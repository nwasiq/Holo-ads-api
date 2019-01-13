const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const BrandSchema = require('../api/models/Brand');
const config = require('./database');

module.exports = function (passport) {
    let opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = config.secret;
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        console.log(jwt_payload);
        BrandSchema.getBrandById(jwt_payload._id, (err, brand) => {
            if (err) {
                return done(err, false);
            }

            if (brand) {
                return done(null, brand);
            } else {
                return done(null, false);
            }
        });
    }));
}
