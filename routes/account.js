var express = require("express");
var router = express.Router();
const bcryptjs = require('bcryptjs');
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const url = process.env.mongodbURL || "mongodb://localhost:27017/";
const {
    sendMail
} = require('../common/mailsender');
const jwt = require('jsonwebtoken');

router.put("/activationkey", async function (req, res, next) {
    let client;

    try {
        client = await mongoClient.connect(url);
        let db = client.db("zenClass");

        let user = await db.collection('url-users').findOne({
            activationKey: req.body.secretKey
        }); 

        let token = jwt.sign({id : user.email}, "secret key");

        let userInfo = await db.collection("url-users").findOneAndUpdate({
            activationKey: req.body.secretKey
        }, {
            $set: {
                activated: true,
                token : token
            },
            $unset: {
                activationKey: ""
            }
        });
        client.close();

        if (userInfo.value) {
            res.json({
                status: 200,
                message: "Activated",
                token
            })
        } else {
            res.json({
                status: 404,
                message: "Invalid URL"
            })
        }
    } catch (error) {
        console.log(error);
    }
});

router.post("/reset", async function (req, res, next) {
    let client;
    let resetkey = Math.random().toString(20).substr(2, 15);

    try {
        client = await mongoClient.connect(url);
        let db = client.db("zenClass");

        let userInfo = await db.collection("url-users").findOneAndUpdate({
            email: req.body.email
        }, {
            $set: {
                resetkey: resetkey
            }
        });
        client.close();

        if (userInfo.value) {
            let mail = sendMail(req.body.email, 'verification', resetkey);
            if(!mail) throw "mail not send"
            res.json({
                status: 200,
                message: "Link sent"
            })
        } else {
            res.json({
                status: 404,
                message: "No such e-mail id is registered with our database"
            })
        }
    } catch (error) {
        console.log(error);
    }
});


router.put("/verification", async function (req, res, next) {
    let client;

    try {
        client = await mongoClient.connect(url);
        let db = client.db("zenClass");

        let userInfo = await db.collection("url-users").findOneAndUpdate({
            resetkey: req.body.secretKey
        }, {
            $unset: {
                resetkey: ""
            }
        });
        client.close();
        console.log(userInfo);
        if (userInfo.value) {
            res.json({
                status: 200,
                message: "valid User"
            })
        } else {
            res.json({
                status: 404,
                message: "Invalid Access"
            })
        }
    } catch (error) {
        console.log(error);
    }
});

router.post("/changePassword", async function (req, res, next) {
    let client;

    try {
        client = await mongoClient.connect(url);
        let db = client.db("zenClass");
        let pass = req.body.pass;

        let salt = bcryptjs.genSaltSync(10);
        let hashedPassword = bcryptjs.hashSync(pass, salt)
        pass = hashedPassword;

        let email = req.body.email;
        let userInfo = await db.collection("url-users").findOneAndUpdate({
            email: email
        }, {
            $set: {
                pass: pass
            },
        });
        client.close();

        if (userInfo.value) {
            res.json({
                status: 200,
                message: "Password Changed"
            })
        } else {
            res.json({
                status: 404,
                message: "Enter Valid Email-ID"
            })
        }
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;