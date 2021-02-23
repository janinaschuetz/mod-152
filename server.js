var express = require("express");
var sass = require('node-sass');
var fs = require("fs");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('input'));

app.post('/api/css/scss', function (req, res) {
    fs.writeFileSync('input/input.scss', req.body.data.scss, () => {});
    sass.render({
        file: "input/input.scss"
    }, function (err, result) {
        if (!err){
            res.send(result.css.toString());
        } else {
            res.status(400).send(err);
        }
    });
});

app.post('/api/css/less', function (req, res) {
    res.send("POST");
});

app.listen(3000);
