const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const { static, response } = require("express");
const https = require("https");
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Userdb', {useNewUrlParser: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected");
});

const userMail = new mongoose.Schema({
  fname: String,
  lname: String,
  email: String
});

var Mail = mongoose.model('mails', userMail);

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/", (req, res) => {
  const firstName = req.body.fname;
  const lastName = req.body.lname;
  const email = req.body.email;

  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
  };

  const jsonData = JSON.stringify(data);
  const url = "https://us17.api.mailchimp.com/3.0/lists/5d937cac2e";

  const options = {
    method: "POST",
    auth: "hiren1608:beedf2ca4aee8932072e05ea3967d54f-us17",
  };
  const request = https.request(url, options, (response) => {
    if (response.statusCode === 200) {
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failure.html");
    }

    response.on("data", (data) => {
      console.log(JSON.parse(data));
    });
  });

  request.write(jsonData);
  request.end();

  var UserData = new Mail(req.body);
  UserData.save().then(()=>{
        res.send('Saved in databse');
  })
});

app.post("/fail", (req, res) => {
  res.redirect("/");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server runnung");
});

//List id
//5d937cac2e

//api key
//beedf2ca4aee8932072e05ea3967d54f-us17
