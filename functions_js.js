$(function() { 
	window.wave_intervals;
	window.wave_data;
	window.selected_signals = [];
	window.low_limit=0;
	window.max_limit=30;
	read_vcd();
	
	var isDown = false;
	var mouse_down_x;
	var mouse_down_y;
	
	// prevent default right click behaviour in canvas
	$("canvas").on("contextmenu",function(){
       return false;
    }); 
	
	$("#myCanvas").mousedown(function(event){
		switch (event.which) {
		// for mouse 1 (left click), allow setting information marker 
		case 1: 
			draw_wave(wave_data);
			x=event.pageX - $('#myCanvas').offset().left -100;
			if(x > 0 && x < 650){
				x_interval =650 / (max_limit - low_limit) ;
				time_interval = wave_data['time_info']['duration'] / ( wave_data['time_info']['intervals'] -1);
				timeframe =( ( Math.floor(x / x_interval) + low_limit ) * time_interval );
				
				var wave_val=0;
				var current_time_temp=0;
				
				// get the canvas element
				var canvas=document.getElementById("myCanvas");
				var h = canvas.height;
				var buffer = document.getElementById("bufferCanvas");
				
				// start from (15,36)
				var x_canvas=15;
				var y_canvas=36;
				
				// init. the drawing colours and fonts
				var ctx=buffer.getContext("2d");
				// init. stroke and fill colors : black
				ctx.fillStyle = "#000";
				ctx.strokeStyle = "#000";
				// init. font style : Times New Roman, size : 12px
				ctx.font="12px 'Times New Roman'";
				
		
				$.each(window.selected_signals, function( i, index ) {
						
					$.each(window.wave_data[index], function( current_time, value ) {
						if(value != -1){
							wave_val = value;
							current_time_temp=current_time;
						}
						if(current_time >= timeframe){
							return false;
						}
					});
					ctx.fillText("Value : "+wave_val,x_canvas,y_canvas);
					y_canvas=y_canvas+40;
				});
				
				ctx.beginPath();
				ctx.strokeStyle = "#4af";
				ctx.moveTo(x+100,0);
				ctx.lineTo(x+100,h-10);
				ctx.stroke();
				ctx.closePath();
				x_time=x- ((timeframe.toString().length / 2) +1)*5;
				ctx.fillText(timeframe.toString()+wave_data['time_info']['timescale'],x_time+100,h-5);
				
				var ctx_canvas=canvas.getContext("2d");
				ctx_canvas.drawImage(buffer, 0,0);
				
				// Recreate a jpg image of the canvas
				var img = canvas.toDataURL("image/jpg");
				document.getElementById("myimage").innerHTML='<img src="'+img+'"/>';
				
			}
		 
		
		// for mouse 2 (right click), allow time scrolling 
		case 3:
			isDown = true;
			mouse_down_x= event.pageX;
			mouse_down_y= event.pageY;
		} 
	});
	$(document).mouseup(function(event){
		if(isDown){
			isDown = false;
		}
	});
	
	
	$( "#myCanvas" ).mousemove(function( event ) {
		if(isDown){
			var mouse_up_x= event.pageX;
			var mouse_up_y= event.pageY;
			var dif = Math.round((mouse_down_x-mouse_up_x)/10);
			mouse_down_x = mouse_up_x;
			
			temp_low_limit = low_limit +dif;
			temp_max_limit = max_limit +dif;
			if(temp_low_limit < 0){
				low_limit=0;
			}else{
				if(temp_max_limit > wave_intervals){
					low_limit = wave_intervals - (max_limit - low_limit);
					max_limit = wave_intervals;
				}else{
					low_limit = temp_low_limit;
					max_limit = temp_max_limit;
				}
			}
			
			draw_wave(wave_data);
		}
		
		x=event.pageX - $('#myCanvas').offset().left -100;
		if(x > 0 && x < 650){
			x_interval =650 / (max_limit - low_limit) ;
			time_interval = wave_data['time_info']['duration'] / ( wave_data['time_info']['intervals'] -1);
			timeframe =( ( Math.floor(x / x_interval) + low_limit ) * time_interval );
			
			var wave_val=0;
			var current_time_temp=0;
			
			// get the canvas element
			var canvas=document.getElementById("myCanvas");
			var h = canvas.height;
			var buffer = document.getElementById("bufferCanvas");
			
			// start from (15,36)
			var x_canvas=15;
			var y_canvas=36;
			
			// init. the drawing colours and fonts
			var ctx=canvas.getContext("2d");
			ctx.drawImage(buffer, 0,0);
			// init. stroke and fill colors : black
			ctx.fillStyle = "#000";
			ctx.strokeStyle = "#000";
			// init. font style : Times New Roman, size : 12px
			ctx.font="12px 'Times New Roman'";
			
	
			$.each(window.selected_signals, function( i, index ) {
					
				$.each(window.wave_data[index], function( current_time, value ) {
					if(value != -1){
						wave_val = value;
						current_time_temp=current_time;
					}
					if(current_time >= timeframe){
						return false;
					}
				});
				ctx.fillStyle = "#ffa";
				ctx.fillRect(x_canvas,y_canvas-10,80,10);
				ctx.fillStyle = "#000";
				ctx.fillText("Value : "+wave_val,x_canvas,y_canvas);
				y_canvas=y_canvas+40;
			});
			
			ctx.beginPath();
			ctx.strokeStyle = "#faa";
			ctx.moveTo(x+100,0);
			ctx.lineTo(x+100,h-10);
			ctx.stroke();
			ctx.closePath();
			x_time=x- ((timeframe.toString().length / 2) +1)*5;
			ctx.fillText(timeframe.toString()+wave_data['time_info']['timescale'],x_time+100,h-5);
			
		}
	});
	
	// When the mouse leaves the canvas, redraw it from the buffer 
	$( "#myCanvas" ).mouseout(function( event ) {
		var canvas=document.getElementById("myCanvas");
		var buffer = document.getElementById("bufferCanvas");
		var ctx=canvas.getContext("2d");
		ctx.drawImage(buffer, 0,0);
	});
		
		
	// Slider's event listener
	$("#slider_button").mousedown(function(event){
		$("#slider_info").show(400);
		$('body').on('mousemove', function(e) {
			// Calculate the slider's value
            offset=e.pageX - $('#slider_main').offset().left  - $('.slider_button').outerWidth()/2;
			offset = Math.round(offset);
			if(offset<0){ offset =1; }
			if(offset>100){ offset =100; }
			
			// move the slider and the info box
			$("#slider_button").css('left', offset+'px');
			$("#slider_info").css('left', offset+'px');
			
			// update the time scale value and redraw the data
			$("#simulation_zoom").val(offset);
			draw_wave(wave_data);
			
			// update the info value of the info box
			$("#slider_info").html(offset +'%');
			
			// prevent default behaviour of mouse drag
			e.preventDefault();
        }).on('mouseup', function() {
			$('body').unbind( "mousemove");
			$("#slider_info").hide(400);
		});
	});
	
});

