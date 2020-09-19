var express = require("express");
var router = express.Router();
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const url = "mongodb+srv://bharani:DF8b4vOeqVVIchCQ@cluster0.jsd3k.mongodb.net?retryWrites=true&w=majority";


router.get("/:tinyUrl", async function (req, res, next) {

    let client;
    try {
        client = await mongoClient.connect(url);
        let db = client.db("zenClass");
        let urlData = await db.collection("urls").findOne({
            shortURLPath: req.params.tinyUrl
        });
        console.log(req.params)
        if (!urlData) {
            res.json({
                status: 404,
                message: "Invalid Link",
            });
        } else {
            let existing = await db.collection("urls").findOneAndUpdate({
                shortURLPath: req.params.tinyUrl
            }, {
                $inc: {
                    count: 1
                }
            });

            res.redirect(urlData.fullURL);
        }
        client.close();
    } catch (error) {
        client.close();
        console.log("error", error);
        res.json({
            status: 404,
            message: "Something went wrong in server",
        });
    }
});

module.exports = router;