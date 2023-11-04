import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'
import { space } from './routes/space'


const app = new Elysia()
  .use(swagger())
  .use(cors({
    origin: '*'
  }))
  .use(space)
  .listen({
    hostname: '0.0.0.0',
    port: 80
  })

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)