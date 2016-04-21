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
            students: "/api/getStudents"
        };

        function json(res){
            return res.json();
        }

        return {
            students: function(callback){
                if(typeof callback == "undefined"){
                    console.warn("Callback is undefined");
                }
                fetch(GET_PATHS.students)
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

    // module()

    // var get = module("get");
    // get.students(function(data){console.log(data)});

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
