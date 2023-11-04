// File: routes/space.ts
import { spaceRepository } from '../models/space';
import { Elysia, Context, RouteSchema, t } from 'elysia';
import { connection } from '../lib/database';
import { EntityId } from 'redis-om'
import * as geolib from 'geolib';


export const space = new Elysia();

const SpaceBody = t.Object({
    name: t.String(),
    time_to_live: t.Number(),
    geo_center: t.String(),
    range: t.Number(),
    user_limit: t.Number()
});


space.post('/space', async ({ body, set }) => {
    try {
        const { name, time_to_live, geo_center, range, user_limit } = body;
        const created_at = new Date();

        const [longitude, latitude] = geo_center.split(',').map(coord => parseFloat(coord));


        // Create a new space entity
        const newSpace = await spaceRepository.save({
            name,
            created_at,
            geo_center: { longitude, latitude },
            range,
            user_limit,
            expirey: time_to_live,
        });


        console.log(newSpace[EntityId]);

        const streamKey = `space:${newSpace[EntityId]}:chat`;
        connection.XADD(streamKey, '*', { 'type': 'system', 'message': 'Welcome to the space!' });

        return JSON.stringify({ EntityId: newSpace[EntityId] });

    } catch (error) {
        set.status = 500;
        return { error: error };
    }
}, { body: SpaceBody });


const GeoLocationQuery = t.Object({
    geo_location: t.String(),
});

space.get('/space', async ({ query, set }) => {
    try {
        const { geo_location } = query;
        const [longitude, latitude] = geo_location.split(',').map(coord => parseFloat(coord));

        // Query all spaces from Redis
        const spaces = await spaceRepository.search().where('geo_center').inRadius(circle => circle
            .longitude(longitude)
            .latitude(latitude)
            .radius(1)
            .kilometer
        )
            .return.all()


        // Filter out spaces that have expired
        const now = new Date();
        const filteredSpaces = spaces.filter(space => space.expiry ? space.expiry > now : true);


        // Filter by range
        const filteredSpacesByRange = filteredSpaces.filter(space => {
            if (!space.geo_center) {
                throw new Error('geo_center is null or undefined');
            }
            const distance = geolib.getDistance(
                { latitude, longitude },
                { latitude: space.geo_center.latitude, longitude: space.geo_center.longitude }
            );

            console.log(distance);
            return distance <= space.range;
        });

        // Add EntityId to each space
        filteredSpacesByRange.forEach(space => {
            space.EntityId = space[EntityId];
        });

        return JSON.stringify(filteredSpacesByRange);

    } catch (error) {
        set.status = 500;
        return { error: error };
    }
}, { query: GeoLocationQuery });


space.get('/space/:id', async ({ params, set }) => {

    try {
        const { id } = params;
        const space = await spaceRepository.fetch(id);

        return JSON.stringify(space);

    } catch (error) {
        set.status = 500;
        return { error: error };
    }

});


const HistoryQuery = t.Object({
    timestamp: t.String({ optional: true}),
    limit: t.String({ optional: true})
});

space.get('/space/:id/history', async ({ query, params, set }) => {
    try {
        var { id, timestamp, limit } = { ...query, ...params };

        const timestamp_int = parseInt(timestamp) || Date.now();
        const limit_int = parseInt(limit) || 10;
        
        const streamKey = `space:${id}:chat`;
        const messages = await connection.XRANGE(streamKey, '-', timestamp, {COUNT: limit_int});

        return JSON.stringify(messages);

    } catch (error) {
        set.status = 500;
        return { error: error };
    }
}, { query: HistoryQuery });
export default space;