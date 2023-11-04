import { Entity, Schema } from 'redis-om';
import client from '../lib/database';

const chatSchema = new Schema('chat', {
  space: { type: 'string' },
  timestamp: { type: 'date' },
  message: { type: 'string' },
  sender: { type: 'string' }
});

/* use the client to create a Repository just for Persons */
export const chatRepository = client.fetchRepository(chatSchema)

/* create the index for Person */
await chatRepository.createIndex()