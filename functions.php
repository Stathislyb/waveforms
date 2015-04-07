<?php

function read_vcd(){
	$data = array();
	$module = "";
	$time_interval_couter=0;
	$changes_at_time=0;
	$timescale='s';
	$testbench_timestamp = filemtime("testbench.vcd");

	if(file_exists($testbench_timestamp.'.json') ){
		echo file_get_contents($testbench_timestamp.'.json');
	}else{
		$handle = fopen("testbench.vcd", "r");
		if($handle){
			while (($line = fgets($handle)) !== false) {
				// if the line is timescale definition, keep it to the time information
				if(  preg_match('/^  1 .*/',$line) === 1){
					// trim unnecessary parts and keep the timescale units
					$timescale = trim(str_replace('1',"",$line));
				}
				
				// if the line is module definition, add that module to the path
				if(  preg_match('/^\$scope module .*/',$line) === 1){
					// trim unnecessary parts and keep the module's name
					$line = str_replace('$scope module ',"",$line);
					$module .= "_-_".trim(str_replace(' $end',"",$line));
				}
				
				// if the line is module ending, remove the last module from the path
				if(  preg_match('/^\$upscope \$end/',$line) === 1){
					// get the index of the last slash "/"
					$pos = strrpos($module, "_-_");
					// get the substring from index 0 to $pos-1
					$module = substr($module, 0, $pos );
				}
				
				// if the line defines a variable
				if( preg_match('/^\$var reg .*/',$line) === 1){
				
					// trim the unnecessary parts
					$line=str_replace(' $end',"",$line);
					$line=str_replace('$var reg ',"",$line);
					// and split the line to the var's length,
					//  the var's symbol and it's name
					$str_array=explode(" ",$line);
					$data[$str_array[1]] = array(
						"name" => trim($str_array[2]),
						"length" => trim($str_array[0]),
						"module" => $module
					);
				}
				
				// if the line is time for value changes
				if(  preg_match('/^#\d+/',$line) === 1){
					// keep the time of the changes
					$changes_at_time = trim(str_replace('#',"",$line));
					
					foreach ($data as &$signal) {
						$signal[$changes_at_time] = -1;
					}
					
					$time_interval_couter++;
				}
				
				// if the line is a variable change value
				if( preg_match('/^\d.*/',$line) === 1 || preg_match('/^U.*/',$line) === 1 ){
					// save the new value in the array
					$data[trim(substr($line,1))][$changes_at_time]=trim($line[0]);

				}
				if( preg_match('/^bU.*/',$line) === 1 || preg_match('/^b\d.*/',$line) === 1 ){

					// get the change value and it's symbol
					$str_array=explode(" ",$line);
					
					// save the new value in the array
					$data[trim($str_array[1])][$changes_at_time]=trim($str_array[0]);

				}
			}
		}else{
			echo "Could not open file";
		} 
		fclose($handle);
		
		$data['time_info']= array(
			"duration" => $changes_at_time,
			"intervals" => $time_interval_couter,
			"timescale" => $timescale
		);
		
		$fp = fopen($testbench_timestamp.'.json', 'w') or die("Unable to open file!");
		fwrite($fp, json_encode($data));
		fclose($fp);
		echo json_encode($data);
	}
}

if(isset($_GET['read_vcd'])){
	read_vcd();
} 

?>