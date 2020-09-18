var express = require("express");
var router = express.Router();
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const url = "mongodb://localhost:27017/";

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", {
    title: "Express",
  });
});

router.post("/createUser", async function (req, res, next) {
  let client;
  try {
    client = await mongoClient.connect(url);
    let db = client.db("b15wd");
    let { email, fname, lname, pass } = req.body;
    let existing = await db.collection("students").findOne({
      email: email,
    });

    if (existing) {
      res.json({
        status: 500,
        message: "E-mail id already exist....please Login",
      });
    } else {
      await db.collection("students").insertOne({
        email,
        fname,
        lname,
        pass,
      });
      console.log(await db.collection("students").find().toArray());
      client.close();
      console.log(email);
      res.json({
        status: 200,
        message: "New User Added",
      });
    }
  } catch (error) {
    res.json({
      status: 404,
      message: "Something went wrong in server",
    });
  }
});

router.post("/login", async function (req, res, next) {
  let client;
  try {
    client = await mongoClient.connect(url);
    let db = client.db("b15wd");
    let { email, fname, lname, pass } = req.body;
    let existing = await db.collection("students").findOne({ email: email });
    client.close();

    if (!existing) {
      res.json({
        status: 404,
        message: "No User Exists",
      });
    } else if (existing.pass !== pass) {
      res.json({
        status: 500,
        message: "Password did not match",
      });
    } else {
      res.json({
        status: 200,
        message: "Valid User",
      });
    }
  } catch (error) {
    res.json({
      status: 404,
      message: "Something went wrong in server",
    });
  }
});

module.exports = router;
