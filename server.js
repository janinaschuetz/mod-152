"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sharp = require("sharp");
var multer = require("multer");
var express = require("express");
var sass = require('node-sass');
var less = require('less');
var app = express();
var port = 3000;
var files = new Array(5);
app.use(express.urlencoded({ extended: true }));
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
        }
        else {
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
        }
        else {
            res.status(400).send(err);
        }
    });
});
/**
 * multer configurations
 * what happens to a file if uploaded
 */
var store = multer.diskStorage({
    // where does the file get stored
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    // how does the file get named
    filename: function (req, file, callback) {
        if (file.mimetype.indexOf("image") > -1) {
            callback(null, Date.now() + '_' + file.originalname);
        }
        else {
            callback({
                error: 'Not a image file'
            }, null);
        }
    }
});
var upload = multer({ storage: store });
/**
 * Static directory for files
 */
app.use('/files', express.static('files'));
/**
 * Third endpoint to generate images in various sizes from one source-image
 */
app.post('/api/file', upload.single('file'), function (req, res, next) {
    for (var i = 0; i < 5; i++) {
        var filetype = void 0;
        var width = void 0;
        switch (i) {
            case 0:
                filetype = 'small_';
                width = 720;
                break;
            case 1:
                filetype = 'medium_';
                width = 1280;
                break;
            case 2:
                filetype = 'large_';
                width = 1920;
                break;
            case 3:
                filetype = 'thumbnail_';
                width = 360;
                break;
            case 4:
                filetype = 'original_';
                width = null;
                break;
        }
        var fileDestination = __dirname + '/files/' + filetype + req.file.filename;
        files[i] = filetype + req.file.filename;
        sharp(__dirname + '/uploads/' + req.file.filename)
            .resize(width, null, {
            fit: "contain"
        })
            .toFile(fileDestination);
    }
    next();
}, function (req, res) {
    res.json({
        data: {
            images: {
                small: 'https://https://m152-bis19p-janina-schuetz.herokuapp.com/files/' + files[0],
                medium: 'https://https://m152-bis19p-janina-schuetz.herokuapp.com/files/' + files[1],
                large: 'https://https://m152-bis19p-janina-schuetz.herokuapp.com/files/' + files[2],
                thumbnail: 'https://https://m152-bis19p-janina-schuetz.herokuapp.com/files/' + files[3],
                original: 'https://https://m152-bis19p-janina-schuetz.herokuapp.com/files/' + files[4]
            }
        }
    });
});
app.listen(process.env.PORT || port);
//# sourceMappingURL=server.js.map