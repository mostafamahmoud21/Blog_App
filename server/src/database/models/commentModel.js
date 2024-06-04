const mongoose=require('mongoose')

const commentSchema=mongoose.Schema({
    comment:{
        type:String,
        required:false
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true
    },
    postId:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'post', 
        required: true
    }
},{timestamps:true})

const commentModel=mongoose.model('comment',commentSchema)
module.exports=commentModel