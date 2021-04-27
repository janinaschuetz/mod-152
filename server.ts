import * as sharp from "sharp";
import * as multer from "multer";
import * as ffmpeg from "fluent-ffmpeg";
import * as Websocket from "ws";

let express = require("express");
let sass = require('node-sass');
let less = require('less');
let path = require('path');

const app = express();
const port = 3000;
let files: string[] = new Array(5);
const wss = new Websocket.Server({
   port: 8080,
});

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
        if (file.mimetype.indexOf("audio") > -1 || file.mimetype.indexOf("text/vtt") > -1) {
            callback(null, __dirname + '/files');
        } else {
            callback(null, __dirname + '/uploads');
        }
    },
    // how does the file get named
    filename: (req, file, callback) => {
        callback(null, Date.now() + '_' + file.originalname);
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
app.post('/api/file', upload.single('file'), async (req, res, next) => {
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

        await sharp(__dirname + '/uploads/' + req.file.filename)
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
                small: 'https://m152-bis19p-janina-schuetz.herokuapp.com/files/' + files[0],
                medium: 'https://m152-bis19p-janina-schuetz.herokuapp.com/files/' + files[1],
                large: 'https://m152-bis19p-janina-schuetz.herokuapp.com/files/' + files[2],
                thumbnail: 'https://m152-bis19p-janina-schuetz.herokuapp.com/files/' + files[3],
                original: 'https://m152-bis19p-janina-schuetz.herokuapp.com/files/' + files[4]
            }
        }
    });
});

/**
 * Fourth endpoint to merge multiple videos
 * not functional... :(
 */
app.post('/api/videos', upload.array('files'), (req, res) => {

    let videoObj = ffmpeg();
    let mergedFileName = '';
    let fileName = '';

    if (req.query.fileName) {
        if (req.files.length > 1) {
            mergedFileName = Date.now() + '_' + req.query.fileName.toString() + '.mp4';
        } else {
            fileName = req.files[0].fileName;
        }
    } else {
        fileName = req.files[0].fileName;
        mergedFileName = Date.now() + '_' + 'transformed_video.mp4';
    }

    // video merge
    if (req.files.length > 1) {
        req.files.forEach(function (video) {
            videoObj = videoObj.input(video.path);
        });
    }

    videoObj = videoObj.mergeToFile(__dirname + '/files/merged.mp4');

    // query params
    if (req.query.turn === "true") {
        videoObj = videoObj.withVideoFilter('transpose=1, transpose=1');
    }

    if (req.query.fileName) {
        mergedFileName = Date.now() + '_' + req.query.fileName;
    } else {
        mergedFileName = 'files/' + Date.now() + '_' + mergedFileName;
    }

    if (req.query.width && req.query.height) {
        videoObj = videoObj.size(`${req.query.width}x${req.query.height}`);
    }

    if (req.query.videoBitrate) {
        videoObj = videoObj.videoBitrate(req.query.videoBitrate as string);
    }

    videoObj.save(mergedFileName);


    // json-response
    res.json({
        data: {
            video: {
                location: "https://m152-bis19p-janina-schuetz.herokuapp.com/files/" + fileName
            }
        }
    });
});

/**
 * Fifth endpoint to upload a audio- and a vtt-file
 */
app.post('/api/audio', upload.fields([{name: 'audio'}, {name: 'vtt'}]), (req, res) => {
    res.json({
        data: {
            audio: "https://m152-bis19p-janina-schuetz.herokuapp.com/files/" + req.files['audio'][0].filename,
            vtt: "https://m152-bis19p-janina-schuetz.herokuapp.com/files/" + req.files['vtt'][0].filename
        }
    });
});

app.listen(process.env.PORT || port);

/**
 * Last part of LB1 - Websocket
 */
// GET-Request for main page (= websocket.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/websocket.html'));
});

function noop() {}

wss.on('connection', client => {

    client.isAlive = true;
    client.on('pong', () => { client.isAlive = true });

    client.on('message', data => {
        Array.from(wss.clients)
            //.filter(connectedClient => connectedClient !== client)
            .forEach(connectedClient => connectedClient.send(data));
    });

    client.send('Herzlich Willkommen im Chat.');
});

const interval = setInterval(function ping() {
   wss.clients.forEach(function each(ws) {
       if (!ws.isAlive) {
           console.log('exit')
           ws.terminate();
       }
       ws.isAlive = false;
       ws.ping(noop);
   });
}, 15000);

wss.on('close', function close() {
    clearInterval(interval);
});
