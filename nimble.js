/* nimble.min.js - https://github.com/CodeSmith32/nimblejs - version 1.2.8 - MIT licensed: https://opensource.org/licenses/MIT */
var nimble=new function(e){"use strict";var n,t,i,a,o,r=this,l=e.document,c=e.navigator,s=(o=c.userAgent,t="edge",(n=o.match(/(?:Edge\/((\d+)[\d\.]*))/))||(t="chrome",n=o.match(/Chrome\/((\d+)[\d\.]*)/))||(t="firefox",n=o.match(/Firefox\/((\d+)[\d\.]*)/))||(t="ie",n=o.match(/(?:MSIE |Trident.*?rv:?\s*)((\d+)[\d\.]*)/))||(t="opera",n=o.match(/(?:Opera |Opera\/.*?Version )((\d+)[\d\.]*)/))||(t="safari",n=o.match(/(?:Version\/((\d+)[\d\.]*))?.*Safari/))||(t="other",0)?(i=n[2],a=n[1]):(i=null,a=null),{browser:t,version:+i,fullversion:a,valueOf:function(){return t}}),f="requestAnimationFrame"in e?"":"msRequestAnimationFrame"in e?"ms":"mozRequestAnimationFrame"in e?"moz":"webkitRequestAnimationFrame"in e?"webkit":"oRequestAnimationFrame"in e?"o":"",d=f+(f?"R":"r")+"equestAnimationFrame",u=f+(f?"C":"c")+"ancelAnimationFrame",h="pointerLockElement"in l?"":"msPointerLockElement"in l?"ms":"mozPointerLockElement"in l?"moz":"webkitPointerLockElement"in l?"webkit":"",v=h+(h?"R":"r")+"equestPointerLock",m=h+(h?"E":"e")+"xitPointerLock",p=h+(h?"P":"p")+"ointerLockElement",g=h+"pointerlockchange",x=h+"pointerlockerror";function w(e,n){return e.on=e.hook=function(e,t){"function"==typeof t&&e in n&&n[e].push(t)},e.off=e.unhook=function(e,t){if(e in n){var i=n[e].indexOf(t);i>-1&&n[e].splice(i,1)}},function(e){for(var t=n[e.event],i=t.length,a=0;a<i;a++)t[a].call(void 0,e)}}function y(e,n,t){var i=!1;e.enable=function(){if(!i){var e;for(var a in t){e=a.split(" ");for(var o=0;o<e.length;o++)n.addEventListener(e[o],t[a],{passive:!1})}i=!0}},e.disable=function(){if(i){var e;for(var a in t){e=a.split(" ");for(var o=0;o<e.length;o++)n.removeEventListener(e[o],t[a])}i=!1}},e.isenabled=function(){return i},r.enableByDefault&&e.enable()}r.enableByDefault=!0;var b=function(n){var t=this;if(!(t instanceof b))throw"Bad instantiation of object nimble.Canvas";n=n||e;var i,a,o=null,r="2d",l=null;function c(e){o&&o.getContext&&(t.width=i=o.width=n.innerWidth||n.offsetWidth,t.height=a=o.height=n.innerHeight||n.offsetHeight,l=o.getContext(r),t.antialias||(l.imageSmoothingEnabled=!1),t.context=l,s({event:"resize",context:l,width:i,height:a,original:e}),t.redraw())}t.context=null,t.width=0,t.height=0,t.antialias=!0,y(t,e,{resize:c}),t.update=function(){c(null)},t.canvas=function(e,n){if(void 0===e)return o;o=e,r=3==n?"webgl":"2d",c()},t.stepclear=function(){t.clear()},t.clear=function(e){if(e||(e=t.back),"webgl"==r){if(e){var n,o,c;n=(e&=16777215)>>16,o=(e&=65535)>>8,c=255&e,l.clearColor(n,o,c,1)}else l.clearColor(0,0,0,1);l.clear(l.COLOR_BUFFER_BIT)}else e?(l.fillStyle=e,l.fillRect(-1,-1,i+2,a+2)):l.clearRect(-1,-1,i+2,a+2)},t.redraw=function(){s({event:"draw",context:l,width:i,height:a})},t.back=null;var s=w(t,{draw:[],resize:[]})},z=function(n){var t=this;if(!(t instanceof z))throw"Bad instantiation of object nimble.Steps";n=n||e;var i=null,a=null,o=!1,l=null;function c(n){if(o){var t=+l===l?n-l:16.67;l=n,a=1e3/t,s({event:"step",delta:t}),o&&(i=e[d](c))}}t.enable=t.start=function(){null===i&&(i=e[d](c),o=!0)},t.disable=t.stop=function(){null!==i&&(e[u](i),i=null,o=!1,l=a=null)},t.running=t.isenabled=function(){return o},t.fps=function(){return a};var s=w(t,{step:[]})
;r.enableByDefault&&t.enable()},k=function(n){var t=this;if(!(t instanceof k))throw"Bad instantiation of object nimble.Keyboard";n=n||e;var i=function(){for(var e={backspace:8,tab:9,numclear:12,enter:13,shift:16,control:17,alt:18,space:32,pageup:33,pagedown:34,end:35,home:36,left:37,up:38,right:39,down:40,pausebreak:19,capslock:20,escape:27,printscreen:44,insert:45,del:46,windows:91,numpad0:96,numpad1:97,numpad2:98,numpad3:99,numpad4:100,numpad5:101,numpad6:102,numpad7:103,numpad8:104,numpad9:105,multiply:106,add:107,subtract:109,decimal:110,divide:111,f1:112,f2:113,f3:114,f4:115,f5:116,f6:117,f7:118,f8:119,f9:120,f10:121,f11:122,f12:123,numlock:144,scrolllock:145,semicolon:186,colon:186,plus:187,equals:187,comma:188,lessthan:188,period:190,greaterthan:190,minus:189,underscore:189,slash:191,question:191,atilda:192,lbracket:219,rbracket:221,quote:222,backslash:220,verticalbar:220},n="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",t=0;t<n.length;t++)e[n[t]]=n.charCodeAt(t);return e}(),a={};for(var o in i)t[o]=!1,a[i[o]]=o;t.codes=Object.create(i),t.icodes=Object.create(a),t.pressed={},t.released={},y(t,n,{keydown:function(e){var n=a[e.which];t[n]||(t[n]=!0,t.steps&&(t.pressed[n]=!0),r({event:"down",code:e.which,key:n,original:e}))},keyup:function(e){var n=a[e.which];t[n]=!1,t.steps&&(t.released[n]=!0),r({event:"up",code:e.which,key:n,original:e})}}),t.stepclear=function(){t.pressed={},t.released={}},t.steps=!1;var r=w(t,{down:[],up:[]})},Y=function(n){var t=this;if(!(t instanceof Y))throw"Bad instantiation of object nimble.Mouse";var i=v in(n=n||e)?n:l.documentElement,a={left:1,middle:2,right:3},o={};for(var r in a)t[r]=!1,o[a[r]]=r;t.codes=Object.create(a),t.icodes=Object.create(o),t.pressed={},t.released={},t.wheeldelta={x:0,y:0,d:0},t.x=-1e4,t.y=-1e4,t.xdelta=0,t.ydelta=0,t.xwheel=0,t.ywheel=0,t.wheel=0;var c=!1,f=!1;t.pointerlock=function(e){if(!arguments.length)return c;!(c=!!e)&&f&&t.exitpointerlock()},t.ispointerlocked=function(){return f},t.exitpointerlock=function(){f&&i[m]()};var d,u={},h={};t.enable=function(){u.enable(),h.enable()},t.disable=function(){u.disable(),h.disable()},t.isenabled=function(){return u.isenabled()},(d={})[g]=function(){f=l[p]==i},d[x]=function(){console.log("error obtaining pointerlock")},y(u,l,d),y(h,n,{mousedown:function(e){c&&!f&&i[v]();var a=o[e.which];t[a]=!0,t.steps&&(t.pressed[a]=!0),t.x=e.clientX-(n.offsetLeft||0),t.y=e.clientY-(n.offsetTop||0),b({event:"down",code:e.which,button:a,original:e})},mouseup:function(e){var i=o[e.which];t[i]=!1,t.steps&&(t.released[i]=!0),t.x=e.clientX-(n.offsetLeft||0),t.y=e.clientY-(n.offsetTop||0),b({event:"up",code:e.which,button:i,original:e})},mousemove:function(e){t.x=e.clientX-(n.offsetLeft||0),t.y=e.clientY-(n.offsetTop||0),t.steps&&(t.xdelta+=+e.movementX===e.movementX?e.movementX:+e.mozMovementX===e.mozMovementX?e.mozMovementX:+e.webkitMovementX===e.webkitMovementX?e.webkitMovementX:0,t.ydelta+=+e.movementY===e.movementY?e.movementY:+e.mozMovementY===e.mozMovementY?e.mozMovementY:+e.webkitMovementY===e.webkitMovementY?e.webkitMovementY:0),b({event:"move",x:t.x,y:t.y,original:e})},wheel:function(e){"firefox"==s?(t.xwheel=24*-e.deltaX,t.ywheel=24*-e.deltaY,
t.wheel=24*-e.deltaY):(t.xwheel=e.wheelDeltaX,t.ywheel=e.wheelDeltaY,t.wheel=e.wheelDelta),t.wheeldelta.x+=t.xwheel,t.wheeldelta.y+=t.ywheel,t.wheeldelta.d+=t.wheel,b({event:"wheel",wheel:t.wheel,xwheel:t.xwheel,ywheel:t.ywheel,original:e})}}),t.stepclear=function(){t.pressed={},t.released={},t.wheeldelta={x:0,y:0,d:0},t.xdelta=t.ydelta=0},t.steps=!1;var b=w(t,{wheel:[],down:[],up:[],move:[]})},M=function(n){var t=this;if(!(t instanceof M))throw"Bad instantiation of object nimble.Touch";function i(e,n,i){var a=this;t.fingers[i]=a,t.steps&&t.pressed.push(a),a.x=e,a.y=n,a.identifier=i,a.ended=!1,a._move=function(e,n,t){a.x=e,a.y=n,o({event:"move",x:a.x,y:a.y,original:t})},a._end=function(e,n,r,l){+e===e&&(a.x=e,a.y=n),delete t.fingers[i],a.ended=!0,t.steps&&t.released.push(a),o({event:"end",x:a.x,y:a.y,canceled:r,original:l})};var o=w(a,{move:[],end:[]})}n=n||e,t.fingers={},t.pressed=[],t.released=[],y(t,n,{touchstart:function(e){e.preventDefault();for(var t=n.offsetLeft||0,o=n.offsetTop,r=e.changedTouches,l=[],c=r.length,s=0;s<c;s++)l.push(new i(r[s].clientX-t,r[s].clientY-o,r[s].identifier));a({event:"start",fingers:l,original:e})},touchmove:function(e){e.preventDefault();for(var i=n.offsetLeft||0,o=n.offsetTop,r=e.changedTouches,l=[],c=r.length,s=0;s<c;s++)r[s].identifier in t.fingers&&(l.push(t.fingers[r[s].identifier]),t.fingers[r[s].identifier]._move(r[s].clientX-i,r[s].clientY-o,e));a({event:"move",fingers:l,original:e})},touchend:function(e){e.preventDefault();for(var i=n.offsetLeft||0,o=n.offsetTop,r=e.changedTouches,l=[],c=r.length,s=0;s<c;s++)r[s].identifier in t.fingers&&(l.push(t.fingers[r[s].identifier]),t.fingers[r[s].identifier]._end(r[s].clientX-i,r[s].clientY-o,!1,e));a({event:"end",fingers:l,canceled:!1,original:e})},touchcancel:function(e){e.preventDefault();for(var i=n.offsetLeft||0,o=n.offsetTop,r=e.changedTouches,l=[],c=r.length,s=0;s<c;s++)r[s].identifier in t.fingers&&(l.push(t.fingers[r[s].identifier]),t.fingers[r[s].identifier]._end(r[s].clientX-i,r[s].clientY-o,!0,e));a({event:"end",fingers:l,canceled:!0,original:e})}}),t.clear=function(){for(var e in t.fingers)t.fingers[e]._end(null,null,2,null)},t.stepclear=function(){t.pressed=[],t.released=[]},t.steps=!1;var a=w(t,{start:[],move:[],end:[]})},X=function(n){var t=this;if(!(t instanceof X))throw"Bad instantiation of object nimble.Orientation";n=n||e,t.alpha=0,t.beta=0,t.gamma=0,t.xgrav=0,t.ygrav=0,t.zgrav=0,t.xacc=0,t.yacc=0,t.zacc=0,t.xorient={x:0,y:0,z:0},t.yorient={x:0,y:0,z:0},t.zorient={x:0,y:0,z:0},t.xreal={x:0,y:0,z:0},t.yreal={x:0,y:0,z:0},t.zreal={x:0,y:0,z:0};var i=Math.PI/180,a=Math.cos,o=Math.sin;y(t,n,{deviceorientation:function(e){t.alpha=e.alpha,t.beta=e.beta,t.gamma=e.gamma;var n=t.alpha*i,l=t.beta*i,c=t.gamma*i,s=a(n),f=o(n),d=a(l),u=o(l),h=a(c),v=o(c);t.xorient.x=h*d,t.yorient.x=h*u*f-s*v,t.zorient.x=v*f+h*s*u,t.xorient.y=d*v,t.yorient.y=h*s+v*u*f,t.zorient.y=s*v*u-h*f,t.xorient.z=-u,t.yorient.z=d*f,t.zorient.z=d*s,f=-f,u=-u,v=-v,t.xreal.x=d*h,t.yreal.x=-d*v,t.zreal.x=u,t.xreal.y=s*v+h*f*u,t.yreal.y=s*h-f*u*v,t.zreal.y=-d*f,t.xreal.z=f*v-s*h*u,t.yreal.z=h*f+s*u*v,t.zreal.z=s*d,r({event:"rotate",alpha:t.alpha,beta:t.beta,gamma:t.gamma,original:e})},
devicemotion:function(e){var n,i;n=e.accelerationIncludingGravity||{},null===(i=e.acceleration||{}).x&&null===n.x||(null===n.x&&(n={x:i.x+9.81*t.zreal.x,y:i.y+9.81*t.zreal.y,z:i.z+9.81*t.zreal.z}),null===i.x&&(i={x:n.x-9.81*t.zreal.x,y:n.y-9.81*t.zreal.y,z:n.z-9.81*t.zreal.z}),t.xgrav=n.x,t.ygrav=n.y,t.zgrav=n.z,t.xacc=i.x,t.yacc=i.y,t.zacc=i.z,r({event:"move",xacc:t.xacc,yacc:t.yacc,zacc:t.zacc,xgrav:t.xgrav,ygrav:t.ygrav,zgrav:t.zgrav,original:e}))}}),t.stepclear=function(){},t.steps=!1;var r=w(t,{rotate:[],move:[]})};r.Canvas=b,r.Steps=z,r.Keyboard=k,r.Mouse=Y,r.Touch=M,r.Orientation=X}(this);