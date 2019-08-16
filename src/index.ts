import { init as initConfig, CACHE_PATH, LRUN } from './config'
import { promises as fs } from 'fs'
import * as spj from './spj'
import * as submission from './submission'
import { addTask } from './task'
import { Readable } from 'stream'

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
    try {
        await fs.mkdir(CACHE_PATH())
        await fs.chown(CACHE_PATH(), LRUN().uid, LRUN().gid)
    } catch {}
    for (const path of INIT_PATH)
        try {
            await fs.mkdir(`${CACHE_PATH()}/${path}`)
            await fs.chown(`${CACHE_PATH()}/${path}`, LRUN().uid, LRUN().gid)
        } catch {}
}

export function deleteSpecialJudge(id: string) {
    return addTask<void>(() => spj.deleteSpecialJudge(id))
}

export function updateSpecialJudge(id: string, data: Readable) {
    return addTask<{ success: boolean }>(
        () => spj.updateSpecialJudge(id, data),
        () => spj.compileSpecialJudge(id),
    )
}

export function deleteSubmission(id: string) {
    return addTask<void>(() => submission.deleteSubmission(id))
}

export function createSubmission(id: string, data: Readable, lang: string) {
    return addTask<{ success: boolean }>(
        () => submission.updateSubmission(id, data, lang),
        () => submission.compileSubmission(id, lang),
    )
}

export function testSubmission(...args: Parameters<typeof submission.testSubmission>) {
    return addTask<{
        status: string
        info: string
        points: number
        time: number
        memory: number
    }>(() => submission.testSubmission(...args))
}
