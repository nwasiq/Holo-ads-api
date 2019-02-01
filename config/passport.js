const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Advertiser = require('../api/models/Advertiser');
const config = require('./database');

module.exports = function (passport) {
    let opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = config.secret;
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        console.log(jwt_payload);
        Advertiser.getAdvertiserById(jwt_payload._id, (err, advertiser) => {
            if (err) {
                return done(err, false);
            }

            if (advertiser) {
                return done(null, advertiser);
            } else {
                return done(null, false);
            }
        });
    }));
}
