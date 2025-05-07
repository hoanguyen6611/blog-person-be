import express from 'express';
const route = express.Router();

route.get('/anothertest', (req, res) => {
    res.status(200).send('User route');
});

export default route;
