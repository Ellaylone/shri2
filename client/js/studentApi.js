var studentApi = (function () {
    var sApi = {};
    sApi.init = function(){
        sApi.students = module("students");
        sApi.groups = module("groups");
        sApi.tasks = module("tasks");
        sApi.mentors = module("mentors");
    }

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
            add: function(studentData, callback){
                fetch("addStudents", callback, studentData);
            },
            edit: function(studentData, callback){
                fetch("editStudents", callback, studentData);
            }
        }
    });

    module("groups", function(fetch){
        return {
            get: function(callback){
                fetch("getGroups", callback);
            },
            add: function(groupData, callback){
                fetch("addGroups", callback, groupData);
            }
        }
    });

    module("tasks", function(fetch){
        return {
            get: function(callback){
                fetch("getTasks", callback);
            },
            add: function(taskData, callback){
                fetch("addTasks", callback, taskData);
            }
        }
    });

    module("mentors", function(fetch){
        return {
            get: function(callback){
                fetch("getMentors", callback);
            },
            add: function(mentorData, callback){
                fetch("addMentors", callback, mentorData);
            }
        }
    });

    sApi.init();
    return sApi;
}());
