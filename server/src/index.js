const express=require('express')
const connectDB = require('./database/dbconnection.js');
const dotenv=require('dotenv');
dotenv.config()
const userRouter = require('./modules/usersCrud/Routes/userRouter.js');
const postRouter = require('./modules/posts/Routes/postRouter.js');
const commentRouter = require('./modules/comments/Routes/commentRouter.js');
const app=express()
connectDB()
app.use(express.json())
app.use('/api/users',userRouter)
app.use('/api/posts',postRouter)
app.use('/api',commentRouter)

app.listen(process.env.PORT,()=>{
    console.log('Server running')
}) 