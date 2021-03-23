"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var sharp = require("sharp");
var multer = require("multer");
var ffmpeg = require("fluent-ffmpeg");
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
app.post('/api/file', upload.single('file'), function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var i, filetype, width, fileDestination;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < 5)) return [3 /*break*/, 4];
                filetype = void 0;
                width = void 0;
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
                fileDestination = __dirname + '/files/' + filetype + req.file.filename;
                files[i] = filetype + req.file.filename;
                return [4 /*yield*/, sharp(__dirname + '/uploads/' + req.file.filename)
                        .resize(width, null, {
                        fit: "contain"
                    })
                        .toFile(fileDestination)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                i++;
                return [3 /*break*/, 1];
            case 4:
                next();
                return [2 /*return*/];
        }
    });
}); }, function (req, res) {
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
 */
app.post('/api/videos', upload.array('files'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var queryString, urlParams, turn, fileName, width, height, videoBitrate, mergedVideo, videos;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                queryString = window.location.search;
                urlParams = new URLSearchParams(queryString);
                turn = urlParams.get('turn');
                fileName = urlParams.get('fileName');
                width = urlParams.get('width');
                height = urlParams.get('height');
                videoBitrate = urlParams.get('videoBitrate');
                if (turn == '') {
                    turn = 'rotate=0';
                }
                else {
                    turn = 'rotate=180';
                }
                if (fileName == '') {
                    fileName = 'mergedVideo.mp4';
                }
                else {
                    fileName += '.mp4';
                }
                if (width == '') {
                    width = '?';
                }
                if (height == '') {
                    height = '?';
                }
                mergedVideo = ffmpeg();
                videos = req.files;
                videos.forEach(function (video) {
                    mergedVideo = mergedVideo.addInput(video);
                });
                return [4 /*yield*/, mergedVideo.mergeToFile(__dirname + '/files/' + fileName)
                        .videoFilter(turn)
                        .size(width + 'x' + height)
                        .videoBitrate(videoBitrate)];
            case 1:
                _a.sent();
                // json-response
                res.json({
                    data: {
                        video: {
                            location: "https://m152-bis19p-janina-schuetz.herokuapp.com/files/" + fileName
                        }
                    }
                });
                return [2 /*return*/];
        }
    });
}); });
app.listen(process.env.PORT || port);
//# sourceMappingURL=server.js.map