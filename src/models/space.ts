import { Entity, Schema } from 'redis-om'
import client from '../lib/database';

/* create a Schema for Person */
const spaceSchema = new Schema('space', {
  name: { type: 'string' },
  created_at: { type: 'date' },
  geo_center: { type: 'point' },
  range: { type: 'number' },
  user_limit: { type: 'number' },
  expirey: { type: 'date' }
})

/* use the client to create a Repository just for Persons */
export const spaceRepository = client.fetchRepository(spaceSchema)

/* create the index for Person */
await spaceRepository.createIndex()