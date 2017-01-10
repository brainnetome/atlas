var GLOBAL={
  area_map_flag:false,
  num2dim:["x","y","z"],
  drag:{mousedown:false},
  opacity:0.5,
	iiarr:[90,107,90],
	fiber:{
		rotate:1,id:28,angle:0,mouse:{
			down:false,startloc:{x:-1,y:-1},startangle:-1
		}
	},
	treedata:{},
	regionCount:246,
	// fibtimer:window.setInterval(function(){
	// 	GLOBAL.fiber.angle=(GLOBAL.fiber.angle+10)%360;Update();
	// },500)
};
// var iiarr=[90,107,90];
window.addEventListener("load",function()
{
	loadLabelMaps();
	// loadBarCharts();
	loadTreeViewData();
	// loadConnectogramData();

	$("#connectogram-checkbox").click(function(){
		if ($('#connectogram-checkbox').prop('checked')){
			$("#atlas-checkbox").prop('checked',false);
			$("#atlas-panel").hide();
			$("#connectogram-panel").show();
		}
	});
	$("#atlas-checkbox").click(function(){
		if ($('#atlas-checkbox').prop('checked')){
			$("#connectogram-checkbox").prop('checked',false);
			$("#atlas-panel").show();
			$("#connectogram-panel").hide();
		}
	});

  $("#toggle-area-map").on("click",ToggleAreaMapHandler);
  $("#toggle-fiber").on("click",ToggleFiberHandler);
	
  $("#lessOpacity").on("click",function(){
			GLOBAL.opacity=Math.min(1,Math.max(0,GLOBAL.opacity-0.1));Update();
	});
  $("#moreOpacity").on("click",function(){
			GLOBAL.opacity=Math.min(1,Math.max(0,GLOBAL.opacity+0.1));Update();
	});
  
	$("#status").html("status: "+(GLOBAL.area_map_flag?"on":"off"));

	String.prototype.padLeft = function (length, character) { 
    return new Array(length - this.length + 1).join(character || '0') + this; 
	}

  function loadLabelMaps()
	{
		$.ajax("js/bnatlasviewer/labelmaps_new.txt").done(function(responseText){
			$("#map-container").html(responseText);

			handler("display-x");
			handler("display-y");
			handler("display-z");

			$.ajax("js/bnatlasviewer/BDf_FDR05.json").done(function(data){BDf_FDR05 = data;});
			$.ajax("js/bnatlasviewer/PCf_FDR05.json").done(function(data){PCf_FDR05 = data;});

			// load fiber images
			$.ajax("images/imglist.txt").done(function(responseText2){
				$("#imglist").html(responseText2);
				initializeFiber('fib');
				initializeFiber('fun');
				$('#plugins4').jstree('select_node','1');
			});

			Update();
			document.getElementById("display-splash").style.display='none';
		});
	}

	function loadTreeViewData(){
		var $treeview = $('#plugins4');
		$treeview.jstree({
			'core' : {
				'data' : {
					"url" : "js/bnatlasviewer/bnatlas_tree_new.json",
					"dataType" : "json" // needed only if you do not supply JSON headers
				}
			},
			"types" : {
				"file" : {"icon" : "jstree-default jstree-file"}
			},
			"plugins" : [ "search","types" ]
		}).on("select_node.jstree", function (e, data) { 
			var title = data.node.text;
			if (typeof GLOBAL_title2center[title] === 'undefined'){
				console.error("typeof GLOBAL_title2center[title] === 'undefined'");return;
			}
			centeringAreasByTitle(title);
			viewFiberByTitle(title);
			Update();
			DrawConnectogram(title);
			DrawBehaviorBar(title,'BDf_FDR05');
			DrawBehaviorBar(title,'PCf_FDR05');
			highlightAreasByTitle(title);
			document.getElementById("log2").innerHTML=data.node.text+','+data.node.id;
			document.getElementById("log_area").innerHTML=data.node.data['alias'];
			// console.log(data);console.log(e);
		}).on('loaded.jstree', function() {
			$treeview.jstree('open_node','Frontal Lobe');
			$treeview.jstree('open_node','SFG, Superior Frontal Gyrus');
		});// .on('model.jstree',function(e,nodes){
		// 	GLOBAL.treedata = nodes;
		// 	console.log(e);
		// 	console.log(nodes);
		// });
		//$.jstree.reference('#plugins4').select_node("Frontal Lobe");
		var to = false;
		$('#plugins4_q').keyup(function () {
			if(to) { clearTimeout(to); }
			to = setTimeout(function () {
				var v = $('#plugins4_q').val();
				$('#plugins4').jstree(true).search(v);
			}, 250);
		});
	}

	function ToggleFiberHandler(e){
		var canvas=document.getElementById("display-fib");
		var stat=parseInt(canvas.style.opacity);
		if (stat==0){canvas.style.opacity=1;}else{canvas.style.opacity=0;}
		document.getElementById("fiber-status").innerHTML=stat?"Probabilistic":"Deterministic";
	}

	function initializeFiber(fibstr){
		var canvas=document.getElementById('display-'+fibstr);
		canvas.addEventListener('mousedown',fibMouse_down,false);
		canvas.addEventListener('mousemove',fibMouse_move,false);
		canvas.addEventListener('mouseup',  fibMouse_up,false);
		canvas.addEventListener('mouseout', fibMouse_up,false);
		canvas.addEventListener('mouseover',fibMouse_over,false);

		function fibMouse_down(e){
			var canvas=e.target;
			var offsetX=canvas.parentNode.offsetLeft;
			var posX=e.pageX-offsetX;
			GLOBAL.fiber.mouse.down=1;
			GLOBAL.fiber.mouse.startloc.x=posX;
			GLOBAL.fiber.mouse.startangle=GLOBAL.fiber.angle;
			fibMouse_move(e);
		}
		function fibMouse_move(e){
			var canvas=e.target;
			var offsetX=canvas.parentNode.offsetLeft;
			var posX=e.pageX-offsetX;
			if ((GLOBAL.fiber.mouse.down)&&
					(GLOBAL.fiber.mouse.startloc.x>0)&&
					(GLOBAL.fiber.mouse.startangle>=0))
			{
				GLOBAL.fiber.angle=
					((posX-GLOBAL.fiber.mouse.startloc.x)+GLOBAL.fiber.mouse.startangle+720)%360;
				document.getElementById("label").innerHTML=
					'dragging:'+GLOBAL.fiber.mouse.startangle+'->'+GLOBAL.fiber.angle;
			}else{
				fibMouse_up(e);
			}
			Update();
		}
		function fibMouse_up(e){
			GLOBAL.fiber.mouse.down=0;
			GLOBAL.fiber.mouse.startloc.x=-1;
			GLOBAL.fiber.mouse.startangle=-1;
		}
		function fibMouse_over(e){
			//clearInterval(GLOBAL.fibtimer);
		}
	}

  // -------------------------------------------------------
  // handle mouse wheel events
  // -------------------------------------------------------
  function handler(canvasid)
  {
  	var idcode=canvasid[canvasid.length-1];
  	var idx=((idcode=="x")?0:((idcode=="y")?1:2));
		var ii=GLOBAL.iiarr[idx];
		var canvas=document.getElementById(canvasid);
		var img=document.getElementById(canvas.id+"-img");
		var phony=document.getElementById(canvas.id+"-img-phony");

		canvas.width =parseFloat(canvas.parentNode.style.width );
		canvas.height=parseFloat(canvas.parentNode.style.height);
		var maxii=181*217/Math.max(canvas.width,canvas.height);
		GLOBAL.iiarr[idx]=Math.min(maxii,Math.max(0,ii));
		DrawImage(canvas,img,idx);

		var phonyid="map-"+idx+"-"+GLOBAL.iiarr[idx];
		phony.useMap="#"+phonyid;
		var areas=document.getElementById(phony.useMap.substr(1)).childNodes;
		for (var areaiter=0; areaiter < areas.length; areaiter++){
			areas[areaiter].addEventListener("click",MouseClickAreaHandler,false);
			areas[areaiter].addEventListener("mouseover",MouseOverAreaHandler,false);
			// areas[areaiter].addEventListener("mouseout", MouseOutAreaHandler ,false);
		}
		
		phony.addEventListener("mousedown",     MouseDraggingHandler_start,false);
		phony.addEventListener("mousemove",     MouseDraggingHandler_move ,false);
		phony.addEventListener("mouseup",       MouseDraggingHandler_stop ,false);

		phony.addEventListener("mousewheel",    MouseWheelHandler,false);
		phony.addEventListener("DOMMouseScroll",MouseWheelHandler,false);

		function MouseWheelHandler(e){
  	  var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
			var ii=GLOBAL.iiarr[idx];
  	  if (delta>0){ii+=1;}else{ii-=1;}
			GLOBAL.iiarr[idx]=Math.min(maxii,Math.max(0,ii));
			Update();

			if (GLOBAL.area_map_flag){
				var phonyid="map-"+idx+"-"+GLOBAL.iiarr[idx];
				phony.useMap="#"+phonyid;
				
				var areas=document.getElementById(phony.useMap.substr(1)).childNodes;
				for (var areaiter=0; areaiter < areas.length; areaiter++){
					areas[areaiter].addEventListener("mouseover",MouseOverAreaHandler,false);
					areas[areaiter].addEventListener("click",MouseClickAreaHandler,false);
					// areas[areaiter].addEventListener("mouseout", MouseOutAreaHandler ,false);
				}
			}
		} // function MouseWheelHandler
  }

  function MouseOverAreaHandler(e)
  {
  	// var title=e.target.title;
		// viewFiberByTitle(title);

		// DrawFiber('fib');
		// DrawFiber('den');
		// DrawFiber('fun');
  	// document.getElementById("label").innerHTML=title;
		// DrawBehaviorBar(title);
		// highlightAreasByTitle(title);
  }

  function MouseClickAreaHandler(e)
  {
		MouseOutAreaHandler(e);
		
  	var title=e.target.title;
		// viewFiberByTitle(title);
		// // DrawFiber('fib');
		// DrawFiber('den');
		// DrawFiber('fun');
		// DrawBehaviorBar(title,'BDf_FDR05');
		// DrawBehaviorBar(title,'PCf_FDR05');
		// highlightAreasByTitle(title);

		var idx=GLOBAL_title2ind[title];
		console.log(idx+1);
		var $treeview = $('#plugins4');
		$treeview.jstree('close_all');
		$treeview.jstree('deselect_all');
		$treeview.jstree('select_node',idx+1);
  }

  function MouseOutAreaHandler(e)
  {
  	var title=e.target.title;
  	var mapnodelist=document.getElementsByTagName("map");
		var targetmapid=["map-0-"+GLOBAL.iiarr[0],"map-1-"+GLOBAL.iiarr[1],"map-2-"+GLOBAL.iiarr[2]];
		for (var i=0;i<mapnodelist.length;i++)
		{
			if ((mapnodelist[i].id==targetmapid[0])||
					(mapnodelist[i].id==targetmapid[1])||
					(mapnodelist[i].id==targetmapid[2]))
			{
				var idx=mapnodelist[i].id.substr(4,1);
				var canvas=document.getElementById("display-"+GLOBAL.num2dim[idx]);
				var img=document.getElementById(canvas.id+"-img");
				DrawImage(canvas,img,idx);
			}
		}
		
		// document.getElementById("label").innerHTML="";
  }

  function MouseDraggingHandler_start(e)
  {
		var img=e.target;
		img.ondragstart=function(){return false;};
		var canvas=img.parentNode;
		var offsetX=canvas.offsetLeft;
		var offsetY=canvas.offsetTop;
		if (GLOBAL.area_map_flag){
			//document.getElementById("label").innerHTML="";
			return;
		}else{
			GLOBAL.drag.mousedown=true;
		}
		MouseDraggingHandler_move(e);
  }

  function MouseDraggingHandler_move(e)
  {
		var vlist=new Array;vlist[0]=[1,2];vlist[1]=[0,2];vlist[2]=[0,1];
		var img=e.target;
		var canvas=img.parentNode;
		var offsetX=parseInt(canvas.getBoundingClientRect().left);//canvas.offsetLeft;
		var offsetY=parseInt(canvas.getBoundingClientRect().top);//canvas.offsetTop;
		if (GLOBAL.area_map_flag){
			// document.getElementById("label").innerHTML="";
			return;
		}else{
			if (GLOBAL.drag.mousedown){
				// var posX=e.pageX-offsetX;
				// var posY=e.pageY-offsetY;
				var posX=parseInt(e.clientX-offsetX);
				var posY=parseInt(e.clientY-offsetY);
				document.getElementById("label").innerHTML="start:"+posX+","+posY;
				var idx=img.id.substr(8,1)=="x"?0:(img.id.substr(8,1)=="y"?1:2);
				var v=vlist[idx];
				switch(idx){
				case 0:{GLOBAL.iiarr[v[0]]=posX;GLOBAL.iiarr[v[1]]=posY;break;}
				case 1:{GLOBAL.iiarr[v[0]]=posX;GLOBAL.iiarr[v[1]]=posY;break;}
				case 2:{GLOBAL.iiarr[v[0]]=posX;GLOBAL.iiarr[v[1]]=217-posY;break;}
				}
				Update();
			}else{
				// document.getElementById("label").innerHTML="";
			}
		}
  }

  function MouseDraggingHandler_stop(e)
  {
		if (GLOBAL.area_map_flag){document.getElementById("label").innerHTML="";return;}
		else{
			GLOBAL.drag.mousedown=false;
			// document.getElementById("label").innerHTML="";
		}
  }

  function ToggleAreaMapHandler(e)
  {
		GLOBAL.area_map_flag = (!GLOBAL.area_map_flag);
		document.getElementById("status").innerHTML="status: "+(GLOBAL.area_map_flag?"on":"off");
		if (!GLOBAL.area_map_flag){
			for (var idx=0;idx<3;idx++){
				var canvas=document.getElementById("display-"+GLOBAL.num2dim[idx]);
				var phony=document.getElementById(canvas.id+"-img-phony");
				var areas=document.getElementById(phony.useMap.substr(1)).childNodes;
				for (var areaiter=0; areaiter < areas.length; areaiter++){
					areas[areaiter].addEventListener("click",MouseClickAreaHandler,false);
					areas[areaiter].removeEventListener("mouseover",MouseOverAreaHandler,false);
					// areas[areaiter].removeEventListener("mouseout", MouseOutAreaHandler ,false);
				}
				phony.useMap="";
			} // for loop
		}else{
			for (var idx=0;idx<3;idx++){
				var canvas=document.getElementById("display-"+GLOBAL.num2dim[idx]);
				var phony=document.getElementById(canvas.id+"-img-phony");
				phony.useMap="#map-"+idx+"-"+GLOBAL.iiarr[idx];
				var areas=document.getElementById(phony.useMap.substr(1)).childNodes;
				for (var areaiter=0; areaiter < areas.length; areaiter++){
					areas[areaiter].addEventListener("click",MouseClickAreaHandler,false);
					areas[areaiter].addEventListener("mouseover",MouseOverAreaHandler,false);
					// areas[areaiter].addEventListener("mouseout", MouseOutAreaHandler ,false);
				}
			} // for loop
		}
  }
});

