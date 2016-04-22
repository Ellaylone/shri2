var studentApi = (function () {
    var sApi = {};
    sApi.init = function(){
        sApi.fetch = module("fetch");
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
        const GET_PATHS = {
            students: "/api/getStudents",
            mentors: "/api/getMentors",
            groups: "/api/getGroups",
            tasks: "/api/getTasks"
        };

        function json(res){
            return res.json();
        }

        return function(url, callback){
            if(typeof callback == "undefined"){
                console.warn("Callback is undefined");
            }
            fetch(GET_PATHS[url])
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
    });

    module("fetch", function(){
        const URL_PATHS = [
            "getStudents", "getMentors", "getGroups", "getTasks"
        ]

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
            var fetchUrl = "/api/" + url;
            var fetchInit = {};

            if(typeof data == "undefined"){
                fetchInit.method = "GET";
            } else {
                fetchInit.method = "POST";
                fetchInit.body = data
            }
            fetch(fetchUrl, fetchInit)
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
        };
    });

    module("students", function(){

        return {
        }
    });

    sApi.init();
    return sApi;
}());
