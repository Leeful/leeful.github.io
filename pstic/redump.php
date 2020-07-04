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

if(isset($_GET["tid"]) && $get_flag){
	//送信データ
	$data = array(
		"quicksearch" => $_GET["tid"]
	);
	// URLエンコードされたクエリ文字列を生成
	$data = http_build_query($data, "", "&");
	// ストリームコンテキストのオプションを作成
	$options = array(
			// HTTPコンテキストオプションをセット
			"http" => array(
				"method"=> "POST",
				"header"=> "Content-Type: application/x-www-form-urlencoded",
				"content" => $data
			)
	);
	// ストリームコンテキストの作成
	$context = stream_context_create($options);
	// POST送信
	$response = file_get_contents("http://redump.org/results/", false, $context);
	echo $response;
}else{
    echo "";
}