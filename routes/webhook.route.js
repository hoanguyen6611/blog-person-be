import express from 'express';
import { clerkWebHook } from '../controllers/webhookcontroller.js';
import bodyParser from 'body-parser';

const route = express.Router();

route.post(
    '/clerk',
    bodyParser.raw({ type: 'application/json' }),
    clerkWebHook
);

export default route;