function centeringAreasByTitle(title)
{
	// var idx=GLOBAL_title2ind[title];
	// document.getElementById('log').innerHTML='centering: '+idx;
	// for (var i=0;i<3;i++){GLOBAL.iiarr[i]=GLOBAL_gv_center[idx*3+i];}
	// var idx=GLOBAL_title2ind[title];
	// document.getElementById('log').innerHTML='centering: '+idx;
	for (var i=0;i<3;i++){GLOBAL.iiarr[i]=GLOBAL_title2center[title][i];}
}

function viewFiberByTitle(title)
{
	var ind=GLOBAL_title2ind[title];
	GLOBAL.fiber.id=ind+1;
	document.getElementById("log2").innerHTML=title+','+GLOBAL.fiber.id;
}

function highlightAreasByTitle(title)
{
  var mapnodelist=document.getElementsByTagName("map");
  var targetmapid=["map-0-"+GLOBAL.iiarr[0],"map-1-"+GLOBAL.iiarr[1],"map-2-"+GLOBAL.iiarr[2]];
  for (var i=0;i<mapnodelist.length;i++)
  {
		if ((mapnodelist[i].id==targetmapid[0])||
				(mapnodelist[i].id==targetmapid[1])||
				(mapnodelist[i].id==targetmapid[2]))
		{
			var idx=mapnodelist[i].id.substr(4,1);
			var ctx=document.getElementById("display-"+GLOBAL.num2dim[idx]).getContext("2d");
			var areas=mapnodelist[i].childNodes;
			for (var j=0;j<areas.length;j++)
			{
				if (areas[j].title==title){
					var c=areas[j].coords.split(",");
					for (var k in c){c[k]=parseInt(c[k],10);}
					ctx.strokeStyle="#ff0000";
					ctx.lineWidth=1.5;
					ctx.beginPath();
					ctx.moveTo(c[0],c[1]);
					for (var k=2;k<c.length;k+=2){ctx.lineTo(c[k],c[k+1]);}
					ctx.closePath();
					ctx.stroke();
					ctx.lineWidth=1;
				}
			}
		}
  }
}

