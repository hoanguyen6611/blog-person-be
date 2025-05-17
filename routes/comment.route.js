import express from 'express';
import {
    createNewComment,
    getCommentByPost,
    getComment
} from '../controllers/comment.controller.js';
const route = express.Router();

route.get('/:postId', getCommentByPost);
route.get('/:postId', getComment);
route.post('/', createNewComment);

export default route;
