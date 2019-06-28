import { promises as fs } from 'fs'
import { CACHE_PATH, INFILE_PATH, OUTFILE_PATH, LANG, LRUN } from './config'
import { lrun, LRUN_STATUS } from './util/lrun'
import { Readable } from 'stream'
import { pipeToFile } from './util/fs'

export function deleteSubmission(id: string) {
    return Promise.all([
        fs.unlink(`${CACHE_PATH()}/submission/source/${id}${LANG('cpp').extension}`),
        fs.unlink(`${CACHE_PATH()}/submission/binary/${id}`),
    ])
}

export function updateSubmission(id: string, data: Readable, lang: string) {
    const langInfo = LANG(lang)
    if (langInfo)
        return pipeToFile(data, `${CACHE_PATH()}/submission/source/${id}${LANG(lang).extension}`)
    return Promise.resolve()
}

export async function compileSubmission(id: string, lang: string) {
    const langInfo = LANG(lang)
    if (langInfo) {
        if (langInfo.compiler) {
            const result = await lrun(
                langInfo.compiler
                .map(i => i
                    .replace(/\{infile\}/g, `${CACHE_PATH()}/submission/source/${id}${langInfo.extension}`)
                    .replace(/\{outfile\}/g, `${CACHE_PATH()}/submission/binary/${id}`)
                ), {
                    time: LRUN().compilerTime,
                    memory: LRUN().compilerMemory,
                }
            )
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
            .replace(/\{infile\}/g, `${CACHE_PATH()}/submission/source/${submission}${langInfo.extension}`)
            .replace(/\{outfile\}/g, `${CACHE_PATH()}/submission/binary/${submission}`)
        ), {
            time,
            memory,
            chroot: true,
            jailFile: [
                `${CACHE_PATH()}/submission/source/${submission}${langInfo.extension}`,
                ...(langInfo.compiler ? [`${CACHE_PATH()}/submission/binary/${submission}`] : []),
                ...langInfo.mirror,
            ],
            infile: `${INFILE_PATH()}/${testcase}.in`,
            outfile: `${CACHE_PATH()}/submission/outfile/${submission}.out`
        }
    )
    if (!result) return {
        status: 'UKE',
        info: 'unknown error',
        points: 0,
        time: 0,
        memory: 0,
    }
    const conclusion = {
        status: 'UKE',
        info: 'unknown error',
        points: 0,
        time: result.time,
        memory: result.memory,
    }
    switch (result.status) {
        case LRUN_STATUS.MEMORY_LIMIT_EXCEEDED:
            conclusion.status = 'MLE'
            conclusion.info = 'memory limit exceeded'
            break
        case LRUN_STATUS.OUTPUT_LIMIT_EXCEEDED:
            conclusion.status = 'OLE'
            conclusion.info = 'output limit exceeded'
            break
        case LRUN_STATUS.TIME_LIMIT_EXCEEDED:
            conclusion.status = 'TLE'
            conclusion.info = 'time limit exceeded'
            break
        case LRUN_STATUS.RUNTIME_ERROR:
            conclusion.status = 'RE'
            conclusion.info = 'runtime error'
            break
        default: break
    }
    if (conclusion.status === 'UKE') {
        const spjRunResult = await lrun([
            ...LANG('cpp').runner
            .map(i => i
                .replace(/\{infile\}/g, `${CACHE_PATH()}/spj/source/${specialjudge}${LANG('cpp').extension}`)
                .replace(/\{outfile\}/g, `${CACHE_PATH()}/spj/binary/${specialjudge}`)
            ),
            `${INFILE_PATH()}/${testcase}.in`,
            `${CACHE_PATH()}/submission/outfile/${submission}.out`,
            `${OUTFILE_PATH()}/${testcase}.out`,
        ], {
            time,
            memory,
            chroot: true,
            jailFile: [
                `${CACHE_PATH()}/spj/source/${specialjudge}${langInfo.extension}`,
                `${CACHE_PATH()}/spj/binary/${specialjudge}`,
                `${INFILE_PATH()}/${testcase}.in`,
                `${CACHE_PATH()}/submission/outfile/${submission}.out`,
                `${OUTFILE_PATH()}/${testcase}.out`,
                ...langInfo.mirror,
            ],
            errfile: `${CACHE_PATH()}/submission/result/${submission}.out`
        })
        if (!spjRunResult) {
            conclusion.status = 'SJE'
            conclusion.info = 'judger error. we\'re sorry!'
        } else {
            const spjResult = await fs.readFile(`${CACHE_PATH()}/submission/result/${submission}.out`, 'utf-8')
            if (spjResult.startsWith('ok')) {
                conclusion.status = 'AC'
                conclusion.points = 1
            } else if (spjResult.startsWith('points')) {
                conclusion.status = 'PC'
                conclusion.points = Number(spjResult.split(' ')[1])
            } else conclusion.status = 'WA'
            conclusion.info = spjResult
        }
    }
    return conclusion
}
