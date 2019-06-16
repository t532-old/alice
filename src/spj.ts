import { promises as fs } from 'fs'
import { PATH, LANG, LRUN } from './config'
import { lrun, LRUN_STATUS } from './util/lrun'
import { Readable } from 'stream'
import { pipeToFile } from './util/fs'

export function deleteSpecialJudge(id: string) {
    return Promise.all([
        fs.unlink(`${PATH()}/spj/source/${id}${LANG('cpp').extension}`),
        fs.unlink(`${PATH()}/spj/binary/${id}`),
    ])
}

export function updateSpecialJudge(id: string, data: Readable) {
    return pipeToFile(data, `${PATH()}/spj/source/${id}${LANG('cpp').extension}`)
}

export async function compileSpecialJudge(id: string) {
    const result = await lrun(
        LANG('cpp').compiler
        .map(i => i
            .replace(/\{infile\}/g, `${PATH()}/spj/source/${id}${LANG('cpp').extension}`)
            .replace(/\{outfile\}/g, `${PATH()}/spj/binary/${id}`)
        ), {
            time: LRUN().compilerTime,
            memory: LRUN().compilerMemory,
        }
    )
    if (result.status === LRUN_STATUS.NORMAL)
        return { success: true }
    else return { success: false }
}
