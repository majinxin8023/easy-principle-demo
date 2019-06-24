/**
 *
app.use(async (ctx, next) => {
    console.log('1')
    await next();
    console.log('5')
});
app.use(async (ctx, next) => {
    console.log('2')
    await next();
    console.log('4')
});
app.use(async ctx => {
    console.log('3')
    ctx.body = 'Hello World';
});

        等价

app.use(async (ctx, next) => {
    console.log('1')
    async (ctx, next) => {
        console.log('2')
        async ctx => {
            console.log('3')
            ctx.body = 'Hello World';
        }
        console.log('4')
    }
    console.log('5')
});
 */

let EventEmitter = require('events');
let http = require('http');
let context = require('./context')
let request = require('./request')
let response = require('./response')

class Applocation extends EventEmitter{
    constructor(){
        super()
        this.middlewares = []
        this.context = context
        this.request = request
        this.response = response
    }
    compose () { // 此方法就是为了处理多个的middlewares
        return async ctx => {
            function createNext(middleware, oldNext) {
                return async () => {
                    await middleware(ctx, oldNext)
                }
            }
            let len = this.middlewares.length
            let next = async () => { // 这是next最初始的样子
                return Promise.resolve()
            }
            for (let i = len - 1; i >= 0; i--) { // 此处的循环看最上面的注释, 循环的过程中next一直在动态的改变
                let currentMiddleware = this.middlewares[i]
                next = createNext(currentMiddleware, next)
            }
            await next()
        }
    }
    use (middleware) { // middlewares处理所有的中间件
        this.middlewares.push(middleware)
    }
    createContext (req, res) {
        let ctx = Object.create(this.context)
        ctx.request = Object.create(this.request)
        ctx.response = Object.create(this.response)
        ctx.res = ctx.response.res = res;
        ctx.req = ctx.request.req = req;
        return ctx
    }
    callback () {
        return (req, res) => {
            let ctx = this.createContext(req, res);
            let respond = () => this.responseBody(ctx)
            let onerror = err => this.onerror(err, ctx)
            let fn = this.compose()
            return fn(ctx).then(respond).catch(onerror)
        }
    }
    onerror (err, ctx) {
        if (err.code == "ENOEND") {
            ctx.status = 404
        } else {
            ctx.status = 500
        }
        let msg = err.message || '服务异常'
        ctx.res.end(msg)
        this.emit('error', err)
    }
    responseBody (ctx) {
        let context = ctx.body;
        if (typeof context === 'string') {
            ctx.res.end(context)
        } else if (typeof context === 'object') {
            ctx.res.end(JSON.stringify(context))
        }
    }
    listen (...args) {
        let server = http.createServer(this.callback())
        server.listen(...args)
    }
}
module.exports = Applocation