function Update()
{
	//if ($('#atlas-checkbox').prop('checked'))
	{
		for (var idx=0;idx<3;idx++){
			var canvas=document.getElementById("display-"+GLOBAL.num2dim[idx]);
			var img=document.getElementById("display-"+GLOBAL.num2dim[idx]+"-img");
			DrawImage(canvas,img,idx);
		}
		// DrawFiber('fib');
		DrawFiber('den');
		DrawFiber('fun');
		// DrawBehaviorBar(title,'BDf_FDR05');
		// DrawBehaviorBar(title,'PCf_FDR05');
		document.getElementById("opacity").innerHTML="opacity:"+GLOBAL.opacity.toFixed(1);
		// }else{
		// DrawConnectogram(title);
	}
}

function DrawImage(canvas,img,idx)
{
	var vlist=new Array;vlist[0]=[1,2];vlist[1]=[0,2];vlist[2]=[0,1];
  document.getElementById("log").innerHTML=GLOBAL.iiarr;
	var ctx=canvas.getContext("2d");
	ctx.clearRect(0,0,canvas.width,canvas.height);
	var ww=canvas.width; var hh=canvas.height;
	var xloc=Math.floor((GLOBAL.iiarr[idx]-1)%10);
	var yloc=Math.floor((GLOBAL.iiarr[idx]-1)/10);
	ctx.globalAlpha=1;//-GLOBAL.opacity;
	ctx.drawImage(document.getElementById(img.id+"-bg"),ww*xloc,hh*yloc,ww,hh,0,0,ww,hh);
	ctx.globalAlpha=GLOBAL.opacity;
	ctx.drawImage(img,ww*xloc,hh*yloc,ww,hh,0,0,ww,hh);
	ctx.globalAlpha=1;//-GLOBAL.opacity;
	ctx.font="16px Arial";
	ctx.fillStyle="#ff0000";
	ctx.strokeStyle="#00ffff";
	var v=vlist[idx];
	ctx.globalAlpha=1;
	ctx.beginPath();
	if (idx==0){
		ctx.fillText("S",105,16);ctx.fillText("P",2,100);
		ctx.moveTo(0,GLOBAL.iiarr[v[1]]-.5);ctx.lineTo(217,GLOBAL.iiarr[v[1]]-.5);
		ctx.moveTo(GLOBAL.iiarr[v[0]]-.5,0);ctx.lineTo(GLOBAL.iiarr[v[0]]-.5,181);
	}
	if (idx==1){
		ctx.fillText("S",85,16); ctx.fillText("L",2,100);
		ctx.moveTo(0,GLOBAL.iiarr[v[1]]-.5);ctx.lineTo(181,GLOBAL.iiarr[v[1]]-.5);
		ctx.moveTo(GLOBAL.iiarr[v[0]]-.5,0);ctx.lineTo(GLOBAL.iiarr[v[0]]-.5,181);
	}
	if (idx==2){
		ctx.fillText("A",85,16); ctx.fillText("L",2,110);
		ctx.moveTo(0,217-GLOBAL.iiarr[v[1]]-.5);ctx.lineTo(181,217-GLOBAL.iiarr[v[1]]-.5);
		ctx.moveTo(GLOBAL.iiarr[v[0]]-.5,0);ctx.lineTo(GLOBAL.iiarr[v[0]]-.5,217);
	}
	ctx.closePath();
	ctx.stroke();
}

