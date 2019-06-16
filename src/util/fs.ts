import { Readable, Stream, Writable } from 'stream'
import { createWriteStream, createReadStream } from 'fs'

export function waitStreamUntilEnd(stream: Stream): Promise<void> {
    return new Promise((resolve, reject) => {
        stream.on('error', reject)
        stream.on('end', resolve)
    })
}

export function pipeToFile(data: Readable, file: string) {
    try { data.pipe(createWriteStream(file)) } catch { return Promise.resolve() }
    return waitStreamUntilEnd(data)
}

export function pipeFromFile(dest: Writable, file: string) {
    let data: Readable
    try {
        data = createReadStream(file)
        data.pipe(dest)
    } catch { return Promise.resolve() }
    return waitStreamUntilEnd(data)
}
