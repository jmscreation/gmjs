/* ------------------------------------------ //
					GM-JS
			Version: 0.3.3
			Author: jmscreator
			License: Free to use (See GPL License)
			
	Current Progress:
// ------------------------------------------- */

var GMJS = new (function(){'use strict';
	var _error = 0;
	if(typeof(nimble) == 'undefined') {_error++;console.error('GMJS Requires Nimble');}
	if(typeof(PIXI) == 'undefined') {_error++;console.error('GMJS Requires PIXI');}
	if(_error) throw ('GMJS Failed To Load Because '+_error.toString()+' Error'+'s'.repeat((_error>1))+' Occurred');
	var This = this;
	var _GameEngineStarted = false;
	var Application = PIXI.Application,
		Container = PIXI.Container,
		Graphics = PIXI.Graphics,
		Text = PIXI.Text,
		TextStyle = PIXI.TextStyle,
		Sprite = PIXI.Sprite,
		AnimSprite = PIXI.extras.AnimatedSprite,
		Rectangle = PIXI.Rectangle,
		TextureCache = PIXI.utils.TextureCache,
		Texture = PIXI.Texture,
		BaseTexture = PIXI.BaseTexture,
		loader = PIXI.loader,
		resources = PIXI.loader.resources;
		
	var in_array = function(keys, array){ // Returns if all keys are in an array
		if(typeof(array) != 'object') return false;
		if(typeof(keys) == 'string') return keys in array;
		for(var x in keys){
			if(!(keys[x] in array)) return false;
		}
		return true;
	}
	
	This.StartGameEngine = function(Params){
		if(_GameEngineStarted) return console.error('GameEngine Is Running!');
		_GameEngineStarted = true;
		
		//Setup game initialization parameters
		var GameStart = Params['onStart']||function(){},
		GameEnd = Params['onEnd'] || function(){},
		Images = Params['images'] || [],
		View = Params['view'] || {};
		
		View.width = ('width' in View)?View.width:512;
		View.height = ('height' in View)?View.height:512;
		
		//Create game application frame
		var app = new Application(View);
		//console.log(app);
		// create algorithm
		// app.stage.x; app.stage.y; //view position in room
		// app.renderer.resize(width, height); //view port
		app.stage.updateLayersOrder = function () {
			app.stage.children.sort(function(a,b) {
				a.zIndex = a.zIndex || 0;
				b.zIndex = b.zIndex || 0;
				return b.zIndex - a.zIndex
			});
		};
		
		//Create game on screen
		document.body.appendChild(app.view);
		
		function loadTextures(list){
			function createFrame(tx, tile){
				if(!in_array(['x', 'y', 'w', 'h'], tile)) return false;
				tx.frame = (new Rectangle(tile.x, tile.y, tile.w, tile.h));return true;
			}
			for(var img in list){
				var i = list[img];
				if(TextureCache[i.path] == undefined) {console.error('Failed loading resource - '+i.name+' - Image file not found');continue;}
				var tex = new Texture(BaseTexture.fromImage(i.path)); // Generate New Texture
				if('tile' in i){
					if(!createFrame(tex, i.tile)) console.error('Failed creating frame for - '+i.name);
				}
				
				if('animated' in i){
					tex = [];
					var j = i.animated;
					var count = j.count || 0,
					columns = j.columns || 1,
					w = j.w || 0,h = j.h || 0,
					xoff = j.xoff || 0,yoff = j.yoff || 0,
					xsep = j.xsep || 0,ysep = j.ysep || 0;
					
					for(var t = 0; t < count; t++){
						var tx = new Texture(BaseTexture.fromImage(i.path)); // Animation Textures
						tex.push(tx);
						var xx = (t % columns),
						row = Math.floor(t / columns),
						tile = {x:(xoff+w*xx+xsep*(!!xx)), y:(yoff+h*row+ysep*(!!t)*row), w:w, h:h};
						createFrame(tx, tile);
					}
				}
				i.texture = tex;
			}
		}
		
		//Import textures
		var TexList = [];
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
			loader.add(i.path);
			TexList.push(i);
		}
		
		//Setup important class objects/variables
		var _DepthChanged = false,
		room = app.screen,
		keyboard = new nimble.Keyboard(),
		mouse = new nimble.Mouse(),
		object_table = [];
		
		keyboard.steps = true;
		mouse.steps = true;
		
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
			_text.align = function(a, b){b=b||1;switch(a){case 'center':_text.anchor.x = 0.5;_text.anchor.y = 0.5;return;case 'left':_text.anchor.x = 1-b/100;return;case 'right':_text.anchor.x = b/100;return;case 'top':_text.anchor.y = 1-b/100;case 'bottom':_text.anchor.y = b/100;}};
			_text.x = x || 0;
			_text.y = y || 0;
			app.stage.addChild(_text);
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
			var l = get_instances(obj);
			return (!!l[id])?l[id]:false;
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
		keyboard_check_released = function(key){
			return !!keyboard.released[key];
		},
		mouse_check = function(mb){
			if(mb != 'left' && mb != 'right' && mb != 'middle') return false;
			return mouse[mb];
		},
		mouse_check_pressed = function(mb){
			mb = mb||'left';
			return !!mouse.pressed[mb];
		},
		mouse_check_released = function(mb){
			mb = mb||'left';
			return !!mouse.released[mb];
		},
		mouse_click = function(t, op, mb){
			mb = mb||'left';
			op = op || mouse_check;
			if(op(mb)){
				return (checkCollision({x:mouse.x, y:mouse.y, width:1, height:1}, t.sprite));
			}
		},
		checkCollision = function(r1, r2){
			if(r1 === r2) return false;
			if('radius' in r2 && !('radius' in r1)) {
				var _t=r1; r1=r2; r2=_t;
			}
			if(!('radius' in r1)) {
				return (Math.abs(r1.x-r2.x)<(r1.width+r2.width)/2 && Math.abs(r1.y-r2.y)<(r1.height+r2.height)/2);
			} else if(!('radius' in r2)) {
				var vx=r1.x-r2.x, vy=r1.y-r2.y, dx=Math.abs(vx), dy=Math.abs(vy), wd=r1.radius+r2.width/2, hd=r1.radius+r2.height/2, ccx,ccy;
				return (dx<r2.width/2 && dy<hd) || (dy<r2.height/2 && dx<wd) || (ccx=Math.sign(vx)*r2.width/2,ccy=Math.sign(vy)*r2.height/2,(vx-ccx)**2 + (vy-ccy)**2 < r1.radius**2);
			} else {
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
		collision_bounce = function(t, other){
			if('radius' in t.mask){
				var vx = t.xprevious-other.x, vy = t.yprevious-other.y,
					dx=Math.abs(vx), dy=Math.abs(vy),
					wd=t.mask.radius+other.mask.width/2, hd=t.mask.radius+other.mask.height/2;
				
				if(dx<other.mask.width/2)
					t.y = other.y + Math.sign(vy) * hd;
				else if(dy<other.mask.height/2)
					t.x = other.x + Math.sign(vx) * wd;
				else {
					vx -= Math.sign(vx)*other.mask.width/2;
					vy -= Math.sign(vy)*other.mask.height/2;
					var l = 1 - t.mask.radius/Math.sqrt(vx*vx+vy*vy);
					t.x -= vx*l;
					t.y -= vy*l;
				}
			} else {
				var vx = t.xprevious-other.x, vy = t.yprevious-other.y, d1;
				if((d1=vx>vy) ^ (vx+vy>0))
					t.y = other.y + (1-d1*2) * (t.mask.height+other.mask.height)/2;
				else
					t.x = other.x + (d1*2-1) * (t.mask.width+other.mask.width)/2;
			}
		},
		instance = function(obj, x, y){
			var t = this;
			//Local vars for instance
			var _destroy = false,
			depth = obj.depth,
			image_alpha = 1,
			image_single = 0,
			image_angle = 0,
			xscale = 1,yscale = 1;
			
			var updateMask = function(){
				var m = t.mask;
				if(!!obj.mask){
					m.xoff = obj.mask.x;
					m.yoff = obj.mask.y;
					if('radius' in obj.mask)
						m.width = m.height = (m.radius = obj.mask.radius)*2;
					else 
						{m.width = obj.mask.w;m.height = obj.mask.h;}
				} else {m.width = t.sprite.width;m.height = t.sprite.height;}
			}
			
			Object.defineProperty(t, 'object_index', {value:obj, writeable:false});
			Object.defineProperty(t, 'depth', {get:function(){return depth;}, set:function(x){_DepthChanged = _DepthChanged || (depth != x);depth = x;t.sprite.zIndex = depth;}});
			
			t.active = true;
			t.destroyed = false;
			t.xprevious = x;
			t.yprevious = y;
			t.mask = {xoff:0, yoff:0};
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
				obj.obj_destroyed(t);//Destroy Event
				t.sprite.rendered = false;
				_destroy = true;
			};
			t.collision_code = function(){
				for(var c in t.collision_objects){
					if(_destroy) return;
					t.collision_objects[c]._run_step();//Collision Checking
				}
			};
			t.step_code = function(){
				if(_destroy) return;
				t.graphics.clear();
				t.xprevious = t.x;
				t.yprevious = t.y;
				if(!t.sprite.renderable) t.sprite.renderable = true;
				for(var a in obj.alarms){//Alarm Event
					t[obj.alarms[a].name]._run_step();
				}
				obj.obj_step(t);//Step Event
			};
			t.end_step_code = function(){
				if(_destroy){
					var i = obj.instances.indexOf(t);
					if(i > -1) obj.instances.splice(i , 1);
					app.stage.removeChild(t.sprite);
					app.stage.removeChild(t.graphics);
					return;
				}
				obj.obj_end_step(t);//End Step Event
			};
			
			var texture;
			for(var tx in TexList){
				if(TexList[tx].name == obj.image){
					texture = TexList[tx].texture;
					if(!texture.length) texture = [texture];
					break;
				}
			}
			if(obj.image != null){
				t.sprite = new AnimSprite(texture);
			} else {
				t.sprite = new Sprite('');
			}
			if(!!t.sprite.play){
				t.sprite.onLoop = function(){obj.obj_end_animation_step(t);};
				t.sprite.animationSpeed = 0.5;
				t.sprite.play();
			}
			t.sprite.anchor.x = 0.5;
			t.sprite.anchor.y = 0.5;
			t.sprite.renderable = false;
			app.stage.addChild(t.sprite);
			
			t.graphics = new Graphics();
			t.graphics.zIndex = depth;
			Object.defineProperty(t.graphics, 'depth', {get:function(){return t.graphics.zIndex;}, set:function(x){_DepthChanged = _DepthChanged || (t.graphics.zIndex != x);t.graphics.zIndex = x;}});
			app.stage.addChild(t.graphics);
			
			Object.defineProperty(t, 'image_alpha', {get:function(){return image_alpha;}, set:function(x){image_alpha = Math.max(Math.min(x, 1), 0);t.sprite.alpha = image_alpha;}});
			Object.defineProperty(t, 'image_angle', {get:function(){return image_angle;}, set:function(x){image_angle = x;t.sprite.rotation = (image_angle)*Math.PI/180;}});
			Object.defineProperty(t, 'xscale', {get:function(){return xscale;}, set:function(x){xscale = x;t.sprite.scale.y = x;if(!obj.mask) updateMask();}});
			Object.defineProperty(t, 'yscale', {get:function(){return yscale;}, set:function(x){yscale= x;t.sprite.scale.x = x;if(!obj.mask) updateMask();}});
			Object.defineProperty(t, 'x', {get:function(){return x;}, set:function(v){x = v;t.sprite.x = v; t.mask.x = v + t.mask.xoff;}});
			Object.defineProperty(t, 'y', {get:function(){return y;}, set:function(v){y = v;t.sprite.y = v; t.mask.y = v + t.mask.yoff;}});
			Object.defineProperty(t, 'image_single', {get:function(){return image_single;}, set:(!!t.sprite.play)?function(x){image_single = x;if(x == -1) t.sprite.play(); else t.sprite.gotoAndStop(x);}:function(){}});
			Object.defineProperty(t, 'image_index', {get:function(){return (!!t.sprite.play)?t.sprite.currentFrame:0;}, set:function(){}});
			Object.defineProperty(t, 'image_number', {get:function(){return (!!t.sprite.play)?t.sprite.totalFrames:1;}, set:function(){}});
			
			updateMask();
			t.x = x;t.y = y; //Set new x,y coordinate
			
			_DepthChanged = true;
			obj.obj_create(t) //Creation Event
		},
		object = function(args){
			var t = this;
			t.instances = [];
			t.children = [];
			object_table.push(t);
			t.alarm = function(scope, code){
				var t = this;
				var time = -1;
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
			t.depth = ('depth' in args)?args.depth:0;
			t.name = ('name' in args)?args.name:null;
			t.image = ('image' in args)?args.image:null;
			t.obj_create = ('creation' in args)?args.creation:((t.parent)?t.parent.obj_create:function(){});
			t.obj_step = ('step' in args)?args.step:((t.parent)?t.parent.obj_step:function(){});
			t.obj_end_step = ('end_step' in args)?args.end_step:((t.parent)?t.parent.obj_end_step:function(){});
			t.obj_end_animation_step = ('end_animation_step' in args)?args.end_animation_step:((t.parent)?t.parent.obj_end_animation_step:function(){});
			t.obj_destroyed = ('destroyed' in args)?args.destroyed:((t.parent)?t.parent.obj_destroyed:function(){})
			t.alarms = ('alarms' in args)?args.alarms:((t.parent)?t.parent.alarms:[]);
			t.collision = ('collision' in args)?args.collision:((t.parent)?t.parent.collision:[]);
			t.mask = ('mask' in args)?args.mask:((t.parent)?t.parent.mask:null);
			//////-------------------------------------------//////
			
			if(t.parent){
				t.parent.children.push(t); //Add child to parent
			}
			
			t.instance_create = function(x, y){
				var ii = new instance(t, x, y);
				t.instances.push(ii);
				return ii;
			}
			t.instance_number = function(){
				return get_instances(t).length;
			}
		}
		
		function mainLoop(delta){
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
			//Controller
			controller_step();
			
			//Update Keyboard/Mouse
			keyboard.stepclear();
			mouse.stepclear();
		}

		function controller_step(){}
		function publish(){
			This.object = object;
			This.room = room;
			This.collision_with = collision_with;
			This.collision_point = collision_point;
			This.collision_bounce = collision_bounce;
			This.With = _with;
			This.get_object = get_object;
			This.get_instance = get_instance;
			This.keyboard = keyboard;
			This.mouse = mouse;
			This.mouse_click = mouse_click;
			This.mouse_check = mouse_check;
			This.mouse_check_pressed = mouse_check_pressed;
			This.mouse_check_released = mouse_check_released;
			This.keyboard_check_pressed = keyboard_check_pressed;
			This.keyboard_check_released = keyboard_check_released;
			This.controller_step = controller_step;
			This.create_text = create_text;
			This.create_text_style = create_text_style;
		}
		loader.load(setup); // Start Setup When Complete
		function setup() {
			loadTextures(TexList);
			publish();
			GameStart();
			app.ticker.add(mainLoop);
		}
	}
})();