var express = require("express");
var sass = require('node-sass');
var less = require('less');
var fs = require("fs");
const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(express.static('input'));

app.post('/api/css/scss', function (req, res) {
    fs.writeFileSync('input/input.scss', req.body.data.scss, () => {
    });
    sass.render({
        file: "input/input.scss"
    }, function (err, result) {
        if (!err) {
            res.send(
                "{\n" +
                "  \"data\": {\n" +
                "    \"scss\": " + "\"" + result.css.toString() + "\"" +
                "  }\n" +
                "}");
        } else {
            res.status(400).send(err);
        }
    });
});

app.post('/api/css/less', function (req, res) {
    fs.writeFileSync('input/input.less', req.body.data.less, () => {});




    res.send("POST");
});

app.listen(process.env.PORT || 3000);
