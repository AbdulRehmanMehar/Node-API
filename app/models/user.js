const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: mongoose.Types.ObjectId
    },
    name: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    photo: {
        profile: {type: String, default: 'default-profile.png'},
        cover: {type: String, default: 'default-cover.png'},
    },
    socialConnection: {
        google: {type: Boolean, default: false},
        facebook: {type: Boolean, default: false},
        twitter: {type: Boolean, default: false},
    },
    posts: [
        {_id: mongoose.Schema.Types.ObjectId}
    ],
    friends: [
        {
            _id: mongoose.Schema.Types.ObjectId,
            pending: {type: Boolean, default: true}
        }
    ],
});


const User = mongoose.model('User', UserSchema);

module.exports = User;
