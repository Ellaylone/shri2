var express = require('express');
var path = require('path');
var app = express();

app.use(express.static(path.normalize(__dirname + '/../client')));

app.get('/', function (req, res) {
    res.sendFile(path.normalize(__dirname + '/../client/index.html'));
});

var apiToLocal = {
    getStudents: "students.json",
    getGroups: "groups.json",
    getMentors: "mentors.json",
    getTasks: "tasks.json"
}
function apiGet(req, res){
    var clearUrl = req.url.replace(/\/api\/|\//gi, "");
    if(apiToLocal[clearUrl] !== undefined){
        res.setHeader('Content-Type', 'application/json; charset=UTF-8');
        res.sendFile(path.normalize(__dirname + '/data/' + apiToLocal[clearUrl]));
    } else {
        res.sendStatus(404);
    }
}

app.all('/api/*', apiGet);

app.listen(3000, function () {
    console.log('Shri2 listening on port 3000!');
});
