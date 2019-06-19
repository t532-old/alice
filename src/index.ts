import Koa from 'koa'
import { init as initConfig, CACHE_PATH, TOKEN } from './config'
import { promises as fs } from 'fs'
import { router } from './router'
import nanoid from 'nanoid'

const INIT_PATH = [
    'spj/',
        'spj/source/',
        'spj/binary/',
    'submission/',
        'submission/source/',
        'submission/binary/',
        'submission/outfile/',
        'submission/result/',
    'mirrorfs-config/',
]
export async function init(config: Parameters<typeof initConfig>[0]) {
    initConfig(config)
    try { await fs.mkdir(CACHE_PATH()) } catch {}
    for (const path of INIT_PATH)
        try { await fs.mkdir(`${CACHE_PATH()}/${path}`) } catch {}
}

export function use(server: Koa, prefix: string) {
    const _router = router(prefix)
    server.use(async function checkToken(ctx, next) {
        ctx.assert(ctx.request.header['x-access-token'] !== undefined, 401)
        ctx.assert(ctx.request.header['x-access-token'] === TOKEN(), 403)
        await next()
    })
    server.use(async function generateTaskId(ctx, next) {
        ctx.body = { id: ctx.state.taskId = nanoid() }
        await next()
    })
    server.use(_router.routes())
          .use(_router.allowedMethods())
}
