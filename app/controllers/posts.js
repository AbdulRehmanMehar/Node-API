const express = require('express');
const router = express.Router();

const Post = require('../models/post');
const User = require('../models/user');

Array.prototype.remove = () => {
    let what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

router.get('/', (req, res) => {
    Post.find({}).exec()
        .then(posts => {
            res.status(200).json({
                success: true,
                message: 'Posts List',
                data: posts
            });
        }).catch(error => {
            res.status(500).json({
                success: false,
                message: 'Something went wrong',
                data: error
            });
        });
});

router.post('/add', (req, res) => {
    let post = new Post({
        content: req.body.content,
        info: {
            uid: req.body.userId
        }
    });
    post.save()
        .then(post => {
            User.updateOne(
                {_id: req.body.userId}, 
                {$push: {posts: {_id: post._id, isShared: false}}}, 
                {safe: true, upsert: true},
                (error, success) => console.log(error, success)
            );
            res.status(201).json({
                success: true,
                message: 'Post Created',
                data: post
            });
        }).catch(error => {
            res.status(500).json({
                success: false,
                message: 'Something went wrong',
                data: error,
            });
        });
});

router.get('/:postID', (req, res) => {
    const id = req.params.postID;
    Post.findById(id) 
        .then(post => {
            if(post){
                res.status(200).json({
                    success: true,
                    message: 'Post Found',
                    data: post
                });
            }else{
                res.status(400).json({
                    success: false,
                    message: 'Invalid Post ID',
                    data: null,
                });
            }
        }).catch(error => {
            res.status(500).json({
                success: false,
                message: 'Something went wrong',
                data: error
            });
        });
});

router.patch('/:postID', (req, res) => {
    const id = req.params.postID;
    Post.findById(id)
        .then(post => {
            if(post){
                let newPost = {
                    content: post.content,
                    likes:  post.likes,
                    comments: post.comments,
                    shares: post.shares
                };
                if(req.body.content != null){
                    newPost.content = (req.body.content != post.content) ? req.body.content: post.content;
                }
                if(req.body.likerID){
                    let obj = {uid: req.body.likerID};
                    if(newPost.likes.length == 0){
                        newPost.likes.push(obj);
                    }else{
                        newPost.likes.forEach((like) => {
                            if(req.body.likerID == like.uid){
                                newPost.likes.splice(newPost.likes.indexOf(i => {
                                    return req.body.likerID == like.uid;
                                }), 1);
                            }else{
                                newPost.likes.push(obj);
                            }
                        });
                    }
                    newPost.likes = newPost.likes;
                }
                if(req.body.commenterID != null && req.body.commentMsg != null){
                    let obj = {
                        message: req.body.commentMsg,
                        info: {
                            uid: req.body.commenterID,
                            isReply: (req.body.isReply) ? req.body.isReply: false,
                            cid: (req.body.isReply) ? req.body.commentID: null,
                        }
                    };
                    newPost.comments.push(obj);
                }
                if(req.body.deleteComment && req.body.commentID != null && req.body.commenterID != null){
                    let commentsArray = newPost.comments.filter(comment => {
                        if(comment._id == req.body.commentID){
                            return req.body.commentID != comment._id;
                        }else if(comment.info.cid == req.body.commentID){
                            return req.body.commentID != comment.info.cid;
                        }else{
                            return comment;
                        }
                    });
                    newPost.comments = commentsArray;
                }
                if(req.body.sharePost && req.body.sharerID != null){
                    if(newPost.shares.length == 0){
                        User.updateOne(
                            {_id: req.body.sharerID}, 
                            {$push: {posts: {_id: id, isShared: true}}}, 
                            {safe: true, upsert: true},
                            (error, success) => console.log(error, success)
                        );
                        newPost.shares.push({uid: req.body.sharerID});
                    }else{
                        newPost.shares.forEach(share => {
                            if(req.body.sharerID != share.uid){
                                User.updateOne(
                                    {_id: req.body.sharerID}, 
                                    {$push: {posts: {_id: id, isShared: true}}}, 
                                    {safe: true, upsert: true},
                                    (error, success) => console.log(error, success)
                                );
                                newPost.shares.push({uid: sharerID});
                            }
                        })
                    }
                }         
                if(req.body.unshare && req.body.sharerID){
                    newPost.shares.forEach(share => {
                        if(req.body.sharerID == share.uid){
                            User.updateOne(
                                {_id: req.body.sharerID},
                                {$pullAll: {posts: [{_id: id, isShared: true}] }},
                                {safe: true, upsert: true},
                                (error, success) => console.log(error, success)
                            );
                            newPost.shares.splice(newPost.shares.indexOf(i => {
                                return req.body.sharerID == share.uid;
                            }), 1);
                        }
                    });
                }      
                Post.findByIdAndUpdate(id, {$set: newPost}, {new: true})
                    .then(result => {
                        res.status(200).json({
                            success: true,
                            message: "Post Updated Successfully",
                            data: result,
                        });
                    }).catch(error => {
                        res.status(500).json({
                            success: false,
                            message: "Something went wrong",
                            data: error
                        });
                    });
            }else{
                res.status(400).json({
                    success: false,
                    message: 'Invalid Post Id',
                    data: null
                });
            }
        }).catch(error => {
            res.status(500).json({
                success: false,
                message: 'Something went wrong',
                data: error
            });
        });
});

router.delete('/:postID', (req, res) => {
    const id = req.params.postID;
    Post.findById(id)
        .then(post => {
            if(post){
                Post.deleteOne({_id: post._id})
                    .then(deleted => {
                        User.updateOne(
                            {_id: post.info.uid},
                            {$pullAll: {posts: [{_id: id, isShared: false}] }},
                            {safe: true, upsert: true},
                            (error, success) => console.log(error, success)
                        );
                        res.status(200).json({
                            success: true,
                            message: 'Post deleted',
                            data: null
                        });
                    }).catch(error => {
                        res.status(500).json({
                            success: true,
                            message: 'Something went wrong',
                            data: error
                        });
                    });     
            }else{
                res.status(400).json({
                    success: false,
                    message: 'Invalid Post Id',
                    data: null
                });
            }
        }).catch(error => {
            res.status(500).json({
                success: false,
                message: 'Something went wrong',
                data: error
            });
        });
});

module.exports = router;    