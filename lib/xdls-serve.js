'use strict';

;(function () {
	var win = window;
	var storage = win.localStorage;
	var origins = win.document.getElementsByTagName('script')[0].getAttribute('data-origins').split(',');
	for (var i = 0; i < origins.length; i++) {
		origins[i] = new RegExp(origins[i], 'i');
	}
	
	function init() {
		// Setup postMessage event listeners
		if (win.addEventListener) {
			win.addEventListener('message', onMessage, false);
		} else if (win.attachEvent) {
			win.attachEvent('onmessage', onMessage);
		}

		// Tell the parent window we're ready.
		sendmsg({
			ready : true
		}, "*"); // whatever the origin is as it's just signalement
	}

	function checkOrigin(origin) {
		for (var j = 0; j < origins.length; j++) {
			if (origins[j].test(origin)) {
				return true;
			}
		}
	}
	
	function onMessage(e) {
		if (!checkOrigin(e.origin)) {
			return;
		}

		var request = JSON.parse(e.data);
		if (request.type === "init") {
			sendmsg(getinit(), e.origin);
		} else if (request.type === "get") {
			sendmsg(get(request), e.origin);
		} else if (request.type === "set") {
			sendmsg(set(request), e.origin);
		} else if (request.type === "del") {
			sendmsg(del(request), e.origin);
		}
	}

	function getinit() {
		var values = {};
		var _key;
		for (var i = 0, len = storage.length; i < len; ++i) {
			try {
				_key = storage.key(i);
		  		values[_key] = storage.getItem(_key);
			} catch (e) {}
		}
		return {
			values : values,
			init : true
		};
	}
	
	function get(request) {
		var val;
		try {
			val = storage.getItem(request.key);
		} catch (e) {} // in case localstorage is blocked (wp if no space left, ios in ghost mode)
		return { key: request.key, val: val, type: "get", _xds: request._xds };
	}
	
	function set(request) {
		try {
			storage.setItem(request.key, request.val);
		} catch (e) {}
		return { key: request.key, type: "set", _xds: request._xds };
	}
	
	function del(request) {
		storage.removeItem(request.key);
		return {key: request.key, type: "del", _xds: request._xds};
	}
	
	function sendmsg(response, origin) {
		win.parent.postMessage(JSON.stringify(response), origin);
	}

	init();
})();