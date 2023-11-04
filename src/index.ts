import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'


const app = new Elysia()
  .use(swagger())
  .listen(3000)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)