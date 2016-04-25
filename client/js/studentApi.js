var studentApi = (function () {
    var sApi = {};
    //NOTE инициализация
    sApi.init = function(){
        sApi.students = module("students");
        sApi.groups = module("groups");
        sApi.tasks = module("tasks");
        sApi.mentors = module("mentors");
        sApi.prefered = module("prefered");
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
            "addStudents", "addMentors", "addGroups", "addTasks"
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
                fetchInit.headers = {
                    "Content-type": "application/json; charset=UTF-8"
                };
                fetchInit.body = data;
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
            //NOTE объединение студентов в группы: при data.group определяет идентификатор группы студента
            //NOTE оценки выставленные за задания передаются в data.taskResults
            //NOTE позволяет добавить студента-участника
            save: function(data, callback){
                fetch("addStudents", callback, data);
            }
        }
    });

    module("groups", function(fetch){
        return {
            get: function(callback){
                fetch("getGroups", callback);
            },
            save: function(data, callback){
                fetch("addGroups", callback, data);
            }
        }
    });

    module("tasks", function(fetch){
        const students = module("students");
        var updateStudents;
        var id;
        var editCallback;
        function getStudentsFromData(data){
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
                tempData = JSON.parse(data);
                if(tempData.id == 0){
                    fetch("addTasks", callback, data);
                } else {
                    editCallback = callback;
                    fetch("editTasks", setTaskToStudents, getStudentsFromData(tempData));
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
                fetch("addMentors", callback, data);
            }
        }
    });

    //NOTE распределение менторов и студентов по приоритету
    module("prefered", function(students){
        var mentors = module("mentors");
        var sortCallback, maxStudents, total;
        var S = [], M = [], SFinal = [], MFinal = [], SData = [], MData = [];
        function controlSort(){
            var mentorsP = new Promise(
                    function(resolve, reject){
                        mentors.get(resolve);
                    }
                );

            var studentsP = new Promise(
                    function(resolve, reject){
                        students.get(resolve);
                    }
                );
            Promise.all([mentorsP, studentsP]).then(function(values){
                var ratio = values[1].length / values[0].length;
                maxStudents = parseInt(ratio);
                if(maxStudents != ratio){
                    maxStudents++;
                }
                formWorkArrays(values);
                spreadStudents();
            });
        }
        function formWorkArrays(values){
            total = 0;
            values[0].forEach(function(item){
                M[item.id] = item.preferedStudents;
                MFinal[item.id] = [];
                MData[item.id] = item;
            });
            values[1].forEach(function(item){
                S[item.id] = item.preferedMentors;
                SFinal[item.id] = 0;
                SData[item.id] = item;
            });
        }
        function spreadStudents(){
            var spreadP = new Promise(
                function(resolve, reject){
                    setTimeout(function(){
                        for(var i = 0; i <= maxStudents; i++){
                            S.forEach(function(s, si){
                                if(s.length){
                                    M.forEach(function(m, mi){
                                        if(MFinal[mi].length < maxStudents && s[0] == m[0]){
                                            MFinal[mi].push(si);
                                            SFinal[si] = mi;
                                            if(MFinal[mi].length >= maxStudents){
                                                removeMentor(mi);
                                                saveMentor(mi);
                                            }
                                            removeStudent(si);
                                            S[si] = [];
                                        }
                                    });
                                }
                            });
                        }
                        resolve();
                    }, 0);
                }
            ).then(sortCallback);
        }
        function removeStudent(si){
            M.forEach(function(m){
                if(m.length && m.indexOf(si) >= 0){
                    m.splice(m.indexOf(si), 1);
                }
            });
        }
        function removeMentor(mi){
            S.forEach(function(s){
                if(s.length && s.indexOf(mi) >= 0){
                    s.splice(s.indexOf(mi), 1);
                }
            });
        }
        function saveMentor(mi){
            MData[mi].students = MFinal[mi];
            mentors.save(JSON.stringify(MData[mi]), () => {});
        }
        return {
            sort: function(callback){
                sortCallback = callback;
                controlSort();
            }
        }
    });

    sApi.init();
    return sApi;
}());
