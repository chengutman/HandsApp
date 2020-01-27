const express = require('express');
const router = express.Router();
const postHandler = require('../Handlers/postHandler');
const requestHandler = require('../Handlers/requestHandler');
const userHandler = require('../Handlers/userHandler');
const calendarService = require('../Services/googleCalendarService/CalendarEvents');
const googleAuth = require('../Services/googleCalendarService/GoogleCalendarAuth');


router.get('/showAllPosts', async (req, res, next) => {
    try {
        let query = { status: 'Pending' };
        const results = await postHandler.getPostsBy(query);
        if (results === -1) throw 'Error on fetching posts';
        if (!results) throw 'Empty';
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});


router.get('/:constriant/:value/showPosts', async (req, res, next) => {
    try {
        let constriant = req.params.constriant;
        var query;
        var postQuery;
        if (constriant == 'location') {
            query = { 'location.city': req.params.value };
            const requestsIds = await requestHandler.findRequestsBy(query);
            if (requestsIds === -1 || !requestsIds.length) {
                let errorMsg = (requestsIds === -1) ? 'Error On fetching requests' : 'No Requests';
                throw errorMsg;
            }
            postQuery = {
                status: 'Pending',
                request: { $in: requestsIds }
            };
        } else {
            postQuery = {
                status: 'Pending',
                'professions.profession': req.params.value
            };
        }
        const results = await postHandler.getPostsBy(postQuery);
        if (results === -1 || !results.length) {
            let errorMsg = (results === -1) ? 'Error on fetch posts' : 'No Posts';
            throw errorMsg;
        }
        res.status(200).json(results);

    } catch (err) {
        res.status(500).json({ message: err });
    }
});


router.get('/:user/:time/showUserPosts', async (req, res, next) => {
    try {
        var query = {};
        const user = await userHandler.getUser(req.params.user);
        if (user === -1) throw 'Error On user Fetch';
        if (user.user_type === 'Admin') query.admin = req.params.user;
        else query.volunteers = req.params.user;
        query.status = (req.params.time === 'future') ? { $in: ['Pending', 'Accepted'] } : 'Archive';
        const results = await postHandler.getPostsBy(query);
        if (results === -1 || !results.length) {
            let errorMsg = (results === -1) ? 'Error On fetching posts' : 'No posts';
            throw errorMsg;
        }
        res.status(200).json(results);

    } catch (err) {
        res.status(500).json({ message: req.body.errorMsg });
    }
});


router.get('/:id/showPost', async (req, res, next) => {
    try {
        let query = { _id: req.params.id };
        const result = await postHandler.getPostsBy(query);
        if (result === -1 || !result) {
            let errorMsg = (result === -1) ? 'Error On fetching post' : 'No post';
            throw errorMsg;
        }
       res.status(200).json(result);
    } catch (err) {
        resres.status(500).json({ message: err });
    }
});

router.post('/addPost', async (req, res, next) => {
    try {
        const post = await postHandler.addPost(req);
        if (post === -1) throw 'Error On creating a post';
        const request = await requestHandler.findRequestsBy({ _id: req.body.request });

        const oAuth2Client = await googleAuth.generateOAuthClient();
        const event = postHandler.composeCalendarEvent(post, request);
        const calResult = await calendarService.addEvent(oAuth2Client, event);
        if (calResult === -1) throw 'Error On creating calendar event';

        const updatePost = await postHandler.addCalenderEventId(post._id, calResult);
        if (updatePost === -1) throw 'Error On updating post ';

        const requester = await userHandler.getUser(request[0].requester);
        if (requester) {
            requestHandler.sendAcceptEmail({
                name: {
                    first: requester.name.first,
                    last: requester.name.last,
                },
                email: requester.email
            });
            res.status(200).send('Added Post');
        }
    } catch (err) {
        await postHandler.deletePost(post._id, res);
        res.status(500).json({ message: err });
    }
});


router.put('/:id/editPost', async (req, res, next) => {
    try {
        if (req.body['number_of_volunteers.need']) {
            const post = await postHandler.getPostsBy({ _id: req.params.id });
            if (post === -1) throw 'Error on fetching post';
            if (post[0].status == 'Accepted' && post[0].number_of_volunteers.need < req.body['number_of_volunteers.need']) {
                req.body.status = 'Pending';
            }
        }
        if (req.body['selected_dates.from'] && req.body['selected_dates.to']) {
            const post = await postHandler.getPostsBy({ _id: req.params.id });
            if (post === -1) throw 'Error on fetching post';
            var event = {
                'start': {
                    'dateTime': req.body['selected_dates.from'],
                    'timeZone': 'Israel',
                },
                'end': {
                    'dateTime': req.body['selected_dates.to'],
                    'timeZone': 'Israel',
                }
            }
            const oAuth2Client = await googleAuth.generateOAuthClient();
            const result = await calendarService.editEvent(oAuth2Client, post[0].calendar_event, event);
            if (result === -1) throw 'Error on editing calendar event';
        }
        const result = await postHandler.editPost(req, res);
        if (result === -1) throw 'Error on edit post';
        res.status(200).send(result);
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

router.put('/:post/unjoinEvent', async (req, res, next) => {
    try {
        const post = await postHandler.getPostsBy({ _id: req.params.post });
        if (post === -1) throw 'Error on fetching post';
        req.body.post = post[0];
        const result = await postHandler.unjoinEvent(req);
        if (result === -1) throw 'Error on unjoining an event';
        res.status(200).send('Unjoined Event');
    } catch (err) {
        res.status(500).json({ message: err });
    }
});
router.put('/:post/joinEvent', async (req, res, next) => {
    try {
        const post = await postHandler.getPostsBy({ _id: req.params.post });
        if (post === -1) throw 'Error on fetching post';
        req.body.post = post[0];
        const result = await postHandler.joinEvent(req, res);
        if (result === -1) throw 'Error on updating  post';

        const volunteer = await userHandler.getUser(req.body.volunteersId);
        if (volunteer === -1) throw 'Error on fetching user';

        const oAuth2Client = await googleAuth.generateOAuthClient();
        const inviteResult = calendarService.sendInvite(oAuth2Client, post[0].calendar_event, volunteer.email);
        if (inviteResult === -1) throw 'Error on  calendar invite ';

        res.status(200).send('Joined Event');


    } catch (err) {
        res.status(500).json({ message: err });
    }

});


router.delete('/deletePost', async (req, res, next) => {
    try {
        const post = await postHandler.getPostsBy({ _id: req.body.postId });
        if (post === -1) throw 'Error on fetching post';

        await postHandler.deletePost(req.body.postId, res);
        const request = await requestHandler.findRequester(post[0].request);
        if (request === -1) throw 'Error on post requester';

        let requesterID = request.requester;
        await requestHandler.deleteRequest(post[0].request, res);
        requestHandler.sendRejectEmail(requesterID, res);
        await requestHandler.deleteRequester(requesterID, res);

        const oAuth2Client = await googleAuth.generateOAuthClient();
        const deleteCalEventResult = calendarService.deleteEvent(oAuth2Client, post[0].calendar_event);
        if (deleteCalEventResult === -1) throw 'Error deleting event from calendar';
        res.status(200).send('Deleted Post');
    } catch (err) {
        res.status(500).json({ message: err });
    }
});


module.exports = {
    router
} 