function read_vcd(){

	$.ajax({
		type: "GET",
		url: "functions.php",
		data: "read_vcd=1",
		dataType: "json",
		success: function(data){  
			var modules_array;
			var module ;
			var counter=0;
			if(data['time_info']['intervals'] < 30){
				max_limit = data['time_info']['intervals'];
			}else{
				max_limit=30;
			}
			wave_intervals = data['time_info']['intervals'];
			wave_data = data;
			
			$("#signals").append("<div id='module_none'></div>");
			$.each(data, function( index, signal ) {
				if(signal['name'] && index != "time_info"){

					if(signal["module"]){
						modules_array = signal["module"].split("_-_")
						module = create_modules(modules_array);
					}else{
						module="none";
					}
					$("#module_"+module).append(signal['name']);
					$("#module_"+module).append("<span id='signal_"+counter+"' class='pointer'> =></span>");
					if(index=="'"){
						$("#module_"+module).append("<input type='hidden' id='signal_"+counter+"_val' value=\"'\" /><br/>");
					}else{
						$("#module_"+module).append("<input type='hidden' id='signal_"+counter+"_val' value='"+index+"' /><br/>");
					}
					$("#signal_"+counter).click(function(event) {
						var signal_symbol = $("#"+event.target.id+"_val").val();
						if(selected_signals.indexOf(signal_symbol) == -1){
							selected_signals[selected_signals.length] = signal_symbol;
							draw_wave(data);
						}
					});
					counter++;
				}
			}); // end for each
		} // end success
	}); // end ajax
} // end read_vcd


