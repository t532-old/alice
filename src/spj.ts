import { promises as fs } from 'fs'
import { PATH, LANG, LRUN } from './config'
import { lrun, LRUN_STATUS } from './lrun'

export function deleteSpecialJudge(id: string) {
    return Promise.all([
        fs.unlink(`${PATH()}spj/source/${id}${LANG('cpp').extension}`),
        fs.unlink(`${PATH()}spj/binary/${id}`),
    ])
}

export function updateSpecialJudge(id: string, data: string) {
    return fs.writeFile(`${PATH()}spj/source/${id}${LANG('cpp').extension}`, data)
}

export async function compileSpecialJudge(id: string) {
    await lrun(
        LANG('cpp').compiler
            .map(i => i
                .replace(/\{infile\}/g, `${PATH()}${id}spj/source/${id}${LANG('cpp').extension}`)
                .replace(/\{outfile\}/g, `${PATH()}${id}spj/binary/${id}`)
            ),
        {
            time: LRUN().compilerTime,
            memory: LRUN().compilerMemory,
        }
    )
    // XXX: Shall we check whether it compiled successfully?
    // XXX: Fallback: If spj isn't compiled sucessfully, every submission will get UKE
}
