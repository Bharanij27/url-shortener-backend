var express = require("express");
var router = express.Router();
const bcryptjs = require('bcryptjs');
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const url = process.env.mongodbURL || "mongodb://localhost:27017/";
const {
    sendMail
} = require('../common/mailsender');


router.post("/", async function (req, res, next) {
    let client;
    try {
        client = await mongoClient.connect(url);
        let db = client.db("zenClass");
        let {
            email,
            fname,
            lname,
            pass
        } = req.body;
        let activated = false;
        let activationKey = Math.random().toString(20).substr(2, 15);
        let existing = await db.collection("url-users").findOne({
            email: email,
        });

        if (existing) {
            res.json({
                status: 500,
                message: "E-mail id already exist....please Login",
            });
        } else {
            let urls = [];
            let salt = bcryptjs.genSaltSync(10);
            let hashedPassword = bcryptjs.hashSync(pass, salt)
            pass = hashedPassword;
            await db.collection("url-users").insertOne({
                email,
                fname,
                lname,
                pass,
                urls,
                activated,
                activationKey,
            });
            let mail = sendMail(email, 'activationkey', activationKey);
            if(!mail) throw "mail not send";
            res.json({
                status: 200,
                message: "User Account...please visit the link sent to your registered e-mail id to activate your account",
            });
        }
        client.close();
    } catch (error) {
        client.close();
        res.json({
            status: 404,
            message: "Something went wrong in server",
        });
    }
});
module.exports = router;