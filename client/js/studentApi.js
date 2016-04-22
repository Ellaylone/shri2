var studentApi = (function () {
    var sApi = {};
    sApi.init = function(){
        sApi.get = module("get");
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
        return {
            json: function(url, callback){
                if(typeof callback == "undefined"){
                    console.warn("Callback is undefined");
                }
                fetch(url)
                    .then(
                        function(response) {
                            if (response.status !== 200) {
                                console.warn("Status Code: " + response.status);
                                return;
                            }
                            response.json().then(callback);
                        }
                    )
                    .catch(function(err) {
                        console.warn("Fetch Error:", err);
                    });
            }
        }
    });

    module("get", function(fetch){
        const GET_PATHS = {
            students: "/api/getStudents",
            mentors: "/api/getMentors",
            groups: "/api/getGroups",
            tasks: "/api/getTasks"
        };

        function json(res){
            return res.json();
        }

        return {
            students: function(callback){
                fetch.json(GET_PATHS.students, callback);
            },
            mentors: function(callback){
                fetch.json(GET_PATHS.mentors, callback);
            },
            groups: function(callback){
                fetch.json(GET_PATHS.groups, callback);
            },
            tasks: function(callback){
                fetch.json(GET_PATHS.tasks, callback);
            }
        }
    });

    // описываем модуль
    module("http", function () {

        return {
            ololo: function () {
                alert("ololo!")
            }
        }

    });


    module("ajax", function (http) {

        // http  //модуль автоматически подключился по имени аргумента

        return {
            ololo: function () {
                // http.ololo();
                // alert("test");
            }
        }

    });

    var ajax = module("ajax");
    ajax.ololo();

    sApi.init();
    return sApi;
}());
