const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: mongoose.Types.ObjectId
    },
    sort: {type: String, default: 'photo'},
    content: String,
    likes: [
        {uid: mongoose.Schema.Types.ObjectId}, // User ID
    ],
    comments: [
        {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                default: mongoose.Types.ObjectId
            },
            message: String,
            info: {
                isReply: Boolean,
                cid: mongoose.Schema.Types.ObjectId, // Comment ID
                date: {type: Date, default: Date.now}
            }
        }
    ],
    shares: [
        {uid: mongoose.Schema.Types.ObjectId}
    ],
    info: {
        uid: mongoose.Schema.Types.ObjectId,
        date: {type: Date, default: Date.now}
    }
});

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;