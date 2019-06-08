/// <reference types="koa-bodyparser" />
import Router from 'koa-router'
import { deleteTestcase, updateTestcase } from './testcase'
import { deleteSpecialJudge, updateSpecialJudge, compileSpecialJudge } from './spj'
import { addTask } from './task'

export function router(prefix: string) {
    const _router = new Router<void, {
        query: {
            testcase_id?: string
            specialjudge_id?: string
            submission_id?: string
            language?: string
        }
    }>()
    _router.get('/delete_testcase', async ctx => {
        await deleteTestcase(ctx.query.testcase_id)
    })
    _router.post('/update_testcase/infile', async ctx => {
        await updateTestcase(ctx.query.testcase_id, 'in', ctx.request.rawBody)
    })
    _router.post('/update_testcase/outfile', async ctx => {
        await updateTestcase(ctx.query.testcase_id, 'out', ctx.request.rawBody)
    })
    _router.get('/delete_specialjudge', async ctx => {
        await deleteSpecialJudge(ctx.query.specialjudge_id)
    })
    _router.post('/update_specialjudge', async ctx => {
        await updateSpecialJudge(ctx.query.specialjudge_id, ctx.request.rawBody)
        addTask(() => compileSpecialJudge(ctx.query.specialjudge_id))
    })
    // TODO: /create_submission
    return _router
}
