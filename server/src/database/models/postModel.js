const mongoose=require('mongoose')

const postSchema=mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    desc:{
        type:String,
        required:true,
    },
    photo:{
        type:String,
        required:false,
        default:"",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true
    },
    category:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'category', 
        required: true
    },
},{timestamps:true})

const postModel=mongoose.model('post',postSchema)
module.exports=postModel