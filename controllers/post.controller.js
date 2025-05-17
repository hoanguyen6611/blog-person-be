import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import ImageKit from 'imagekit';

export const getPosts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const posts = await Post.find()
        .populate('user', 'username last_name first_name')
        .limit(limit)
        .skip((page - 1) * limit);
    const totalPosts = await Post.countDocuments();
    const hasMore = page * limit < totalPosts;
    res.status(200).json({ posts, hasMore });
};
export const getPost = async (req, res) => {
    const post = await Post.findOne({ slug: req.params.slug }).populate(
        'user',
        'username img last_name first_name'
    );
    res.status(200).json(post);
};

export const createNewPost = async (req, res) => {
    const clerkUserId = req.auth.userId;
    if (!clerkUserId) {
        return res.status(401).json('Not authenticated');
    }
    const user = await User.findOne({ clerkUserId });
    if (!user) {
        return res.status(404).json('User not found!');
    }
    let slug = req.body.title.replace(/ /g, '-').toLowerCase();
    let existingPost = await Post.findOne({ slug });
    let counter = 2;
    while (existingPost) {
        slug = `${slug}-${counter}`;
        existingPost = await Post.findOne({ slug });
        counter++;
    }
    const newPost = new Post({ user: user._id, slug, ...req.body });
    const post = await newPost.save();
    res.status(200).json(post);
};
export const deletePost = async (req, res) => {
    const clerkUserId = req.auth.userId;
    if (!clerkUserId) {
        return res.status(401).json('Not authenticated');
    }
    const user = await User.findOne({ clerkUserId });
    const deletePost = await Post.findByIdAndDelete({
        _id: req.params.id,
        user: user._id
    });
    if (!deletePost) {
        res.status(403).json('You can delete only your post!');
    }
    res.status(200).json('Delete post succesfully');
};
const imagekit = new ImageKit({
    publicKey: 'public_WYltmmJOZFWTLK9IloWulX5d22Q=',
    privateKey: 'private_9Q2tvWScSgJG6Ou6Rne6GQN4slY=',
    urlEndpoint: 'https://ik.imagekit.io/cjx1zgaos'
});
export const uploadAuth = async (req, res) => {
    const result = imagekit.getAuthenticationParameters();
    res.send({
        publicKey: imagekit.options.publicKey,
        ...result
    });
};
