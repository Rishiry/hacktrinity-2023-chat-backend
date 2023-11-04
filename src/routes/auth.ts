import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import bcrypt from 'bcryptjs';


// Setting up the Elysia application
const app = new Elysia()
    .use(
        jwt({
            name: 'jwt',
            secret: 'Fischl von Luftschloss Narfidort'
        })
    )
    .group('/auth', (app) =>
        app
            .setModel({
                sign: t.Object({
                    email: t.String({ format: 'email' }),
                    password: t.String({ minLength: 8 })
                })
            })
            .post('/sign-up', async ({ body }) => {
                const { email, password } = body;
                const hashedPassword = bcrypt.hashSync(password, 10);
                const user = await userRepository.create({
                    email,
                    hashedPassword
                });
                return user;
            }, {
                schema: {
                    body: 'sign',
                    detail: {
                        description: 'Sign up a new user',
                        tags: ['Authentication']
                    }
                }
            })
            .post('/sign-in', async ({ body, setCookie }) => {
                const { email, password } = body;
                const user = await userRepository.findOne({ email });
                if (!user || !bcrypt.compareSync(password, user.hashedPassword)) {
                    return { error: 'Invalid email or password' };
                }
                const token = await jwt.sign(user);
                setCookie('auth', token, {
                    httpOnly: true,
                    maxAge: 7 * 86400,
                });
                return user;
            }, {
                schema: {
                    body: 'sign',
                    detail: {
                        description: 'Sign in a user',
                        tags: ['Authentication']
                    }
                }
            })
            .get('/profile', async ({ jwt, set, cookie: { auth } }) => {
                const profile = await jwt.verify(auth);
                if (!profile) {
                    set.status = 401;
                    return 'Unauthorized';
                }
                return `Hello ${profile.displayName}`;
            }, {
                schema: {
                    detail: {
                        description: 'Get user profile',
                        tags: ['Authentication', 'Authorized']
                    }
                }
            })
    )
    .listen(8080);
