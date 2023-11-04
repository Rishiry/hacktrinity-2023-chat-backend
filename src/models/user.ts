import { Entity, Schema } from 'redis-om';
import client from '../lib/database';

const userSchema = new Schema('user', {
    displayName: { type: 'string' },
    provider: { type: 'string' },
    
});

/* use the client to create a Repository just for Persons */
export const userRepository = client.fetchRepository(userSchema)

/* create the index for Person */
await userRepository.createIndex()