var studentApi = (function () {
    var sApi = {};

    var module = new function () {

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

    };

    // описываем модуль
    module('http', function () {

        return {
            ololo: function () {
                alert('ololo!')
            }
        }

    });


    module('ajax', function (http) {

        http  //модуль автоматически подключился по имени аргумента

        return {
            ololo: function () {
                http.ololo();
                alert('test');
            }
        }

    });

    var ajax = module('ajax');
    ajax.ololo();


    // обращаемся к модулю
    // var http = module('http');
    // http.ololo() // ololo!


    // var module = (function () {
    //     var someInnerModuleVar;
    //     // console.log("asd");

    //     // крутой js код

    //     return {
    //         // publicMethod: publicMethod,
    //         // init: init
    //     };
    // }());

    // start();
    return sApi;
}());
