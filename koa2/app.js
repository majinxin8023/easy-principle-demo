// const Koa = require('koa');

const MyKoa = require('./KOA/applocation.js')
const app = new MyKoa();

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

app.on("error", err => {
    console.log("🍊错误已发生", err.stack);
})

app.listen(3000);