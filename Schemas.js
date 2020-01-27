const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
    name: {
        first: {
            type: String,
            required: [true, 'First name Required']
        },
        last: {
            type: String,
            required: [true, ' Last name Required']
        }
    },
    email: {
        type: String,
        required: [true, 'Email Required'],
        unique: true
    },
    password: {
        type: String,
        required: [true, ['Password required']],
        validate: {
            validator: function (v) {
                return v.length >= 8;
            },
            message: 'Minimum 8 charecters for password'
        }
    },
    location: {
        type: String,
        required: true
    },
    profession: {
        type: [String],
        enum: ['None', 'Carpenter', 'Painter', 'Plumber'],
        default: 'None'
    },
    user_type: {
        type: String,
        enum: ['Admin', 'Requester', 'Volunteer']
    }
});

const RequestSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: [true, 'Subject required']
    },
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    operation_dates: {
        from: {
            type: Date,
            required: [true, 'Dates Required'],
        },
        to: {
            type: Date,
            required: [true, 'Dates Required'],
        }
    },
    location: {
        city: String,
        street: {
            name: String,
            number: Number
        },
        entrance: {
            type: String,
            default: '-'
        },
        floor: Number,
        apt_number: {
            type: Number,
            default: 0
        }
    },
    images:{
        type:[String],
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        required: [true, 'Description Required']
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending'
    }
});

const PostSchema = new mongoose.Schema({
    request: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request',
        autopopulate: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    number_of_volunteers: {
        need: Number,
        joined: {
            type: Number,
            default: 0,
        }
    },
    selected_dates: {
        from: Date,
        to: Date
    },
    costum_description: {
        changed: {
            type: Boolean,
            default: false
        },
        description: String,
    },
    professions: [{
        profession: {
            type: String,
            enum: ['None', 'Carpenter', 'Painter', 'Plumber'],
        },
        number_needed: Number
    }],
    volunteers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User'
    },
    cover_image:Number,
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected', 'Archive'],
        default: 'Pending'
    },
    calendar_event: String
});

PostSchema.plugin(require('mongoose-autopopulate'));

const User = mongoose.model('User', UserSchema);
const Request = mongoose.model('Request', RequestSchema);
const Post = mongoose.model('Post', PostSchema);

module.exports = {
    User,
    Request,
    Post
};