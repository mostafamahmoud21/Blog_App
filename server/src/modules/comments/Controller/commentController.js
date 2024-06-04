const commentModel = require("../../../database/models/commentModel.js");
const { verifyToken } = require("../../../middlewares/Auth.js");

const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { comment } = req.body;
        const userID = req.user.userId;

        if (!comment || comment.trim() === "") {
            return res.status(400).json({ success: false, message: "Comment content is required" });
        }

        const newComment = await commentModel.create({ comment, userId: userID, postId });

        return res.status(200).json({ success: true, message: "Comment added successfully", comment: newComment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const updateComment = async (req, res) => {
    try {
        const { comment } = req.body
        const { id } = req.params
        const userID = req.user.userId

        const findComment = await commentModel.findById(id)
        if (!findComment) {
            return res.status(404).json({ success: false, message: "Comment Not Found" })
        }
        if (String(findComment.userId) !== userID) return res.json({ success: false, message: "You are not authorized to update this comment" })

        if (!comment || comment.trim() === "") {
            return res.status(400).json({ success: false, message: "Comment content is required" });
        }
        findComment.comment = comment
        await findComment.save();
        res.status(200).json({ success: true, message: "Comment updated successfuly", comment: findComment })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const userID = req.user.userId;
        const findComment = await commentModel.findById(id);

        if (!findComment) {
            return res.status(404).json({ success: false, message: "Comment Not Found" });
        }

        if (String(findComment.userId) !== userID && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "You are not authorized to delete this comment" });
        }
        await commentModel.findByIdAndDelete(id);
        return res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = { addComment, updateComment, deleteComment }