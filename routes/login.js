var express = require("express");
var router = express.Router();
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const url = "mongodb+srv://bharani:DF8b4vOeqVVIchCQ@cluster0.jsd3k.mongodb.net?retryWrites=true&w=majority";
const bcryptjs = require("bcryptjs");
const jwt = require('jsonwebtoken')
const {
    authenticate
} = require('../common/auth');

router.post("/", async function (req, res, next) {
    let client;
    try {
        client = await mongoClient.connect(url);
        let db = client.db("zenClass");
        let {
            email,
            pass
        } = req.body;

        let existing = await db.collection("url-users").findOne({
            email: email
        });
        client.close();

        if (!existing) {
            res.json({
                status: 404,
                message: "No such user exists",
            });
        } else {
            let comparedResult = await bcryptjs.compare(pass, existing.pass)
            console.log(comparedResult)
            if (!comparedResult) {
                res.json({
                    status: 500,
                    message: "Password did not match",
                });
            } else if (!existing.activated) {
                res.json({
                    status: 204,
                    message: "Activate your account to login",
                });
            } else {
                let token = jwt.sign({id : email}, "secret key");
                res.json({
                    status: 200,
                    message: "Valid User",
                    token
                });
            }
        }
    } catch (error) {
        client.close();
        console.log(error);
        res.json({
            status: 404,
            message: "Something went wrong in server",
        });
    }
});

module.exports = router;