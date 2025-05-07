import express from 'express';
import {
    getPosts,
    getPost,
    createNewPost,
    deletePost
} from '../controllers/post.controller.js';

const route = express.Router();
route.get('/', getPosts);
route.get('/:slug', getPost);
route.post('/', createNewPost);
route.delete('/:id', deletePost);

export default route;
