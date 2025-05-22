import express from 'express';
import {
    getUserSavedPosts,
    savedPost
} from '../controllers/user.controller.js';
const route = express.Router();

route.get('/saved', getUserSavedPosts);
route.patch('/save', savedPost);

export default route;
