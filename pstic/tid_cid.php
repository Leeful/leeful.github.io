<?php

if(isset($_GET["tid"])){
	$tid = $_GET["tid"];
	if(preg_match("/[a-zA-Z]{4}\d{5}/",$tid)){
		$json = file_get_contents("json/ps3_psp_psv_psx_tid_cid.json");
		$json = json_decode($json,true);
		$index = array_search($tid,array_column($json,"tid"));
		if($index!=""){
			echo $json[$index]["cid"];
		}
	}
}