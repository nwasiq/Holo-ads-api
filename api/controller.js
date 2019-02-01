'use strict';

const Ad = require('./models/Ad');
const Advertiser = require('./models/Advertiser');
const Application = require('./models/Application');
const User = require('./models/User');
const Developer = require('./models/Developer')
const fs = require('fs');
const path = require('path');
const fileUpload = require('../utils/fileUpload');
const config = require('../config/database');
const baseURL = "http://localhost:3000";
const jwt = require('jsonwebtoken');
const serverAdsPath = './public/ads/';
const mongoose = require('mongoose');


exports.registerDev = function(req, res) {
    let newDev = new Developer(req.body);
    Developer.getDevByEmail(newDev.email, (err, dev) => {
        if (err) throw err;

        if(dev){
            res.json({
                success: false,
                msg: "this developer is already registered"
            })
            return;
        }

        newDev.save((err, dev) => {
            res.json({
                success: true,
                dev: dev
            })
        });
    })
}

exports.devLogin = function(req, res) {
    let devMail = req.body.email;
    let devPass = req.body.password;

    Developer.findOne({email: devMail})
        .populate('apps')
        .exec((err, dev) => {
            if (err) throw err;
            if (!dev) {
                res.json({
                    success: false,
                    msg: "Developer with this email does not exist"
                })

                return;
            }

            var isMatch;

            if (devPass == dev.password)
                isMatch = true;
            else
                isMatch = false;

            if (isMatch) {

                res.json({
                    success: true,
                    developer: dev
                });

            }
            else {
                res.json({ success: false, msg: 'Wrong password' });
            }
        })
}

exports.registerApp = function (req, res) {
    let devEmail = req.body.devEmail;

    Developer.getDevByEmail(devEmail, (err, dev) => {
        if(err) throw err;

        if(!dev){
            res.json({
                success: false,
                msg: "Developer with this email does not exist"
            })
            return;
        }
        let newApp = new Application(req.body.app);
        newApp.save((err, app) => {
            if (err) throw err;

            dev.apps.push(app._id);
            dev.save((err, dev) => {
                if(err) throw err;

                res.json({
                    success: true,
                    appID: app._id,
                    application: app
                })
            })
        })
    })
}

exports.userRegister = function (req, res) {

    let email = req.body.email;
    let app_id = mongoose.Types.ObjectId(req.body.app_id);
    
    User.getUserByEmail(email, (err, user) => {
        if(err) throw err;

        Application.findById(app_id, (err, app) => {
            if (err) throw err;

            if(!user){
                let newUser = new User({
                    age: app.demographic.age,
                    interests: app.interests,
                    email: email,
                    gender: app.demographic.gender,

                });

                newUser.save((err, user) => {
                    if (err) throw err;

                    res.json({
                        success: true,
                        msg: "New user registered. User interests updated according to app: " + app.appName,
                        appId: app_id,
                        user: user
                    })
                })
            }
            else{
                user.interests.push.apply(user.interests, app.interests);
                var uniqueInterests = [...new Set(user.interests)];

                console.log(user.interests);

                user.interests = uniqueInterests;
                user.age = app.demographic.age;
                user.gender = app.demographic.gender;

                user.save((err, user) => {
                    if (err) throw err;
                    res.json({
                        success: true,
                        msg: "User updated according to app: " + app.appName,
                        appId: app_id,
                        user: user
                    });
                })
            }
        })
    })
}

exports.registerAdvertiser = function (req, res) {
    var newAdvertiser = new Advertiser(req.body);
    var username = req.body.name;

    newAdvertiser.adCounter = 0;

    Advertiser.getAdvertiserByName(username, function (err, advertiser) {
        if (err) throw err;
        if (advertiser) {
            res.json({
                success: false,
                msg: "this advertiser is already registered"
            })
            return;
        }
        newAdvertiser.save(function (err, advertiser) {

            if (err) {
                res.json({
                    success: false,
                    msg: "failed",
                    error: err
                });
            }
            else {
                const token = jwt.sign(advertiser.toJSON(), config.secret, {
                    expiresIn: 604800 // 1 week
                });
                res.json({
                    success: true,
                    token: 'Bearer ' + token,
                    advertiser: advertiser
                });
            }
        });
    });

}

