import { promises as fs } from 'fs'
import { PATH, LANG, LRUN } from './config'
import { lrun, LRUN_STATUS } from './util/lrun'
import { Readable } from 'stream'
import { pipeToFile } from './util/fs'

export function deleteSubmission(id: string) {
    return Promise.all([
        fs.unlink(`${PATH()}/submission/source/${id}${LANG('cpp').extension}`),
        fs.unlink(`${PATH()}/submission/binary/${id}`),
    ])
}

export function updateSubmission(id: string, data: Readable, lang: string) {
    const langInfo = LANG(lang)
    if (langInfo)
        return pipeToFile(data, `${PATH()}/submission/source/${id}${LANG(lang).extension}`)
    console.log('no lang')
    return Promise.resolve()
}

export async function compileSubmission(id: string, lang: string) {
    const langInfo = LANG(lang)
    if (langInfo) {
        if (langInfo.compiler) {
            const result = await lrun(
                langInfo.compiler
                .map(i => i
                    .replace(/\{infile\}/g, `${PATH()}/submission/source/${id}${langInfo.extension}`)
                    .replace(/\{outfile\}/g, `${PATH()}/submission/binary/${id}`)
                ), {
                    time: LRUN().compilerTime,
                    memory: LRUN().compilerMemory,
                }
            )
            console.log('finish')
            if (result.status === LRUN_STATUS.NORMAL)
                return { success: true }
        } else return { success: true }
    }
    return { success: false }
}

export async function testSubmission(submission: string, testcase: string, specialjudge: string, lang: string, { time, memory }: {
    time: number
    memory: number
}) {
    const langInfo = LANG(lang)
    const result = await lrun(
        langInfo.runner
        .map(i => i
            .replace(/\{infile\}/g, `${PATH()}/submission/source/${submission}${langInfo.extension}`)
            .replace(/\{outfile\}/g, `${PATH()}/submission/binary/${submission}`)
        ), {
            time,
            memory,
            chroot: true,
            jailFile: [
                `${PATH()}/submission/source/${submission}${langInfo.extension}`,
                `${PATH()}/submission/binary/${submission}`,
                ...langInfo.mirror,
            ],
            infile: `${PATH()}/testcase/infile/${testcase}.in`,
            outfile: `${PATH()}/submission/outfile/${submission}.out`
        }
    )
    const conclusion = {
        status: 'UKE',
        time: result.time,
        memory: result.memory,
    }
    switch (result.status) {
        case LRUN_STATUS.MEMORY_LIMIT_EXCEEDED:
            conclusion.status = 'MLE'
            break
        case LRUN_STATUS.OUTPUT_LIMIT_EXCEEDED:
            conclusion.status = 'OLE'
            break
        case LRUN_STATUS.TIME_LIMIT_EXCEEDED:
            conclusion.status = 'TLE'
            break
        case LRUN_STATUS.RUNTIME_ERROR:
            conclusion.status = 'RE'
            break
        default: break
    }
    if (conclusion.status === 'UKE') {
        const spjRunResult = await lrun([
            ...LANG('cpp').runner
            .map(i => i
                .replace(/\{infile\}/g, `${PATH()}/spj/source/${specialjudge}${LANG('cpp').extension}`)
                .replace(/\{outfile\}/g, `${PATH()}/spj/binary/${specialjudge}`)
            ),
            `${PATH()}/testcase/infile/${testcase}.in`,
            `${PATH()}/submission/outfile/${submission}.out`,
            `${PATH()}/testcase/outfile/${testcase}.out`,
        ], {
            time,
            memory,
            chroot: true,
            jailFile: [
                `${PATH()}/spj/source/${submission}${langInfo.extension}`,
                `${PATH()}/spj/binary/${submission}`,
                `${PATH()}/testcase/infile/${testcase}.in`,
                `${PATH()}/submission/outfile/${submission}.out`,
                `${PATH()}/testcase/outfile/${testcase}.out`,
                ...langInfo.mirror,
            ],
            errfile: `${PATH()}/submission/result/${submission}.out`
        })
        if (!spjRunResult)
            conclusion.status = 'SJE'
        else {
            const spjResult = await fs.readFile(`${PATH()}/submission/result/${submission}.out`, 'utf-8')
            if (spjResult.startsWith('ok'))
                conclusion.status = 'AC'
            else conclusion.status = 'WA'
        }
    }
    return conclusion
}