function DrawFiber(fibstr)
{
	var canvas=document.getElementById('display-'+fibstr);
	var ctx=canvas.getContext('2d');
	var imgfib=document.getElementById('display-'+fibstr+'-img-'+GLOBAL.fiber.id);
	ctx.clearRect(0,0,canvas.width,canvas.height);
	var ww=canvas.width; var hh=canvas.height;
	var xloc=Math.floor(Math.floor((GLOBAL.fiber.angle%360)/10)%5);
	var yloc=Math.floor(Math.floor((GLOBAL.fiber.angle%360)/10)/5);
	//console.log(imgfib+','+ww*xloc+','+hh*yloc+','+ww+','+hh+','+0+','+0+','+ww+','+hh);
	if (imgfib){ctx.drawImage(imgfib,ww*xloc,hh*yloc,ww,hh,0,0,ww,hh);}
}

function DrawConnectogram(title){
	var ind = GLOBAL_title2ind[title]+1;
	var url = 'images/connectogram/'+ind.toString().padLeft(3)+'.svg';
	// $.ajax({ 
	// 	url : url, 
	// 	cache: true,
	// 	processData : false,
	// }).always(function(){
	// 	$("#display-cgram-img").attr("src", url);
	// });

	var img = new Image();img.src = url;
	var canvas=document.getElementById("display-cgram");
	// canvas.style.display='none';
	// $("#display-cgram-img").show();
	// var ww = canvas.width;
	// var hh = canvas.height;
	if (canvas.getContext){
		var ctx = canvas.getContext("2d");
		var node = $('#plugins4').jstree('get_node',ind.toString());
		img.onload = function(){
			// ctx.drawImage(img,0,0,3000,3000,0,0,640,640);
			ctx.clearRect(0,0,3000,3000);
			ctx.fillStyle = "#555";
			ctx.fillRect(0, 0, 3000, 3000);
			ctx.drawImage(img,0,0,3000,3000);
			ctx.fillStyle = "#555";
			ctx.fillRect(0,0,3000,120);
			ctx.font = "80px sans-serif";
			ctx.fillStyle = "#fff";
			ctx.fillText('['+node.id+']:'+node.data['alias'], 40, 80);
		}
	}else{console.warning('canvas is undefined.');}
	
	canvas.onclick=function(event){
		var canvas = document.getElementById("display-cgram");
		var $treeview = $('#plugins4');
		var ctx = canvas.getContext("2d");
		var offsetX=parseInt(canvas.getBoundingClientRect().left);
		var offsetY=parseInt(canvas.getBoundingClientRect().top);
		var scaleX = parseFloat(canvas.width)/parseFloat(canvas.style.width);
		var scaleY = parseFloat(canvas.height)/parseFloat(canvas.style.height);
		var posX=parseInt(event.clientX-offsetX)*scaleX;
		var posY=parseInt(event.clientY-offsetY)*scaleY;
		var regionCount = GLOBAL.regionCount;
		
		for (var idx=1;idx<=regionCount;idx++){
			var node = $treeview.jstree('get_node',idx.toString())
			var path = node.data['cgram'];
			ctx.beginPath();
			ctx.moveTo(path[0],path[1]);
			for (var k=2;k<path.length;k+=2){ctx.lineTo(path[k],path[k+1]);}
			ctx.closePath();
			if (ctx.isPointInPath(posX,posY)){
				console.log(node.id);
				$treeview.jstree('close_all');
				$treeview.jstree('deselect_all');
				$treeview.jstree('select_node',node.id);
				break;
			}
		}
	};

	canvas.onmousemove=function(event){
		var canvas = document.getElementById("display-cgram");
		var $treeview = $('#plugins4');
		var ctx = canvas.getContext("2d");
		var offsetX=parseInt(canvas.getBoundingClientRect().left);
		var offsetY=parseInt(canvas.getBoundingClientRect().top);
		var scaleX = parseFloat(canvas.width)/parseFloat(canvas.style.width);
		var scaleY = parseFloat(canvas.height)/parseFloat(canvas.style.height);
		var posX=parseInt(event.clientX-offsetX)*scaleX;
		var posY=parseInt(event.clientY-offsetY)*scaleY;
		var regionCount = GLOBAL.regionCount;
		var idx=0
		
		for (idx=1;idx<=regionCount;idx++){
			var node = $treeview.jstree('get_node',idx.toString())
			var path = node.data['cgram'];
			ctx.beginPath();
			ctx.moveTo(path[0],path[1]);
			for (var k=2;k<path.length;k+=2){ctx.lineTo(path[k],path[k+1]);}
			ctx.closePath();
			if (ctx.isPointInPath(posX,posY)){
				ctx.font = "80px sans-serif";
				ctx.fillStyle = "#555";
				ctx.fillRect(0,0,3000,120);
				ctx.fillStyle = "#fff";
				ctx.fillText('['+node.id+']:'+node.data['alias'], 40, 80);
				break;
			}
		}
		if (idx>regionCount){ctx.fillStyle = "#555";ctx.fillRect(0,0,3000,120);}
	};
	
}

