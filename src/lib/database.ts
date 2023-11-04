import { Client } from 'redis-om'
import { createClient } from 'redis'

/* create a connection to Redis with Node Redis */
export const connection = createClient({url: process.env.REDIS_URL || 'redis://localhost:6379'});

await connection.connect()

/* create a Client and bind it to the Node Redis connection */
const client = await new Client().use(connection)

export default client