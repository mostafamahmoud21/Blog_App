const validation=(schema)=>{
    return (req,res,next)=>{
        let {error}=schema.validate(req.body,{abortEarly:false})
        //console.log(error)
        if(!error){
            next()
        }else{
            res.json(error.details)
        }
    }
}

module.exports=validation