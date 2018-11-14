const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

const secret = require('./secret');
const User = require('../models/user');


module.exports = (passport) => {
    let opts = {};

    opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
    opts.secretOrKey = secret.appSecret;

    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
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