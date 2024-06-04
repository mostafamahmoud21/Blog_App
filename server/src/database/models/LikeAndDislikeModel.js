const mongoose=require('mongoose')

const LikeSchema=mongoose.Schema({
    like:{type:Number,default:0},
    dislike:{type:Number,default:0},
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

const LikeModel=mongoose.model('Like',LikeSchema)
module.exports=LikeModel