function DrawBehaviorBar(title,BDPC_type)
{
	// console.log(BDf_FDR05[idx]);
	var idx=GLOBAL_title2ind[title]+1;

	var lut = eval(BDPC_type+'[idx]');//BDf_FDR05[idx];
	var labels = [];
	var data = [];
	var datasets = [];

	var colors = {};
	colors['Int']='151,187,205';
	colors['Emo']='220,220,220';
	colors['Cog']='220,0,220';
	colors['Act']='220,20,0';
	colors['Per']='0,220,220';

	var BDPC_title={};
	BDPC_title['BDf_FDR05']='Behaviorial Domains';
	BDPC_title['PCf_FDR05']='Paradigm Classes';
	var BDPC_barcolor={};
	BDPC_barcolor['BDf_FDR05']='#888888';//"#DD6501";
	BDPC_barcolor['PCf_FDR05']='#888888';//"#014D65";

	function sortByDictValue(dict){
		var items=Object.keys(dict).map(function(key){return [key,dict[key]];});
		items.sort(function(a,b){return a[1]-b[1];});
		return items;
	}

	lut = sortByDictValue(lut);
	// console.log(lut);

	var ii = 0;
	for (var ii=0;ii<lut.length;ii++){
		labels[ii]=lut[ii][0];
		data[ii]=lut[ii][1];
	}

	var dataPoints = [];
	for (var ii=0;ii<data.length;ii++){
		dataPoints[ii]={y:data[ii],label:data[ii],indexLabel:labels[ii]};
	}

	var chart = new CanvasJS.Chart("barchart_"+BDPC_type, {
		title:{
			fontFamily: "sans-serif",
			text:BDPC_title[BDPC_type]//+" (likelihood ratio)"
		},
		toolTip:{
			fontFamily: "sans-serif",
			fontSize: 10,
		},
    animationEnabled: false,
		axisX:{
			interval: 1,
			gridThickness: 0,
			labelFontSize: 14,
			labelFontStyle: "normal",
			labelFontWeight: "normal",
			labelFontFamily: "Lucida Sans Unicode"
		},
		axisY: {
      tickThickness: 0,
      lineThickness: 0,
      valueFormatString: " ",
      gridThickness: 0                    
    },
		data: [{     
			toolTipContent: 
			"<span style='\"'font-family:sans-serif color: {color};'\"'>{indexLabel}:</span>"+
 		  "<span style='\"'font-style:bold font-family:sans-serif color:peru '\"'>{y}</span>",
      indexLabelPlacement: "inside",
			indexLabelFontColor: "black",
			indexLabelFontSize: "12",
			indexLabelFontStyle: "bold",
      // indexLabelFontWeight: 600,
      indexLabelFontFamily: "sans-serif",
			type: "bar",
      name: "companies",
			axisYType: "secondary",
			color: BDPC_barcolor[BDPC_type],//"#014D65",
			dataPoints: dataPoints
			    // [
					// {y: 73, label: "China"},{y: 132, label: "US" } // ...
					// ]
		}]
	});

	chart.render();


}
