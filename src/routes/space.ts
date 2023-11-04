// File: routes/space.ts
import { spaceRepository } from '../models/space';
import { Elysia, Context, RouteSchema } from 'elysia';

const space = new Elysia();

interface SpaceBody extends RouteSchema {
    name: string;
    time_to_live: string;
    geo_center: string;
    range: number;
    user_limit: number;
}

interface GeoLocationQuery {
    geo_location: string;
}

space.post('/space', async ({ body, set }: Context<SpaceBody>) => {
    try {
        const { name, time_to_live, geo_center, range, user_limit } = body;
        const created_at = new Date();  // set now as created_at
        
        // Create a new space entity
        const newSpace = spaceRepository.create({
            name,
            created_at,
            geo_center,
            range,
            user_limit,
            time_to_live
        });
        
        // Save the new space to Redis
        await spaceRepository.save(newSpace);
        
        // Respond with the ID of the new space
        return { id: newSpace.id };
    } catch (error) {
        set.status = 500;
        return { error: error.message };
    }
});

space.get('/space', async ({ query, set }: Context<GeoLocationQuery>) => {
    try {
        const { geo_location } = query;
        const [longitude, latitude] = geo_location.split(',').map(coord => parseFloat(coord));
        
        // Query all spaces from Redis
        const spaces = await spaceRepository.find();
        
        // Filter spaces based on the given logic
        const matchingSpaces = spaces.filter(space => {
            const [spaceLongitude, spaceLatitude] = space.geo_center.split(',').map(coord => parseFloat(coord));
            const distance = Math.sqrt(Math.pow(spaceLongitude - longitude, 2) + Math.pow(spaceLatitude - latitude, 2));
            
            const ttl = new Date(space.time_to_live);
            const now = new Date();
            
            return (
                distance <= space.range &&
                (ttl > now || space.time_to_live === '-1')
            );
        });
        
        return matchingSpaces;
    } catch (error) {
        set.status = 500;
        return { error: error.message };
    }
});

export default space;
