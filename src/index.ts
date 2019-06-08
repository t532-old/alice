import Koa from 'koa'
import { init as initConfig, PATH } from './config'
import { promises as fs } from 'fs'
import { router } from './router'

const INIT_PATH = [
    'testcase/',
        'testcase/infile/',
        'testcase/outfile/',
    'spj/',
        'spj/source/',
        'spj/binary/',
    'submission/',
        'submission/source/',
        'submission/binary/',
        'submission/outfile/',
    'mirrorfs-config/',
]
export async function init(config: Parameters<typeof initConfig>[0]) {
    initConfig(config)
    try { await fs.rmdir(PATH()) }
    catch { await fs.mkdir(PATH()) }
    for (const path of INIT_PATH)
        await fs.mkdir(PATH() + path)
}

export function use(server: Koa, prefix: string) {
    // TODO: Token check
    const _router = router(prefix)
    server.use(_router.routes())
          .use(_router.allowedMethods())
}
