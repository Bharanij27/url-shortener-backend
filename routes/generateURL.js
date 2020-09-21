var express = require("express");
var router = express.Router();
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const url = process.env.mongodbURL || "mongodb://localhost:27017/";
const jwt = require('jsonwebtoken');

router.post("/", async function (req, res, next) {
    console.log('name')
    let client, search;
    let shortURL, shortURLPath, fullURL = req.body.fullURL;
    let token = req.body.token;
    try {
        client = await mongoClient.connect(url);
        let db = client.db("zenClass");
        let user = jwt.verify(token, 'secret key');

        do{
            shortURLPath = Math.random().toString(20).substr(2, 6);
            search = await db.collection("urls").findOne({shortURLPath : shortURLPath});
        }while(search !== null);

        shortURL = `https://tinii-url.herokuapp.com/s/${shortURLPath}`;
        let urlData = await db.collection("urls").insertOne({
            shortURLPath,
            shortURL,
            fullURL,
            count : 0,
        });

        await db.collection("url-users").findOneAndUpdate(
            {email: user.id},
            {
                $push : {urls : shortURLPath}
            }
        );

        res.json({
            status : 200,
            shortURL
        })
        client.close();
    } catch (error) {
        client.close();
        console.log(error)
        res.json({
            status: 404,
            message: "Something went wrong in server",
        });
    }
});

module.exports = router;