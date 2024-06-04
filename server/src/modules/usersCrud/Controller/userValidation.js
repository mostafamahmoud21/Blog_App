const joi = require('joi');

const signupSchema=joi.object({
    name:joi.string().min(3).max(30).required(),
    email:joi.string().email().required(),
    password:joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    repassword:joi.ref('password'),
    profilePicture:joi.string()
})

const signinSchema=joi.object({
    email:joi.string().email().required(),
    password:joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
})

const edituserSchema=joi.object({
    name:joi.string().min(3).max(30).trim().optional(),
    email:joi.string().email().optional(),
    password:joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).optional(),
    profilePicture:joi.string().optional()
})
module.exports={signupSchema,signinSchema,edituserSchema}