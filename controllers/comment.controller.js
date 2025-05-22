import Comment from '../models/comment.model.js';
import User from '../models/user.model.js';

export const getCommentByPost = async (req, res) => {
    // const page = parseInt(req.query.page) || 1;
    // const limit = parseInt(req.query.limit) || 5;

    // const comments = await Comment.find()
    //     .populate('user')
    //     .limit(limit)
    //     .skip((page - 1) * limit);
    // const totalComments = await Comment.countDocuments();
    // const hasMore = page * limit < totalComments;
    const comments = await Comment.find({ post: req.params.postId })
        .populate('user', 'username img')
        .sort({ createdAt: -1 });
    res.status(200).json(comments);
};
export const getComment = async (req, res) => {
    const post = await Comment.findOne({ slug: req.params.slug }).populate(
        'user'
    );
    res.status(200).json(post);
};
export const createNewComment = async (req, res) => {
    const clerkUserId = req.auth.userId;
    if (!clerkUserId) {
        return res.status(401).json('Not authenticated');
    }
    const user = await User.findOne({ clerkUserId });
    if (!user) {
        return res.status(404).json('User not found!');
    }
    const newComment = new Comment({ user: user._id, ...req.body });
    const comment = await newComment.save();
    res.status(200).json(comment);
};
export const deleteComment = async (req, res) => {
    const clerkUserId = req.auth.userId;
    const id = req.params.id;

    if (!clerkUserId) {
        return res.status(401).json('Not authenticated!');
    }
    const role = req.auth.sessionClaims?.metadata?.role || 'user';
    if (role === 'admin') {
        await Comment.findByIdAndDelete(id);
        return res.status(200).json('Comment deleted');
    }
    const user = User.findOne({ clerkUserId });
    const deleteComment = await Comment.findByIdAndDelete({
        _id: id,
        user: user._id
    });
    if (!deleteComment) {
        return res.status(403).json('You can delete only your comment!');
    }
    res.status(200).json('Comment deleted');
};
