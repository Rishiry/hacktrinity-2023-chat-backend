import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { space } from './routes/space'


const app = new Elysia()
  .use(swagger())
  .use(space)
  .listen({
    hostname: '0.0.0.0',
    port: 3000
  })

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)