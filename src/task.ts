import { CONCURRENT } from './config'
const taskQueue: Promise<any>[] = new Array(CONCURRENT()).fill(Promise.resolve())
let currentQueue = 0

export interface ITask {
    (): Promise<any>
}

export function addTask<T = any>(...tasks: ITask[]): Promise<T> {
    tasks.forEach(task => 
        taskQueue[currentQueue] = taskQueue[currentQueue].then(task))
    const finalTask = taskQueue[currentQueue]
    if (++currentQueue === taskQueue.length)
        currentQueue = 0
    return finalTask
}
