const userModel = require("../../../database/models/userModel.js");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const uploadImage = require('../../../utils/uploadImage.js');
const mongoose = require("mongoose");
const { verifyToken } = require("../../../middlewares/Auth.js");
const postModel = require("../../../database/models/postModel.js");
const LikeModel = require("../../../database/models/LikeAndDislikeModel.js");
const commentModel = require("../../../database/models/commentModel.js");

const signup = async (req, res) => {
    try {
        const { name, email, password, profilePicture } = req.body;
        const existingUser = await userModel.findOne({ email });
        if (existingUser) return res.status(409).json({ success: false, message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, Number(process.env.ROUND));
        const photo = await uploadImage.uploadimage(profilePicture)
        const userAdded = await userModel.create({ name, email, password: hashedPassword, profilePicture: photo });
        const token = jwt.sign({ id: userAdded._id, role: userAdded.role }, process.env.JWT_KEY, { expiresIn: '1h' })

        return res.status(200).json({ success: true, message: 'Added successfully', user: userAdded, token });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_KEY, { expiresIn: '1h' })
            return res.status(200).json({ success: true, message: 'Login successfully', user: `Welcome ${user.name}`, token });
        } else {
            return res.status(401).json({ success: false, message: 'Password incorrect' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const editProfile = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user.userId
        if (userId !== id) {
            return res.status(403).json({ success: false, message: "You are not authorized to update this profile" });
        }
        const { name, email, password, profilePicture } = req.body
        const userFound = await userModel.findById(id)
        if (!userFound) return res.status(404).json({ success: false, message: "User not found" })

        if (name) userFound.name = name;
        if (email) userFound.email = email;
        if (password) userFound.password = await bcrypt.hash(password, Number(process.env.ROUND));
        if (profilePicture) userFound.profilePicture = await uploadImage.uploadimage(profilePicture);

        await userFound.save()
        return res.status(200).json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' });

    }
}

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user.role;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Valid User ID is required' });
        }

        const userToDelete = await userModel.findById(id);
        if (!userToDelete) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isAuthorized = userRole === 'admin';
        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: "You are not authorized to delete this user" });
        }

        if (userToDelete.profilePicture) {
            await uploadImage.deleteimage(userToDelete.profilePicture);
        }

        await postModel.deleteMany({ userId: id });
        await userModel.findByIdAndDelete(id);

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.log('Delete user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const postsLiked = async (req, res) => {
    try {
        const { userId } = req.user;
        const likes = await LikeModel.find({ userId: userId, like: 1 }).populate('postId', 'title desc photo');
        if (!likes) {
            return res.status(404).json({ success: false, message: "Post not found" })
        }
        const posts = likes.map(like => like.postId);
        return res.status(200).json({ success: true, postsLiked: posts });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to retrieve liked posts" });
    }
};

const userComments = async (req, res) => {
    try {
        const { userId } = req.user;
        const comments = await commentModel.find({ userId: userId }).populate('postId', 'title desc photo');
        if (!comments) {
            return res.status(404).json({ success: false, message: "Not Comments" })
        }
        return res.status(200).json({ success: true, Comments: comments });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to retrieve user's comments" });
    }
};

const myPosts = async (req, res) => {
    try {
        const { userId } = req.user;
        const posts = await postModel.find({ userId: userId });
        if (!posts) {
            return res.status(404).json({ success: false, message: "There are no posts" })
        }
        return res.status(200).json({ success: true, myPosts: posts });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to retrieve user's posts" });
    }
};

module.exports = { signup, signin, editProfile, deleteUser, postsLiked, userComments, myPosts };
