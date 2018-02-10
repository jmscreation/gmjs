/* ------------------------------------------ //
					GM-JS
			Version: 0.2.2
			Author: jmscreator
			License: Free to use
			
	Current Progress:
		Object mask currently being worked on
// ------------------------------------------- */

var GMJS = new (function(){'use strict';
	var _error = 0;
	if(typeof(nimble) == 'undefined') {_error++;console.error('GMJS Requires Nimble');}
	if(typeof(PIXI) == 'undefined') {_error++;console.error('GMJS Requires PIXI');}
	if(_error) throw ('GMJS Failed To Load Because '+_error.toString()+' Error'+'s'.repeat((_error>1))+' Occurred');
	var This = this;
	var _GameEngineStarted = false;
	var keyboard = new nimble.Keyboard(),
		mouse = new nimble.Mouse();
	keyboard.steps = true;
	mouse.steps = true;
	var object_table = [];
	var Application = PIXI.Application,
		Container = PIXI.Container,
		Graphics = PIXI.Graphics,
		Text = PIXI.Text,
		TextStyle = PIXI.TextStyle,
		Sprite = PIXI.Sprite,
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
	var create_text_style, create_text;
	This.StartGameEngine = function(GameStart, Images){
		if(_GameEngineStarted) return console.error('GameEngine Is Running!');
		_GameEngineStarted = true;
		var app = new Application({width:512, height:400});
		app.stage.updateLayersOrder = function () {
			app.stage.children.sort(function(a,b) {
				a.zIndex = a.zIndex || 0;
				b.zIndex = b.zIndex || 0;
				return b.zIndex - a.zIndex
			});
		};
		Images = Images || [];
		
		document.body.appendChild(app.view);
		
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
		
		function loadTextures(list){
			function createFrame(tx, i){
				if(!in_array(['x', 'y', 'w', 'h'], i.tile)) return false;
				tx.frame = (new Rectangle(i.tile.x, i.tile.y, i.tile.w, i.tile.h));return true;
			}
			for(var img in list){
				var i = list[img];
				if(TextureCache[i.path] == undefined) {console.error('Failed loading resource - '+i.name+' - Image file not found');continue;}
				var tex = new Texture(BaseTexture.fromImage(i.path)); // Generate New Texture
				if('tile' in i){
					if(!createFrame(tex, i)) console.error('Failed creating frame for - '+i.name);
				}
				i.texture = tex;
			}
		}
		
		var _DepthChanged = false;
		var room = app.screen;
		
		create_text_style = function(style){
			return new TextStyle(style);
		}
		
		create_text = function(str, x, y, style){
			str = str || '';
			style = style || {};
			var _text = new Text(str, style);
			_text.zIndex = 0;
			Object.defineProperty(_text, 'depth', {set:function(x){_text.zIndex = x;}, get:function(){_DepthChanged = true;return _text.zIndex;}});
			_text.align = function(a, b){b=b||1;switch(a){case 'center':_text.anchor.x = 0.5;_text.anchor.y = 0.5;return;case 'left':_text.anchor.x = 1-b/100;return;case 'right':_text.anchor.x = b/100;return;case 'top':_text.anchor.y = 1-b/100;case 'bottom':_text.anchor.y = b/100;}};
			_text.x = x || 0;
			_text.y = y || 0;
			app.stage.addChild(_text);
			_DepthChanged = true;
			return _text;
		}
		
		var get_object = function(o){
			if(typeof(o) == 'object'){
				return o;
			}
			if(typeof(o) == 'string'){
				for(var x in object_table){
					if(object_table[x].name == o) return object_table[x];
				}
			}
			return false;
		}
		var keyboard_check_pressed = function(key){
			return key in keyboard.pressed;
		}
		var keyboard_check_released = function(key){
			return key in keyboard.released;
		}
		var mouse_check = function(mb){
			if(mb != 'left' && mb != 'right' && mb != 'middle') return false;
			return mouse[mb];
		}
		var mouse_check_pressed = function(mb){
			mb = mb||'left';
			return mb in mouse.pressed;
		}
		var mouse_check_released = function(mb){
			mb = mb||'left';
			return mb in mouse.released;
		}
		var mouse_click = function(t, op, mb){
			mb = mb||'left';
			op = op || mouse_check;
			if(op(mb)){
				return (checkCollision({x:mouse.x, y:mouse.y, width:1, height:1}, t.sprite));
			}
		}

		var checkCollision = function(r1, r2) {
			var widths, heights, vx, vy;
			if(r1 === r2) return false;
			r1.centerX = r1.x; 
			r1.centerY = r1.y; 
			r2.centerX = r2.x; 
			r2.centerY = r2.y; 

			r1.halfWidth = r1.width / 2;
			r1.halfHeight = r1.height / 2;
			r2.halfWidth = r2.width / 2;
			r2.halfHeight = r2.height / 2;

			vx = r1.centerX - r2.centerX;
			vy = r1.centerY - r2.centerY;
			widths = r1.halfWidth + r2.halfWidth;
			heights = r1.halfHeight + r2.halfHeight;
			return (Math.abs(vx) < widths && Math.abs(vy) < heights);
		};
		var collision_with = function(t, o){
			o = get_object(o);
			var list = [];
			_with(o, function(ii){
				if(checkCollision(t.sprite, ii.sprite)) list.push(ii);
			});
			return list.length?list:false;
		}
		var instance = function(obj, x, y){
			var t = this;
			var _destroy = false;
			var depth = obj.depth;
			var updateLocalAsset = function(){
				t.graphics.clear();
				t.sprite.zIndex = depth;
				t.graphics.zIndex = depth - 1;
				t.sprite.x = t.x;
				t.sprite.y = t.y;
				t.sprite.scale.x = t.xscale;
				t.sprite.scale.y = t.yscale;
				t.sprite.alpha = t.image_alpha;
				t.sprite.rotation = (t.image_angle)*Math.PI/180;
			}
			
			
			Object.defineProperty(t, 'object_index', {value:obj, writeable:false});
			Object.defineProperty(t, 'depth', {get:function(){return depth;}, set:function(x){depth = x;updateLocalAsset();_DepthChanged = true;}});
			
			t.active = true;
			t.x = x||0;
			t.y = y||0;
			t.xprevious = t.x;
			t.yprevious = t.y;
			t.image_angle = 0;
			t.image_alpha = 1;
			t.xscale = 1;
			t.yscale = 1;
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
				obj.obj_destroyed(t);//Destroy Event
				t.sprite.rendered = false;
				_destroy = true;
			};
			t.collision_code = function(){
				for(var c in t.collision_objects){
					t.collision_objects[c]._run_step();//Collision Checking
				}
				t.xprevious = t.x;
				t.yprevious = t.y;
			}
			t.step_code = function(){
				if(_destroy) return;
				updateLocalAsset();	
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
			}
			
			var texture;
			for(var tx in TexList){
				if(TexList[tx].name == obj.image){
					texture = TexList[tx].texture;
					break;
				}
			}
			
			t.sprite = new Sprite((obj.image == null)?'':texture);
			t.sprite.renderable = false;
			t.graphics = new Graphics();
			t.sprite.anchor.x = 0.5;
			t.sprite.anchor.y = 0.5;
			updateLocalAsset();//Set info
			
			app.stage.addChild(t.graphics);
			app.stage.addChild(t.sprite);
			
			_DepthChanged = true;
			obj.obj_create(t)//Creation Event
			updateLocalAsset();//Complete information based no creation event
		}

		var object = function(args){
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
					if(time == -1) return;
					if(time == 0) t.code(scope);
					t.time--;
				}
			}
			t.collision_object = function(scope, o, code){
				var t = this;
				o = get_object(o);
				t._run_step = function(){
					_with(o, function(ii){
						if(checkCollision((t.mask == {})?scope.sprite:t.mask, ii.sprite)) code(scope, ii);
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
			t.obj_destroyed = ('destroyed' in args)?args.destroyed:((t.parent)?t.parent.obj_destroyed:function(){})
			t.alarms = ('alarms' in args)?args.alarms:((t.parent)?t.parent.alarms:[]);
			t.collision = ('collision' in args)?args.collision:((t.parent)?t.parent.collision:[]);
			t.mask = ('mask' in args)?args.mask:((t.parent)?t.parent.mask:{});
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
				return _get_instances(t).length;
			}
		}
		var _get_instances = function(obj){
			var l = [];
			function recurse(_obj){
				l = l.concat(_obj.instances);
				for(var child in _obj.children){
					recurse(_obj.children[child]);
				}
			}
			recurse(obj);
			return l;
		}
		var _with = function(obj, scope){
			var l = _get_instances(obj);
			for(var ii in l){
				if(scope(l[ii]) == false) break;
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
			This.With = _with;
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