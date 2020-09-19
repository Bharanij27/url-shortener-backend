var express = require("express");
var router = express.Router();
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const url = "mongodb+srv://bharani:DF8b4vOeqVVIchCQ@cluster0.jsd3k.mongodb.net?retryWrites=true&w=majority";
const jwt = require('jsonwebtoken');

router.post("/", async function (req, res, next) {
    let client;
    
    try {
        let token = req.body.token;
        if(token){
            let user = jwt.verify(token, 'secret key')
            client = await mongoClient.connect(url);
            let db = client.db("zenClass");
            let isTokenValid = await db.collection('url-users').findOne({email : user.id});
            console.log(user.id);
            if(isTokenValid.activated){
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