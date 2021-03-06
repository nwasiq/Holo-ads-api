'use strict';
const passport = require('passport');
const jwt = require('jsonwebtoken');

module.exports = function (app) {

    var controller = require('./controller');

    //temp route
    app.route('/getUsers')
        .get(controller.getAllUsers);

    app.route('/registerApp')
        .post(controller.registerApp);

    app.route('/registerAdvertiser')
        .post(controller.registerAdvertiser);

    app.route('/loginAdvertiser')
        .post(controller.loginAdvertiser);

    app.route('/getallads')
        .get(controller.getAllAds);

    app.route('/userRegister')
        .post(controller.userRegister);

    app.route('/registerDev')
        .post(controller.registerDev);

    app.route('/devLogin')
        .post(controller.devLogin);

    // app.route('/deleteallads')
    //     .get(controller.deleteAllAds);

    app.route('/add-ad')
        .post(passport.authenticate('jwt', {
            failureRedirect: '/authfailurejson',
            session: false
        }), controller.uploadAd);

    app.route('/get-ads')
        .post(controller.getAds);

    app.route('/delete-ads')
        .get(passport.authenticate('jwt', {
            failureRedirect: '/authfailurejson',
            session: false
        }), controller.deleteAds);

    app.get('/authfailurejson', function (req, res) {
        res.json({
            success: false,
            message: 'authorization failed'
        });
    });

}