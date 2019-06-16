import axios from 'axios'
import { CONCURRENT, WEBHOOK, TOKEN } from './config'
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

export function finishTask(id: string, data?: any) {
    return axios.post(WEBHOOK(), {
        id,
        data: data === undefined ? null : data
    }, {
        headers: { 'x-access-token': TOKEN() },
    })
}

export async function performTask(id: string, ...tasks: ITask[]) {
    await finishTask(id, await addTask(...tasks))
}
