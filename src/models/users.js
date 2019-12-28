const mangoose = require("mongoose")
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Tasks = require('./task')

//creating users schema
const userSchema = new mangoose.Schema(
    {
        name:{type:String,required:true,trim:true},
        email:{
            type:String,
            required:true,
            trim:true,
            validate:{
            validator:(value)=>{
              if(!validator.isEmail(value)){
                  throw new Error('Invalid email')
              }
            }
          }
        },
        password:{
            type:String,
            required:true,
            trim:true,
            min:[7,'minimum length is 7'],
            validate:{
            validator:(value)=>{
                if(value.includes('password')){
                    throw new Error('Invalid Password')
                }
            }
          }
        },
        age:{
            type:Number,
            required:true,
            default:0,
            validate(value){
               if(value<0){
                   throw new Error('Invalid age')
               }
            }
        },
        tokens:[{
            token:{
                type:String,
                required:true
            }
        }],
        avatar:{
           type:Buffer
        }
    },
    {timestamps:true}
)

//creating a relationship between user and task
userSchema.virtual('tasks',{
    ref:'Tasks',
    localField:'_id',
    foreignField:'owner'
})

//hidding users password and token from public
userSchema.methods.toJSON=function(){
    const userObject = this.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
}

//generating auth token
userSchema.methods.generateAuthToken = async function(){
    const token = jwt.sign({_id:this._id.toString()},process.env.JWT_SECRET)
    this.tokens = this.tokens.concat({token})
    await this.save()
    return token
}

//verifying users credentials
userSchema.statics.findByCredentials = async(email,password)=>{
    const user = await Users.findOne({email})
    if(!user){throw new Error('Invalid email')}

    const userpass = await bcrypt.compare(password,user.password)
    if(!userpass){throw new Error('Invalid password')}

    return user
}

//hashing passwords
userSchema.pre('save',async function(next){

    if(this.isModified('password')){
       this.password = await bcrypt.hash(this.password,8)
    }

    next()

 })

 userSchema.pre('remove',async function(next){
   await Tasks.deleteMany({owner:this._id})
   next()
 })

const Users = mangoose.model('Users',userSchema)

module.exports=Users