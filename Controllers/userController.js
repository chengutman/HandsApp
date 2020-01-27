const express = require('express');
const router = express.Router();
const userHandler = require('../Handlers/userHandler');

const postHandler = require('../Handlers/postHandler');

router.post('/signup', async (req, res) => {
    req.body.user_type = 'Volunteer';
    const result = await userHandler.signup(req, res);
    res.status(200).json(result);
});


router.post('/login', async (req, res) => {
    await userHandler.login(req, res);
});


router.put('/:id/edit', async (req, res) => {
    await userHandler.editUser(req, res);
});


router.delete('/deleteUser', async (req, res) => {
    try{
       const deleted =  await userHandler.deleteUser(req, res);
       if(deleted === -1) throw 'Error on deleting user';
        const posts = await postHandler.getPostsBy({volunteers : req.body.id});
        if(posts === -1) throw 'Error fetching posts';
        req.body.volunteersId = req.body.id;
        posts.forEach(async function(post){
            req.body.post = post;
            const unjoinedResult = await postHandler.unjoinEvent(req);
            if(unjoinedResult === -1) throw 'Error on unjoining event';
        });
        res.status(200).send('DeletedUser');
    }catch(err){
        res.status(500).json({message: err});
    }
});


module.exports = {
    router
};