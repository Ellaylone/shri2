var express = require('express');
var path = require('path');
var app = express();

app.get('/', function (req, res) {
    res.sendFile(path.normalize(__dirname + '/../client/index.html'));
});

app.get('/getStudents', function (req, res) {
    res.sendFile(path.normalize(__dirname + '/data/students.json'));
});

app.listen(3000, function () {
    console.log('Shri2 listening on port 3000!');
});
