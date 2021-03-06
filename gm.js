/* ------------------------------------------ //
					GM-JS
			Version: 0.6.16
			Author: jmscreator
			License: Free to use (See GPL License)
			
	Current Progress:
// ------------------------------------------- */

var GMJS = new (function(){'use strict';
	var _error = 0;
	if(typeof(nimble) == 'undefined') {_error++;throw new Error('GMJS Requires Nimble');}
	if(typeof(PIXI) == 'undefined') {_error++;throw new Error('GMJS Requires PIXI');}
	if(_error) throw ('GMJS Failed To Load Because '+_error.toString()+' Error'+'s'.repeat((_error>1))+' Occurred');
	var This = this;
	var _GameEngineStarted = false;
	var Application = PIXI.Application,
		Container = PIXI.Container,
		Graphics = PIXI.Graphics,
		Text = PIXI.Text,
		TextStyle = PIXI.TextStyle,
		Sprite = PIXI.Sprite,
		AnimSprite = PIXI.AnimatedSprite,
		TilingSprite = PIXI.TilingSprite,
		Rectangle = PIXI.Rectangle,
		TextureCache = PIXI.utils.TextureCache,
		Texture = PIXI.Texture,
		BaseTexture = PIXI.BaseTexture,
		ConstructLoader = PIXI.Loader,
		loader = PIXI.Loader.shared,
		resources = PIXI.Loader.shared.resources;
	const dtr = Math.PI / 180;
	const rtd = 1/dtr;
	var __IndexPosition = 10000,
		AllInstances = [];
	var in_array = function(keys, array){ // Returns if all keys are in an array
		if(typeof(array) != 'object') return false;
		if(typeof(keys) == 'string') return keys in array;
		for(var x in keys){
			if(!(keys[x] in array)) return false;
		}
		return true;
	},
	newId = function(){
		return __IndexPosition++;
	}
	
	This.StartGameEngine = function(Params){
		if(_GameEngineStarted) throw new Error('GameEngine Is Already Running!');
		_GameEngineStarted = true;
		var load_progress = [{}, {}];
		//Setup game initialization parameters
		var GameStart = Params['onStart']||function(){},
		GameEnd = Params['onEnd'] || function(){},
		LoadingImages = Params['loadingImages'] || [],
		LoadingRoom = Params['loadingRoom'] || {width:640, height:480},
		AfterLoadTimeout = Params['loadingTimeout'] || 1000,
		Images = Params['images'] || [],
		Sounds = Params['sounds'] || [],
		Files = Params['files'] || [],
		Fonts = Params['fonts'] || [],
		BeginStep = Params['beginStep'] || function(){},
		EndStep = Params['endStep'] || function(){},
		PreventDefault = Params['preventDefault'] || false,
		PreventDefaultExpression = Params['preventDefaultExp'] || function(){return true;};
		
		Params['room'] = Params['room'] || {},
		Params['view'] = Params['view'] || {}
		Params['screen'] = Params['screen'] || {};

		//Start Loading Screen
		var loadingScreen = new Application(LoadingRoom);
		document.body.appendChild(loadingScreen.view);
		
		var View = {},
		Screen = {};
		
		This.room = {},
		This.screen = {},
		This.view = {};
		
		//Game width\height in game room
		Object.defineProperty(This.room, 'width', {value:('width' in Params.room)?Params.room.width:600, writeable:false});
		Object.defineProperty(This.room, 'height', {value:('height' in Params.room)?Params.room.height:400, writeable:false});
		
		//View width\height in game room
		Object.defineProperty(This.view, 'width', {get:function(){return View.width;}, set:function(v){View.width = v;app.stage.scale.x = app.renderer.width/v;}});
		Object.defineProperty(This.view, 'height', {get:function(){return View.height;}, set:function(v){View.height = v;app.stage.scale.y = app.renderer.height/v;}});
		
		//View x\y in game room
		Object.defineProperty(This.view, 'x', {get:function(){return View.x;}, set:function(v){View.x = v;app.stage.x = -v*app.stage.scale.x;}});
		Object.defineProperty(This.view, 'y', {get:function(){return View.y;}, set:function(v){View.y = v;app.stage.y = -v*app.stage.scale.y;}});
		
		//Screen width\height on window
		Object.defineProperty(This.screen, 'width', {get:function(){return Screen.width;}, set:function(v){Screen.width = v;app.renderer.resize(v, Screen.height);app.stage.scale.x = app.renderer.width/This.view.width;}});
		Object.defineProperty(This.screen, 'height', {get:function(){return Screen.height;}, set:function(v){Screen.height = v;app.renderer.resize(Screen.width, v);app.stage.scale.y = app.renderer.height/This.view.height;}});
		
		
		//Create game application frame
		var app = new Application(This.room);
		app.stage.updateLayersOrder = function () {
			app.stage.children.sort(function(a,b) {
				a.zIndex = a.zIndex || 0;
				b.zIndex = b.zIndex || 0;
				return b.zIndex - a.zIndex
			});
		};
		
		//Set screen resolution/game port settings
		This.view.x = ('x' in Params.view)?Params.view.x:0;
		This.view.y = ('y' in Params.view)?Params.view.y:0;
		This.view.width = ('width' in Params.view)?Params.view.width:This.room.width;
		This.view.height = ('height' in Params.view)?Params.view.height:This.room.height;
		This.screen.width = ('width' in Params.screen)?Params.screen.width:This.view.width;
		This.screen.height = ('height' in Params.screen)?Params.screen.height:This.view.height;
		
		//Import textures
		var TexList = [];
		
		var isLoading = false; // if game is currently loading extra resources
		
		function loadTextures(list){ // load textures into the engine environment
			function createFrame(tx, tile){
				if(!in_array(['x', 'y', 'w', 'h'], tile)) return false;
				tx.frame = (new Rectangle(tile.x, tile.y, tile.w, tile.h));return true;
			}
			for(var img in list){
				var i = list[img], tex;
				if(TextureCache[i.path] == undefined) {console.error('Failed loading resource - '+i.name+' - Image file not found');continue;}
				
				if('animated' in i){
					tex = [];
					var j = i.animated;
					var count = j.count || 0,
					columns = j.columns || 1,
					w = j.w || 0,h = j.h || 0,
					xoff = j.xoff || 0,yoff = j.yoff || 0,
					xsep = j.xsep || 0,ysep = j.ysep || 0;
					
					for(var t = 0; t < count; t++){
						var tx = new Texture(BaseTexture.from(i.path)); // Animation Textures
						tex.push(tx);
						var xx = (t % columns),
						yy = Math.floor(t / columns),
						tile = {x:(xoff+(w+xsep)*xx), y:(yoff+(h+ysep)*yy), w:w, h:h};
						createFrame(tx, tile);
					}
				} else {
					tex = new Texture(BaseTexture.from(i.path)); // Generate New Texture
					if('tile' in i){
						if(!createFrame(tex, i.tile)) {console.error('Failed creating frame for - '+i.name); continue;}
					}
				}

				i.texture = tex;
			}
		}
		
		for(var img in Images){
			var i = Images[img];
			if(!('path' in i)) {console.error('Failed loading resource - ', i);continue;}
			if('strip' in i){
				for(var l in i.strip){
					var p = i.strip[l];
					if(!('name' in p)) {console.error('Failed loading strip resource with no name - '+i.path);continue;}
					p.path = i.path;
					TexList.push(p);
				}
				if(!i.strip.length) {console.error('Failed loading resource strip with no contents');continue;}
				loader.add(i.path);
				continue;
			} else if(!('name' in i)) {console.error('Failed loading resource with no name');continue;}
			loader.add(i.name, i.path);
			TexList.push(i);
		}
		//Import Files
		for(let file of Files){
			if(!('path' in file)) {console.error('Failed loading file resource - ', file);continue;}
			if(!('name' in file)) {console.error('Failed to load a file resource with no name - ');continue;}
			loader.add(file.name, file.path); //Preload
		}
		//Import Fonts
		var fontsLoaded = 0;
		for(let font of Fonts){
			if(!('path' in font)) {console.error('Failed loading font resource - ', font);continue;}
			if(!('name' in font)) {console.error('Failed to load a font resource with no name - ');continue;}
			//font = {name:'', path:''};
			var obj = new FontFace(font.name, "url('"+font.path+"')", font.options || {});
			obj.load().then(fnt=>{
				document.fonts.add(fnt);
				fontsLoaded++;
			});
		}
		//Import Sounds
		for(let snd of Sounds){
			if(!('path' in snd)) {console.error('Failed loading sound resource - ', snd);continue;}
			if(!('name' in snd)) {console.error('Failed to load a sound resource with no name - ');continue;}
			loader.add(snd.name, snd.path); //Preload
		}
		
		
		//Setup important class objects/variables
		var _DepthChanged = false,
		room = app.screen,
		keyboard = new nimble.Keyboard(),
		mouse = new nimble.Mouse(app.view),
		touch = new nimble.Touch(app.view),
		finger = null,
		object_table = [];
		
		keyboard.steps = true;
		mouse.steps = true;
		touch.steps = true;
		var keyboard_char = '';
		//Keyboard String Input
		keyboard.on('down', function(e){
			if(PreventDefault && PreventDefaultExpression(This, e)) e.original.preventDefault();
			var chr = '';if(!e.key) return;
			if(e.key.length == 1){
				chr = (keyboard.shift)?e.key:e.key.toLowerCase();
				if(keyboard.shift){
					switch(e.key){
						case '1':chr = '!';break;
						case '2':chr = '@';break;
						case '3':chr = '#';break;
						case '4':chr = '$';break;
						case '5':chr = '%';break;
						case '6':chr = '^';break;
						case '7':chr = '&';break;
						case '8':chr = '*';break;
						case '9':chr = '(';break;
						case '0':chr = ')';break;
					}
				}
			} else {
				switch(e.key){
					case 'lbracket':chr = (keyboard.shift)?'{':'[';break;
					case 'rbracket':chr = (keyboard.shift)?'}':']';break;
					case 'semicolon':chr = (keyboard.shift)?':':';';break;
					case 'quote':chr = (keyboard.shift)?'"':'\'';break;
					case 'comma':chr = (keyboard.shift)?'<':',';break;
					case 'period':chr = (keyboard.shift)?'>':'.';break;
					case 'slash':chr = (keyboard.shift)?'?':'/';break;
					case 'backslash':chr = (keyboard.shift)?'|':'\\';break;
					case 'minus':chr = (keyboard.shift)?'_':'-';break;
					case 'equals':chr = (keyboard.shift)?'+':'=';break;
					case 'accent':chr = (keyboard.shift)?'~':'`';break;
					case 'space':chr = ' ';break;
				}
			}
			if(chr) keyboard_char = chr;
		});
		
		//Setup in-game class functions
		var create_text_style = function(style){
			return new TextStyle(style);
		},
		create_text = function(str, x, y, style){
			str = str || '';
			style = style || {};
			var _text = new Text(str, style);
			_text.zIndex = 0;
			Object.defineProperty(_text, 'depth', {set:function(x){_DepthChanged = _DepthChanged || (_text.zIndex != x);_text.zIndex = x;}, get:function(){return _text.zIndex;}});
			
			_text.align = function(a, b){b=b||100;switch(a){case 'center':_text.anchor.x = 0.5;_text.anchor.y = 0.5;return;case 'left':_text.anchor.x = 1-b/100;return;case 'right':_text.anchor.x = b/100;return;case 'top':_text.anchor.y = 1-b/100;return;case 'bottom':_text.anchor.y = b/100;return;}};
			_text.destroy = function(){app.stage.removeChild(_text);}
			_text.x = x || 0;
			_text.y = y || 0;
			if(loadingScreen != null){
				loadingScreen.stage.addChild(_text);
			} else {
				app.stage.addChild(_text);
			}
			_DepthChanged = true;
			return _text;
		},
		get_object = function(o){
			if(typeof(o) == 'object'){
				return o;
			}
			if(typeof(o) == 'string'){
				for(var x in object_table){
					if(object_table[x].name == o) return object_table[x];
				}
			}
			return false;
		},
		get_instances = function(obj){
			var l = [];
			function recurse(_obj){
				l = l.concat(_obj.instances);
				for(var child in _obj.children){
					recurse(_obj.children[child]);
				}
			}
			recurse(obj);
			return l;
		},
		get_instance = function(obj, id){
			if(+obj === obj){var r;for(var z in AllInstances){if(obj == (r=AllInstances[z]).id) return r;}return null;}
			var l = get_instances(obj);id = id || 0;
			return (!!l[id])?l[id]:false;
		},
		sound_play = function(snd, opt){
			opt = opt || {};
			//return Sound.play(snd, opt); //Not loaded
			if(!resources[snd] || !resources[snd].sound) return null;
			return resources[snd].sound.play(opt); //Pre-loaded
		},
		sound_volume = function(snd, vol){
			if(!resources[snd] || !resources[snd].sound) return -1;
			return resources[snd].sound.volume = vol;
		},
		sound_length = function(snd){
			if(!resources[snd] || !resources[snd].sound) return -1;
			return resources[snd].sound.duration;
		},
		_with = function(obj, scope){
			var l = get_instances(obj);
			for(var ii in l){
				if(scope(l[ii]) == false) break;
			}
		},
		keyboard_check_pressed = function(key){
			return !!keyboard.pressed[key];
		},
		keyboard_any = function(){
			for(var k in keyboard.codes) if(k != 'tab' && keyboard[k]) return true;
		},
		keyboard_chr = function(){
			var r = keyboard_char;keyboard_char = '';return r;
		},
		keyboard_check_released = function(key){
			return !!keyboard.released[key];
		},
		mouse_check = function(mb){
			if(mb != 'left' && mb != 'right' && mb != 'middle') return false;
			return mouse[mb] || (mb == 'left' ? finger : false);
		},
		mouse_check_pressed = function(mb){
			mb = mb||'left';
			return !!mouse.pressed[mb] || touch.pressed.length;
		},
		mouse_check_released = function(mb){
			mb = mb||'left';
			return !!mouse.released[mb] || touch.released.length;
		},
		mouse_click = function(t, op, mb){
			mb = mb||'left';
			op = op || mouse_check;
			if(op(mb)){
				return (checkCollision({x:This.mouse_x, y:This.mouse_y, width:1, height:1}, t.sprite));
			}
		},
		point_direction = function(x,y,xx,yy){
			return Math.atan2(y - yy, xx - x) * rtd;
		},
		point_distance = function(x, y, xx, yy){
			var xd = Math.abs(xx - x), yd = Math.abs(yy - y);
			return Math.sqrt(xd**2 + yd**2);
		},
		direction_sign = function(dir, tdir){
			var ang = (((tdir - dir)%360+360)%360);
			return (ang == 180)? Math.round(Math.random())*2-1:(ang < 180)*2-1-(ang == 0);
		},
		vector_direction = function(dir){
			dir *= dtr;return [Math.cos(dir), -Math.sin(dir)];
		},
		checkCollision = function(r1, r2){
			/*
				r1: Mask, r2: Mask
				Mask: {x:number, y:number, radius:number} | {x:number, y:number, width:number, height:number, angle:number & degrees}
			*/
			
			if(!('angle' in r1)) r1.angle = 0; // if angle is not set, make sure to reset the angle to 0
			if(!('angle' in r2)) r2.angle = 0;
			
			if(r1 === r2) return false; // mask doesn't collide with itself
			if('radius' in r2 && !('radius' in r1)) { // put circle mask first
				var _t=r1; r1=r2; r2=_t;
			}
			if(!('radius' in r1)) { // rect - rect collision
				
				/* If collision doesn't work, you can uncomment this code to revert to the original collision */
				//return (Math.abs(r1.x-r2.x)<(r1.width+r2.width)/2 && Math.abs(r1.y-r2.y)<(r1.height+r2.height)/2);
				/* ------------------------------------ */
				
				let r1a = (r1.angle%180+180)%180 * dtr, r2a = (r2.angle%180+180)%180 * dtr; // get angle of mask in radians
				if(r1a === 0 && r2a === 0) {
					return (Math.abs(r1.x-r2.x)<(r1.width+r2.width)/2 && Math.abs(r1.y-r2.y)<(r1.height+r2.height)/2);
				} else {
					let v1x = Math.cos(r1a), v1y = Math.sin(r1a), v2x = Math.cos(r2a), v2y = Math.sin(r2a), v1,v2,v3,v4, mn,mx;
					// rect1 projections
					// rect1 x-axis test
					v1 = (r2.x + (-v2x*r2.width + v2y*r2.height)/2 - r1.x)*v1x + (r2.y + (-v2y*r2.width - v2x*r2.height)/2 - r1.y)*v1y; // top-left
					v2 = (r2.x + (v2x*r2.width + v2y*r2.height)/2 - r1.x)*v1x + (r2.y + (v2y*r2.width - v2x*r2.height)/2 - r1.y)*v1y; // top-right
					v3 = (r2.x + (-v2x*r2.width - v2y*r2.height)/2 - r1.x)*v1x + (r2.y + (-v2y*r2.width + v2x*r2.height)/2 - r1.y)*v1y; // bottom-left
					v4 = (r2.x + (v2x*r2.width - v2y*r2.height)/2 - r1.x)*v1x + (r2.y + (v2y*r2.width + v2x*r2.height)/2 - r1.y)*v1y; // bottom-right
					mn = Math.min(v1,v2,v3,v4); mx = Math.max(v1,v2,v3,v4);
					if(mn >= r1.width/2 || mx <= -r1.width/2) return false; // projection lines intersect
					// rect1 y-axis test
					v1 = (r2.x + (-v2x*r2.width + v2y*r2.height)/2 - r1.x)*-v1y + (r2.y + (-v2y*r2.width - v2x*r2.height)/2 - r1.y)*v1x; // top-left
					v2 = (r2.x + (v2x*r2.width + v2y*r2.height)/2 - r1.x)*-v1y + (r2.y + (v2y*r2.width - v2x*r2.height)/2 - r1.y)*v1x; // top-right
					v3 = (r2.x + (-v2x*r2.width - v2y*r2.height)/2 - r1.x)*-v1y + (r2.y + (-v2y*r2.width + v2x*r2.height)/2 - r1.y)*v1x; // bottom-left
					v4 = (r2.x + (v2x*r2.width - v2y*r2.height)/2 - r1.x)*-v1y + (r2.y + (v2y*r2.width + v2x*r2.height)/2 - r1.y)*v1x; // bottom-right
					mn = Math.min(v1,v2,v3,v4); mx = Math.max(v1,v2,v3,v4);
					if(mn >= r1.height/2 || mx <= -r1.height/2) return false; // projection lines intersect
					
					if(r1a === r2a) return true;
					
					// rect2 projections
					// rect2 x-axis test
					v1 = (r1.x + (-v1x*r1.width + v1y*r1.height)/2 - r2.x)*v2x + (r1.y + (-v1y*r1.width - v1x*r1.height)/2 - r2.y)*v2y; // top-left
					v2 = (r1.x + (v1x*r1.width + v1y*r1.height)/2 - r2.x)*v2x + (r1.y + (v1y*r1.width - v1x*r1.height)/2 - r2.y)*v2y; // top-right
					v3 = (r1.x + (-v1x*r1.width - v1y*r1.height)/2 - r2.x)*v2x + (r1.y + (-v1y*r1.width + v1x*r1.height)/2 - r2.y)*v2y; // bottom-left
					v4 = (r1.x + (v1x*r1.width - v1y*r1.height)/2 - r2.x)*v2x + (r1.y + (v1y*r1.width + v1x*r1.height)/2 - r2.y)*v2y; // bottom-right
					mn = Math.min(v1,v2,v3,v4); mx = Math.max(v1,v2,v3,v4);
					if(mn >= r2.width/2 || mx <= -r2.width/2) return false; // projection lines intersect
					// rect2 y-axis test
					v1 = (r1.x + (-v1x*r1.width + v1y*r1.height)/2 - r2.x)*-v2y + (r1.y + (-v1y*r1.width - v1x*r1.height)/2 - r2.y)*v2x; // top-left
					v2 = (r1.x + (v1x*r1.width + v1y*r1.height)/2 - r2.x)*-v2y + (r1.y + (v1y*r1.width - v1x*r1.height)/2 - r2.y)*v2x; // top-right
					v3 = (r1.x + (-v1x*r1.width - v1y*r1.height)/2 - r2.x)*-v2y + (r1.y + (-v1y*r1.width + v1x*r1.height)/2 - r2.y)*v2x; // bottom-left
					v4 = (r1.x + (v1x*r1.width - v1y*r1.height)/2 - r2.x)*-v2y + (r1.y + (v1y*r1.width + v1x*r1.height)/2 - r2.y)*v2x; // bottom-right
					mn = Math.min(v1,v2,v3,v4); mx = Math.max(v1,v2,v3,v4);
					if(mn >= r2.height/2 || mx <= -r2.height/2) return false; // projection lines intersect
					
					return true;
				}
			} else if(!('radius' in r2)) { // rect - circle collision
				var vx=r1.x-r2.x, vy=r1.y-r2.y, dx=Math.abs(vx), dy=Math.abs(vy), wd=r1.radius+r2.width/2, hd=r1.radius+r2.height/2, ccx,ccy;
				return (dx<r2.width/2 && dy<hd) || (dy<r2.height/2 && dx<wd) || (ccx=Math.sign(vx)*r2.width/2,ccy=Math.sign(vy)*r2.height/2,(vx-ccx)**2 + (vy-ccy)**2 < r1.radius**2);
			} else { // circle - circle collision
				return (r1.x-r2.x)**2 + (r1.y-r2.y)**2 < (r1.radius+r2.radius)**2;
			}
		},
		collision_with = function(t, o){
			o = get_object(o);
			var list = [];
			_with(o, function(ii){
				if(checkCollision(t.mask, ii.mask)) list.push(ii);
			});
			return list.length?list:false;
		},
		collision_point = function(xx, yy, o){
			o = get_object(o);
			var list = [];
			_with(o, function(ii){
				if(checkCollision({x:xx, y:yy, width:1, height:1}, ii.mask)) list.push(ii);
			});
			return list.length?list:false;
		},
		instance_exists = function(instance){
			if(!instance) return false;
			return !instance.destroyed;
		},
		collision_bounce = function(t, other){
			var t_xoff = t.mask.xoff, t_yoff = t.mask.yoff,
			o_xoff = other.mask.xoff, o_yoff = other.mask.yoff,
			vx = t.xprevious+t_xoff-other.x-o_xoff, vy = t.yprevious+t_yoff-other.y-o_yoff;
			if('radius' in t.mask){
				var dx=Math.abs(vx), dy=Math.abs(vy),
				wd=t.mask.radius+other.mask.width/2, hd=t.mask.radius+other.mask.height/2;
				if(dx<other.mask.width/2)
					t.y = other.y+o_yoff + Math.sign(vy) * hd - t_yoff;
				else if(dy<other.mask.height/2)
					t.x = other.x+o_xoff + Math.sign(vx) * wd - t_xoff;
				else {
					vx -= Math.sign(vx)*other.mask.width/2;
					vy -= Math.sign(vy)*other.mask.height/2;
					var l = 1 - t.mask.radius/Math.sqrt(vx*vx+vy*vy);
					t.x -= vx*l;
					t.y -= vy*l;
				}
			} else {
				var d1;
				if((d1=vx>vy) ^ (vx+vy>0))
					t.y = other.y+o_yoff + (1-d1*2) * (t.mask.height+other.mask.height)/2;
				else
					t.x = other.x+o_xoff + (d1*2-1) * (t.mask.width+other.mask.width)/2;
			}
		},
		instance = function(obj, x, y, opt){
			var t = this;
			//Local vars for instance
			var _destroy = false,
			depth = obj.depth,
			image_alpha = 1,
			image_single = 0,
			image_angle = 0,
			xscale = 1,yscale = 1,
			instanceid = newId();
			
			var updateMask = function(){
				var m = t.mask;
				if(!!obj.mask){
					m.xoff = obj.mask.x === undefined ? 0 : obj.mask.x;
					m.yoff = obj.mask.y === undefined ? 0 : obj.mask.y;
					if('radius' in obj.mask){
						m.width = m.height = (m.radius = obj.mask.radius)*2;
					} else {
						m.width = obj.mask.w === undefined ? t.sprite.width * t.xscale : obj.mask.w;
						m.height = obj.mask.h === undefined ? t.sprite.height * t.yscale : obj.mask.h;
						m.angle = obj.mask.angle === undefined ? t.image_angle : obj.mask.angle;
					}
				} else {
					m.width = t.sprite.width * t.xscale;
					m.height = t.sprite.height * t.yscale;
					m.angle = t.image_angle;
				}
			}
			
			Object.defineProperty(t, 'object_index', {value:obj, writeable:false});
			Object.defineProperty(t, 'depth', {get:function(){return depth;}, set:function(x){_DepthChanged = _DepthChanged || (depth != x);depth = x;t.sprite.zIndex = depth;}});
			
			t.active = true;
			t.destroyed = false;
			t.xprevious = x;
			t.yprevious = y;
			t.mask = {xoff:0, yoff:0, angle:0};
			t.collision_objects = [];
			
			for(var a in obj.alarms){
				var al = obj.alarms[a];
				if(('name' in al) && ('code' in al))
					t[al.name] = new obj.alarm(t, al.code);
			}
			for(var c in obj.collision){
				var col = obj.collision[c];
				if(('object' in col) && ('code' in col)){
					t.collision_objects.push(new obj.collision_object(t, (col.object == 'self')?obj:col.object, col.code));
				}
			}
			
			t.instance_destroy = function(){
				t.destroyed = true;
				t.inherited = obj.parent?obj.parent.obj_destroyed.bind(t,t):function(){};
				obj.obj_destroyed(t);//Destroy Event
				t.sprite.rendered = false;
				_destroy = true;
			};
			t.collision_code = function(){
				for(var c in t.collision_objects){
					if(_destroy) return;
					t.inherited = function(){};
					t.collision_objects[c]._run_step();//Collision Checking
				}
			};
			t.step_code = function(){
				if(_destroy) return;
				t.graphics.clear();
				if(!t.sprite.renderable) t.sprite.renderable = true;
				t.inherited = function(){};
				for(var a in obj.alarms){//Alarm Event
					t[obj.alarms[a].name]._run_step();
				}
				
				t.inherited = obj.parent?obj.parent.obj_step.bind(t,t):function(){};
				obj.obj_step(t);//Step Event
				
				t.xprevious = t.x;
				t.yprevious = t.y;
			};
			t.end_step_code = function(){
				if(_destroy){
					var i = obj.instances.indexOf(t);
					if(i > -1) obj.instances.splice(i, 1);
					i = AllInstances.indexOf(t);
					if(i > -1) AllInstances.splice(i, 1);
					app.stage.removeChild(t.sprite);
					app.stage.removeChild(t.graphics);
					return;
				}
				t.inherited = obj.parent?obj.parent.obj_end_step.bind(t,t):function(){};
				obj.obj_end_step(t);//End Step Event
			};
			
			var tx = TexList.filter((ii)=>{
					return ii.name == obj.image;
				})[0],
				txp = tx;
			
			if(tx != undefined && tx.duplicate){
				tx = TexList.filter((ii)=>{
						return (ii.path == txp.path && !ii.duplicate);
					})[0];
			}
			var texture = null;
			
			if(tx != undefined && tx.texture != undefined){
				texture = tx.texture;
				if(!texture.length) texture = [texture];
			}
				
			if(!texture) {
				console.warn('instance created with non-existent texture:', obj.image);
				texture = null;
			}
					
			if(obj.image != null && texture != null){
				if(!obj.tiled)
					t.sprite = new AnimSprite(texture);
				else
					t.sprite = new TilingSprite(texture[0], obj.tiled.w || 32, obj.tiled.h || 32);
			} else {
				t.sprite = new Sprite('');
			}
			if(!!t.sprite.play){
				t.sprite.onLoop = function(){obj.obj_end_animation_step(t);};
				t.sprite.animationSpeed = 0.5;
				t.sprite.play();
			}
			t.sprite.renderable = false;
			
			app.stage.addChild(t.sprite);
			
			t.depth = depth;
			
			t.graphics = new Graphics();
			t.graphics.zIndex = depth;
			t.graphics.color = 0xFFFFFF;
			t.graphics.drawLine = function(x, y, xx, yy){
				t.graphics.beginFill(t.graphics.color);
				t.graphics.moveTo(x, y);
				t.graphics.lineTo(xx, yy);
			}
			t.graphics.drawRectangle = function(x, y, w, h, dir){
				t.graphics.beginFill(t.graphics.color);
				t.graphics.drawRect(x, y, w, h);
				t.graphics.angle = dir;
			}
			Object.defineProperty(t.graphics, 'depth', {get:function(){return t.graphics.zIndex;}, set:function(x){_DepthChanged = _DepthChanged || (t.graphics.zIndex != x);t.graphics.zIndex = x;}});
			app.stage.addChild(t.graphics);
			
			Object.defineProperty(t, 'id', {get:function(){return instanceid;}, set:function(){}});
			Object.defineProperty(t, 'image_alpha', {get:function(){return image_alpha;}, set:function(x){image_alpha = Math.max(Math.min(x, 1), 0);t.sprite.alpha = image_alpha;}});
			Object.defineProperty(t, 'image_angle', {get:function(){return image_angle;}, set:function(x){image_angle = x;t.sprite.angle = image_angle; if(!obj.mask) updateMask()}});
			Object.defineProperty(t, 'xscale', {get:function(){return xscale;}, set:function(x){xscale = x;t.sprite.scale.x = x;if(!obj.mask) updateMask();}});
			Object.defineProperty(t, 'yscale', {get:function(){return yscale;}, set:function(x){yscale= x;t.sprite.scale.y = x;if(!obj.mask) updateMask();}});
			Object.defineProperty(t, 'x', {get:function(){return x;}, set:function(v){x = v;t.sprite.x = v; t.mask.x = v + t.mask.xoff;}});
			Object.defineProperty(t, 'y', {get:function(){return y;}, set:function(v){y = v;t.sprite.y = v; t.mask.y = v + t.mask.yoff;}});
			Object.defineProperty(t, 'xorigin', {get:function(){return t.sprite.anchor.x;}, set:function(v){t.sprite.anchor.x = v;}});
			Object.defineProperty(t, 'yorigin', {get:function(){return t.sprite.anchor.y;}, set:function(v){t.sprite.anchor.y = v;}});
			Object.defineProperty(t, 'image_single', {get:function(){return image_single;}, set:(!!t.sprite.play)?function(x){image_single = x;if(x == -1) t.sprite.play(); else t.sprite.gotoAndStop(x);}:function(){}});
			Object.defineProperty(t, 'image_index', {get:function(){return (!!t.sprite.play)?t.sprite.currentFrame:0;}, set:function(){}});
			Object.defineProperty(t, 'image_number', {get:function(){return (!!t.sprite.play)?t.sprite.totalFrames:1;}, set:function(){}});
			Object.defineProperty(t, 'image_width', {get:function(){return texture==null?0:t.sprite._texture.width;}, set:function(){}});
			Object.defineProperty(t, 'image_height', {get:function(){return texture==null?0:t.sprite._texture.height;}, set:function(){}});
			
			updateMask();
			t.xorigin = obj.origin.x;
			t.yorigin = obj.origin.y;
			t.x = x;t.y = y; //Set new x,y coordinate
			
			opt = opt || null;
			t.inherited = obj.parent?obj.parent.obj_create.bind(t,t,opt):function(){};
			obj.obj_create(t, opt) //Creation Event
		},
		object = function(args){
			var t = this;
			t.instances = [];
			t.children = [];
			object_table.push(t);
			t.alarm = function(scope, code){
				var t = this;
				var time = 0;
				Object.defineProperty(t, 'time', {set:function(x){time = Math.floor(x);}, get:function(){return time;}});
				t.code = code;
				t._run_step = function(){
					if(time == 0) return;
					if(time == 1) t.code(scope);
					t.time--;
				}
			}
			t.collision_object = function(scope, o, code){
				var tt = this;
				o = get_object(o);
				tt._run_step = function(){
					_with(o, function(ii){
						if(ii.destroyed) return;
						if(checkCollision(scope.mask, ii.mask)) return code(scope, ii) !== false;
					});
				}
			}
			
			//Pass any of these options to the newly created object
			t.parent = ('parent' in args)?args.parent:null;
			t.depth = ('depth' in args)?args.depth:((t.parent)?t.parent.depth:0);
			t.tiled = ('tiled' in args)?args.tiled:(t.parent)?t.parent.tiled:false;
			t.name = ('name' in args)?args.name:null;
			t.origin = ('origin' in args)?args.origin:(t.parent)?t.parent.origin:{x:0.5, y:0.5};
			t.image = ('image' in args)?args.image:(t.parent)?t.parent.image:null;
			t.obj_create = ('creation' in args)?args.creation:((t.parent)?t.parent.obj_create:function(){});
			t.obj_step = ('step' in args)?args.step:((t.parent)?t.parent.obj_step:function(){});
			t.obj_end_step = ('end_step' in args)?args.end_step:((t.parent)?t.parent.obj_end_step:function(){});
			t.obj_end_animation_step = ('end_animation_step' in args)?args.end_animation_step:((t.parent)?t.parent.obj_end_animation_step:function(){});
			t.obj_destroyed = ('destroyed' in args)?args.destroyed:((t.parent)?t.parent.obj_destroyed:function(){})
			t.alarms = ('alarms' in args)?args.alarms:[];
			t.collision = ('collision' in args)?args.collision:[];
			t.mask = ('mask' in args)?args.mask:((t.parent)?t.parent.mask:null);
			//////-------------------------------------------//////
			
			// Object only properties
			let tx = TexList.filter((ii)=>{
					return ii.name == t.image;
				})[0],
				txp = tx;

			if(tx != undefined && tx.duplicate){
				tx = TexList.filter((ii)=>{
						return (ii.path == txp.path && !ii.duplicate);
					})[0];
			}
			t.texture = tx;
			Object.defineProperty(t, 'image_width', {get:function(){return !tx ? 0: (tx.animated ? tx.animated.w : tx.texture.width);}, set:function(){}});
			Object.defineProperty(t, 'image_height', {get:function(){return !tx ? 0: (tx.animated ? tx.animated.h : tx.texture.height);}, set:function(){}});
			Object.defineProperty(t, 'image_number', {get:function(){return !tx ? 0: (tx.animated ? tx.animated.count : 1);}, set:function(){}});
			//////-------------------------------------------//////

			if(t.parent){
				[].push.apply(t.alarms, t.parent.alarms);//Inherit Alarms
				var pt,cobs=t.collision.map(o=>o.object);for(var i in t.parent.collision)cobs.includes((pt=t.parent.collision[i]).object)||t.collision.push(pt);//Inherit Collision
				t.parent.children.push(t); //Add child to parent
			}
			
			t.instance_create = function(x, y, opt){
				var ii = new instance(t, x, y, opt);
				t.instances.push(ii);
				AllInstances.push(ii);
				return ii;
			}
			t.instance_number = function(){
				return get_instances(t).length;
			}
		},
		background = function(args){
			var t = this;
			var	origin = {},
			x = 0,y = 0,
			xscale = 1,yscale = 1;
			
			t.image = ('image' in args)?args.image:'';
			t.origin = {};
			
			Object.defineProperty(t, 'x', {get:function(){return x;}, set:function(v){x = v;t.sprite.position.x = v}});
			Object.defineProperty(t, 'y', {get:function(){return y;}, set:function(v){y = v;t.sprite.position.y = v;}});
			Object.defineProperty(t, 'xscale', {get:function(){return xscale;}, set:function(x){xscale = x;t.sprite.tileScale.x = x;}});
			Object.defineProperty(t, 'yscale', {get:function(){return yscale;}, set:function(x){yscale= x;t.sprite.tileScale.y = x;}});
			Object.defineProperty(t.origin, 'x', {get:function(){return origin.x;}, set:function(v){origin.x = v;t.sprite.tilePosition.x = v;}});
			Object.defineProperty(t.origin, 'y', {get:function(){return origin.y;}, set:function(v){origin.y = v;t.sprite.tilePosition.y = v;}});
			
			var tx = TexList.filter((ii)=>{
					return ii.name == t.image;
				})[0],
				txp = tx;
			
			if(tx != undefined && tx.duplicate){
				tx = TexList.filter((ii)=>{
						return (ii.path == txp.path && !ii.duplicate);
					})[0];
			}
			var texture = null;
			
			if(tx != undefined && tx.texture != undefined){
				texture = tx.texture;
			}
				
			if(!texture) {
				console.warn('background created with non-existent texture:', t.image);
				texture = null;
			}
			
			if(t.image != '' && texture != null){
				t.sprite = new TilingSprite(texture,This.room.width, This.room.height);
				t.sprite.zIndex = 9999999;
			}
			else {
				t.sprite = new TilingSprite('');
			}
			
			t.x = ('position' in args)?args.position.x || 0:0;
			t.y = ('position' in args)?args.position.y || 0:0;
			t.origin.x = ('origin' in args)?args.origin.x || 0:0;
			t.origin.y = ('origin' in args)?args.origin.y || 0:0;
			
			app.stage.addChild(t.sprite);
			_DepthChanged = true;
			
			t.destroy = function(){
				app.stage.removeChild(t.sprite);
			}
		},
		resource_add = function(args, onComplete = ()=>{}, onError = ()=>{}){
			var list = [];
			if(!args.length) throw new Error("resource_add() Must be given an array of resources! Example: [ {name:'', path:'', type:<RES_TYPE>}, ... ]");
			if(isLoading) return false;
			isLoading = true;
			for(var j = 0; j<args.length;j++){
				var i = args[j];
				if(!('type' in i)) throw new Error('Failed loading resource with no type - ' + i);
				if(!('path' in i)) throw new Error('Failed loading resource - ' + i + ' with no path');
				if(!('name' in i)) throw new Error('Failed to load a resource - must give a name!');
				
				if(i.name in TexList) {
					console.error('Resource name duplicate found: ' + i.name);
					continue;
				}
				
				if(i.path in loader.resources) {
					console.error('Resource already exists: ' + i.name);
					if(i.type == 1){ i.duplicate = true; TexList.push(i); }// don't need to reload the texture
					continue;
				}
				
				switch(i.type){
				case 0: // RES_SOUND
					loader.add(i.name, i.path);
					break;
				case 1: // RES_IMAGE
					if(!('path' in i)) throw new Error('Failed loading resource - ' + i);
					if('strip' in i){
						for(var l in i.strip){
							var p = i.strip[l];
							if(!('name' in p)) throw new Error('Failed loading strip resource with no name - '+i.path);
							p.path = i.path;
							list.push(p);
						}
						if(!i.strip.length) throw new Error('Failed loading resource strip with no contents');
						loader.add(i.path);
						break;
					} else if(!('name' in i)) throw new Error('Failed loading resource with no name');
					loader.add(i.name, i.path);
					list.push(i);
					break;
				case 2: // RES_FILE
					loader.add(i.name, i.path);
					break;
				case 3: // RES_FONT
					//font = {name:'', path:''};
					var obj = new FontFace(font.name, "url('"+font.path+"')", {});
					obj.load().then(fnt=>{
						document.fonts.add(fnt);
						fontsLoaded++;
					});
					break;
					
				}
			}
			loader.on('error', function(){
				onError();
				throw new Error('Failed loading a resource via resource_add()');
			});
			loader.load(function(){
				console.log('Loaded new resources');
				if(list.length){
					loadTextures(list);
					TexList.push(...list);
				}
				onComplete();
				isLoading = false;
			});
			return true;
		},
		resource_get = function(name){
			return resources[name];
		},
		resource_free = function(name){
			let res = resources[name];
			if(res !== undefined){
				if(res.sound) res.sound.destroy();
				if(res.texture) res.texture.destroy();
				delete resources[name];
			}
		};
		//-----Loading Screen
		(function(){
			var load_obj = [],
			loadingLoop = function(){
				for(var i in load_obj){
					var ii = load_obj[i];
					if('step' in ii) ii.step(ii, (load_progress));
				}
			}, beginLoading = function(){
				publish();
				loading.destroy();
				var loaderInstance = function(type, para, step, x, y){
					var t = this;
					t.type = type;
					t.step = step;
					switch(type){
					case 0:
						t.sprite = para?(new Sprite(TextureCache[para])):'';
						if(!t.sprite) return;
						Object.defineProperty(t, 'xscale', {set:function(){t.sprite.scale.x = i;}, get:function(){return t.sprite.scale.x;}});
						Object.defineProperty(t, 'yscale', {set:function(){t.sprite.scale.y = i;}, get:function(){return t.sprite.scale.y;}});
						break;
					case 1:
						t.sprite = create_text(para.text, x, y, new TextStyle(para.style));
						break;
					case 2:
						t.sprite = new Graphics();
						break;
					}
					loadingScreen.stage.addChild(t.sprite);
					Object.defineProperty(t, 'x', {set:function(i){t.sprite.x = i;}, get:function(){return t.sprite.x;}});
					Object.defineProperty(t, 'y', {set:function(i){t.sprite.y = i;}, get:function(){return t.sprite.y;}});
					t.x = x;
					t.y = y;
				}
				for(var i in LoadingImages){
					var ii = LoadingImages[i];
					var step, type, tex, x, y;
					step = ii.step || function(){};
					type = ii.type || 0;
					switch(type){
					case 0:tex = ii.path || '';break;
					case 1:tex = {text:(ii.text||''), style:(ii.style||{})};break;
					}
					x = ii.x || 0;
					y = ii.y || 0;
					load_obj.push((new loaderInstance(type, tex, step, x, y)));
				}
				loadingScreen.ticker.add(loadingLoop);
			}, loading = new ConstructLoader();
			
			for(var i in LoadingImages){
				var ii = LoadingImages[i];
				if(!('path' in ii)) continue;
				loading.add('__'+i, ii.path);
			}
			loading.load(beginLoading);
		})();
		//------
		
		function mainLoop(delta){
			//Update Mouse Coords
			if(mouse.x < 0 || mouse.y < 0){

				finger = null;
				for(let f in touch.fingers) { finger = touch.fingers[f]; break; }

				if(finger){
					This.mouse_x = (finger.x + This.view.x)*app.stage.scale.x;
					This.mouse_y = (finger.y + This.view.y)*app.stage.scale.y;
				}

			} else {
				This.mouse_x = (mouse.x + This.view.x)*app.stage.scale.x;
				This.mouse_y = (mouse.y + This.view.y)*app.stage.scale.y;
			}
			
			//Global Step
			BeginStep();
			
			for(var o in object_table){
				var it = object_table[o].instances;
				for(var instance in it){
					var ii = it[instance];
					if(ii.active) ii.step_code();//Step Event
				}
			}
			for(var o in object_table){
				var it = object_table[o].instances;
				for(var instance in it){
					var ii = it[instance];
					if(ii.active) ii.collision_code();//Collision Event Checking
				}
			}
			for(var o in object_table){
				var it = object_table[o].instances;
				for(var instance in it){
					var ii = it[instance];
					if(ii.active) ii.end_step_code();//End Step Event
				}
			}
			if(_DepthChanged){
				app.stage.updateLayersOrder();
				_DepthChanged = false;
			}

			//Global Step
			EndStep();
			//Update Keyboard/Mouse
			keyboard.stepclear();
			mouse.stepclear();
			touch.stepclear();

		}

		function publish(){
			This.RES_SOUND = 0;
			This.RES_IMAGE = 1;
			This.RES_FILE = 2;
			This.RES_FONT = 3;
		
			This.mouse_x = 0;
			This.mouse_y = 0;
			This.object = object;
			This.collision_with = collision_with;
			This.collision_point = collision_point;
			This.collision_bounce = collision_bounce;
			This.direction_sign = direction_sign;
			This.vector_direction = vector_direction;
			This.point_direction = point_direction;
			This.point_distance = point_distance;
			This.sound_play = sound_play;
			This.sound_volume = sound_volume;
			This.sound_length = sound_length;
			This.With = _with;
			This.background = background;
			This.get_object = get_object;
			This.get_instance = get_instance;
			This.instance_exists = instance_exists;
			This.keyboard = keyboard;
			This.keyboard_any = keyboard_any;
			This.keyboard_char = keyboard_chr;
			This.mouse = mouse;
			This.mouse_click = mouse_click;
			This.mouse_check = mouse_check;
			This.mouse_check_pressed = mouse_check_pressed;
			This.mouse_check_released = mouse_check_released;
			This.keyboard_check_pressed = keyboard_check_pressed;
			This.keyboard_check_released = keyboard_check_released;
			This.create_text = create_text;
			This.create_text_style = create_text_style;
			This.resource_add = resource_add;
			This.resource_get = resource_get;
			This.resource_free = resource_free;
			This.resource_list = ()=>resources;
			This.setFPS = (fps)=>{app.ticker.maxFPS = fps;};
		}

		var progress = function(loader, res){
			load_progress = [loader, res];
		}
		loader.on('progress', progress).load(setup); // Start Setup When Complete
		function setup() {
			loadTextures(TexList);
			
			function launchGame(){
				document.body.removeChild(loadingScreen.view); // 
				loadingScreen.destroy(true); // destroy loading screen object
				loadingScreen = null; // de-reference loading screen
				//Create game on screen
				document.body.appendChild(app.view);
				GameStart();
				app.ticker.add(mainLoop);
			}
			
			var finalCheck = setInterval(()=>{
				
				if(fontsLoaded != Fonts.length) return; // wait for fonts to load
				
				clearInterval(finalCheck);
				setTimeout(launchGame, AfterLoadTimeout);
			}, 1000);
			/*var a = function(){
				var begin, end;
				begin = performance.now();
				mainLoop();
				end = performance.now();
				var delta = end - begin;
				setTimeout(a, Math.max(1000/60 - delta, 0.00000001));
			};
			a();*/
		}
	}
})();
