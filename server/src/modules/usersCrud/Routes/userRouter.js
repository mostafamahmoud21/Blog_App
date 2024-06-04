const userController= require("../Controller/userController.js");
const express=require('express');
const { signinSchema, signupSchema, edituserSchema} = require("../Controller/userValidation.js");
const validation = require("../../../middlewares/validation.js");
const {verifyToken,checkAdminRole} = require("../../../middlewares/Auth.js");
const userRouter=express.Router()

userRouter.post('/signup',validation(signupSchema),userController.signup)
userRouter.post('/signin',validation(signinSchema),userController.signin)
userRouter.put('/editProfile/:id',verifyToken,validation(edituserSchema),userController.editProfile);
userRouter.delete('/deleteUser/:id',verifyToken,userController.deleteUser);
userRouter.get('/postsLiked',verifyToken,userController.postsLiked);
userRouter.get('/Comments',verifyToken,userController.userComments);
userRouter.get('/myPosts',verifyToken,userController.myPosts);
module.exports=userRouter