/// <reference types="koa-bodyparser" />
import Router from 'koa-router'
import { deleteSpecialJudge, updateSpecialJudge, compileSpecialJudge } from './spj'
import { performTask } from './task'
import { updateSubmission, compileSubmission, testSubmission } from './submission'

export function router(prefix: string) {
    const _router = new Router<{ taskId: string }, {
        query: {
            testcase_id?: string
            specialjudge_id?: string
            submission_id?: string
            language?: string
            time?: string
            memory?: string
        }
    }>()
    _router.delete('/delete_specialjudge', async ctx => {
        performTask(
            ctx.state.taskId,
            () => deleteSpecialJudge(ctx.query['specialjudge_id'])
        )
    })
    _router.post('/update_specialjudge', async ctx => {
        performTask(
            ctx.state.taskId,
            () => updateSpecialJudge(ctx.query['specialjudge_id'], ctx.req),
            () => compileSpecialJudge(ctx.query['specialjudge_id']),
        )
    })
    _router.post('/create_submission', async ctx => {
        performTask(
            ctx.state.taskId,
            () => updateSubmission(ctx.query['submission_id'], ctx.req, ctx.query['language']),
            () => compileSubmission(ctx.query['submission_id'], ctx.query['language']),
        )
    })
    _router.get('/test_submission', async ctx => {
        performTask(
            ctx.state.taskId,
            () => testSubmission(
                ctx.query['submission_id'],
                ctx.query['testcase_id'],
                ctx.query['specialjudge_id'],
                ctx.query['language'], {
                    time: ctx.query.time,
                    memory: ctx.query.memory,
            }),
        )
    })
    return _router
}
