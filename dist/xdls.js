/*! xdls - v0.0.0 - 2014-05-06
* http://www.youtube.com/watch?v=cDuG95DXbw8
* Copyright (c) 2014 Obi-Wan Kenobi; Licensed  */
!function(a,b){"use strict";"function"==typeof define&&define.amd?define([],b):a.xdls=b()}(this,function(){"use strict";var a,b,c,d=!1,e=!1,f=0,g=[],h=[],i=[],j={},k="*",l=5e3,m=function(a,d){if(e)throw"xdls init already started";b=a.url,l=a.timeout||5e3,c=d;var f=document.createElement("a");f.href=b;var g={"http:":80,https:443};k=f.protocol+"//"+f.hostname+(f.port&&g[f.protocol]!==parseInt(f.port,10)?":"+f.port:""),n(),p(o())},n=function(){e=window.document.createElement("iframe"),e.style.display="none",window.addEventListener?window.addEventListener("message",function(a){q(a)},!1):window.attachEvent("onmessage",function(a){q(a)}),window.document.body.appendChild(e),e.src=b},o=function(){var a,b=window.localStorage,c=function(a){return function(){if(!d)throw"You need to wait until ready callback has fired";return a.apply(null,arguments)}};try{Object.defineProperty(window,"localStorage",{get:function(){return{setItem:c(u),getItem:c(v),removeItem:c(w)}}}),a=function(){Object.defineProperty(window,"localStorage",{get:function(){return b}})}}catch(e){var f=b.setItem,g=b.getItem,h=b.removeItem;b.getItem=c(v),b.setItem=c(u),b.removeItem=c(w),a=function(){b.getItem=g,b.setItem=f,b.removeItem=h}}return a},p=function(b){setTimeout(function(){m.initiated||(console.warn("unable to connect to xdls remote frame, switching back to classic localStorage"),a=!0,b(),c(new Error("timeout")))},l)},q=function(b){if(b.origin===k&&!a){var f;try{f=JSON.parse(b.data)}catch(b){return}f&&f._is_xds&&(f.ready?(d=e.contentWindow,t({type:"init"})):f.init?(j=f.values,m.initiated=!0,c()):(g[f._xds](f.val,f),r()))}},r=function(){for(var a=0,b=h.length;b>a;a++)s(h[0].request,h[0].callback),h.shift()},s=function(a,b){return!m.initiated||i.indexOf(a.key)>=0?h.push({request:a,callback:b}):(f++,a._xds=f,i.push(a.key),g[f]=function(){i.splice(i.indexOf(a.key),1),b&&b()},void t(a))},t=function(a){d.postMessage(JSON.stringify(a),k)},u=function(a,b,c){j[a]=b,s({type:"set",key:a,val:b},c)},v=function(a,b){return s({type:"get",key:a},b),j[a]},w=function(a,b){delete j[a],s({type:"del",key:a},b)};return m});