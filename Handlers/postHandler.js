const { Request, User, Post } = require('../Schemas');
const requestHandler = require('./requestHandler');
const userHandler = require('./userHandler');

const findPostByRequest = async (reqID, res) => {
    try {
        const post = await Post.findOne({ request: reqID });
        return post;
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


const deletePost = async (postID, res) => {
    try {
        await Post.deleteOne({ _id: postID });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}


const getPostsBy = async (query) => {
    try {
        const results = await Post.find(query);
        return results;
    } catch (err) {
        return -1;
    }
}


const addPost = async (req) => {
    const newPost = new Post(req.body);
    try {
        const result = await newPost.save();
        return result;
    } catch (err) {
        return -1;
    }
}


const editPost = async (req, res) => {
    try {
        await Post.updateOne({ _id: req.params.id }, req.body);
        return 'Updated Post';
    } catch (err) {
        return -1;
    }
}


const addCalenderEventId = async (postId, eventId) => {
    try {
        await Post.updateOne({ _id: postId }, { calendar_event: eventId });
        return 0;
    } catch (err) {
        return -1;
    }
}

const unjoinEvent = async (req) => {
    var queryToUpdate;
    if (req.body.post.status === 'Accepted') {
        queryToUpdate = {
            'number_of_volunteers.joined': req.body.post.number_of_volunteers.joined - 1,
            status: 'Pending',
            $pull: { volunteers: req.body.volunteersId }
        }
    } else {
        queryToUpdate = {
            'number_of_volunteers.joined': req.body.post.number_of_volunteers.joined - 1,
            $pull: { volunteers: req.body.volunteersId }
        }
    }

    try {
        await Post.updateOne({ _id: req.body.post._id }, queryToUpdate);
        return 0;
    } catch (err) {
        return -1;
    }
}
const joinEvent = async (req, res) => {
    var queryToUpdate;
    if (req.body.post.number_of_volunteers.joined + 1 === req.body.post.number_of_volunteers.need) {
        queryToUpdate = {
            'number_of_volunteers.joined': req.body.post.number_of_volunteers.joined + 1,
            status: 'Accepted',
            $push: { volunteers: req.body.volunteersId }
        }
    } else {
        queryToUpdate = {
            'number_of_volunteers.joined': req.body.post.number_of_volunteers.joined + 1,
            $push: { volunteers: req.body.volunteersId }
        }
    }
    try {
        await Post.updateOne({ _id: req.body.post._id }, queryToUpdate);
        return 0;
    } catch (err) {
        return -1;
    }
}


const composeCalendarEvent = (post, request) => {
    var eventDescription;
    if (post.costum_description.changed) {
        eventDescription = post.costum_description.description;
    } else {
        eventDescription = request[0].description;
    }
    const event = {
        'summary': request[0].subject,
        'location': request[0].location.city,
        'description': eventDescription,
        'start': {
            'dateTime': post.selected_dates.from,
            'timeZone': 'Israel',
        },
        'end': {
            'dateTime': post.selected_dates.to,
            'timeZone': 'Israel',
        },
        'attendees': [],
    };
    return event;
}


module.exports = {
    findPostByRequest,
    deletePost,
    getPostsBy,
    addPost,
    editPost,
    joinEvent,
    composeCalendarEvent,
    addCalenderEventId,
    unjoinEvent
}