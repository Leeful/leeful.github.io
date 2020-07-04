<?php
$get_flag = true;
if(isset($_SERVER["HTTP_REFERER"])){
	$ref = $_SERVER["HTTP_REFERER"];
	if(!preg_match("/^(http:\/\/kood\.info\/|http:\/\/localhost\/)/",$ref)){
		$get_flag = false;
	}
}else{
	$get_flag = false;
}
//$get_flag = true;

if(isset($_GET["url"]) && preg_match("/^https?:/",$_GET["url"]) && $get_flag){
	$options["ssl"]["verify_peer"]=false;
	$options["ssl"]["verify_peer_name"]=false;
	if(!isset($_GET["no_ua"])){
		$options = [
			"http" => [
				"header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36",
			],
		];
	}
	$response = file_get_contents($_GET["url"], false, stream_context_create($options));
	echo $response;
}else{
	echo "";
}