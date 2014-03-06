/*!
 * minMap v0.0.1
 * https://github.com/rodrigopolo/minMap
 *
 * Copyright (c) 2014 Rodrigo Polo, All Rights Reserved.
 *
 * Open source under the BSD License.
 * http://creativecommons.org/licenses/BSD/
 *
 *
 */

window.minMaps = window.minMaps || {};

(function () {

	if(!minMaps.dp){
		minMaps= {
			sprite: 'img/map_controls_sprite.png',
			sprite_retina:'img/map_controls_sprite2x.png',
			pc: [{i:'u',w:37,h:23,x:-48,y:0},{i:'r',w:23,h:37,x:-24,y:0},{i:'d',w:37,h:23,x:-48,y:-24},{i:'l',w:23,h:37,x:0,y:0}],
			dp: [93206.75555555556,46603.37777777778,23301.68888888889,11650.844444444445,5825.422222222222,2912.711111111111,1456.3555555555556,728.1777777777778,364.0888888888889,182.04444444444445,91.02222222222223,45.51111111111111,22.755555555555556,11.377777777777778,5.688888888888889,2.8444444444444446,1.4222222222222223,0.7111111111111111]
		};

		minMaps.css = document.createElement('style');
		minMaps.css.type = 'text/css';
		minMaps.css.appendChild(document.createTextNode('.map_c{display: block; background: url('+minMaps.sprite+') no-repeat 0 0; z-index: 1001; cursor: pointer; position: absolute;}'));
		minMaps.css_head = document.head || document.getElementsByTagName('head')[0];
		minMaps.css_head.appendChild(minMaps.css);

		minMaps.Map = function(el, options) {
			var px = 'px',
			    $this = this;
			this.op = options;
			this._markers='';

			this.dom_el = document.getElementById(el);

			this.op.width = this.dom_el.clientWidth;
			this.op.height = this.dom_el.clientHeight;

			if(this.op.retina){
				minMaps.css.appendChild(document.createTextNode('.map_c{background: url('+minMaps.sprite_retina+') no-repeat 0 0;background-size: 110px 47px;}'));
			}

			this.loadImg();

			if(this.op.panControls || this.op.zoomControl){
				this.control_canvas = document.createElement('div');
				this.control_canvas.id = el+'_MMcontrols';
				this.control_canvas.style.position = 'absolute';
				this.control_canvas.style.width = this.op.width+px;
				this.control_canvas.style.height = this.op.height+px;
				this.control_canvas.style.zIndex = '10000';
				this.dom_el.appendChild(this.control_canvas);
			}

			this.controls={};

			if(this.op.panControls){
				for(k in minMaps.pc){
					this.controls[minMaps.pc[k].i] = document.createElement('div');
					this.controls[minMaps.pc[k].i].className = 'map_c';
					this.controls[minMaps.pc[k].i].style.width = minMaps.pc[k].w+px;
					this.controls[minMaps.pc[k].i].style.height = minMaps.pc[k].h+px;
					this.controls[minMaps.pc[k].i].style.backgroundPosition = minMaps.pc[k].x+'px '+minMaps.pc[k].y+px;
					
					this.controls[minMaps.pc[k].i]._ac = minMaps.pc[k].i;
					this.controls[minMaps.pc[k].i]._p = $this;
					this.controls[minMaps.pc[k].i].onclick = this._ca;

					this.control_canvas.appendChild(this.controls[minMaps.pc[k].i]);
				}
				var margin = 5;
				this.controls.u.style.top = this.controls.l.style.left = this.controls.r.style.right = margin+px;
				this.controls.d.style.top = ((this.op.height-this.controls.d.clientHeight)-margin)+px;
				this.controls.u.style.left = this.controls.d.style.left = (this.op.width/2)-(this.controls.u.clientWidth/2)+px;
				this.controls.l.style.top = this.controls.r.style.top = (this.op.height/2)-(this.controls.l.clientHeight/2)+px;
			}

			if(this.op.zoomControl){
				this.controls.zc = document.createElement('div');
				this.controls.zi = document.createElement('div');
				this.controls.zo = document.createElement('div');
				this.controls.zc.style.width = 24+px;
				this.controls.zc.style.height = 45+px;
				this.controls.zc.style.position = 'absolute';
				this.controls.zc.style.top = this.controls.zc.style.right = 5+px;
				this.controls.zi.style.width = this.controls.zo.style.width = 24+px;
				this.controls.zi.style.height = this.controls.zo.style.height = 22+px;
				this.controls.zi.className = this.controls.zo.className = 'map_c';
				this.controls.zi.style.position = this.controls.zo.style.position = 'relative';
				this.controls.zi.style.backgroundPosition = '-86px 0';
				this.controls.zo.style.backgroundPosition = '-86px -22px';
				this.controls.zi.onclick = function(){$this.zoomIn();}
				this.controls.zo.onclick = function(){$this.zoomOut();}
				this.controls.zc.appendChild(this.controls.zi);
				this.controls.zc.appendChild(this.controls.zo);
				this.control_canvas.appendChild(this.controls.zc);
			}

		};

		minMaps.Map.prototype._ca = function(){
			var p = this._p;
			var dg =  minMaps.dp[p.op.zoom] / (p.op.width * 2);

			if(this._ac=='u'){
				p.op.center.lat+=dg;
			}else if(this._ac=='r'){
				p.op.center.lng+=dg;
			}else if(this._ac=='d'){
				p.op.center.lat-=dg;
			}else if(this._ac=='l'){
				p.op.center.lng-=dg;

			}
			p.loadImg();
		}


		minMaps.Map.prototype.createURL = function(){
			var $this = this,
			    url_params = {};
			if(this.op.markers){
				this.op.markers.forEach(function(mrk) {
					if(mrk.color){
						mrk.color = '0x'+mrk.color;
					}
					var loc = mrk.lat+','+mrk.lng;
					delete mrk.lat;
					delete mrk.lng;
					var d = [];
					for(k in mrk){
						d.push(k+':'+mrk[k]);
					}
					$this._markers+='&markers='+encodeURIComponent(d.join('|')+'|'+loc);
				});
			}
			this.op.markers = null;
			url_params.center 			= this.op.center.lat+','+this.op.center.lng;
			url_params.size 			= this.op.width+'x'+this.op.height;
			url_params.sensor 			= this.op.sensor || false;
			url_params.zoom 			= this.op.zoom || 17;
			url_params.maptype 			= this.op.mapType || 'roadmap';
			url_params.visual_refresh 	= this.op.visual_refresh || true;

			if(this.op.format){
				url_params.format = this.op.format;
			}
			if(this.op.key){
				url_params.key = this.op.key;
			}
			if(this.op.retina){
				url_params.scale = '2';
			}

			return 'http://maps.googleapis.com/maps/api/staticmap?'+this.serialize(url_params)+this._markers;
		}

		minMaps.Map.prototype.serialize = function(obj){
			var str = [];
			for(var p in obj){
				if (obj.hasOwnProperty(p)) {
					str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
				}
			}
			return str.join("&");
		}

		minMaps.Map.prototype.loadImg = function(){
			this.dom_el.style.backgroundImage='url('+this.createURL()+')';
			if(this.op.retina){
				this.dom_el.style.backgroundSize=this.op.width+'px '+this.op.height+'px';
			}
		}

		minMaps.Map.prototype.zoomIn = function(){
			this.op.zoom++;
			this.loadImg();
		}

		minMaps.Map.prototype.zoomOut = function(){
			this.op.zoom--;
			this.loadImg();
		}
	}
	
})();









