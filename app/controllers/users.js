const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const User = require('../models/user');
const secret = require('../config/secret');
const mailer = require('../config/nodemailer');




router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    User.find({}).select('-__v -password -socialConnection -email').exec()
        .then(users => {
            res.status(200).json({
                success: true,
                message: 'Users List',
                data: {
                    users: users
                }
            });
        }).catch(error => {
            res.status(200).json({
                success: true,
                message: 'Something went wrong',
                data: error
            });
        });    
});


router.get('/check/uname/:uname', (req, res) => {
    User.findOne({username: req.body.username}).select('-password -__v').exec()
        .then(user => {
            if(user) {
                res.status(200).json({
                    success: true,
                    message: 'User exist with this email',
                    data: user
                });
            }else{
                res.status(400).json({
                    success: false,
                    message: 'User does\'nt Exist',
                    data: false,
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

router.post('/register', (req, res) => {
    User.findOne({email: req.body.email}).exec()
        .then(record => {
            if(record){
                res.status(400).json({
                    success: false,
                    message: "User already exists with this email"
                });
            }else{
                let user = new User({
                    name: req.body.name,
                    email: req.body.email,
                    username: req.body.username,
                    password: bcrypt.hashSync(req.body.password, 10),
                    photo: {
                        profile: (req.body.profile != null) ? req.body.profile : 'default-profile.png',
                        cover: (req.body.cover != null) ? req.body.cover : 'default-cover.png'
                    },
                });
                user.save()
                    .then(result => {
                        mailer.registration(result); // send mail
                        res.status(201).json({
                            success: true,
                            message: 'User is Registered with confirmation link to email',
                            data: result
                        });
                    }).catch(error => {
                        res.status(500).json({
                            success: false,
                            message: 'Something went wrong',
                            data: error
                        });
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

router.post('/login', (req, res) => { // Email can be username or email
    User.findOne({$or: [{email: req.body.email}, {username: req.body.email}]})
        .select('-__v')
        .exec()
        .then(user => {
            if(user) {
                bcrypt.compare(req.body.password, user.password, (error, success) => {
                    if(success) {
                        const token = jwt.sign({_id: user._id}, secret.appSecret, {expiresIn: 604800});
                        user.password = null;
                        res.status(200).json({
                            success: true,
                            message: "Token Created",
                            data: {
                                token: "JWT " +token,
                                user: user
                            }
                        });
                    }
                    if(error) {
                        res.status(400).json({
                            success: false,
                            message: "User Credentials don't match",
                            data: error
                        });
                    }
                    console.log(error, success)
                });
                // res.status(200).json({success: true, message: "Exists", data: user})
            }
            else{
                res.status(400).json({
                    success: false,
                    message: "User not found",
                    data: null
                });
            }
        }).catch(error => {
            res.status(500).json({
                success: false,
                message: "Something went wrong => find",
                data: error
            });
        });
});

// Get User By ID; ALWAYS USE DYNAMIC URLS BELOW THE STATIC URLS SO IT MAY ONLY GET CALLED IF NO STATIC URL IS FOUND
router.get('/:uid', passport.authenticate('jwt', {session: false}), (req, res) => {
    const uid = req.params.uid;
    User.findById(uid).select('-password -__v').exec()
        .then(user => {
            if(user){
                res.status(200).json({
                    success: true,
                    message: "User Found",
                    data: user
                });
            }else{
                res.status(400).json({
                    success: false,
                    message: "User not Found",
                    data: null
                });
            }
        }).catch(error => {
            res.status(500).json({
                success: false,
                message: "Something went wrong",
                data: error
            });
        });
});

router.patch('/:uid', passport.authenticate('jwt', {session: false}), (req, res) => {
    const uid = req.params.uid;
    User.findById(uid).select('-posts -friends -__v').exec()
        .then(user => {
            if(user){
                let newUser = {
                    name: user.name,
                    password: user.password,
                    photo: {
                        profile: user.photo.profile,
                        cover: user.photo.cover,
                    },
                    socialConnection: {
                        google: user.socialConnection.google,
                        twitter: user.socialConnection.twitter,
                        facebook: user.socialConnection.facebook,
                    }
                };

                if (req.body.name != null) {
                    newUser.name = (req.body.name != user.name) ? req.body.name : user.name;
                }
                if(req.body.password != null){
                    newUser.password = (bcrypt.compareSync(req.body.password, user.password)) ? user.password : bcrypt.hashSync(req.body.password, 10);
                }
                if(req.body.profile != null){
                    newUser.photo.profile = (req.body.profile != user.photo.profile) ? req.body.profile : user.photo.profile;
                }
                if (req.body.cover != null) {
                    newUser.photo.cover = (req.body.cover != user.photo.cover) ? req.body.cover : user.photo.cover;
                }
                if (req.body.google != null) {
                    newUser.socialConnection.google = (req.body.google != user.socialConnection.google) ? req.body.google : user.socialConnection.google;
                }
                if (req.body.facebook != null) {
                    newUser.socialConnection.facebook = (req.body.facebook != user.socialConnection.facebook) ? req.body.facebook : user.socialConnection.facebook;
                }
                if (req.body.twitter != null) {
                    newUser.socialConnection.twitter = (req.body.twitter != user.socialConnection.twitter) ? req.body.twitter : user.socialConnection.twitter;
                }
                
                User.findByIdAndUpdate(user._id, { $set: newUser }, { new: true }).select('-posts -friends -__v')
                    .then(updated => {
                        res.status(200).json({
                            success: true,
                            message: "User updated",
                            data: updated
                        });
                    }).catch(error => {
                        res.status(500).json({
                            success: false,
                            message: "Something went wrong => update",
                            data: error
                        });
                    });
            }else{
                res.status(400).json({
                    success: false,
                    message: "User not Found",
                    data: null
                });
            }
        }).catch(error => {
            res.status(500).json({
                success: false,
                message: "Something went wrong",
                data: error
            });
        });
});

router.delete('/:uid', passport.authenticate('jwt', {session: false}), (req, res) => {
    const uid = req.params.uid;
    User.findById(uid).exec()
        .then(user => {
            if(user) {
                User.deleteOne({ _id: user._id }).exec()
                    .then(_ => {
                        res.status(200).json({
                            success: true,
                            message: 'User deleted',
                            data: null
                        });
                    }).catch(error => {
                        res.status(500).json({
                            success: false,
                            message: 'Something went wrong',
                            data: error
                        });
                    });
            }else{
                res.status(400).json({
                    success: false,
                    message: 'User not found',
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



