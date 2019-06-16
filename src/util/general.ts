import { resolve } from 'path'

export function noop() {}

export function absolutePath(path: string) { return resolve(process.cwd(), path) }
