var express = require("express");
var router = express.Router();
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const url = "mongodb+srv://bharani:DF8b4vOeqVVIchCQ@cluster0.jsd3k.mongodb.net?retryWrites=true&w=majority";


router.get("/", async function (req, res, next) {
    let client;
    
    try {
        let token = req.body.token;
        if(token){
            client = await mongoClient.connect(url);
            let db = client.db("zenClass");
            let isTokenValid = await db.collection('url-users').findOne({token : token});
            if(isTokenValid.email){
                res.json({
                    status : 200,
                    messsage : "Valid User"
                })
            }
            else{
                res.json({
                    status : 404,
                    messsage : "Unable to access"
                })
            }
        }
    } catch (error) {
        res.json({
            messsage : "no token availabe"
        })
    }

});

module.exports = router;