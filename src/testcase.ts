import { promises as fs } from 'fs'
import { PATH } from './config'
import { Server as FileServer, FileStore } from 'tus-node-server'
import { IncomingMessage, ServerResponse } from 'http'

declare module 'http' {
    interface IncomingMessage {
        filename?: string
    }
}

let fileServers: { in: FileServer, out: FileServer }

export function initTestcaseStore() {
    fileServers = {
        in: new FileServer(),
        out: new FileServer(),
    }
    fileServers.in.datastore = new FileStore({
        path: '/update_testcase_infile',
        directory: `${PATH()}/testcase/infile/`,
        namingFunction(req: IncomingMessage) { return req.filename },
    })
    fileServers.out.datastore = new FileStore({
        path: '/update_testcase_outfile',
        directory: `${PATH()}/testcase/outfile/`,
        namingFunction(req: IncomingMessage) { return req.filename },
    })
}

export async function deleteTestcase(id: string) {
    return Promise.all([
        fs.unlink(`${PATH()}/testcase/infile/${id}.in`),
        fs.unlink(`${PATH()}/testcase/infile/${id}.out`),
    ])
}

export function updateTestcase(id: string, type: 'in' | 'out', data: IncomingMessage, resp: ServerResponse) {
    data.filename = `${id}.${type}`
    fileServers[type].handle(data, resp)
}
