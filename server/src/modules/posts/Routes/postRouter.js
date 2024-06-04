const express=require('express');
const PostControllers = require('../Controller/postController.js');
const { verifyToken } = require('../../../middlewares/Auth.js');
const { addPostSchema ,editPostSchema} = require('../Controller/postValidation.js');
const validation = require('../../../middlewares/validation.js');
const postRouter=express.Router()

postRouter.post('/addPost',verifyToken,validation(addPostSchema),PostControllers.addPost)
postRouter.get('/viewPost',PostControllers.viewPosts)
postRouter.get('/viewOnePosts/:id',PostControllers.ViewOnePost)
postRouter.put('/editPosts/:id',verifyToken,validation(editPostSchema),PostControllers.editPost)
postRouter.delete('/deletePost/:id',verifyToken,PostControllers.deletePost)
//postRouter.get('/commentPost/:postId',verifyToken,PostControllers.getCommentPost)
postRouter.post('/:postId/like', verifyToken,PostControllers.likePost);
postRouter.post('/:postId/dislike', verifyToken,PostControllers.dislikePost);
postRouter.get('/category/:id', verifyToken,PostControllers.getPostsByCategory);
//postRouter.post('/disLike/:postId',verifyToken,PostControllers.disLike)

module.exports=postRouter 