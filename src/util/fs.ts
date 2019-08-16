import { Readable, Stream, Writable } from 'stream'
import { createWriteStream, createReadStream, promises as fs } from 'fs'
import { LRUN } from '../config'

export function waitStreamUntilEnd(stream: Stream): Promise<void> {
    return new Promise((resolve, reject) => {
        stream.on('error', reject)
        stream.on('end', resolve)
    })
}

export function pipeToFile(data: Readable, file: string) {
    try { data.pipe(createWriteStream(file)) } catch { return Promise.resolve() }
    return waitStreamUntilEnd(data).then(() => fs.chown(file, LRUN().uid, LRUN().gid))
}

export function pipeFromFile(dest: Writable, file: string) {
    let data: Readable
    try {
        data = createReadStream(file)
        data.pipe(dest)
    } catch { return Promise.resolve() }
    return waitStreamUntilEnd(data)
}
