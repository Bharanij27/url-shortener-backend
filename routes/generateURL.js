var express = require("express");
var router = express.Router();
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const url = process.env.mongodbURL || "mongodb://localhost:27017/";
const jwt = require('jsonwebtoken');
const { use } = require("./users");

router.post("/", async function (req, res, next) {
    let client, search;
    let shortURL, shortURLPath, fullURL = req.body.fullURL;
    let token = req.body.token;
    try {
        client = await mongoClient.connect(url);
        let db = client.db("zenClass");
        let user = jwt.verify(token, 'secret key');
        let isURLAvail = await db.collection("urls").findOne({userId : user.id, fullURL : fullURL});

        if(isURLAvail){
            res.json({
                status : 304,
                shortURL : isURLAvail.shortURL
            })
        }
        else{
            do{
                shortURLPath = Math.random().toString(20).substr(2, 6);
                search = await db.collection("urls").findOne({shortURLPath : shortURLPath});
            }while(search !== null);

            shortURL = `https://tinii-url.herokuapp.com/s/${shortURLPath}`;
            let urlData = await db.collection("urls").insertOne({
                userId : user.id,
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
        }
        client.close();
    } catch (error) {
        console.log(error)
        client.close();
        res.json({
            status: 404,
            message: "Something went wrong in server",
        });
    }
});

module.exports = router;