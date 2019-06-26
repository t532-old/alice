import { CONCURRENT } from './config'
const taskQueue = new Array(CONCURRENT()).fill(Promise.resolve())
let currentQueue = 0

export interface ITask {
    (): Promise<any>
}

export function addTask(...tasks: ITask[]) {
    tasks.forEach(task => 
        taskQueue[currentQueue] = taskQueue[currentQueue].then(task))
    const finalTask = taskQueue[currentQueue]
    if (++currentQueue === taskQueue.length)
        currentQueue = 0
    return finalTask
}
