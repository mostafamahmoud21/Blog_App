const LikeModel = require("../../../database/models/LikeAndDislikeModel.js");
const categoryModel = require("../../../database/models/categoryModel.js");
const commentModel = require("../../../database/models/commentModel.js");
const postModel = require("../../../database/models/postModel.js");
const userModel = require("../../../database/models/userModel.js");
const { verifyToken } = require("../../../middlewares/Auth.js");
const uploadImage = require('../../../utils/uploadImage.js');

const addPost = async (req, res) => {
    try {
        const { title, desc, photo, category } = req.body;
        const userId = req.user.userId;

        let existCategory = await categoryModel.findOne({ category: category })

        if (!existCategory) {
            existCategory = new categoryModel({ category: category });
            await existCategory.save();
        }
        const uploadedPhoto = await uploadImage.uploadimage(photo);

        const newPost = new postModel({
            title,
            desc,
            photo: uploadedPhoto,
            userId,
            category: existCategory._id
        });

        const savedPost = await newPost.save();
        res.status(201).json({ success: true, message: "Post added successfully", post: savedPost });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to add post" });
    }
}

const viewPosts = async (req, res) => {
    try {
        const page = req.query.page * 1 || 1
        const limit = req.query.page * 1 || 6
        const skip = (page - 1) * limit
        const posts = await postModel.find({}).populate('category','category').skip(skip).limit(limit);
        res.json({ success: true, message: "Posts retrieved successfully", posts: posts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to retrieve posts" });
    }
}

const ViewOnePost = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the post by ID
        const post = await postModel.findById(id, '-_id -__v').populate('userId', '-_id name profilePicture');
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const likeData = await LikeModel.find({ postId: id });

        // Count likes and dislikes
        const likes = likeData.filter(like => like.like === 1).length;
        const dislikes = likeData.filter(dislike => dislike.dislike === 1).length;
        const Comments = await commentModel.find({ postId: id }).populate('userId', 'name profilePicture -_id').select('-_id comment').select('comment createdAt').sort({ createdAt: -1 });
        const response = {
            success: true,
            message: "Post retrieved successfully",
            post,
            likes,
            dislikes, Comments
        };

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to retrieve post" });
    }
}

const deletePost = async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role;

    try {

        const post = await postModel.findByIdAndDelete(postId);

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const isAuthorized = userRole === 'admin' || post.userId.equals(userId);
        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: "You are not authorized to delete this post" });
        }

        await Promise.all([
            LikeModel.deleteMany({ postId }),
            commentModel.deleteMany({ postId }),
            uploadImage.deleteImage(post.photo)
        ]);

        return res.status(200).json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to delete post" });
    }
};

const editPost = async (req, res) => {
    const { id } = req.params;
    const { title, desc, photo, category } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    try {
        const post = await postModel.findById(id);

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const isAuthorized = userRole === 'admin' || post.userId.equals(userId);

        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: "You are not authorized to update this post" });
        }

        if (title) post.title = title;
        if (desc) post.desc = desc;
        if (photo) {
            const uploadedPhoto = await uploadImage.uploadimage(photo);
            post.photo = uploadedPhoto;
        }
        if (category) post.category = category

        await post.save();

        return res.json({ success: true, message: "Post updated successfully", post });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Failed to update post" });
    }
};

// const getCommentPost = async (req, res) => {
//     try {
//         const { postId } = req.params;
//         const post = await postModel.findOne({ _id: postId }).populate('userId', 'name profilePicture -_id');
//         const Comments = await commentModel.find({ postId: postId }).populate('userId', 'name profilePicture -_id').select('-_id comment').select('comment createdAt').sort({ createdAt: -1 });
//         const likesData = await LikeModel.find({ postId: postId });
//         const likes = likesData.filter(like => like.like === 1);
//         const dislikes = likesData.filter(dislike => dislike.dislike === 1);
//         const likeCount = likes.length;
//         const dislikeCount = dislikes.length;
//         const response = {
//             success: true,
//             message: "Post retrieved successfully",
//             llikes: {
//                 count: likeCount,
//             },
//             dislikes: {
//                 count: dislikeCount,
//             }
//         };

//         res.json({ post, Comments, response });
//     } catch (error) {
//         console.log(error);
//         res.json({ message: "error" });
//     }
// }

const getPostsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        if(!categoryId){
            await categoryModel.findById(categoryId)
            return res.status(500).json({ success: false, message: "Post not found" });
        }
        const posts = await postModel.find({ category: categoryId })
            .select('-_id -userId')
            .populate('userId', 'name profilePicture -_id');

        return res.json({ success: true, message: "Posts retrieved successfully", posts:posts });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to retrieve posts by category" });
    }
};


const likePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.userId;

        // Check if the post exists
        const existPost = await postModel.findById(postId);
        if (!existPost) {
            return res.status(400).json({ message: "Post not found" });
        }

        // Check if the user has already reacted to the post
        const existingReaction = await LikeModel.findOne({ postId, userId });

        if (existingReaction) {
            if (existingReaction.like === 1) {
                return res.status(200).json({ message: "Post already liked" });
            } else {
                // If the existing reaction is a dislike, update it to a like
                existingReaction.like = 1;
                existingReaction.dislike = 0;
                await existingReaction.save();
                return res.status(200).json({ message: "Post liked successfully" });
            }
        }

        // If no reaction exists, create a new like
        const newReaction = new LikeModel({ postId, userId, like: 1 });
        await newReaction.save();

        return res.status(201).json({ message: "Post liked successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const dislikePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.userId;

        // Check if the post exists
        const existPost = await postModel.findById(postId);
        if (!existPost) {
            return res.status(400).json({ message: "Post not found" });
        }

        // Check if the user has already reacted to the post
        const existingReaction = await LikeModel.findOne({ postId, userId });

        if (existingReaction) {
            if (existingReaction.dislike === 1) {
                return res.status(200).json({ message: "Post already disliked" });
            } else {
                // If the existing reaction is a like, update it to a dislike
                existingReaction.like = 0;
                existingReaction.dislike = 1;
                await existingReaction.save();
                return res.status(200).json({ message: "Post disliked successfully" });
            }
        }

        // If no reaction exists, create a new dislike
        const newReaction = new LikeModel({ postId, userId, dislike: 1 });
        await newReaction.save();

        return res.status(201).json({ message: "Post disliked successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


module.exports = { addPost, viewPosts, ViewOnePost, editPost, deletePost, likePost, dislikePost, getPostsByCategory };