function create_modules(modules_array){
	var module = modules_array.pop();
	var perent_element;
	if (module){
		if ( $("#module_"+module).length == 0){ 
			parent_module = create_modules(modules_array);
			if(parent_module == -1){
				perent_element = $("#signals");
			}else{
				perent_element = $("#module_"+parent_module);
			}
			perent_element.append("<br/><span id='span_module_"+module+"' class='bold pointer'>+ "+module+"</span><br/>");
			perent_element.append("<div id='module_"+module+"' class='hidden'></div>");
			$( "#span_module_"+module ).click(function() {
				$( "#module_"+module ).toggleClass( "hidden" );
			});
		}
		return module;
	}else{
		return -1;
	}
}


function draw_wave(signal_data){
	var first_signal=1;
	var pulse_height=10;
	var old_pulse_height=-1;
	var old_value =-1;
	var time_interval=1;
	var time_counter=0;
	var x_multi_intervals=0;
	var first_timeframe=1;
	var old_multivalue_named=-1;
	var last_frame=1;
	var time_offset_y=15;
	var time_frame = signal_data['time_info']['duration'] / (signal_data['time_info']['intervals']-1);
	
	max_limit = low_limit + Math.round( signal_data['time_info']['intervals']*($("#simulation_zoom").val()/100) );
	if(max_limit > signal_data['time_info']['intervals']){
		low_limit = low_limit - (max_limit - signal_data['time_info']['intervals']);
		max_limit = signal_data['time_info']['intervals'];
	}
	
	time_interval = max_limit - low_limit;
	if( time_interval > 9){
		time_interval=Math.round(time_interval/9);
	}else{
		time_interval=1;
	}
	// get the canvas element
	var canvas=document.getElementById("myCanvas");
	
	// get the canvas width
	var x_interval = 95;
	var w = canvas.width;
	
	// fix the canvas height to fit all the waves
	var y_interval = 40;
	canvas.height = y_interval*window.selected_signals.length+40;
	var h = canvas.height;
	// start from (5,20)
	var x=5;
	var y=20;
	
	// init. the drawing colours and fonts
	var ctx=canvas.getContext("2d");
	// fill the canvas with color : white
	ctx.fillStyle = "#fff";
	ctx.fillRect(0,0,w,h);
	// init. stroke and fill colors : black
	ctx.fillStyle = "#000";
	ctx.strokeStyle = "#000";
	// init. font style : Times New Roman, size : 12px
	ctx.font="12px 'Times New Roman'";
	
	$.each(window.selected_signals, function( i, index ) {
		
		// draw the names of the waveforms
		ctx.moveTo(x,y);
		ctx.fillText(signal_data[index]['name'],x,y);
		
		// move through x for the waveform
		x=x+x_interval;
		// calculate the length of each pulse
		x_interval=650 / (max_limit - low_limit) ;
		
		// draw the wave form
		//  for each time frame in the signal
		$.each(signal_data[index], function( current_time, value ) {
			if(value != -1){
				old_value = value;
			}
			if(!isNaN(current_time) && current_time >= low_limit*time_frame && current_time <= max_limit*time_frame){
				ctx.strokeStyle = "#000";
				
				if(first_signal==1){
					if(time_counter==0){
						if(time_offset_y == 15){
							time_offset_y = 0;
						}else{
							time_offset_y=15;
						}
						ctx.beginPath();
						ctx.strokeStyle = "#aaa";
						ctx.moveTo(x,0);
						ctx.lineTo(x,h-40+time_offset_y);
						ctx.stroke();
						ctx.closePath();
						x_time=x- ((current_time.length / 2) +1)*5;
						ctx.fillText(current_time+signal_data['time_info']['timescale'],x_time,h-35+time_offset_y);
						time_counter=time_interval;
					}else{
						time_counter--;
					}
					
				}
				
				// begin path for the pulse
				ctx.beginPath();
				// default pulse color : black
				ctx.strokeStyle = "#000";	
				
				if(signal_data[index]['length']==1){
					if(value == -1){
						value = old_value;
					}
					
					// fix the pulse height depending the value
					if (value==1){
						pulse_height=-10;
					}else if(value==0){
						pulse_height=10;
					}else if(value=='U'){
						// unknown value pulse height : 0, color : red 
						pulse_height =0;
						ctx.strokeStyle = "#f00";
					}
					
					if(old_pulse_height == -1){
						old_pulse_height = pulse_height;
					}
					
					// create the horizontal pulse for this time frame 
					ctx.moveTo(x, y+ pulse_height);
					ctx.lineTo(x+x_interval, y+ pulse_height);
					// create the vertical pulse for this time frame
					ctx.moveTo(x, y+ old_pulse_height);
					ctx.lineTo(x, y+ pulse_height);
					
				}else{
					if(value == -1){
						value = old_value;
						x_multi_intervals = x_interval + x_multi_intervals;
					}else{
						if(first_timeframe != 1){
							if(old_multivalue_named.match(/bU.*/g)){
								value_length=old_multivalue_named.length*10;
							}else{
								value_length=old_multivalue_named.length*8;
							}
							if(value_length < x_multi_intervals){
								ctx.fillText(old_multivalue_named,x-x_multi_intervals+5,y+5);
							}							
						}
						x_multi_intervals=x_interval;
						ctx.moveTo(x, y+10);
						ctx.lineTo(x, y-10);
						ctx.moveTo(x+1.5, y-1.5);
						ctx.arc(x, y, 3, 0, 2 * Math.PI, false);
					}
					
					if( old_value.match(/bU.*/g)){
						ctx.strokeStyle = "#f00";
					}
					
					ctx.moveTo(x, y+10);
					ctx.lineTo(x+x_interval, y+10);
					ctx.moveTo(x, y-10);
					ctx.lineTo(x+x_interval, y-10);
				}
				
				x=x+x_interval;
				old_pulse_height=pulse_height;
				
				ctx.stroke();
				ctx.closePath();
				first_timeframe=0;
			}
			
			if((current_time >= max_limit*time_frame || current_time == signal_data['time_info']['duration']) && last_frame==1){
				last_frame=0;
				if(signal_data[index]['length']>1){
					if(old_value.match(/bU.*/g)){
						value_length=old_value.length*10;
					}else{
						value_length=old_value.length*8;
					}
					if(value_length < x_multi_intervals){
						ctx.fillText(old_value,x-x_multi_intervals+5,y+5);
					}
				}
				
				if(time_offset_y == 15){
					time_offset_y = 0;
				}else{
					time_offset_y=15;
				}
				
			}
			
			old_multivalue_named=old_value;
		});
		
		
		// reinit some values and move through the y axis
		y=y+40;
		x=5;
		x_interval = 95;
		old_pulse_height=-1;
		old_value =-1;
		first_signal=0;
		first_timeframe=1;
		x_multi_intervals=0;
		last_frame=1;
	});
	
	// draw all the lines in the canvas
	
	// Create a jpg image of the canvas
	var img = canvas.toDataURL("image/jpg");
	document.getElementById("myimage").innerHTML='<img src="'+img+'"/>';
	
	// Save canvas to buffer
	var buffer = document.getElementById("bufferCanvas");
	buffer.width = canvas.width;
	buffer.height = canvas.height;
	context = buffer.getContext('2d');	
	context.drawImage(canvas, 0,0);
}
