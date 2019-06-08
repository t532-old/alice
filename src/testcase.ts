import { promises as fs } from 'fs'
import { PATH } from './config'

export async function deleteTestcase(id: string) {
    return Promise.all([
        fs.unlink(`${PATH()}testcase/infile/${id}.in`),
        fs.unlink(`${PATH()}testcase/outfile/${id}.out`),
    ])
}

export function updateTestcase(id: string, type: 'in' | 'out', data: string) {
    return fs.writeFile(`${PATH()}testcase/${type}file/${id}.${type}`, data)
}
