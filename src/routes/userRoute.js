const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail,sendCancelEmail} = require('../email/account')
const Users = require('../models/users')
const auth = require('../middleware/auth')


const router = new express.Router()

//creating Users
router.post('/users',async(req,res)=>{
    const user = new Users(req.body)
    
    try{
      await user.save()
      sendWelcomeEmail(user.email,user.name)
      const token = await user.generateAuthToken()
      res.send({user,token})
    }catch(e){
      res.status(400).send(e)
    }
})

//user login
router.post('/users/login',async(req,res)=>{
  
  try{
    const user = await Users.findByCredentials(req.body.email,req.body.password)
    const token = await user.generateAuthToken()
    res.send({user,token})
  }catch(e){
     res.status(400).send(e)
  }
})

//setting up multer
const upload = multer({
  limits:{
    fileSize:1000000
  },
  fileFilter(req,file,cb){
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
       return cb(new Error('Please upload image with jpg,jpeg,png formart'))
    }
    cb(undefined,true)
  }
})

//upload avatar
router.post('/users/me/avatar',auth,upload.single('avatar'),async(req,res)=>{
  try {
     const buffer = await sharp(req.file.buffer).resize(250,250).png().toBuffer()
     req.user.avatar = buffer
     await req.user.save()
     res.status(200).send()
  } catch (e) {
    res.status(400).send(e)
  }
},(error,req,res,next)=>{
  res.status(400).send({error:error.message})
})

//view avatar
router.get('/users/me/:id/avatar',async(req,res)=>{
  const user = await Users.findById(req.params.id)
  try{
    if(!user||!user.avatar){
      throw new Error()
    }
    res.set('Content-Type','image/png')
    res.send(user.avatar)
  }catch(e){
    res.status(404).send()
  }
})

//remove avatar
router.delete('/users/me/removeAvatar',auth,async(req,res)=>{
  req.user.avatar = undefined
  await req.user.save()
  res.send('Avatar removed')
})

//logging out from a single device
router.post('/users/logout',auth,async(req,res)=>{
  try{
    req.user.tokens = req.user.tokens.filter((token)=>{
        return token.token !== req.token
    })
    req.user.save()
    res.send()
  }catch(e){
     res.status(401).send(e)
  }
})

//logging out from all devices
router.post('/users/logoutAll',auth,async(req,res)=>{
  try{
    req.user.tokens = []
    req.user.save()
    res.send()
  }catch(e){
    res.send(401).send()
  }
})

//getting user profile
router.get('/users/me',auth,async(req,res)=>{
    res.send(req.user)
})



//updating user
router.patch('/users/me',auth,async(req,res)=>{
    const update = Object.keys(req.body)
    const canUpdate = ['name','email','age','password']
    const isValidOperation = update.every((update)=>canUpdate.includes(update))

    if(!isValidOperation){res.status(400).send('Invalid update')}

    try{
      
      update.forEach((update)=>req.user[update]=req.body[update])
      await req.user.save()
      res.send(req.user)
    }catch(e){
       res.status(400).send(e)
    }
})

//deleting user account
router.delete('/users/me',auth,async(req,res)=>{
   try{
     req.user.remove()
     sendCancelEmail(req.user.email,req.user.name)
     res.send(req.user)
   }catch(e){
     res.status(500).send()
   }
})

module.exports=router
