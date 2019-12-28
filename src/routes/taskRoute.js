const express = require('express')
const Tasks = require('../models/task')
const auth = require('../middleware/auth')

const router = new express.Router()

//creating Tasks
router.post('/tasks',auth,async(req,res)=>{
    const task = new Tasks({
      ...req.body,
      owner:req.user._id
    })
    try{
      await task.save()
      res.send(task)
    }catch(e){
      res.status(400).send(e)
    }
 })
 
 //getting all tasks
 router.get('/tasks',auth,async(req,res)=>{

   const match = {}
   const sort = {}

   if(req.query.completed){
     match.completed = req.query.completed === 'true'
   }

   if(req.query.sortBy){
     const part = req.query.sortBy.split(':')
     sort[part[0]] = part[1] === 'desc' ? -1:1
   }
 
     try{
       const tasks = await req.user.populate({
        path:'tasks',
        match,
        options:{
          limit:parseInt(req.query.limit),
          skip:parseInt(req.query.skip)
        },
        sort
        }).execPopulate()
  
       if(!tasks){
         res.status(404).send()
       }
       res.send(tasks.tasks)
     }catch(e){
       res.status(400).send(e)
     }
 })
 
 //getting tasks by ID
 router.get('/tasks/:id',auth,async(req,res)=>{
 
     try{
       const task = await Tasks.findOne({_id:req.params.id,owner:req.user._id})
       if(!task){res.status(404).send()}
       res.send(task)
     }catch(e){
       res.status(400).send(e)
     }
 })
 
 //updatting task
 router.patch('/tasks/:id',auth,async(req,res)=>{
   const update = Object.keys(req.body)
   const canUpdate = ['completed','description']
   const isValidOperation = update.every((update)=>canUpdate.includes(update))
   if(!isValidOperation){res.status(400).send('Invalid update')}
 
   try{
     const task = await Tasks.findOne({_id:req.params.id,owner:req.user._id})
     update.forEach((update)=>task[update]=req.body[update])
     if(!task){res.status(400).send()}
     await task.save()
     res.send(task)
   }catch(e){
     res.status(400).send(e)
   }
 
 })
 
 //deleting task
 router.delete('/tasks/:id',auth,async(req,res)=>{
   try{
    const task = await Tasks.findOneAndDelete({_id:req.params.id,owner:req.user._id})
    if(!task){res.status(404).send('Task not found')}
    res.send(task)
   }catch(e){
     res.status(400).send(e)
   }
 })

 module.exports = router