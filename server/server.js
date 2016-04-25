'use strict';

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const students = require('./data')(path.join(__dirname, './data/students.json'));
const groups = require('./data')(path.join(__dirname, './data/groups.json'));
const mentors = require('./data')(path.join(__dirname, './data/mentors.json'));
const tasks = require('./data')(path.join(__dirname, './data/tasks.json'));

const app = express();

app.set('json spaces', 4);
app.set('x-powered-by', false);
app.use(express.static(path.normalize(__dirname + '/../client')));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.sendFile(path.normalize(__dirname + '/../client/index.html'));
});

app.all('/api/*', function(req, res){
    switch(req.method){
    case "GET":
        apiGet(req, res);
        break;
    case "POST":
        apiPost(req, res);
        break;
    default:
        break;
    }
});

const apiToGet = {
    getStudents: students,
    getGroups: groups,
    getMentors: mentors,
    getTasks: tasks
}

const apiToPost = {
    addStudents: students,
    addGroups: groups,
    addMentors: mentors,
    addTasks: tasks
}

function apiGet(req, res){
    var clearUrl = req.url.replace(/\/api\/|\//gi, "");
    console.log("GET", clearUrl);
    if(apiToGet[clearUrl] !== undefined){
        apiToGet[clearUrl].getAll().then((result) => res.json(result));
    } else {
        res.sendStatus(404);
    }
}

function apiPost(req, res){
    var clearUrl = req.url.replace(/\/api\/|\//gi, "");
    console.log("POST", clearUrl);
    console.log(req.body);
    if(apiToPost[clearUrl] !== undefined){
        var data
        switch(clearUrl){
            case "addStudents":
                data = parseStudentFromRequest(req, res);
            break;
            case "addGroups":
                data = parseGroupFromRequest(req, res);
            break;
            case "addMentors":
                data = parseMentorFromRequest(req, res);
            break;
            case "addTasks":
                data = parsTaskFromRequest(req, res);
            break;
            default:
            break;
        }
        if(req.body.id == 0){
            //NOTE add new
            apiToPost[clearUrl].add(data).then(() => res.send({status: "ok"}));
        } else {
            //NOTE edit existing
            const dataId = Number(req.body.id);
            data.id = dataId;
            apiToPost[clearUrl].update(data).then(() => res.send({status: "ok"}));
        }
        ;
    } else {
        res.sendStatus(404);
    }
}

function parseStudentFromRequest(req, res){
    return {
        name: req.body.name,
        group: req.body.group,
        tasks: req.body.tasks,
        taskResults: req.body.taskResults,
        preferedMentors: req.body.preferedMentors
    };
}

function parseGroupFromRequest(req, res){
    return {
        name: req.body.name
    };
}

function parseMentorFromRequest(req, res){
    return {
        name: req.body.name,
        students: req.body.students,
        preferedStudents: req.body.preferedStudents
    };
}

function parseTaskFromRequest(req, res){
    return {
        name: req.body.name,
        description: req.body.description,
        students: req.body.students
    };
}

app.listen(3000, function () {
    console.log('Shri2 listening on port 3000!');
});
