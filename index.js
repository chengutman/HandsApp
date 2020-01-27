const express = require('express');
require('dotenv').config();

const connection = require('./Services/db_connection');
const userRouter = require('./Controllers/userController').router;
const requestRouter = require('./Controllers/requestController').router;
const postRouter = require('./Controllers/postController').router;
const app = express();
const port = process.env.PORT || 8080;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/user', userRouter);
app.use('/request',requestRouter);
app.use('/post',postRouter);

app.listen(port);



console.log(`listening on port ${port}`);