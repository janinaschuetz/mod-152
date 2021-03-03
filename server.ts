import * as sharp from "sharp";
import * as multer from "multer";

let express = require("express");
let sass = require('node-sass');
let less = require('less');
const app = express();
const port = 3000;
let files: string[] = new Array(5);

app.use(express.urlencoded({extended: true}));
app.use(express.json());

/**
 * First endpoint to transpile scss into css
 */
app.post('/api/css/scss', (req, res) => {
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
app.post('/api/css/less', (req, res) => {
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

/**
 * multer configurations
 * what happens to a file if uploaded
 */
let store = multer.diskStorage({
    // where does the file get stored
    destination: (req, file, callback) => {
        callback(null, __dirname + '/uploads');
    },
    // how does the file get named
    filename: (req, file, callback) => {
        if (file.mimetype.indexOf("image") > -1) {
            callback(null, Date.now() + '_' + file.originalname);
        } else {
            callback({
                error: 'Not a image file'
            }, null);
        }
    }
});

let upload = multer({storage: store});

/**
 * Static directory for files
 */
app.use('/files', express.static('files'));

/**
 * Third endpoint to generate images in various sizes from one source-image
 */
app.post('/api/file', upload.single('file'), (req,res, next) => {
    for (let i = 0; i < 5; i++) {
        let filetype: string;
        let width: number;

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

        let fileDestination = __dirname + '/files/' + filetype + req.file.filename;

        files[i] = filetype + req.file.filename;

        sharp(__dirname + '/uploads/' + req.file.filename)
            .resize(width, null, {
                fit: "contain"
            })
            .toFile(fileDestination);
    }
    next();

}, (req, res) => {
    res.json({
        data: {
            images: {
                small: 'https://https://m152-bis19p-janina-schuetz.herokuapp.com/files/' + files[0],
                medium: 'https://https://m152-bis19p-janina-schuetz.herokuapp.com/files/' + files [1],
                large: 'https://https://m152-bis19p-janina-schuetz.herokuapp.com/files/' + files[2],
                thumbnail: 'https://https://m152-bis19p-janina-schuetz.herokuapp.com/files/' + files[3],
                original: 'https://https://m152-bis19p-janina-schuetz.herokuapp.com/files/' + files[4]
            }
        }
    });
});

app.listen(process.env.PORT || port);
