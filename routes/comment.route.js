import express from 'express';
import {
    createNewComment,
    getAllComment,
    getComment
} from '../controllers/comment.controller.js';
const route = express.Router();

route.get('/', getAllComment);
route.get('/:slug', getComment);
route.post('/', createNewComment);

export default route;
