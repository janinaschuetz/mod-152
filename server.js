var express = require("express");
//var bodyParser = require("body-parser");
const app = express();

/*
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json);
app.use(bodyParser.raw);
*/

app.post('/api/css/scss', function (req, res) {
    res.send("Test");
    //res.sendFile("");
});

app.post('/api/css/less', function (req, res) {
    res.send("POST");
    //res.sendFile("");
});

app.listen(3000);
