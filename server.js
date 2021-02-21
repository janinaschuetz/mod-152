var express = require("express");
const app = express();

app.get('/css/scss', function (req, res) {
    res.send("Test");
});

app.post('/css/less', function (req, res) {
    res.send("POST");
});

app.listen(3500);
