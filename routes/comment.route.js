import express from 'express';
import {
    createNewComment,
    getCommentByPost,
    getComment,
    deleteComment
} from '../controllers/comment.controller.js';
const route = express.Router();

route.get('/:postId', getCommentByPost);
route.get('/:postId', getComment);
route.post('/', createNewComment);
route.delete('/:id', deleteComment);

export default route;
