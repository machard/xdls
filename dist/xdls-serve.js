/*! xdls - v0.0.0 - 2014-04-03
* http://www.youtube.com/watch?v=cDuG95DXbw8
* Copyright (c) 2014 Obi-Wan Kenobi; Licensed  */
"use strict";!function(){function a(){h.addEventListener?h.addEventListener("message",b,!1):h.attachEvent&&h.attachEvent("onmessage",b),g({ready:!0},"*")}function b(a){if(-1!==j.indexOf(a.origin)){var b=JSON.parse(a.data);"init"===b.type?g(c(),a.origin):"get"===b.type?g(d(b),a.origin):"set"===b.type?g(e(b),a.origin):"del"===b.type&&g(f(b),a.origin)}}function c(){for(var a,b={},c=0,d=i.length;d>c;++c)try{a=i.key(c),b[a]=i.getItem(a)}catch(e){}return{values:b,init:!0}}function d(a){var b;try{b=i.getItem(a.key)}catch(c){}return{key:a.key,val:b,type:"get",_xds:a._xds}}function e(a){try{i.setItem(a.key,a.val)}catch(b){}return{key:a.key,type:"set",_xds:a._xds}}function f(a){return i.removeItem(a.key),{key:a.key,type:"del",_xds:a._xds}}function g(a,b){h.parent.postMessage(JSON.stringify(a),b)}var h=window,i=h.localStorage,j=h.document.getElementsByTagName("script")[0].getAttribute("data-origins").split(",");a()}();