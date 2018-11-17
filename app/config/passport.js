const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const secret = require('./secret');
const User = require('../models/user');


module.exports = (passport) => {
    let opts = {};

    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('JWT');
    opts.secretOrKey = secret.appSecret;

    passport.use('jwt',new JWTStrategy(opts, (jwt_payload, done) => {        
        User.findOne({ id: jwt_payload.sub }).exec()
            .then(user => {
                if(user) {
                    done(null, user);
                }else{
                    done(null, false);
                }
            }).catch(error => {
                done(error, false);
            });
    }));
};