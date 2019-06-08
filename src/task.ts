import { CONCURRENT } from './config'
const taskQueue = new Array(CONCURRENT()).fill(Promise.resolve())
let currentQueue = 0

export function addTask(task: () => Promise<any>) {
    taskQueue[currentQueue] = taskQueue[currentQueue].then(task)
    if (++currentQueue >= taskQueue.length)
        currentQueue = 0
    return taskQueue[currentQueue]
}
