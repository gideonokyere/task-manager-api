const mangoose = require("mongoose")
//const validator = require('validator')

const taskSchema = new mangoose.Schema({
    description:{
        type:String,
        trim:true,
        required:true
    },
    completed:{
        type:Boolean,
        default:false
    },
    owner:{
        type:mangoose.Schema.Types.ObjectId,
        required:true,
        ref:'Users'
    }
},{timestamps:true})

const Tasks = mangoose.model('Tasks',taskSchema)

module.exports = Tasks

