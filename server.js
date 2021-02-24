var express = require("express");
var sass = require('node-sass');
var less = require('less');
var fs = require("fs");
const app = express();
const port = 3000;

app.use(express.urlencoded({extended: true}));
app.use(express.json());

/**
 * First endpoint to transpile scss into css
 */
app.post('/api/css/scss', function (req, res) {
    sass.render({
        data: req.body.data.scss
    }, function (err, result) {
        if (!err) {
            res.json({
                data: {
                    css: result.css.toString()
                }
            });
        } else {
            res.status(400).send(err);
        }
    });
});

/**
 * Second endpoint to transpile less into css
 */
app.post('/api/css/less', function (req, res) {
    less.render(req.body.data.less, function (err, result) {
        if (!err) {
            res.json({
                data: {
                    css: result.css
                }
            });
        } else {
            res.status(400).send(err);
        }
    });
});

app.listen(process.env.PORT || port);
