import { spawn, StdioOptions } from 'child_process'
import nanoid from 'nanoid'
import { LRUN, MIRROR, PATH } from '../config'
import { promises as fs } from 'fs'
import { pipeFromFile, pipeToFile } from './fs'
import { noop } from './general'

export enum LRUN_STATUS { NORMAL, TIME_LIMIT_EXCEEDED, MEMORY_LIMIT_EXCEEDED, OUTPUT_LIMIT_EXCEEDED, RUNTIME_ERROR }

export interface ILrunResult {
    status: LRUN_STATUS
    time: number
    memory: number
}

export async function mirrorfs(id: string, mirror: string[], type: 'setup' | 'teardown') {
    const mirrorPath = `${PATH()}/mirrorfs-config/${id}.mfsconf`
    await fs.writeFile(mirrorPath, mirror.map(i => `mirror ${i}`).join('\n'))
    const proc = spawn('lrun-mirrorfs', [
        '--name', id,
        `--${type}`, mirrorPath,
    ])
    return new Promise<void>(resolve => proc.on('exit', async () => {
        if (type === 'teardown')
            await fs.unlink(mirrorPath)
        resolve()
    }))
}

function parseResult(result: string): ILrunResult {
    if (!result) return null
    const pairs = result
        .split('\n')
        .map(i => i
            .split(' ')
            .filter(i => i)
        )
    const objform: { [x: string]: string } = {}
    for (const i of pairs)
        objform[i[0]] = i[1]
    let status: LRUN_STATUS
    if (objform.EXCEED === 'REAL_TIME') status = LRUN_STATUS.TIME_LIMIT_EXCEEDED
    else if (objform.EXCEED === 'MEMORY') status = LRUN_STATUS.MEMORY_LIMIT_EXCEEDED
    else if (objform.EXCEED === 'OUTPUT') status = LRUN_STATUS.OUTPUT_LIMIT_EXCEEDED
    else if (parseInt(objform.EXITCODE) || parseInt(objform.SIGNALED)) status = LRUN_STATUS.RUNTIME_ERROR
    else status = LRUN_STATUS.NORMAL
    return {
        status,
        time: parseFloat(objform.REALTIME) * 1000,
        memory: parseInt(objform.MEMORY),
    }
}

export async function lrun(executable: string[], {
    network = false,
    isolate = true,
    chroot = false,
    jailFile = [],
    memory = 128 * 1024 * 1024,
    time = 1000,
    output = 128 * 1024 * 1024,
    passExitcode = false,
    resetEnv = false,
    infile,
    outfile,
    errfile,
}: {
    network?: boolean
    isolate?: boolean
    chroot?: boolean
    jailFile?: string[]
    memory?: number
    time?: number
    output?: number
    passExitcode?: boolean
    resetEnv?: boolean
    infile?: string
    outfile?: string
    errfile?: string
}) {
    const args = [
        '--network', String(network),
        '--pass-exitcode', String(passExitcode),
        '--reset-env', String(resetEnv),
        '--isolate-process', String(isolate),
        '--max-memory', String(memory),
        '--max-real-time', (time / 1000).toFixed(3),
        '--max-output', String(output),
    ]
    const stdio: StdioOptions = ['pipe', 'pipe', 'pipe', 'pipe']
    let mirrorfsCallback: () => void
    if (chroot) {
        const jailId = nanoid(),
              mirror = [...MIRROR(), ...jailFile]
        await mirrorfs(jailId, mirror, 'setup')
        args.push('--chroot', `/run/lrun/mirrorfs/${jailId}`)
        mirrorfsCallback = () => mirrorfs(jailId, mirror, 'teardown')
    }
    const proc = spawn('lrun', [...args, ...executable], {
        uid: LRUN().uid,
        gid: LRUN().gid,
        stdio,
    })
    if (infile) pipeFromFile(proc.stdin, infile).catch(noop)
    if (outfile) pipeToFile(proc.stdout, outfile).catch(noop)
    if (errfile) pipeToFile(proc.stderr, errfile).catch(noop)
    let rawResult: string = ''
    proc.stdio[3].on('data', d => rawResult += d)
    if (mirrorfsCallback) proc.on('exit', mirrorfsCallback)
    return new Promise<ILrunResult>(resolve => 
        proc.on('exit', () => {
            resolve(parseResult(rawResult))
            console.log(args.join(' '), executable.join(' '))
        })
    )
}
