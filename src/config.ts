import { absolutePath } from './util/general'

let _CACHE_PATH: string,
    _INFILE_PATH: string,
    _OUTFILE_PATH: string
let _LANGUAGE: Record<string, ILanguageInfo>
let _MIRROR: string[]
let _LRUN: ILrunConfig
let _CONCURRENT: number

export type ISpawnTuple = string[]

export interface ILanguageInfo {
    compiler: string[]
    runner: string[]
    extension: string
    mirror: string[]
}

export interface ILrunConfig {
    compilerTime: number
    compilerMemory: number
    uid: number
    gid: number
}

export async function init({
    cachePath,
    infilePath,
    outfilePath,
    language,
    mirror,
    lrun,
    concurrent,
}: {
    cachePath: string
    infilePath: string
    outfilePath: string
    language: Record<string, ILanguageInfo>
    mirror: string[]
    lrun: ILrunConfig
    concurrent: number
}) {
    _CACHE_PATH = absolutePath(cachePath)
    _INFILE_PATH = absolutePath(infilePath)
    _OUTFILE_PATH = absolutePath(outfilePath)
    _LANGUAGE = language
    _MIRROR = mirror
    _LRUN = lrun
    _CONCURRENT = concurrent
}

export function CACHE_PATH() { return _CACHE_PATH }
export function INFILE_PATH() { return _INFILE_PATH }
export function OUTFILE_PATH() { return _OUTFILE_PATH }
export function LANG(lang: string) { return _LANGUAGE[lang] }
export function MIRROR() { return _MIRROR }
export function LRUN() { return _LRUN }
export function CONCURRENT() { return _CONCURRENT }