exports.loginAdvertiser = function (req, res) {
    var username = req.body.name;
    var password = req.body.password;
    Advertiser.getAdvertiserByName(username, (err, advertiser) => {
        if (err) throw err;
        if (!advertiser) {
            res.json({ success: false, msg: 'Advertiser not found' });
            return;

        }

        var isMatch;

        if (password == advertiser.password)
            isMatch = true;
        else
            isMatch = false;

        if (isMatch) {
            const token = jwt.sign(advertiser.toJSON(), config.secret, {
                expiresIn: 604800 // 1 week
            });

            res.json({
                success: true,
                token: 'Bearer ' + token,
                advertiser: advertiser
            });

        }
        else {
            res.json({ success: false, msg: 'Wrong password' });
        }
    })
}

exports.uploadAd = function (req, res) {
    fileUpload.uploadAd(req, res, (err) => {

        const adType = req.body.adType;
        if (err) {
            res.json({
                success: false,
                msg: "upload failed",
                err: err
            });
        }
        else {
            if (req.file == undefined) {
                res.json({
                    success: false,
                    msg: "no file selected"
                });
            } else {
                Advertiser.findOne(req.user._id, function (err, advertiser) {
                    var adLink = baseURL + `/ads/${req.file.filename}`;
                    var advert = new Ad({
                        adLink: adLink,
                        adType: adType,
                        adName: req.body.adName,
                        adDescription: req.body.adDescription,
                        adExternalLink: req.body.adExternalLink,
                        demographic: req.body.demographic,
                        interests: req.body.interests
                    });

                    advert.save((err, ad) => {
                        if (err) throw err;

                        advertiser.ads.push(ad._id);
                        advertiser.save((err, advertiser) => {
                            if (err) throw err;
                            res.json({
                                success: true,
                                advertiser: advertiser.name,
                                ad: ad.adLink
                            })
                        });
                    })
                });
            }
        }

    });
}

// temp func

exports.getAllUsers = function(req, res) {
    User.find({}, (err, users) => {
        res.json({
            users: users
        })
    })
}

exports.getAds = function (req, res) {

    let userEmail = req.body.email;
    User.getUserByEmail(userEmail, (err, user) => {
        if (err) throw err;
        if(!user){
            res.json({
                success: false,
                msg: "User with this email address does not exist in the system"
            })
            return;
        }
        Ad.find(
            {'demographic.age': {$in: user.age}, 
             'demographic.gender': {$in: user.gender},
              interests: {$in: user.interests}}, (err, ads) => {

                  if(err) throw err;
                  if(ads.length == 0){
                      res.json({
                          success: false,
                          msg: "No matching ads found for this user"
                      })
                      return;
                  }

                  res.json({
                      success: true,
                      ads: ads
                  })
                  /**
                   * Todo: Distance matching here!!
                   */

              })
    })
    // Brand.findOne(req.user._id)
    //     .populate('ads')
    //     .exec(function (err, brand) {
    //         if (err) throw err;
    //         if (brand.ads.length == 0) {
    //             res.json({
    //                 success: false,
    //                 msg: "No ads found"
    //             });
    //             return;
    //         }
    //         res.json({
    //             success: true,
    //             ads: brand.ads
    //         });
    //     });
}

exports.deleteAds = function (req, res) {
    Advertiser.findOne(req.user._id, function (err, advertiser) {
        if (err) throw err;

        var fileDeleted = false;

        fs.readdir(serverAdsPath, (err, files) => {
            if (err) throw err;

            for (const file of files) {

                if (file.toString().indexOf(req.user.name.toString()) != -1){
                    fileDeleted = true;
                    fs.unlink(path.join(serverAdsPath, file), err => {
                        if (err) throw err;
                    });
                }
            }

            if(!fileDeleted){
                res.json({
                    success: false,
                    msg: "No ads found for advertiser: " + advertiser.name
                })
                return;
            }

            Ad.deleteMany({ _id: { $in: advertiser.ads}}, (err, ads) => {
                if(err) throw err;
                advertiser.ads = [];
                advertiser.save(function (err) {
                    if (err) throw err;
                    res.json({
                        success: true,
                        msg: "Ads cleared"
                    });
                })
            });
        });
    });
}

exports.getAllAds = function (req, res) {
    AdModel.find({}, function (err, ads) {
        if (err) throw err;
        if (ads.length == 0) {
            res.json({
                success: false,
                msg: "No ads found"
            })
            return;
        }
        res.json({
            success: true,
            ads: ads
        })
    })
}

// exports.deleteAllAds = function (req, res) {
//     AdsDb.remove({}, function (err, ads) {
//         if (err) throw err;
//         res.json({
//             success: true,
//             msg: "All ads removed"
//         })
//     })
// }


