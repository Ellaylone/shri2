var studentApi = (function () {
    var sApi = {};
    sApi.init = function(){
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

    // start();
    return sApi;
}());
