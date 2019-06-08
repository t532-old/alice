let _PATH: string
let _LANGUAGE: Record<string, ILanguageInfo>
let _MIRROR: string[]
let _LRUN: ILrunConfig
let _CONCURRENT: number

export type ISpawnTuple = string[]

export interface ILanguageInfo {
    compiler: string[]
    runner: string[]
    extension: string
}

export interface ILrunConfig {
    compilerTime: number
    compilerMemory: number
    uid: number
    gid: number
}

export async function init({
    path,
    language,
    mirror,
    lrun,
    concurrent,
}: {
    path: string
    language: Record<string, ILanguageInfo>
    mirror: string[]
    lrun: ILrunConfig
    concurrent: number
}) {
    _PATH = path
    _LANGUAGE = language
    _MIRROR = mirror
    _LRUN = lrun
    _CONCURRENT = concurrent
}

export function PATH() { return _PATH }
export function LANG(lang: string) { return _LANGUAGE[lang] }
export function MIRROR() { return _MIRROR }
export function LRUN() { return _LRUN }
export function CONCURRENT() { return _CONCURRENT }
