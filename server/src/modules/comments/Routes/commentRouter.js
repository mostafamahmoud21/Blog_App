const express=require('express')
const commentController = require('../Controller/commentController.js')
const commentRouter=express.Router()
const { verifyToken } = require('../../../middlewares/Auth.js');

commentRouter.post('/comment/:postId',verifyToken,commentController.addComment)
commentRouter.put('/comment/:id',verifyToken,commentController.updateComment)
commentRouter.delete('/comment/:id',verifyToken,commentController.deleteComment)

module.exports=commentRouter