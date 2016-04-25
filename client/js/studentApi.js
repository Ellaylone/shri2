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
            var promises = [];
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
                        promises.push(new Promise(
                                function(resolve, reject){
                                    students.save(JSON.stringify(item), function(){resolve();});
                                }
                            ));
                    }
                } else {
                    var hasTask = false;
                    for(var j = 0; j < item.tasks.length; j++){
                        if(item.tasks[j] == parseInt(id)){
                            hasTask = true;
                            break;
                        }
                    }
                    if(hasTask){
                        item.tasks.splice(j, 1);
                        promises.push(new Promise(
                                function(resolve, reject){
                                    students.save(JSON.stringify(item), function(){resolve();});
                                }
                            ));
                    }
                }
            });
            Promise.all(promises).then(resolve());
        }

        function setTaskToStudents(editTasksData){
            id = editTasksData.id;
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
                editCallback = callback;
                fetch("addTasks", setTaskToStudents, getStudentsFromData(tempData));
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
        var S = [], SID = [], M = [], MID = [], MFinal = [], MData = [];
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
            });
        }
        function formWorkArrays(values){
            total = 0;
            values[0].forEach(function(item){
                MID.push(item.id);
                M.push(item.preferedStudents);
                MFinal.push(new Array());
                MData[item.id] = item;
            });
            values[1].forEach(function(item){
                total++;
                SID.push(item.id);
                S.push(item.preferedMentors);
            });
            sortStudents();
        }

        function sortStudents(){
            for(var si = 0; si < S.length; si++){
                if(!lookForPickControl(si, [0, maxStudents])){
                    lookForPickControl(si, [maxStudents, M.length]);
                }
            }
            saveMentors();
        }
        

        function lookForPickControl(si, limits){
            var success = false;
            for(var p = 0; p < S[si].length; p++){
                success = lookForPick(si, p, [limits[0], limits[1]]);
                if(success){
                    break;
                }
            }
            return success;
        }

        function lookForPick(si, p, limits){
            var topMi = MID.indexOf(S[si][p]);
            var topM = M[topMi];
            for(var i = limits[0]; i < limits[1]; i++){
                if(topM[i] == SID[si] && MFinal[topMi].length < maxStudents){
                    MFinal[topMi].push(SID[si]);
                    return true;
                } else {
                    return false;
                }
            }
        }
        
        function saveMentors(){
            for(var mi = 0; mi < MID.length; mi++){
                MData[MID[mi]].students = MFinal[MID[mi]]; 
                mentors.save(JSON.stringify(MData[MID[mi]]), () => {});
            }
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
