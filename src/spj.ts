import { promises as fs } from 'fs'
import { CACHE_PATH, LANG, LRUN } from './config'
import { lrun, LRUN_STATUS } from './util/lrun'
import { Readable } from 'stream'
import { pipeToFile } from './util/fs'

export function deleteSpecialJudge(id: string) {
    return Promise.all([
        fs.unlink(`${CACHE_PATH()}/spj/source/${id}${LANG('cpp').extension}`),
        fs.unlink(`${CACHE_PATH()}/spj/binary/${id}`),
    ])
}

export function updateSpecialJudge(id: string, data: Readable) {
    return pipeToFile(data, `${CACHE_PATH()}/spj/source/${id}${LANG('cpp').extension}`)
}

export async function compileSpecialJudge(id: string) {
    const result = await lrun(
        LANG('cpp').compiler
        .map(i => i
            .replace(/\{infile\}/g, `${CACHE_PATH()}/spj/source/${id}${LANG('cpp').extension}`)
            .replace(/\{outfile\}/g, `${CACHE_PATH()}/spj/binary/${id}`)
        ), {
            time: LRUN().compilerTime,
            memory: LRUN().compilerMemory,
        }
    )
    if (result.status === LRUN_STATUS.NORMAL)
        return { success: true }
    else return { success: false }
}
