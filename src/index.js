const express = require('express')
require('./db/mongoose')

const userRouter = require('./routes/userRoute')
const taskRouter = require('./routes/taskRoute')


const app = express()

const port = process.env.PORT

//converting our request data into json
app.use(express.json())

app.use(userRouter)
app.use(taskRouter)




app.listen(port,()=>{
    console.log('server is running on port ' + port)
})