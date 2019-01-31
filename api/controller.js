'use strict';

const AdModel = require('./models/AdModel');
const Brand = require('./models/Brand');
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

exports.registerBrand = function (req, res) {
    var newBrand = new Brand(req.body);
    var username = req.body.name;

    newBrand.adCounter = 0;

    Brand.getBrandByName(username, function (err, brand) {
        if (err) throw err;
        if (brand) {
            res.json({
                success: false,
                msg: "this brand is already registered"
            })
            return;
        }
        newBrand.save(function (err, brand) {

            if (err) {
                res.json({
                    success: false,
                    msg: "failed",
                    error: err
                });
            }
            else {
                const token = jwt.sign(brand.toJSON(), config.secret, {
                    expiresIn: 604800 // 1 week
                });
                res.json({
                    success: true,
                    token: 'Bearer ' + token,
                    brand: brand
                });
            }
        });
    });

}

exports.loginBrand = function (req, res) {
    var username = req.body.name;
    var password = req.body.password;
    Brand.getBrandByName(username, (err, brand) => {
        if (err) throw err;
        if (!brand) {
            res.json({ success: false, msg: 'Brand not found' });
            return;

        }

        var isMatch;

        if (password == brand.password)
            isMatch = true;
        else
            isMatch = false;

        if (isMatch) {
            const token = jwt.sign(brand.toJSON(), config.secret, {
                expiresIn: 604800 // 1 week
            });

            res.json({
                success: true,
                token: 'Bearer ' + token,
                brand: brand
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
                Brand.findOne(req.user._id, function (err, brand) {
                    var adLink = baseURL + `/ads/${req.file.filename}`;
                    var advert = new AdModel({
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

                        brand.ads.push(ad._id);
                        brand.save((err, brand) => {
                            if (err) throw err;
                            res.json({
                                success: true,
                                brand: brand.name,
                                ad: ad.adLink
                            })
                        });
                    })
                });
            }
        }

    });
}

exports.getAds = function (req, res) {
    Brand.findOne(req.user._id)
        .populate('ads')
        .exec(function (err, brand) {
            if (err) throw err;
            if (brand.ads.length == 0) {
                res.json({
                    success: false,
                    msg: "No ads found"
                });
                return;
            }
            res.json({
                success: true,
                ads: brand.ads
            });
        });
}

exports.deleteAds = function (req, res) {
    Brand.findOne(req.user._id, function (err, brand) {
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
                    msg: "No ads found for brand: " + brand.name
                })
                return;
            }

            AdModel.deleteMany({ _id: { $in: brand.ads}}, (err, ads) => {
                if(err) throw err;
                brand.ads = [];
                brand.save(function (err) {
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

exports.loginBrand = function (req, res) {
    var username = req.body.name;
    var password = req.body.password;
    Brand.getBrandByName(username, (err, brand) => {
        if (err) throw err;
        if (!brand) {
            res.json({ success: false, msg: 'Brand not found' });
            return;

        }

        var isMatch;

        if (password == brand.password)
            isMatch = true;
        else
            isMatch = false;

        if (isMatch) {
            const token = jwt.sign(brand.toJSON(), config.secret, {
                expiresIn: 604800 // 1 week
            });

            res.json({
                success: true,
                token: 'Bearer ' + token,
                brand: brand
            });

        }
        else {
            res.json({ success: false, msg: 'Wrong password' });
        }
    })
}

exports.registerBrand = function (req, res) {
    var newBrand = new Brand(req.body);
    var username = req.body.name;

    newBrand.adCounter = 0;

    Brand.getBrandByName(username, function (err, brand) {
        if (err) throw err;
        if (brand) {
            res.json({
                success: false,
                msg: "this brand is already registered"
            })
            return;
        }
        newBrand.save(function (err, brand) {

            if (err) {
                res.json({
                    success: false,
                    msg: "failed",
                    error: err
                });
            }
            else {
                const token = jwt.sign(brand.toJSON(), config.secret, {
                    expiresIn: 604800 // 1 week
                });
                res.json({
                    success: true,
                    token: 'Bearer ' + token,
                    brand: brand
                });
            }
        });
    });

}


