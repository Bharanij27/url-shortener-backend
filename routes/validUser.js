var express = require("express");
var router = express.Router();
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const url = process.env.mongodbURL || "mongodb://localhost:27017/";
const jwt = require('jsonwebtoken');

router.post("/", async function (req, res, next) {
    let client;

    try {
        let token = req.body.token;
        if (token) {
            let user = jwt.verify(token, 'secret key')
            client = await mongoClient.connect(url);
            let db = client.db("zenClass");
            let isTokenValid = await db.collection('url-users').findOne({
                email: user.id
            });

            if (isTokenValid.activated) {
                if (!req.body.all) {
                    res.json({
                        status: 200,
                        data: isTokenValid,
                        messsage: "Valid User"
                    })
                }
                else{
                    let resultUrl = await db.collection('urls').find({userId : user.id}).toArray();
                    res.json({
                        status: 200,
                        data: resultUrl,
                    })
                }
            } else {
                res.json({
                    status: 404,
                    messsage: "Unable to access"
                })
            }
        }
    } catch (error) {
        res.json({
            messsage: "no token availabe"
        })
    }

});

module.exports = router;