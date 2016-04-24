var studentApi = (function () {
    var sApi = {};
    //NOTE инициализация
    sApi.init = function(){
        sApi.students = module("students");
        sApi.groups = module("groups");
        sApi.tasks = module("tasks");
        sApi.mentors = module("mentors");
    }

    //NOTE описываем модуль
    var module = (function () {

        var modules = {};


        function inject(factory) {

            var require = factory.toString()
                .match(/\(([\s\S]*?)\)/)[1]
                .match(/[\$\w]+/img) || [];

            return factory.apply(null, require.map(module));

        }


        function module(name, factory) {

            if (!factory) {
                var module = modules[name];
                return module.instance || (module.instance = inject(module.factory));
            }

            modules[name] = {
                factory : factory,
                instance: null
            };

        }


        return module;

    })();

    //NOTE занимается получением/отправкой данных
    module("fetch", function(){
        const URL_PATHS = [
            "getStudents", "getMentors", "getGroups", "getTasks",
            "addStudents", "addMentors", "addGroups", "addTasks",
            "editStudents", "editMentors", "editGroups", "editTasks",
            "removeStudents", "removeMentors", "removeGroups", "removeTasks"
        ]
        const URL_PREFIX = "/api/";

        function json(res){
            return res.json();
        }

        return function(url, callback, data){
            if(typeof url == "undefined"){
                throw("Url is undefined");
            } else if(URL_PATHS.indexOf(url) < 0){
                throw("Url is unknown");
            }
            if(typeof callback == "undefined"){
                throw("Callback is undefined");
            }
            var fetchUrl = URL_PREFIX + url;
            var fetchInit = {};

            if(typeof data == "undefined"){
                fetchInit.method = "GET";
            } else {
                fetchInit.method = "POST";
                fetchInit.body = data
            }
            return fetch(fetchUrl, fetchInit)
                .then(
                    function(response) {
                        if (response.status !== 200) {
                            console.warn("Status Code: " + response.status);
                            callback({
                                status: false,
                                error: response.status
                            });
                            return;
                        }
                        response.json().then(callback);
                    }
                )
                .catch(function(err) {
                    console.warn("Fetch Error:", err);
                    callback({
                        status: false,
                        error: err
                    });
                });
        };
    });

    module("students", function(fetch){
        return {
            get: function(callback){
                fetch("getStudents", callback);
            },
            save: function(data, callback){
                //NOTE объединение студентов в группы: при data.group определяет идентификатор группы студента
                //NOTE оценки выставленные за задания передаются в data.taskResults
                if(data.id == 0){
                    //NOTE позволяет добавить студента-участника
                    fetch("addStudents", callback, data);
                } else {
                    fetch("editStudents", callback, data);
                }
            }
        }
    });

    module("groups", function(fetch){
        return {
            get: function(callback){
                fetch("getGroups", callback);
            },
            save: function(data, callback){
                if(data.id == 0){
                    fetch("addGroups", callback, data);
                } else {
                    fetch("editGroups", callback, data);
                }
            }
        }
    });

    module("tasks", function(fetch){
        const students = module("students");
        var updateStudents;
        var id;
        var editCallback;
        function getStudentsFromData(data){
            data = JSON.parse(data);
            updateStudents = data.students;
            id = data.id;
            delete data.students;
            data = JSON.stringify(data);
            return data;
        }

        function saveStudents(resolve, reject, data){
            data.forEach(function(item, i){
                if(updateStudents.indexOf(item.id) >= 0){
                    var hasTask = false;
                    for(var j = 0; j < item.tasks.length; j++){
                        if(item.tasks[j] == parseInt(id)){
                            hasTask = true;
                            break;
                        }
                    }
                    if(!hasTask){
                        item.tasks.push(parseInt(id));
                        var studentCallback = function(){
                            if(i == data.length - 1){
                                resolve();
                            }
                        }
                        students.save(item, studentCallback);
                    }
                }
            });
        }

        function setTaskToStudents(editTasksData){
            if(typeof editTasksData.status != "undefined" && editTasksData.status == "ok"){
                students.get(function(data){
                    var studentP = new Promise(
                        function(resolve, reject){
                            saveStudents(resolve, reject, data);
                        }
                    );
                    studentP.then(function(){
                        editCallback(editTasksData);
                    });
                });
            } else {
                editCallback(editTasksData);
            }
        }

        return {
            get: function(callback){
                fetch("getTasks", callback);
            },
            save: function(data, callback){
                //NOTE создание индивидуальных и групповых заданий
                if(data.id == 0){
                    fetch("addTasks", callback, data);
                } else {
                    editCallback = callback;
                    fetch("editTasks", setTaskToStudents, getStudentsFromData(data));
                }
            }
        }
    });

    module("mentors", function(fetch){
        return {
            get: function(callback){
                fetch("getMentors", callback);
            },
            save: function(data, callback){
                if(data.id == 0){
                    fetch("addMentors", callback, data);
                } else {
                    fetch("editMentors", callback, data);
                }
            }
        }
    });

    module("prefered", function(students, mentors){
        return {
            //TODO sort prefered
            //NOTE распределение менторов и студентов по приоритету
            sort: function(callback){
            }
        }
    });

    sApi.init();
    return sApi;
}());
