// Uses AMD or browser globals to create a module.

// Grabbed from https://github.com/umdjs/umd/blob/master/amdWeb.js.
// Check out https://github.com/umdjs/umd for more patterns.

// Defines a module "xdls".
// Note that the name of the module is implied by the file name. It is best
// if the file name and the exported global have matching names.

// If you do not want to support the browser global path, then you
// can remove the `root` use and the passing `this` as the first arg to
// the top function.

(function (root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals
        root.xdls = factory();
    }
}(this, function () {
    'use strict';

    var giveup;
    var serverUrl;
    var server = false;
    var serverFrame = false;
    var _id = 0;
    var callbacks = [];
    var queue = [];
    var processingKeys = [];
    var cachedValues = {};
    var callbackReady;
    var origin = '*';
    var timeout = 5000;

    var xdls = function (options, callback) {
        if (serverFrame) {
            throw "xdls init already started";
        }

        serverUrl =  options.url; //"../xds/xds-serve/xds-serve.html";
        timeout = options.timeout || 5000;
        callbackReady = callback;

        var a = document.createElement("a");
        a.href = serverUrl;
        var NO_PORTS = {
            'http:' : 80,
            'https' : 443
        };
        origin = a.protocol + '//' + a.hostname + ((a.port && NO_PORTS[a.protocol] !== parseInt(a.port, 10)) ? ':' + a.port : '');

        init();
        setUpTimeout(replaceLocalStorage());
    };

    var init = function () {
        //create the server frame out of sight
        serverFrame = window.document.createElement('iframe');
        serverFrame.style.display = "none";

        //set up something to handle the "ready" message back from the server, and any responses therein
        if (window.addEventListener) {
            window.addEventListener('message', function (e) { onMessage(e); }, false);
        } else {
            window.attachEvent('onmessage', function (e) { onMessage(e); });
        }
            
        window.document.body.appendChild(serverFrame);
        serverFrame.src = serverUrl;

    };

    var replaceLocalStorage = function () {
        var ls = window.localStorage; // old ref

        var checkReadyAndCall = function (fn) {
            return function () {
                if (!server) {
                    throw "You need to wait until ready callback has fired";
                }
                return fn.apply(null, arguments);
            };
        };

        var ret;

        try {
            Object.defineProperty(window, 'localStorage', {
                get: function localStorage() {
                    return {
                        setItem : checkReadyAndCall(_setItem),
                        getItem : checkReadyAndCall(_getItem),
                        removeItem : checkReadyAndCall(_removeItem)
                    };
                }
            });

            ret = function () {
                Object.defineProperty(window, 'localStorage', {
                    get: function localStorage() {
                        return ls;
                    }
                });
            };
        } catch (e) {
            var _old_setItem = ls.setItem;
            var _old_getItem = ls.getItem;
            var _old_removeItem = ls.removeItem;

            ls.getItem = checkReadyAndCall(_getItem);
            ls.setItem = checkReadyAndCall(_setItem);
            ls.removeItem = checkReadyAndCall(_removeItem);

            ret = function () {
                ls.getItem = _old_getItem;
                ls.setItem = _old_setItem;
                ls.removeItem = _old_removeItem;
            };
        }
        

        return ret;
    };

    var setUpTimeout = function (restore) {
        setTimeout(function () {
            if (!xdls.initiated) {
                console.warn('unable to connect to xdls remote frame, switching back to classic localStorage');
                giveup = true;
                restore();
                callbackReady(new Error('timeout')); // 
            }
        }, timeout);
    };

    var onMessage = function (e) {
        if (e.origin !== origin || giveup) {
            return;
        }

        var response;
        try {
            response = JSON.parse(e.data);
        } catch (e) {
            return; // pas pour nous
        }

        if (!response || !response._is_xds) {
            return; // pas pr nous
        }
        
        if (response.ready) {
            server = serverFrame.contentWindow;
            post({type : 'init'});
        } else if (response.init) {
            cachedValues = response.values;
            xdls.initiated = true;
            callbackReady();
        } else {
            callbacks[response._xds](response.val, response);
            processQueue();
        }
    };

    var processQueue = function () {
        for (var i = 0, len = queue.length; i < len; i++) {
            remoteStore(queue[0].request, queue[0].callback);
            queue.shift();
        }
    };

    var remoteStore = function (request, callback) {
        if (!xdls.initiated || processingKeys.indexOf(request.key) >= 0) {
            return queue.push({
                request : request,
                callback : callback
            });
        }

        //increment the request id to keep track of callbacks
        _id++;
        request._xds = _id;
        processingKeys.push(request.key);

        callbacks[_id] = function () {
            processingKeys.splice(processingKeys.indexOf(request.key), 1);
            if (callback) {
                callback();
            }
        };

        post(request);
    };

    var post = function (data) {
        server.postMessage(JSON.stringify(data), origin);
    };

    var _setItem = function (key, value, callback) {
        cachedValues[key] = value;
        remoteStore({'type' : "set", 'key' : key, 'val' : value}, callback);
    };
    var _getItem = function (key, callback) {
        remoteStore({'type': "get", 'key' : key}, callback);
        return cachedValues[key];
    };
    var _removeItem = function (key, callback) {
        delete cachedValues[key];
        remoteStore({'type' : "del", 'key' : key}, callback);
    };

    return xdls;
}));
