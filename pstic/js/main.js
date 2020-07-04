const tid_reg = /[a-zA-Z]{4}\d{5}/;
const cid_reg = /[a-zA-Z]{2}\d{4}-[a-zA-Z]{4}\d{5}_(\d{2}|[a-zA-Z]{2})-[a-zA-Z0-9]{16}/;
const notfound ="<span class='notfound'> (404...)</span>";
var tid; // タイトルID
var cid_array; // コンテンツIDの配列(各チェックで異なるコンテンツIDを取得する事があるため配列)
var prod_url; // PS Storeの製品ページのURL
var output1; // 入力値から分かる情報等の出力場所
var output2; // ソニーのゲーム紹介ページから取得した情報の出力場所
var output3; // GameFAQsのリリース情報ページから取得した情報の出力場所
var output4; // Tmdbのxml/jsonから取得した情報の出力場所
var output5; // Updateのxmlから取得した情報の出力場所
var output6; // Chihiroのjsonから取得した情報の出力場所
var output7;　// Redumpから取得した情報の出力場所
var output8;　// PSXDatacenterから取得した情報の出力場所
var title_array; // タイトル名の配列(TumblerSearchで検索する際に使用)
var cid_region_array; // コンテンツIDのリージョンチェックの実行判定用(PS4,PSVideo)
var console_name; // ハード或いは種別の名前を格納(ps1_2,ps3,ps4,psp,vita,psm,video)
var chi_region; // リージョンからPS Storeの国コード/言語コードを決定する際に使用
var chi_cl; // PS Storeの国コード/言語コードを格納
var chi_hist_array; // ChihiroのURLを格納。一度チェックしたURLの判定に使用
var chi_cid_index; // ChihiroCheckでcid_arrayのコンテンツIDを取り出す際の添字の格納
var chi_out_cid; // ChihiroCheckに成功したコンテンツIDを格納。ReChihiroCheckで使用
var tid_j_hist_array; // tid_cid.phpに渡したタイトルIDを格納。一度チェックしたタイトルIDの判定に使用
var create_search_word_flag; // TumblerSearchの検索ワード作成実行の判定に使用
var tumb_search_array; // TumblerSearchの検索条件の格納([word,chi_cl,title_array,cid_array])
var tumb_search_index; // tumb_search_arrayから検索条件を取り出す際の添字の格納
var tumb_hit_flag; // TumblerSearchでコンテンツIDを発見したかどうかの判定に使用
var ps1c_flag // PS1Classicsの判定(tid_cid.jsonのチェック用)
var ps4_v_phys_flag // PS4のBDのID,PSVitaのカードのIDの判定 (変更有り)
var ps4_v_phys_flag_fix // PS4のBDのID,PSVitaのカードのIDの判定 (変更無し)
var ps4_tc_flag; // PS4のタイトルID入力時にchihiroのtitlecontainerのURLを作成するための判定

/* イニシャライズ */
function GlbVarInit(num){
	switch(num){
		case 1:
			/* IdCheck用 */
			cid_array = [];
			output1 = $("#output1");
			output2 = $("#output2");
			output3 = $("#output3");
			output4 = $("#output4");
			output5 = $("#output5");
			output6 = $("#output6");
			output7 = $("#output7");
			output8 = $("#output8");
			title_array = [];
			cid_region_array = [];
			console_name = null;
			chi_region = null;
			chi_cl = null;
			chi_hist_array = [];
			chi_cid_index = 0;
			chi_out_cid = null;
			tid_j_hist_array = [];
			create_search_word_flag = true;
			tumb_search_array = [];
			tumb_search_index = 0;
			tumb_hit_flag = false;
			ps1c_flag = false;
			ps4_v_phys_flag = false;
			ps4_v_phys_flag_fix = false;
			ps4_tc_flag = false;
			break;
		case 2:
			/* EnableInput用 */
			tid = undefined;
			cid_array = undefined;
			prod_url = undefined;
			title_array = undefined;
			cid_region_array = undefined;
			console_name = undefined;
			chi_region = undefined;
			chi_cl = undefined;
			chi_hist_array = undefined;
			chi_cid_index = undefined;
			chi_out_cid = undefined;
			tid_j_hist_array = undefined;
			create_search_word_flag = undefined;
			tumb_search_array = undefined;
			tumb_search_index = undefined;
			tumb_hit_flag = undefined;
			ps1c_flag = undefined;
			ps4_v_phys_flag = undefined;
			ps4_v_phys_flag_fix = false;
			ps4_tc_flag = undefined;
			break;
	}
}

/* input_areaへの入力 - 無効 */
function DisableInput(){
	$("#input_id").prop("disabled",true);
	$("#tmdb").prop("disabled",true);
	$("#update").prop("disabled",true);
	$("#chihiro").prop("disabled",true);
	$("#chihiro_sb").prop("disabled",true);
	$("#official").prop("disabled",true);
	$("#official_sb").prop("disabled",true);
	$("#redump").prop("disabled",true);
	$("#psxdc").prop("disabled",true);
	$("#reset").prop("disabled",true);
}

/* input_areaへの入力 - 有効 */
function EnableInput(){
	$("#input_id").prop("disabled",false);
	$("#tmdb").prop("disabled",false);
	$("#update").prop("disabled",false);
	$("#chihiro").prop("disabled",false);
	$("#chihiro_sb").prop("disabled",false);
	$("#official").prop("disabled",false);
	$("#official_sb").prop("disabled",false);
	$("#redump").prop("disabled",false);
	$("#psxdc").prop("disabled",false);
	$("#reset").prop("disabled",false);
	$("#input_id").focus();
	$("#reset").show();
	$("#reset").on("click",function(){
		GlbVarInit(2);
		EmptyOa();
		$("#input_id").val("");
		$("#input_id").focus();
	})	
}

/* 指定の或いは全出力場所の中身を空に */
function EmptyOa(num){
	if(num!=undefined){
		if(num.length==undefined){
			const oa_id = "output" + num;
			$("#"+oa_id).empty();
		}else{
			// numが配列の場合
			$.each(num,function(i,n){
				const oa_id = "output" + n;
				$("#"+oa_id).empty();
			})
		}
	}else{
		$("#output_area ul").empty();
	}
}

/* index.htmlから実行 */
function IdCheck(input_id,id_type,manual){
	DisableInput();
	/* イニシャライズ */
	GlbVarInit(1);
	/* 各出力場所の中身を空に */
	EmptyOa();
	/* OfficialCheckでoutput2が移動している可能性があるため、元に戻す */
	$("#output2").insertAfter("#output1");
	/* ID,URLを変数に格納 */
	switch(id_type){
		case "title":
			tid = input_id;
			prod_url = null;
			break;
		case "content":
			tid = input_id.match(tid_reg)[0];
			cid_array.push(input_id);
			prod_url = null;
			break;
		case "url":
			cid_array.push(input_id.match(cid_reg)[0].toUpperCase());
			tid = cid_array[0].match(tid_reg)[0];
			prod_url = input_id;					
			break;
	}
	/* タイトルIDの出力 */
	OutputItem(output1,"Title ID",tid);
	/* コンテンツIDの出力 */
	if(cid_array.length==1) OutputItem(output1,"Content ID",cid_array[0]);
	/* 各種チェックの実行 */
	if(manual!=undefined){
		ManualMode(manual);
	}else{
		const tid_0_4 = tid.slice(0,4);
		const tid_0_3 = tid.slice(0,3);
		const tid_0_2 = tid.slice(0,2);
		switch(tid_0_2){
			/* PS1,PS2 Disc */
			case "SC":
			case "SL":
			case "SR":
			case "SI":
			case "TL":
			case "TC":
			case "PA":
			case "PB":
			case "PD":
				console_name = "ps1_2";
				var media;
				if(tid_0_2=="SI"){
					media = "PS1 CD";
				}else{
					media = "PS1/PS2 Disc";
				}
				OutputItem(output1,"Media",media);
				PhysicalMedia();
				PS1PS2_main();
				break;
			case "PE":
			case "PT":
			case "PU":
				console_name = "ps1_2";
				OutputItem(output1,"Media","PS1/PS2 Disc");
				PhysicalMedia();
				PS1PS2_main();
				break;
			case "PS":
				if(tid_0_4=="PSXC"){
					// PSXC00201～00204
					console_name = "ps1_2";
					OutputItem(output1,"Media","PS2(PSX) Disc");
					PhysicalMedia();
					PS1PS2_main();
				}else{
					// 該当するIDがあるのかは不明。念の為
					OutputItem(output1,"Media",null);
					PhysicalMedia();
					UnknownConsole_main();
				}
				break;
			/* PS3 BD */
			case "BC":
			case "BL":
				console_name = "ps3";
				OutputItem(output1,"Media","PS3 BD");
				PhysicalMedia();
				PSPPS3_main();
				break;
			/* PS3 BD (It means Multi Region Title C....?) */
			case "MR":
				console_name = "ps3";
				OutputItem(output1,"Media","PS3 BD");
				PhysicalMedia();
				PSPPS3_main();
				break;
			/* PS3 BD + Extras (PSVita crossbuy) */
			case "XC": 
			case "XL":
				console_name = "ps3";
				OutputItem(output1,"Media","PS3 BD + Extras (PSVita crossbuy)");
				PhysicalMedia();
				PSPPS3_main();
				break;
			/* PS4 BD */
			case "CU":
				console_name = "ps4";
				OutputItem(output1,"Media","PS4 BD/Digital");
				CID_RegionCheck(output1,cid_array[0]);
				if(cid_array.length==0 && prod_url==null){
					ps4_tc_flag = true;
				}
				PS4_main();
				break;
			/* PS4 BD , PSVita , PS1,PS2 Disc */
			case "PC":
			case "PL":
				if(tid_0_3=="PCS"){
					console_name = "vita";
					OutputItem(output1,"Media","PSVita Card/Digital");
					PSVITA_RegionTypeCheck();
					PSVITA_main();
				}else if(tid_0_3=="PCP"){
					console_name = "ps1_2";
					OutputItem(output1,"Media","PS1/PS2 Disc");
					PhysicalMedia();
					PS1PS2_main();
				}else{
					console_name = "ps4";
					OutputItem(output1,"Media","PS4 BD");
					ps4_v_phys_flag = true;
					ps4_v_phys_flag_fix = true;
					PhysicalMedia();
					if(cid_array.length==0 && prod_url==null){
						ps4_tc_flag = true;
					}
					PS4_main();
				}
				break;
			/* PSP UMD */
			case "UC": 
			case "UL":
				console_name = "psp";
				OutputItem(output1,"Media","PSP UMD");
				PhysicalMedia();
				PSPPS3_main();
				break;
			/* PSVita Card */
			case "VC": 
			case "VL":
				console_name = "vita";
				OutputItem(output1,"Media","PSVita Card");
				ps4_v_phys_flag = true;
				ps4_v_phys_flag_fix = true;
				PhysicalMedia();
				PSVITA_main();
				break;
			/* PSVita System, PS4 System, PSM, PSP/PS3 DL, PS1/PS2 Classics */
			case "NP":
				const tid_0_5 = tid.slice(0,5);
				if(tid_0_5=="NPXS1"){
					console_name = "vita";
					OutputItem(output1,"Media","PSVita Digital");
					PSVITA_main();
				}else if(tid_0_5=="NPXS2" || tid_0_5=="NPXS3"){
					console_name = "ps4";
					OutputItem(output1,"Media","PS4 Digital");
					if(cid_array.length==0 && prod_url==null){
						ps4_tc_flag = true;
					}
					PS4_main();
				}else{
					psm_flag = PSM_Check();
					if(!psm_flag){
						if(tid_0_3=="NPM" || tid_0_3=="NPV"){
							/* PS Video (NPMA,NPVA,NPVB) */
							console_name = "video";
							OutputItem(output1,"Media","Digital (Video)");
							CID_RegionCheck(output1,cid_array[0]);
							PSVIDEO_main();
						}else{
							PSPPS3_NP_RegionCheck();
							PSPPS3_NP_TypeCheck();
							PSPPS3_main();
						}
					}else{
						/* PSMのIDで何をやれば良いのか分からないため、ここで終了 */
						console_name = "psm";
						EnableInput();
					}
				}
				break;
			default :
				OutputItem(output1,"Media",null);
				UnknownConsole_main();
				break
		}
	}
}

/* コンテンツIDがcid_arrayに存在するかどうかの判定、無ければ格納 */
function NewCidPush(cid){
	var new_cid_flag = false;
	if(cid_array.indexOf(cid)==-1){
			cid_array.push(cid);
			new_cid_flag = true;
	}
	return new_cid_flag;
}

/* CD/DVD/BD/UMD/Card */
function PhysicalMedia(){
	PhysicalMedia_RegionCheck();
	PhysicalMedia_TypeCheck();
}

/* CD/DVD/BD/UMD/Card */
function PhysicalMedia_RegionCheck(){
	var right,region;
	switch(tid.slice(1,2)){
		case "C":
			right = "First Party";
			break;
		case "L":
			right = "Third Party";
			break;
	}
	switch(tid.slice(2,3)){
		case "A":
			region = "Asia";
			chi_region = "ASIA";
			break;
		case "E":
			region = "Europe";
			chi_region = "EU";
			break;
		case "J":
			region = "Japan";
			chi_region = "JP";
			break;
		case "H":
			region = "Hong Kong";
			chi_region = "HK";
			break;
		case "K":
			region = "Korea";
			chi_region = "KR";
			break;
		case "U":
			region = "USA";
			chi_region = "US";
			break;
		case "P":	/* PS1/PS2 */
			switch(tid.slice(0,3)){
				case "PAP":
				case "PBP":
				case "PDP":
				case "PEP":
				case "PTP":
				case "PUP":
				case "PSX":
					break;
				case "PCP":
					right = undefined;
					break;
				default:
					region = "Japan";
					chi_region = "JP";
					break;
			}
			break;
	}
	if(tid.substring(0,4)=="MRTC"){
		OutputItem(output1,"Region","? (Multi Region/Multi Language?)");
	}else{
		OutputItem(output1,"Region",region);
	}
	OutputItem(output1,"Rights",right)
}

/* CD/DVD/BD/UMD/Card */
function PhysicalMedia_TypeCheck(){
	var type;
	switch(tid.substring(3,4)){
		case "B":
			type = "Peripheral Software";
			break;
		case "C":
			type = "System Firmware";
			break;
		case "D":
			type = "Demo";
			break;
		case "M":
			type = "Retail release";
			break;
		case "S":
			type = "Retail release";
			break;
		case "T":
			type = "(closed) Betas";
			break;
		case "V":
			type = "Multi Region PS3 CS disc";
			break;
		case "X":
			type = "Demos, Store Videos, etc...?";
			break;
		case "Z":
			type = "Region locked PS3 CS disc";
			break;
	}
	if(tid.substring(0,4)=="MRTC"){
		OutputItem(output1,"Type","Multi Region Title C....?");
	}else{
		OutputItem(output1,"Type",type);
	}
}

/* PSM - NPNx,NPOx,NPPx,NPQx */
function PSM_Check(){
	var region;
	var psm_flag = true;
	switch(tid.slice(2,3)){
		case "N":
			region = "USA";
			chi_region = "US";
			break;
		case "O":
			region = "Europe";
			chi_region = "EU";
			break;
		case "P":
			region = "Japan";
			chi_region = "JP";
			break;
		case "Q":
			region = "Asia";
			chi_region = "ASIA";
			break;
		default :
			psm_flag = false;
		 break;
	}
	if(region!=undefined){
		OutputItem(output1,"Media","Digital(PSM)");
		OutputItem(output1,"Region",region);
	}
	return psm_flag;
}

/* PSVita - PCSxYYYYY */
function PSVITA_RegionTypeCheck(){
	var region,right;
	switch(tid.slice(3,4)){
		case "A":
			region ="USA";
			right = "First Party";
			chi_region = "US";
			break;
		case "B":
			region ="Europe";
			right = "Third Party";
			chi_region = "EU";
			break;
		case "C":
			region ="Japan";
			right = "First Party";
			chi_region = "JP";
			break;
		case "D":
			region ="Asia/Korea";
			right = "First Party";
			chi_region = "ASIA";
			break;
		case "E":
			region ="USA";
			right = "Third Party";
			chi_region = "US";
			break;
		case "F":
			region ="Europe";
			right = "First Party";
			chi_region = "EU";
			break;
		case "G":
			region ="Japan";
			right = "Third Party";
			chi_region = "JP";
			break;
		case "H":
			region ="Asia/Korea";
			right = "Third Party";
			chi_region = "ASIA";
			break;
		case "I":
			region ="Internal (Sony)";
			right = "First Party";
			chi_region = "US";
			break;
	}
	OutputItem(output1,"Region",region);
	OutputItem(output1,"Rights",right);
}

/* PSP,PS3 - NPxx */
function PSPPS3_NP_RegionCheck(){
	var region;
	switch(tid.slice(2,3)){
		case "A":
			region = "Asia";
			chi_region = "ASIA";
			break;
		case "E":
			region = "Europe";
			chi_region = "EU";
			break;
		case "J":
			region = "Japan";
			chi_region = "JP";
			break;
		case "H":
			region = "Hong Kong";
			chi_region = "HK";
			break;
		case "K":
			region = "Korea";
			chi_region = "KR";
			break;
		case "U":
			region = "USA";
			chi_region = "US";
			break;
		case "I":
			region = "Internal (Sony)";
			chi_region = "US";
			break;
		case "X":
			region = "(Firmware/SDK Sample)";
			break;
	}
	OutputItem(output1,"Region",region);
}

/* PSP,PS3 - NPxx */
function PSPPS3_NP_TypeCheck(){
	var type;
	var ps3_flag = false;
	switch(tid.slice(3,4)){
		case "A":
			type = "First Party PS3";
			ps3_flag = true;
			break;
		case "B":
			type = "Third Party PS3";
			ps3_flag = true;
			break;
		case "C":
			type = "First Party PS2 Classic";
			ps3_flag = true;
			break;
		case "D":
			type = "Third Party PS2 Classic";
			ps3_flag = true;
			break;
		case "E":
			type = "Third Party PS1 Classic (PAL)";
			ps1c_flag = true;
			break;
		case "F":
			type = "First Party PS1 Classic (PAL)";
			ps1c_flag = true;
			break;
		case "G":
			type = "First Party PSP";
			console_name = "psp";
			break;
		case "H":
			type = "Third Party PSP";
			console_name = "psp";
			break;
		case "I":
			type = "First Party PS1 Classic (NTSC)";
			ps1c_flag = true;
			break;
		case "J":
			type = "Third Party PS1 Classic (NTSC)";
			ps1c_flag = true;
			break;
		case "K":
			type = "First Party Game related Content";
			break;
		case "L":
			type = "Third Party Game related Content";
			break;
		case "M":
			type = "Music";
			break;
		case "N":
			type = "Game Soundtracks";
			break;
		case "O":
			type = "Other";
			break;
		case "P":
		case "Q":
		case "R":
			type = "?";
			break;
		case "S":
			type = "System";
			break;
		case "T":
		case "U":
		case "V":
			type = "?";
			break;
		case "W":
			type = "First Party PSP Remasters";
			ps3_flag = true;
			break;
		case "X":
			type = "First Party PSP Minis";
			ps3_flag = true;
			break;
		case "Y":
			type = "Third Party PSP Remasters";
			ps3_flag = true;
			break;
		case "Z":
			type = "Third Party PSP minis";
			ps3_flag = true;
			break;
	}
	if(tid.slice(0,4)=="NPEJ"){
		type = "Third Party PS3";
		ps3_flag = true;
		ps1c_flag = false;
	}
	if(ps1c_flag){
		console_name = "ps3";
	}
	var media = "PSP,PS3 Digital";
	if(ps3_flag){
		media = "PS3 Digital";
		console_name = "ps3";
	}else if(console_name=="psp"){
		media = "PSP Digital";
	}else{
		console_name = "ps3";
	}
	OutputItem(output1,"Media",media);
	OutputItem(output1,"Type",type);
}

/* PS4, PS Video */
function CID_RegionCheck(out,cid){
	if(cid!=null && cid!=undefined){
		const cid_0_6 = cid.match(/[a-zA-Z]{2}\d{4}/,"")[0];
		if(cid_region_array.indexOf(cid_0_6)==-1){
			cid_region_array.push(cid_0_6);
			var region;
			switch(cid.slice(0,1)){
				case "J":
					region ="Japan";
					chi_region = "JP";
					break;
				case "U":
					region ="USA";
					chi_region = "US";
					break;
				case "E":
					region ="Europe";
					chi_region = "EU";
					break;
				case "H":
					region ="Asia";
					chi_region = "ASIA";
					break;
				case "K":
					region ="Korea";
					chi_region = "KR";
					break;
				case "I":
					region ="Internal";
					chi_region = "US";
					break;
			}
			OutputItem(out,"Region",region);
		}
	}
}

/* PS4 - 各種チェックの実行 */
function PS4_main(){
	PS4BD_PSVCard_TidSearch().then(
		function(){
			return $.Deferred().resolve().promise();
		},function(){
			const notice = "The CUSA format Title ID is not found.";
			OutputNotice(output1,notice);
			return $.Deferred().resolve().promise();
		}
	).then(
		function(){
			var def = $.Deferred();
			PS3PS4_TmdbCheck(def);
			return def.promise();
		}
	).then(
		function(data){
			var def = $.Deferred();
			PS4_TmdbOut(data,def);
			return def.promise();
		},function(){
			return $.Deferred().resolve().promise();
		}
	).then(
		function(){
			var def = $.Deferred();
			PS4_UpdateCheck(def);
			return def.promise();
		}
	).then(
		function(data){
			var def = $.Deferred();
			PS4_UpdateOut(data,def);
			return def.promise();
		},function(){
			return $.Deferred().resolve().promise();
		}
	).then(
		function(){
			var def = $.Deferred();
			ChihiroCheck(def);
			return def.promise();
		}
	).then(
		function(data,chihiro_json_url){
			var def = $.Deferred();
			ChihiroOut(data,chihiro_json_url,def);
			return def.promise();
		},function(){
			return $.Deferred().resolve().promise();
		}
	).then(
		function(){
			EnableInput();
		}
	);
}

/* PSP,PS3 - 各種チェックの実行 */
function PSPPS3_main(){
	(function(){
		var def = $.Deferred();
		PS3PS4_TmdbCheck(def);
		return def.promise();
	}()).then(
		function(data){
			var def = $.Deferred();
			PS3_TmdbOut(data,def);
			return def.promise();
		},function(){
			return $.Deferred().resolve().promise();
		}	
	).then(
		function(){
			var def = $.Deferred();
			PSPPS3_UpdateCheck(def);
			return def.promise();
		}
	).then(
		function(data){
			var def = $.Deferred();
			PSPPS3_UpdateOut(data,def);
			return def.promise();
		},function(){
			return $.Deferred().resolve().promise();
		}
	).then(
		function(){
			var def = $.Deferred();
			ChihiroCheck(def);
			return def.promise();
		}
	).then(
		function(data,chihiro_json_url){
			var def = $.Deferred();
			ChihiroOut(data,chihiro_json_url,def);
			return def.promise();
		},function(){
			return $.Deferred().resolve().promise();
		}
	).then(
		function(){
			var def = $.Deferred();
			GetOfficial_PS3PSPPSVITA(def,[],0);
			return def.promise();
		}
	).then(
		function(){
			var def = $.Deferred();
			const first_tid = $("#output1_Title_ID .item").text();
			if(console_name=="psp" && first_tid.indexOf("NP")==-1){
				RedumpCheck(def);
			}else{
				return $.Deferred().resolve().promise();
			}
			return def.promise();
		}
	).then(
		function(){
			EnableInput();
		}
	);
	
}

/* PS1,PS2 - 各種チェックの実行 */
function PS1PS2_main(){
	(function(){
		var def = $.Deferred();
		if(tid.indexOf("SLUS")==0){
			PS3PS4_TmdbCheck(def);
		}else{
			def.reject();
		}
		return def.promise();
	}()).then(
		function(data){
			var def = $.Deferred();
			PS3_TmdbOut(data,def);
			return def.promise();
		},function(){
			return $.Deferred().resolve().promise();
		}	
	).then(
		function(){
			var def = $.Deferred();
			if($("#official").prop("checked")){
				GetOfficial(def,tid);
			}else{
				def.reject();
			}
			return def.promise();
		}
	).then(
		function(official_url,data){
			var def = $.Deferred();
			OutputOfficial(official_url,data,def);
			return def.promise();
		},function(){
			return $.Deferred().resolve().promise();
		}
	).then(
		function(){
			var def = $.Deferred();
			if(cid_array.length>0){
				ChihiroCheck(def);
			}else{
				def.reject();
			}
			return def.promise();
		}
	).then(
		function(data,chihiro_json_url){
			var def = $.Deferred();
			ChihiroOut(data,chihiro_json_url,def);
			return def.promise();
		},function(){
			return $.Deferred().resolve().promise();
		}
	).then(
		function(){
			var def = $.Deferred();
			RedumpCheck(def);
			return def.promise();
		}
	).then(
		function(){
			var def = $.Deferred();
			PSXDcCheck(def);
			return def.promise();	
		}
	).then(
		function(psxdc_url,data){
			var def = $.Deferred();
			PSXDcOut(psxdc_url,data,def);
			return def.promise();
		},function(){
			return $.Deferred().resolve().promise();
		}
	).then(
		function(){
			EnableInput();
		}
	);
};

/* PSVita - 各種チェックの実行 */
function PSVITA_main(){
	PS4BD_PSVCard_TidSearch().then(
		function(){
			return $.Deferred().resolve().promise();
		},function(){
			const notice = "The PCSx format Title ID is not found.";
			OutputNotice(output1,notice);
			return $.Deferred().resolve().promise();
		}
	).then(
		function(){
			var def = $.Deferred();
			PSVITA_UpdateCheck(def);
			return def.promise();
		}
	).then(
		function(data){
			var def = $.Deferred();
			PSVITA_UpdateOut(data,def);
			return def.promise();
		},function(){
			return $.Deferred().resolve().promise();			
		}
	).then(
		function(){
			var def = $.Deferred();
			ChihiroCheck(def);
			return def.promise();
		}
	).then(
		function(data,chihiro_json_url){
			var def = $.Deferred();
			ChihiroOut(data,chihiro_json_url,def);
			return def.promise();
		},function(){
			return $.Deferred().resolve().promise();
		}
	).then(
		function(){
			var def = $.Deferred();
			GetOfficial_PS3PSPPSVITA(def,[],0);
			return def.promise();
		}
	).then(
		function(){
			EnableInput();
		}
	);
	
}

/* PS Video - 各種チェックの実行 */
function PSVIDEO_main(){
	(function(){
		var def = $.Deferred();
		ChihiroCheck(def);
		return def.promise();
	}()).then(
		function(data,chihiro_json_url){
			var def = $.Deferred();
			ChihiroOut_Video(data,chihiro_json_url,def);
			return def.promise();
		},function(){
			return $.Deferred().resolve().promise();
		}
	).then(
		function(){
			EnableInput();
		}
	)
}

/* 未知のタイトルID - 各種チェックの実行 */
function UnknownConsole_main(){
	console_name = "unknown";
	chi_region = "JP";
	(function(){
		var def = $.Deferred();
		if($("#official").prop("checked")){
			GetOfficial(def,tid);
		}else{
			def.reject();
		}
		return def.promise();
	}()).then(
		function(official_url,data){
			var def = $.Deferred();
			OutputOfficial(official_url,data,def);
			return def.promise();
		},function(){
			return $.Deferred().resolve().promise();
		}
	).then(
		function(){
			var def = $.Deferred();
			ChihiroCheck(def);
			return def.promise();
		}
	).then(
		function(data,chihiro_json_url){
			var def = $.Deferred();
			ChihiroOut(data,chihiro_json_url,def);
			return def.promise();
		},function(){
			return $.Deferred().resolve().promise();
		}
	).then(
		function(){
			var def = $.Deferred();
			RedumpCheck(def);
			return def.promise();
		}
	).then(
		function(){
			EnableInput();
		}
	);
}

/* PS4のBD,PSVitaのカードのIDを用いて実際のタイトルIDの検索を試みる */
function PS4BD_PSVCard_TidSearch(){
	var def = $.Deferred();
	var result_official_url = null;
	var result_gamefaqs_url = null;
	if(ps4_v_phys_flag){
		console.log("--- OfficialPage/GameFAQs Check - 開始 ---");
		
		$.Deferred().resolve().promise().then(
			function(){
				var d = $.Deferred();
				GetOfficial(d,tid);
				return d.promise();
			}
		).then(
			function(official_url,data){
				var d = $.Deferred();
				OutputOfficial(official_url,data,d);
				return d.promise();
			},function(){
				console.log("--- OfficialPage/GameFAQs Check - 紹介ページのリダイレクト無し ---");
				return $.Deferred().resolve().promise();
			}
		).then(
			function(){
				if(!ps4_v_phys_flag){
					/* 旧仕様のURLでリダイレクトされそこからタイトルIDを取得出来た場合はPS4_main()に戻る */
					console.log("--- OfficialPage/GameFAQs Check - 終了 ---");
					def.resolve();
				}else{
					(function(){
						var d = $.Deferred();
						Scraping_SearchEngine(tid,d,1);
						return d.promise();
					}()).then(
						function(result_url_array){
							console.log("--- OfficialPage/GameFAQs Check - 検索エンジン結果有り ---");
							console.log(result_url_array);
							$.each(result_url_array,function(i,result_url){
								if(result_url.indexOf("jp.playstation.com/games/")>-1){
									result_official_url = result_url;
								}
								if(result_url.indexOf("gamefaqs.gamespot.com/")>-1){
									result_gamefaqs_url = result_url;
								}
							})
							if(result_official_url!=null && output2.text()==""){
								GetPageData(result_official_url).then(
									function(data){
										var d = $.Deferred();
										OutputOfficial(result_official_url,data,d);
										return d.promise();
									},function(){
										console.log("--- OfficialPage/GameFAQs Check - 紹介ページの取得失敗 ---");
										return $.Deferred().resolve().promise();
									}
								).then(
									function(){
										if(!ps4_v_phys_flag){
											/* 新仕様のURLでタイトルIDを取得出来た場合はPS4_main()に戻る */
											console.log("--- OfficialPage/GameFAQs Check - 終了 ---");
											def.resolve();									
										}else{
											/* GameFAQs */
											if(result_gamefaqs_url!=null){
												GetGameFAQs_Tid();
											}
										}
									}
								);
							}else if(result_gamefaqs_url!=null){
								/* GameFAQs */
								GetGameFAQs_Tid(result_gamefaqs_url);
							}else{
								console.log("--- OfficialPage/GameFAQs Check - 検索エンジン結果無し ---");
								console.log("--- OfficialPage/GameFAQs Check - 終了 ---");
								def.reject();
							}
						},function(){
							console.log("--- OfficialPage/GameFAQs Check - 検索エンジン結果無し ---");
							console.log("--- OfficialPage/GameFAQs Check - 終了 ---");
							def.reject();
						}
					);
				}
			}
		);
	}else{
		def.resolve(tid);
	}
	/* GameFAQsのリリース情報ページから情報を取得,出力 */
	function GetGameFAQs_Tid(gamefaqs_url){
		GetPageData(gamefaqs_url).then(
			function(data){
				OutputGameFAQs(gamefaqs_url,data,def);
			},function(){
				console.log("--- OfficialPage/GameFAQs Check - GameFAQsのリリース情報ページの取得失敗 ---");
				console.log("--- OfficialPage/GameFAQs Check - 終了 ---");
				def.reject();
			}
		)
	}
	return def.promise();
}

/* 旧仕様の紹介ページのURLを作成し、データを取得　*/
function GetOfficial(def,page_id){
	/* 
		https://www.jp.playstation.com/software/title/(タイトルID或いはコンテンツID).html 
		(新仕様はタイトルID/コンテンツIDの代わりにタイトル名が使用されており、htmlの内容も異なる)
		PS1,PS2,PSPタイトルはおそらくすべて旧仕様
		PS3,PS4,PSVitaタイトルは旧仕様と新仕様の両方があり、旧仕様のURLで新仕様にリダイレクトされるタイトルもある
		引数のpage_idはタイトルIDかコンテンツID
	*/
	if(chi_region=="JP"){
		const official_path = "https://www.jp.playstation.com/software/title/";
		var official_url = null;
		if(page_id.match(cid_reg)){
			page_id = page_id.toLowerCase().replace(/-/g,"");
			official_url = official_path + page_id + ".html";	
		}else{
			page_id = page_id.toLowerCase();
			official_url = official_path + page_id + ".html";	
		}
		GetPageData(official_url).then(
			function(data){
				if(data.indexOf("大変申し訳ございません。このページは削除")==-1){
					def.resolve(official_url,data);
				}else{
					/* 404(新仕様にリダイレクトされない場合を含む) */
					OfficialCheckNotice();
					def.reject();
				}
			},function(){
				OfficialCheckNotice();
				def.reject();
			}
		)
	}else{
		def.reject();
	}
	function OfficialCheckNotice(){
		if(console_name=="ps1_2" || console_name=="unknown"){
			const notice = "Official Page Check finished.<br>Couldn't find offcial page.";
			OutputNotice(output2,notice);
		}
	}
}

/* PS3,PSP,PSVita(PCSxYYYYY)で紹介ページのURLを作成し、データを取得 - Official Page Check */
function GetOfficial_PS3PSPPSVITA(def,check_id_array,check_index){
	var check_flag = false; // チェック実行フラグ
	const cb_flag = $("#official").prop("checked");
	const sb_val = $("#official_sb").val();
	if(cb_flag && sb_val=="ex"){
		check_flag = true;
	}
	/* チェック実行 */
	if(check_flag && !ps4_v_phys_flag && !ps4_v_phys_flag_fix && chi_region=="JP"){
		if(check_id_array.length==0){
			/* 初回はページのID(タイトルID,コンテンツID)の配列(check_id_array)を作成 */
			console.log("--- Official Page Check - ページのID候補の準備開始 ---");
			GetCidFromTid().then(
				function(cid){
					NewCidPush(cid);
					return $.Deferred().resolve().promise();
				},function(){
					return $.Deferred().resolve().promise();
				}
			).then(
				function(){
					if(console_name=="psp" || console_name=="ps3"){
						/* 入力したタイトルIDがNPxx以外であれば格納 */
						const first_tid = $("#output1_Title_ID .item").text();
						if(first_tid.indexOf("NP")==-1){
							check_id_array.push(first_tid);
						}
						/* tidに格納されたタイトルIDが入力したタイトルIDと異なりNPxx以外であれば格納 */
						if(tid!=first_tid && tid.indexOf("NP")==-1){
							check_id_array.push(tid);
						}
						/* NPxx形式のタイトルIDを持つコンテンツIDを格納 */
						$.each(cid_array,function(i,cid){
							const temp_tid = cid.match(tid_reg)[0];
							if(temp_tid.indexOf("NP")==0){
								check_id_array.push(cid);
							}
						})
					}else if(console_name=="vita"){
						/* コンテンツIDを格納 */
						$.each(cid_array,function(i,cid){
							check_id_array.push(cid);
						})
					}
					if(check_id_array.length>0){
						/* チェック実行 */
						console.log("--- Official Page Check - ページのID候補の準備完了 ---");
						GetOfficial_PS3PSPPSVITA(def,check_id_array,0);
					}else{
						/* チェック不可。main()に戻る */
						console.log("--- Official Page Check - ページのID候補無し。失敗 ---");
						OfficialCheckNotice();
						def.resolve();
					}
				}
			);
		}else{
			console.log("--- Official Page Check"+(check_index+1)+" - チェック開始 ---");
			/* 2回目以降の実行 */
			/* チェック終了後にChihiroCheckを行うか否かの判定用として準備 */
			const cid_array_len_save = cid_array.length;
			const title_array_len_save = title_array.length;
			/* チェック実行 */
			$.Deferred().resolve().promise().then(
				function(){
					var d = $.Deferred();
					GetOfficial(d,check_id_array[check_index]);
					return d.promise();
				}
			).then(
				function(official_url,data){
					var d = $.Deferred();
					OutputOfficial(official_url,data,d);
					return d.promise();
				},function(){
					check_index++;
					var d = $.Deferred();
					if(check_index<check_id_array.length){
						/* 再度チェック実行 */
						console.log("--- Official Page Check"+(check_index)+" - チェック再実行 ---");
						GetOfficial_PS3PSPPSVITA(def,check_id_array,check_index);
					}else{
						/* main()に戻る */
						console.log("--- Official Page Check"+(check_index)+" - 紹介ページ発見出来ず ---");
						OfficialCheckNotice();
						def.resolve();
					}
					/* 処理をここで止める(dはpending) */
					return d.promise();
				}
			).then(
				function(){
					console.log("--- Official Page Check"+(check_index+1)+" - 成功 ---");
					if(cid_array.length!=cid_array_len_save ||
						title_array.length!=title_array_len_save){
						/* ChihiroCheckが可能な場合は実行 */
						if(output6.text().length<80){
							ChihiroCheckCall();
						}else{
							/* main()に戻る */
							MoveOutput2();
							def.resolve();
						}
					}else{
						/* main()に戻る */
						MoveOutput2();
						def.resolve();
					}
				}
			)
		}
	}else{
		def.resolve();
	}
	/* ChihiroCheckの呼び出し */
	function ChihiroCheckCall(){
		console.log("--- Official Page Check"+(check_index+1)+" - ChihiroCheckを再実行 ---");
		$(".chihiro").remove();
		$(".search").remove();
		create_search_word_flag = true; // 検索ワードの再作成許可
		EmptyOa(6);
		$.Deferred().resolve().promise().then(
			function(){
				var d = $.Deferred();
				ChihiroCheck(d);
				return d.promise();
			}
		).then(
			function(data,chihiro_json_url){
				var d = $.Deferred();
				ChihiroOut(data,chihiro_json_url,d);
				return d.promise();
			},function(){
				return $.Deferred().resolve().promise();
			}
		).then(
			function(){
				/* main()に戻る */
				MoveOutput2();
				def.resolve();
			}
		)
	}
	/* Output2の移動 */
	function MoveOutput2(){
		if(output6.text().length<80){
			output2.insertAfter("#output5");
		}else{
			output2.insertAfter("#output6");
		}
	}
	function OfficialCheckNotice(){
		const notice = "Official Page Check finished.<br>Couldn't find offcial page.";
		OutputNotice(output2,notice);
		output2.insertAfter("#output6");
	}
}

/* 検索エンジンで紹介ページとGameFAQsのリリース情報ページのURLを探す */
function Scraping_SearchEngine(search_tid,def,type){
	/*
		type 1 ... Google検索
		type 2 ... Yahoo検索
		Google検索で何らかのエラーが発生した場合はYahoo検索実行
	*/
	console.log("--- OfficialPage/GameFAQs Check - 検索エンジン" + type + " ---");
	if(type==1 && search_tid.indexOf("-")==-1){
		search_tid = StrIns(tid,4,"-");
	}
	if(type==1){
		const search_str1 = "https://www.google.com/search?q=%22";
		const search_str2 = "%22+site%3Aplaystation.com+OR+site%3Agamefaqs.gamespot.com%22";
		const search_url = search_str1 + search_tid + search_str2;
		console.log("--- OfficialPage/GameFAQs Check - Google検索開始 ---");
		GetPageData(search_url).then(
			function(data){
				/* エラー防止 */
				data = data.replace(/(src="\/images\/)/g,'src="https://www.google.com/images/');
				data = data.replace(/(src="\/logos\/)/g,'src="https://www.google.com/logos/');
				if(data.indexOf("429 Too Many Requests")==-1){
					/* 検索結果からURLを探す */
					const result_url_array = [];
					const rc = $(data).find(".rc");
					$.each(rc,function(i,elem){
						if($(elem).find(".s").text().indexOf(search_tid)>-1){
							const result_url = $(elem).find(".r").find("a").attr("href");
							if(result_url.indexOf("jp.playstation.com/games/")>-1){
								result_url_array.push(result_url);
							}
							if(console_name=="ps4"){
								if(result_url.indexOf("gamefaqs.gamespot.com/ps4/")>-1){
									result_url_array.push(result_url);
								}
							}else if(console_name=="vita"){
								if(result_url.indexOf("gamefaqs.gamespot.com/vita/")>-1){
									result_url_array.push(result_url);
								}
							}
						}
					});
					if(result_url_array.length>0){
						console.log("--- OfficialPage/GameFAQs Check - Google検索終了 ---");
						def.resolve(result_url_array);
					}else{
						console.log("--- OfficialPage/GameFAQs Check - Google検索終了 ---");
						/* Googleで見つからなければ他の検索エンジンでもおそらく見つからないためreject */
						def.reject();
					}
				}else{
					console.log("--- OfficialPage/GameFAQs Check - Google検索失敗 ---");
					Scraping_SearchEngine(search_tid,def,2);
				}	
			},function(){
				console.log("--- OfficialPage/GameFAQs Check - Google検索失敗 ---");
				Scraping_SearchEngine(search_tid,def,2);
			}
		)
	}else if(type==2){
		const search_str1 = "https://search.yahoo.co.jp/search?p=%22";
		const search_str2 = "%22+site%3Ajp.playstation.com+OR+site%3Agamefaqs.gamespot.com";
		const search_url = search_str1 + search_tid + search_str2;
		console.log("--- OfficialPage/GameFAQs Check - Yahoo検索開始 ---");	
		GetPageData(search_url).then(
			function(data){
				const result_url_array = [];
				const section = $(data).find("section");
				$.each(section,function(i,elem){
					if($(elem).find(".sw-Card__summary").text().indexOf(search_tid)>-1){
						const result_url = $(elem).find(".sw-Card__titleInner").attr("href");
						if(result_url.indexOf("jp.playstation.com/games/")>-1){
							result_url_array.push(result_url);
						}
						if(console_name=="ps4"){
							if(result_url.indexOf("gamefaqs.gamespot.com/ps4/")>-1){
								result_url_array.push(result_url);
							}
						}else if(console_name=="vita"){
							if(result_url.indexOf("gamefaqs.gamespot.com/vita/")>-1){
								result_url_array.push(result_url);
							}
						}
					}
				})
				if(result_url_array.length>0){
					console.log("--- OfficialPage/GameFAQs Check - Yahoo検索終了 ---");
					def.resolve(result_url_array);
				}else{
					console.log("--- OfficialPage/GameFAQs Check - Yahoo検索終了 ---");
					def.reject();
				}
			},function(){
				console.log("--- OfficialPage/GameFAQs Check - Yahoo検索失敗 ---");
				def.reject();
			}
		)
	}else{
		def.reject();
	}
}

/* 紹介ページの情報を出力 */
function OutputOfficial(official_url,data,def){
	/* エラー防止 */
	data = data.replace(/(src="\/etc\/)/g,'src="https://www.jp.playstation.com/etc/');
	data = data.replace(/(src="\/content\/)/g,'src="https://www.jp.playstation.com/content/');
	data = data.replace(/(src="\/common\/)/g,'src="https://www.jp.playstation.com/common/');
	data = data.replace(/(src="\/software\/)/g,'src="https://www.jp.playstation.com/software/');
	data = data.replace(/(src="\/8tnu0100000000ft\/)/g,'src="https://www.jp.playstation.com/8tnu0100000000ft/');
	/* PS4,PSVitaのパッケージのタイトルIDを入力した場合 */
	var ps4_v_phys_flag2 = false;
	if(ps4_v_phys_flag){
		ps4_v_phys_flag2 = true;
	}	
	/* 情報取得 */
	if($(data).find("#softTitle").length>0 && $(data).find("#softTitle").text()!=""){
		/* URLの出力 */
		OutputLink(output1,"Official",official_url);
		/* タイトル名の出力 */
		OutputTitle(output2,[$(data).find("#softTitle").text()])
		/* コンテンツID(+タイトルID)の取得、出力 */
		var new_cid = null;
		const cid_index1 = data.indexOf("https://store.playstation.com/#!/ja-jp/cid=");
		if(cid_index1>-1){
			/* DL版のリンクが存在する場合 */
			const cid_index2 = cid_index1 + 79;
			const temp_prod_url = data.slice(cid_index1,cid_index2);
			if(temp_prod_url.match(cid_reg)){
				new_cid = temp_prod_url.match(cid_reg)[0];
				NewCidPush(new_cid);
				if(ps4_v_phys_flag2){
					tid = new_cid.match(tid_reg)[0];
					ps4_v_phys_flag = false;
					OutputItem(output2,"Title ID",tid);
				}
			}
		}
		if(new_cid==null){
			/* 
				DL版のリンクが存在しない場合、或いは上の処理で得た文字列が不適切な物だった場合
				コンテンツIDが使用されているパッケージ画像のURLか紹介ページのURLを探す
			*/
			const cid_lower_reg1 = /[a-z]{2}\d{4}[a-z]{4}\d{5}_(\d{2}|[a-z]{2})[a-z0-9]{16}/;
			const cid_lower_reg2 = /[a-z]{2}\d{4}[a-z]{4}\d{5}_(\d{2}|[a-z]{2})/;
			if(data.match(cid_lower_reg1)){
				var temp_cid = data.match(cid_lower_reg1)[0].toUpperCase();
				const temp_prefix = temp_cid.substr(0,6);
				const temp_tid = temp_cid.substr(6,12);
				const temp_tail = temp_cid.substr(18,16);
				temp_cid = temp_prefix + "-" + temp_tid + "-" + temp_tail;
				new_cid = temp_cid;
				NewCidPush(new_cid);
				if(ps4_v_phys_flag2){
					tid = new_cid.match(tid_reg)[0]; 
					ps4_v_phys_flag = false;
					OutputItem(output2,"Title ID",tid);
				}
			}else if(data.match(cid_lower_reg2)){
				/* こちらの場合はコンテンツIDが不完全なため、タイトルIDの取得のみ */
				const temp_cid = data.match(cid_lower_reg2)[0].toUpperCase();
				if(ps4_v_phys_flag2){
					tid = temp_cid.match(tid_reg)[0];
					ps4_v_phys_flag = false;
					OutputItem(output2,"Title ID",tid);
				}
			}
		}
		if(new_cid!=null){
			OutputItem(output2,"Content ID",new_cid);
		}
		const explain = $(data).find("#software-explain");
		
		if(explain.length>0){
			/* --- 旧仕様のページの情報取得、出力 --- */
			/* ゲームカバーの出力 */
			var box_img = $(explain).find("#explain-box-img").find("img");
			if(box_img.length==2){
				box_img = $(box_img).attr("src");
				if(box_img!="https://www.jp.playstation.com/common/img/noimages.jpg"){
					const box_elem_str = GenVideoImgElemStr([],[box_img]);
					OutputDialogLink(output2,"Game Cover",box_elem_str);
				}	
			}
			/* 発売日の出力 */
			var releaseDate = $(explain).find("#releaseDate");
			if(releaseDate.length>0){
				releaseDate = $(releaseDate).text().replace(/(	| |\r|\n)/g,"");
				releaseDate = releaseDate.toString();
				OutputItem(output2,"Release Date",releaseDate);
			}
			/* ジャンルの出力 */
			var genre1 = $(data).find("#genreMain");
			var genre2 = $(data).find("#genreSub");
			if(genre1.length>0){
				genre1 = $(genre1).text();
				OutputItem(output2,"Main Genre",genre1);
				if(genre2.length>0){
					genre2 = $(genre2).text();
					if(genre2!="" && genre1!=genre2){
						OutputItem(output2,"Sub Genre",genre2);
					}
				}
			}			
			/* パブリッシャーの出力 */
			var makerName = $(data).find("#makerName");
			if(makerName.length>0){
				makerName = $(makerName).text();
				OutputItem(output2,"Publisher",makerName);
			}		
			/* JANの出力 */
			var jan = $(data).find("#JANCode");
			if(jan.length>0){
				jan = $(jan).text()
				if(jan!="") OutputItem(output2,"JAN",jan);
			}
			/* レーティングの出力 */
			var cero = $(data).find("#ceroAge");
			if(cero.length>0){
				cero = $(cero).find("img").attr("alt");
				OutputItem(output2,"Content Rating",cero);
			}			
			/* タイトル紹介の出力 */
			var article = $(data).find("#software-about");
			if(article.length>0 && $(article).text().length>20){
				article = $(article).html();
				const background = "background:#FFF ";
				article = article.replace(/(background:#000000|background:#000 )/g,background)
				OutputDialogLink(output2,"Description",article)
			}
			/* 動画・画像の出力 */
			const gallery = $(data).find("#carousel-thumbs").find(".clearfix").find("li");
			if(gallery.length>0){
				var videos = []; var imgs = [];
				for(var i=0; i<gallery.length; i++){
					if($(gallery[i]).find("a").attr("alt")!=undefined){
						var img_src = $(gallery[i]).find("a").attr("href");
						if(img_src.indexOf("http")==0) imgs.push(img_src);
						if(img_src.indexOf("/software/title/")==0){
							img_src = "https://www.jp.playstation.com/" + img_src;
							imgs.push(img_src);
						}
					}else if($(gallery[i]).find("a").hasClass("youtube")){
						video_src = $(gallery[i]).find("a").attr("href");
						if(video_src.indexOf("#")==0){
							video_src = video_src.substr(1);
							const i_elem1 = '<div class="iframe_y"><iframe width="560" height="315" src="https://www.youtube.com/embed/';
							const i_elem2 = '?controls=1" frameborder="0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
							video_src = i_elem1 + video_src + i_elem2;
							videos.push(video_src);
						}
					}
				}
				const car_img = $(data).find("#carousel-image");
				var car_img_elem = "";
				if(car_img.length>0){
					if($(car_img).find("img").attr("src")!=undefined){
						car_img_elem = GenVideoImgElemStr([],[$(car_img).find("img").attr("src")])
					}
				}
				const img_elem = GenVideoImgElemStr([],imgs);
				var video_img_elem = videos.join("")+img_elem;
				video_img_elem = car_img_elem + video_img_elem;
				OutputDialogLink(output2,"Gallery",video_img_elem);
			}
			/* セーブ先の出力 */
			var save_device = $(data).find("#saveDevice");
			if(save_device.length>0){
				save_device = $(save_device).text();
				OutputItem(output2,"Save Device",save_device);
			}
			/* プレイヤー人数の出力 */
			var player = $(data).find("#player");
			if(player.length>0){
				player = $(player).text();
				OutputItem(output2,"Player",player);
			}
		}else{
			/* --- 新仕様のページの情報取得、出力 --- */
			/* ゲームカバーの出力 */
			const store_box = $(data).find(".store-box");
			var store_boxes = []
			var store_box_names = [];
			if(store_box.length>0){
				for(var i=0; i<store_box.length; i++){
					const box_name = $(store_box[i]).find("h3").text();
					const box_url = $(store_box[i]).find("img").attr("src");
					if((box_name!=undefined && box_name!="") && box_url!=undefined){
						store_box_names.push(box_name);
						store_boxes.push(box_url);
					}
				}
				if(store_box_names.length>0 && store_boxes.length>0 &&
				store_box_names.length==store_boxes.length){
					const box_elem_str = GenVideoImgElemStr([],store_boxes,store_box_names);
					OutputDialogLink(output2,"Game Cover",box_elem_str);
				}
			}
			/* 発売日の出力 */
			const releaseDate = $(data).find("#releaseDate");
			if(releaseDate.length>0){
				const releaseDate_str = $(releaseDate).text();
				OutputItem(output2,"Release Date",releaseDate_str);
			}
			/* ジャンルの出力 */
			const genre1 = $(data).find("#genreMain");
			const genre2 = $(data).find("#genreSub");
			if(genre1.length>0){
				const genre1_str = $(genre1).text();
				OutputItem(output2,"Genre_Main",genre1_str);
				if(genre2.length>0){
					const genre2_str = $(genre2).text();
					if(genre1_str!=genre2_str){
						OutputItem(output2,"Genre_Sub",genre2_str);
					}
				}
			}
			/* パブリッシャーの出力 */
			const makerName = $(data).find("#makerName");
			if(makerName.length>0){
				const makerName_str = $(makerName).text();
				OutputItem(output2,"Publisher",makerName_str);
			}
			/* JANの出力 */
			const jan = $(data).find("#JANCode");
			if(jan.length>0){
				const jan_str = $(jan).text()
				OutputItem(output2,"JAN",jan_str);
			}
			/* レーティングの出力 */
			const cero = $(data).find("#ceroAge");
			if(cero.length>0){
				const cero_str = $(cero).find("img").attr("alt");
				OutputItem(output2,"Content Rating",cero_str);
			}
			/* タイトル紹介の出力 */
			const article = $(data).find("#cat-article");
			if(article.length>0){
				OutputDialogLink(output2,"Description",$(article).html())
			}
			/* 動画・画像の出力 */
			const thumbnails = $(data).find("ul.row.thumbnails");
			if(thumbnails.length>0){
				const gallery = $(thumbnails).find("li.col-xs-2.col-sm-2");
				const videos = []; const imgs = [];
				for(var i=0; i<gallery.length; i++){
					var video_src = $(gallery[i]).find("a").attr("data-video-src");
					if(video_src!=undefined){
						video_src = $(video_src).attr("src");
						video_src = video_src.substring(0,video_src.indexOf("?autoplay"));
						const i_elem1 = '<div class="iframe_y"><iframe width="480" height="270" src="';
						const i_elem2 = '?controls=1" frameborder="0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>'
						video_src = i_elem1 + video_src + i_elem2;
						videos.push(video_src);
					}
					var img_src = $(gallery[i]).find("a").attr("data-img-src");
					if(img_src!=undefined){
						if(img_src.indexOf("https://")==0){
							if(img_src.indexOf("https://i.ytimg.com")==-1){
								imgs.push(img_src);
							}
						}else if(img_src.indexOf("//sce.scene7")==0){
							img_src = "https:" + img_src;
							imgs.push(img_src);
						}
					}
				}
				const game_cover = $(data).find("div.row.game-cover");
				var cover_elem = null;
				if(game_cover.length>0){
					cover_elem = $(game_cover).find("img.img-responsive").attr("src");
					cover_elem = GenVideoImgElemStr([],[cover_elem])
				}
				const img_elem = GenVideoImgElemStr([],imgs);
				var video_img_elem = videos.join("")+img_elem;
				video_img_elem = cover_elem + video_img_elem;
				OutputDialogLink(output2,"Gallery",video_img_elem)
			}
			/* プレイヤー人数の出力 */
			const catalog = $(data).find(".catalog");
			if(catalog.length>0){
				const cat_tr = $(catalog).find("tr");
				for(var i=0; i<cat_tr.length; i++){
					const cat_th = $(cat_tr[i]).find("th");
					const th_str = $(cat_th).text();
					const td_str = $(cat_tr[i]).find("td").text();
					if(th_str=="プレイヤー"){
						OutputItem(output2,"Player",td_str);
					}
				}
			}
		}
		if(!ps4_v_phys_flag && ps4_v_phys_flag2){
			/* PS4,PSVitaのパッケージのタイトルIDを入力し、紹介ページから実際のタイトルIDを取得した場合 */
			console.log("--- OfficialPage/GameFAQs Check - 紹介ページからタイトルID発見 ---");
			def.resolve();
		}else if(ps4_v_phys_flag){
			/* PS4,PSVitaのパッケージのタイトルIDを入力し、紹介ページから実際のタイトルIDを取得出来なかった場合 */
			console.log("--- OfficialPage/GameFAQs Check - 紹介ページからタイトルID発見出来ず ---");
			def.resolve();
		}else{
			/* PS4,PSVitaのパッケージのタイトルIDを入力していない場合 */
			def.resolve();
		}
	}else{
		def.resolve();
	}
}

/* GameFAQsのリリース情報ページの情報を出力 */
function OutputGameFAQs(gamefaqs_url,data,def){
	if(data.indexOf("503 Service Temporarily Unavailable")==-1){
		OutputLink(output1,"GameFAQs",gamefaqs_url);
		/* 
			入力したタイトルIDの項目があるかどうかを調べ、あるならregion_strにリージョンを格納する 
			同時に該当項目の情報を取得する
		*/
		const region = $(data).find(".cregion");
		var region_str = null; // リージョン
		var title_name = null; // タイトル名
		var jan = null; // JAN
		var company = null; // パブリッシャー
		var releaseDate = null; // 発売日
		var cero = null; // レーティング
		$.each(region,function(i,elem1){
			if(region_str==null){
				const temp_region_str = $(elem1).text();
				$.each($(elem1).siblings(),function(x,elem2){
					search_tid = StrIns(tid,4,"-");
					if($(elem2).text().indexOf(search_tid)==0){
						/* リージョンの格納 */
						region_str = temp_region_str;
						const parent_elem = $($(elem1).siblings()).parent();
						/* タイトル名の取得 */
						if(title_name==null){
							title_name = $(parent_elem).prev().find(".ctitle").text();
						}
						const datacompany = $(parent_elem).find(".datacompany");
						/* パブリッシャーの取得 */
						if(datacompany.length>0){
							if(company==null) company = $(datacompany).text();
						}
						/* JANの取得 */
						const datapid = $(parent_elem).find(".datapid");
						if(datapid.length>0){
							for(var y=0; y<datapid.length; y++){
								const datapid_jan = $(datapid[y]).text();
								if(datapid_jan.length==13){
									if(jan==null) jan = datapid_jan;
								}	
							}
						}
						/* 発売日の取得 */
						const cdate = $(parent_elem).find(".cdate");
						if(cdate.length>0){
							if(releaseDate==null) releaseDate = $(cdate).text();
						}
						/* レーティングの取得 */
						const datarating = $(parent_elem).find(".datarating");
						if(datarating.length>0){
							if(cero==null) cero = $(datarating).text();
						}
					}
				})
			}
		})
		/* region_strにリージョンが格納されている場合は、同じリージョンを持つタイトルIDを調べる */
		var new_tid = null;	
		const tid_reg2 = /[a-zA-Z]{4}-\d{5}/;
		if(region_str!=null){
			$.each(region,function(i,elem1){
				if(region_str==$(elem1).text() && new_tid==null){
					$.each($(elem1).siblings(),function(x,elem2){
						const elem2_str = $(elem2).text();
						if(console_name=="ps4"){
							if(elem2_str.indexOf("CUSA-")==0 && elem2_str.match(tid_reg2)){
								if(new_tid==null){
									new_tid = elem2_str.match(tid_reg2)[0];
									new_tid = new_tid.replace(/-/,"");
									if(ps4_v_phys_flag){
										ps4_v_phys_flag = false;
									}
								}
							}
						}else if(console_name=="vita"){
							if(elem2_str.indexOf("PCS")==0 && elem2_str.match(tid_reg2)){
								if(new_tid==null){
									new_tid = elem2_str.match(tid_reg2)[0];
									new_tid = new_tid.replace(/-/,"");
									if(ps4_v_phys_flag){
										ps4_v_phys_flag = false;
									}
								}
							}							
						}
					})
				}
			})
		}
		/* タイトルの出力 */
		if(title_name!=null && title_name!=""){
			OutputItem(output3,"Title",title_name);
		}
		/* タイトルIDの出力 */
		if(new_tid!=null){
			tid = new_tid;
			OutputItem(output3,"Title ID",tid);			
		}
		/* 発売日の出力 */
		if(releaseDate!=null){
			releaseDate　= new Date(releaseDate).toLocaleDateString();
			OutputItem(output3,"Release Date",releaseDate);
		}
		/* パブリッシャーの出力 */
		if(company!=null){
			OutputItem(output3,"Publisher",company);
		}
		/* JANの出力 */
		if(jan!=null){
			OutputItem(output3,"JAN",jan);
		}
		/* レーティングの出力 */
		if(cero!=null){
			OutputItem(output3,"Content Rating",cero);
		}
		if(new_tid!=null){
			console.log("--- OfficialPage/GameFAQs Check - GameFAQsのリリース情報ページからタイトルID発見 ---");
			if(console_name=="vita" && (new_tid.indexOf("PCSC")==0 || new_tid.indexOf("PCSG")==0)){
				chi_region = "JP";
			}
			console.log("--- OfficialPage/GameFAQs Check - 終了 ---");
			def.resolve();
		}else{
			console.log("--- OfficialPage/GameFAQs Check - GameFAQsのリリース情報ページからタイトルID発見出来ず ---");
			console.log("--- OfficialPage/GameFAQs Check - 終了 ---");
			def.reject();
		}
	}else{
		def.reject();
	}
}

/* PS3,PS4(CUSAYYYYY) - Tmdb Check */
function PS3PS4_TmdbCheck(def){
	if($("#tmdb").prop("checked") && !ps4_v_phys_flag){
		const key = "F5DE66D2680E255B2DF79E74F890EBF349262F618BCAE2A9ACCDEE5156CE8DF2CDF2D48C71173CDC2594465B87405D197CF1AED3B7E9671EEB56CA6753C2E6B0";
		const msg = tid + "_00";
		const hmac = GetHmacSha1(key,msg).toUpperCase();		
		if(tid.slice(0,2)!="CU" && console_name!="psp"){
			/* PS3 */
			const path = "http://tmdb.np.dl.playstation.net/tmdb/";
			const tmdb_xml_url = path + msg + "_" + hmac + "/" + msg + ".xml";
			OutputLink(output1,"Tmdb xml",tmdb_xml_url);
			GetPageData(tmdb_xml_url,"xml").then(
				function(data){
					def.resolve(data);
				},function(){
					$("#output1_Tmdb_xml").append(notfound);
					def.reject();
				}
			);
		}else if(tid.slice(0,2)=="CU"){
			/* PS4 */
			const path = "http://tmdb.np.dl.playstation.net/tmdb2/";
			const tmdb2_json_url = path + msg + "_" + hmac + "/" + msg + ".json";
			OutputLink(output1,"Tmdb json",tmdb2_json_url);
			GetPageData(tmdb2_json_url,"json").then(
				function(data){
					def.resolve(data);
				},function(){
					$("#output1_Tmdb_json").append(notfound);
					def.reject();
				}
			);
		}else{
			def.reject();
		}
	}else{
		def.reject();
	}	
	return def.promise();
}

/* PS3 - Tmdbのjsonの情報を出力 */
function PS3_TmdbOut(data,def){
	/* タイトル名の出力 */
	const temp_title_array = [];
	$.each($(data).find("name"),function(i,name){
		temp_title_array.push($(name).text().replace(/\n/," "));
	})
	OutputTitle(output4,temp_title_array,"tmdb");
	/* アイコンの出力 */
	const icon_url_array = [];
	$.each($(data).find("icon"),function(i,icon){
		icon_url_array.push($(icon).text());
	})
	if(icon_url_array.length!=0){
		const icon_elem_str = GenVideoImgElemStr([],icon_url_array);
		OutputDialogLink(output4,"Icon",icon_elem_str);
	}
	/* メディアタイプの出力 */
	const media_type = $(data).find("media-type").text();
	if(media_type=="disc"){
		OutputItem(output4,"Media Type","BD");
	}else{
		OutputItem(output4,"Media Type","Digital");
	}
	/* ペアレンタルレベルの出力 */
	const lv_array = [];
	$.each($(data).find("parental-level"),function(i,lv_elem){
		const lv = $(lv_elem).text()
		const region = $(lv_elem).attr("region");
		var lv_region = "";
		if(region==undefined){
			lv_region = lv;
		}else{
			lv_region = lv + " (region=" + region + ")";
		}
		lv_array.push(lv_region);
	})
	if(lv_array.length>0){
		OutputItem(output4,"Parental Level",lv_array[0]);
		if(lv_array.length>1){
			/* ペアレンタルレベルが複数ある場合に、矢印アイコンをクリックして表示を切り替えられるように */
			const out_id = output4.attr("id");
			const item_id = out_id + "_plv_arrow";
			const deno_id = out_id + "_deno"; // 分子表示のID
			const fraction_elem = "(<span id='"+deno_id+"'>1</span>"+"<span>/"+lv_array.length+")</span>";
			const arrow_elem = fraction_elem + "<span id='"+item_id+"' class='arrow_right'></span>"
			const plv_out_id = out_id + "_Parental_Level";
			$("#"+plv_out_id).find(".item").before(arrow_elem);
			$("#"+item_id).on("mouseover",function(){
				$("#"+item_id).css("color","deepskyblue");
			});
			$("#"+item_id).on("mouseout",function(){
				$("#"+item_id).css("color","green");
			});
			var plv_index = 1;
			$("#"+item_id).on("click",function(){
				$("#"+plv_out_id).find(".item").html(lv_array[plv_index]);
				$("#"+deno_id).html((plv_index+1));
				plv_index++;
				if(plv_index>=lv_array.length) plv_index = 0;
			});
		
		}
	}
	/* 解像度情報の出力 */
	OutputItem(output4,"Resolution",$(data).find("resolution").text());
	/* サウンドフォーマット情報の出力 */
	OutputItem(output4,"Sound Format",$(data).find("sound-format").text());
	def.resolve();
}

/* PS4(CUSAYYYYY) - Tmdbのjsonの情報を出力 */
function PS4_TmdbOut(data,def){
	/* タイトル名の出力 */
	const temp_title_array = [];
	$.each(data.names,function(i,name){
		temp_title_array.push(name.name.replace(/\n/," "));
	})
	OutputTitle(output4,temp_title_array,"tmdb");
	/* コンテンツIDの出力 */
	const cid = data.contentId;
	if(NewCidPush(cid)){
		OutputItem(output4,"Content ID",cid);
		CID_RegionCheck(output4,cid);
	}
	/* アイコンの出力 */
	if(data.icons!=undefined){
		const icon_url_array = [];
		const icon_name_array = [];
		$.each(data.icons,function(i,val){
			icon_url_array.push(val.icon);
			if(i==0){
				icon_name_array.push("default");
			}else{
				icon_name_array.push("lang : " + val.lang);
			}			
		})
		const icon_elem_str = GenVideoImgElemStr([],icon_url_array,icon_name_array);
		OutputDialogLink(output4,"Icon",icon_elem_str);
	}	
	/* ペアレンタルレベルの出力 */
	OutputItem(output4,"Parental Level",data.parentalLevel);
	/* プレイ人数の出力 */
	const play_together =  data.playTogether;
	if(play_together!=undefined){
		OutputItem(output4,"Play Together",play_together);
	}
	/* PSVRをサポートしているかどうかの出力 */
	var psvr = "Yes";
	if(data.psVr==0) psvr = "No";
	OutputItem(output4,"PSVR Support",psvr);
	/* PS4Proをサポートしているかどうかの出力 */
	var ps4pro = "Yes";
	if(data.neoEnable==0) ps4pro = "No";
	OutputItem(output4,"PS4Pro Support",ps4pro);	
	/* pronunciation.xmlの情報を取得,出力 */
	GetPronunciation(output4,data.pronunciation);
	/* 背景画像の出力 */
	if(data.backgroundImage!=undefined){
		const background_img_elem_str = GenVideoImgElemStr([],[data.backgroundImage],["Background Image"]);
		OutputDialogLink(output4,"Background Image",background_img_elem_str);
	}else{
		OutputItem(output4,"Background Image","-");
	}
	/* BGM(at9)のURLを出力 */
	OutputLink(output4,"BGM (at9)",data.bgm);
	def.resolve();
}

/* PS4(CUSAYYYYY) - Update Check */
function PS4_UpdateCheck(def){
	if($("#update").prop("checked") && !ps4_v_phys_flag){
		const key = "AD62E37F905E06BC19593142281C112CEC0E7EC3E97EFDCAEFCDBAAFA6378D84";
		const msg = "np_" + tid;
		const hmac = GetHmacSha256(key,msg);
		const path = "http://gs-sec.ww.np.dl.playstation.net/plo/np/";
		const update_xml_url = path + tid + "/" + hmac + "/" + tid + "-ver.xml";
		OutputLink(output1,"Update xml",update_xml_url);
		GetPageData(update_xml_url,"xml").then(
			function(data){
				def.resolve(data);
			},function(){
				$("#output1_Update_xml").append(notfound);
				def.reject();
			}
		);
	}else{
		def.reject();
	}
}

/* PS4(CUSAYYYYY) - Updateのxmlの情報を出力 */
function PS4_UpdateOut(data,def){
	/* タイトル名の出力 */
	const temp_title_array = [$($(data).find("title")[0]).text().replace(/\n/," ")];
	$.each($(data).find("title").nextAll(),function(i,title_name){
		temp_title_array.push($(title_name).text().replace(/\n/," "));
	})
	OutputTitle(output5,temp_title_array);
	/* コンテンツIDの出力 */
	const cid = $(data).find("package").attr("content_id");
	if(NewCidPush(cid)){
		OutputItem(output5,"Content ID",cid);
		CID_RegionCheck(output5,cid);
	}
	/* mandatory yes/no */
	var mandatory = "Yes";
	if($(data).find("tag").attr("mandatory")=="false") mandatory = "No";
	OutputItem(output5,"Mandatory Patch",mandatory);
	/* 要求FWバージョンの出力 */
	const sys_ver = FixSysVer($(data).find("package").attr("system_ver"));
	OutputItem(output5,"Required Firmware",sys_ver);
	/* PKGのバージョンの出力 */
	const ver = parseFloat($(data).find("package").attr("version")).toFixed(2).toString();
	OutputItem(output5,"Patch Version",ver);
	/* PKGのサイズの出力 */
	OutputItem(output5,"Total Size",FixSize($(data).find("package").attr("size")));
	/* PKG ManifestのURLの出力 */
	const pkg_mf_url = $(data).find("package").attr("manifest_url");
	OutputLink(output5,"PKG Manifest",pkg_mf_url);
	/* ピース数と各ピースのURLの出力 */
	GetPageData(pkg_mf_url,"json").then(
		function(data2){
			const pieces = data2.pieces;
			const piece_num = pieces.length;
			OutputItem(output5,"Number of Pieces",piece_num);
			$.each(pieces,function(i,piece){
				const piece_url = piece.url;
				OutputLink(output5,"PKG (Piece" + (i+1) + ")",piece_url);
			})
			/* Delta PKGのURLの出力 */
			const delta_pkg_url = $(data).find("delta_info_set").attr("url");
			OutputLink(output5,"Delta PKG",delta_pkg_url);
			/* changeinfoのURLの出力 */
			var changeinfo_url = $(data).find("changeinfo").attr("url");
			if(changeinfo_url!=undefined){
				OutputLink(output5,"ChangeInfo",changeinfo_url);
				const changeinfo_all = $(data).find("changeinfo").nextAll();
				const changeinfo_urls = [];
				for(var i=0; i<changeinfo_all.length; i++){
					const changeinfo_num = changeinfo_all[i].tagName.substr(11);
					const changeinfo_name = "ChangeInfo_" + changeinfo_num;
					changeinfo_url = $(changeinfo_all[i]).attr("url");
					changeinfo_urls.push(changeinfo_url);
					changeinfo_urls.push(changeinfo_name);
				}
				if(changeinfo_urls.length>0){
					OutputDialogLink(output5,"ChangeInfo_xx",HrefStr(changeinfo_urls))
				}
			}
			/* PlayGo Manifest のURLの出力 */
			const playgo_mf_url = $(data).find("latest_playgo_manifest").attr("url");
			OutputLink(output5,"PlayGo Manifest",playgo_mf_url);
		}
	);
	def.resolve();	
}

/* PSP,PS3 - Update Check */
function PSPPS3_UpdateCheck(def){
	if($("#update").prop("checked")){
		const path = "https://a0.ww.np.dl.playstation.net/tpl/np/";
		const update_xml_url = path + tid + "/" + tid + "-ver.xml";
		OutputLink(output1,"Update xml",update_xml_url);
		GetPageData(update_xml_url,"xml").then(
			function(data){
				def.resolve(data);
			},function(){
				$("#output1_Update_xml").append(notfound);
				def.reject();
			}
		);
	}else{
		def.reject();
	}
}

/* PSP,PS3 - Updateのxmlの情報を出力 */
function PSPPS3_UpdateOut(data,def){
	/* タイトルの出力 */
	const temp_title_array = [$($(data).find("TITLE")[0]).text().replace(/\n/," ")];
	$.each($(data).find("TITLE").nextAll(),function(i,title_name){
		temp_title_array.push($(title_name).text().replace(/\n/," "));
	})
	OutputTitle(output5,temp_title_array);
	/* 要求FWバージョンの出力　*/
	const pkgs = $(data).find("package");
	const pkg_len = pkgs.length;
	const pkg_index = pkg_len - 1;
	var ver = "";
	if(pkg_len!=1){
		/* pkgが複数ある場合は、最新版の要求FWを取得する */
		ver = parseFloat($(pkgs[pkg_index]).attr("version")).toFixed(2).toString();
		ver = " (v" + ver +  ")";
	}
	var sys_ver = ($(pkgs[pkg_index]).attr("psp_system_ver"));
	if(sys_ver==undefined){
		sys_ver = $(pkgs[pkg_index]).attr("ps3_system_ver");
	}
	sys_ver = parseFloat(sys_ver).toFixed(2).toString();
	if(isNaN(sys_ver)) sys_ver = null;
	OutputItem(output5,"Required Firmware " + ver,sys_ver);
	/* PKGのURLとサイズの出力 */
	$.each(pkgs,function(i,pkg){
		var ver =  parseFloat($(pkg).attr("version")).toFixed(2).toString();
		ver = "v" + ver;
		const update_pkg_url = $(pkg).attr("url");
		OutputLink(output5,ver + " PKG",update_pkg_url);
		const size = " (" + FixSize($(pkg).attr("size")) + ")";
		output5.find("li").last().find(".item").append(size);
		/* コンテンツIDの出力 */
		if(i==pkg_index){
			const cid = update_pkg_url.match(cid_reg)[0];
			if(NewCidPush(cid)){
				OutputItemAfter($("#output5_Title"),"Content ID",cid);
			}
		}
	})	
	/* param.hipのURLの出力 */
	var param_url = $(data).find("paramhip").attr("url");
	if(param_url!=undefined){
		OutputLink(output5,"PARAM.HIP",param_url);
		$("#output5_PARAM_HIP a").removeAttr("target");
		const param_array = $(data).find("paramhip").nextAll();
		const param_urls = [];
		for(var i=0; i<param_array.length; i++){
			const param_num = param_array[i].tagName.substr(9);
			const param_name = "PARAM_" + param_num + ".HIP";
			param_url = $(param_array[i]).attr("url");
			param_urls.push(param_url);
			param_urls.push(param_name);
		}
		if(param_urls.length>0){
			const param_hrefs = HrefStr(param_urls);
			OutputDialogLink(output5,"PARAM_xx.HIP",param_hrefs);
		}
	}
	def.resolve();
}

/* PSVita(PCSxYYYYY)- Update Check */
function PSVITA_UpdateCheck(def){
	if($("#update").prop("checked") && !ps4_v_phys_flag){
		const key = "E5E278AA1EE34082A088279C83F9BBC806821C52F2AB5D2B4ABD995450355114";
		const msg = "np_" + tid;
		const hmac = GetHmacSha256(key,msg);
		const path = "http://gs-sec.ww.np.dl.playstation.net/pl/np/";
		const update_xml_url = path + tid + "/" + hmac + "/" + tid + "-ver.xml";
		OutputLink(output1,"Update xml",update_xml_url);
		GetPageData(update_xml_url,"xml").then(
			function(data){
				def.resolve(data);
			},function(){
				$("#output1_Update_xml").append(notfound);
				def.reject();
			}			
		);
	}else{
		def.reject();
	}
}

/* PSVita(PCSxYYYYY)- Updateのxmlの情報を出力 */
function PSVITA_UpdateOut(data,def){
	/* タイトルの出力 */
	const temp_title_array = [$($(data).find("title")[0]).text().replace(/\n/," ")];
	$.each($(data).find("title").nextAll(),function(i,title_name){
		temp_title_array.push($(title_name).text().replace(/\n/," "));
	})
	OutputTitle(output5,temp_title_array);
	/* コンテンツIDの出力 */
	const cid = $(data).find("package").attr("content_id");
	if(NewCidPush(cid)){
		OutputItem(output5,"Content ID",cid);
	}
	/* 要求FWバージョンの出力 */
	const pkgs = $(data).find("package");
	const pkg_len = pkgs.length;
	var ver = "";
	var sys_ver = "";
	if(pkg_len!=1){
		/* pkgが複数ある場合(incrementalが採用されている場合)は、最新版の要求FWを取得する */
		ver = parseFloat($(pkgs[pkg_len-1]).attr("version")).toFixed(2).toString();
		ver = " (v" + ver +  ")";
		sys_ver = FixSysVer($(pkgs[pkg_len-1]).attr("psp2_system_ver"));		
	}else{
		sys_ver = FixSysVer($(data).find("package").attr("psp2_system_ver"));
	}
	OutputItem(output5,"Required Firmware" + ver,sys_ver);
	/* PKGのURLとサイズの出力 */
	$.each(pkgs,function(i,pkg){
		var ver =  parseFloat($(pkg).attr("version")).toFixed(2).toString();
		ver = "v" + ver;
		update_pkg_url = $(pkg).attr("url");
		OutputLink(output5,ver + " PKG",update_pkg_url);
		const size = " (" + FixSize($(pkg).attr("size")) + ")";
		output5.find("li").last().find(".item").append(size);
	})
	/* Hybrid PKGのURLとサイズの出力 */
	const hybrid_pkg = $(data).find("hybrid_package");
	if(hybrid_pkg.length){
		const hybrid_pkg_url = $(hybrid_pkg).attr("url");
		OutputLink(output5,"Hybrid PKG",hybrid_pkg_url);
		const size = " (" + FixSize($(hybrid_pkg).attr("size")) + ")";
		output5.find("li").last().find(".item").append(size);
	}	
	/* changeinfoのURLの出力 */
	var changeinfo_url = $(data).find("changeinfo").attr("url");
	if(changeinfo_url!=undefined){
		OutputLink(output5,"ChangeInfo",changeinfo_url);
		const changeinfo_all = $(data).find("changeinfo").nextAll();
		const changeinfo_urls = [];
		for(var i=0; i<changeinfo_all.length; i++){
			const changeinfo_num = changeinfo_all[i].tagName.substr(11);
			const changeinfo_name = "ChangeInfo_" + changeinfo_num;
			changeinfo_url = $(changeinfo_all[i]).attr("url");
			changeinfo_urls.push(changeinfo_url);
			changeinfo_urls.push(changeinfo_name);
		}
		if(changeinfo_urls.length>0){
			OutputDialogLink(output5,"ChangeInfo_xx",HrefStr(changeinfo_urls))
		}
	}
	def.resolve();
}

/* ChihiroのURLを作成し、データを取得 */
function ChihiroCheck(def,cid){
	var check_flag = true; // ChihiroCheck許可フラグ
	/* 呼び出し側でコンテンツIDを指定していない場合 */
	if(cid==undefined){
		if(ps4_tc_flag){
			/* titlecontainerを使用する場合は許可 */
		}else if(cid_array.length>0){
			/* cid_arrayの中身がある場合は許可 */
			cid = cid_array[0];
		}else{
			/* 上に該当しないならチェック不可 */
			check_flag = false;
		}
	}
	/* ChihiroCheck開始 */
	if($("#chihiro").prop("checked") && !ps4_v_phys_flag && check_flag &&
	(cid!=undefined || ps4_tc_flag)){
		/* 国コード/言語コードの確定 */
		const chi_sb = $("#chihiro_sb").val();
		if(chi_sb=="default"){
			if(prod_url!=null){
				try{
					const prod_url_lc_reg = /\/[a-zA-Z]{2}-([a-zA-Z]{4}-)?[a-zA-Z]{2}\//;
					var prod_url_lc = prod_url.match(prod_url_lc_reg)[0];
					prod_url_lc = prod_url_lc.replace(/\//g,"");
					var lang = prod_url_lc.slice(0,prod_url_lc.match(/-[a-zA-Z]{2}$/)["index"]);
					var country = prod_url_lc.match(/-[a-zA-Z]{2}$/)[0];
					country = country.replace(/-/,"");
					if(lang=="zh-hant"){
						lang = "ch";
					}else if(lang=="zh-hans"){
						lang = "zh";
					}
					chi_cl = country + "/" + lang;
				}catch(e){
					FuzzyCountryLangFromRegion();
				}	
			}else{
				FuzzyCountryLangFromRegion();
			}	
		}else{
			chi_cl = chi_sb;
		}
		/* chi_clが不適切な文字列の場合はus/enを設定 */
		if(!chi_cl.match(/[a-zA-Z]{2}\/[a-zA-Z]{2}/)){
			chi_cl = "us/en";
		}
		/* URLの作成 */
		var chihiro_json_url;
		if(ps4_tc_flag){
			/* PS4のタイトルIDを入力した場合はtitlecontainerを使用する */
			const path = "https://store.playstation.com/store/api/chihiro/00_09_000/titlecontainer/";
			chihiro_json_url = path + chi_cl + "/999/" + tid + "_00";
		}else{
			/* ps4_tc_flagがfalseの場合はcontainerを使用する */
			const path = "https://store.playstation.com/store/api/chihiro/00_09_000/container/";
			chihiro_json_url = path + chi_cl + "/999/" + cid;		
		}
		if(chi_hist_array.indexOf(chihiro_json_url)==-1){
			/* チェック済みのURLを確認し、未チェックの場合はチェック継続 */
			chi_hist_array.push(chihiro_json_url);
			/* URLの出力 */
			/* 添字は、ChihiroCheckを複数回実行する場合に分かりやすくするために表示させている */
			var item_name = "Chihiro json";
			var item_length = $(".chihiro").length + 1;
			if(item_length==1) item_length="";
			item_name = item_name + item_length;
			OutputLink(output1,item_name,chihiro_json_url);
			/* リンクの隣に国コード/言語コードを出力　*/
			$(".chihiro").last().append(" ("+chi_cl+")");
			/* スクレイピング */
			GetPageData(chihiro_json_url,"json").then(
				function(data){
					console.log("--- Chihiro Check - 成功 ---\n" + chihiro_json_url);
					if(chihiro_json_url.match(cid_reg)){
						chi_out_cid = chihiro_json_url.match(cid_reg)[0];
					}
					def.resolve(data,chihiro_json_url);
				},function(){
					$(".chihiro").last().append(notfound);
					console.log("--- Chihiro Check - 404 ---\n" + chihiro_json_url);
					NextChihiroCheck1(def);
				}
			);
		}else{
			/* チェック済みのURLだったので次 */
			NextChihiroCheck1(def);
		}
	}else if($("#chihiro").prop("checked") && !ps4_v_phys_flag){
		/* コンテンツIDがcid_arrayに格納されていない場合 */
		NextChihiroCheck2(def);
	}else{
		def.reject();
	}
	/* スクレイピングが失敗した場合にChihiroCheckの継続を試みる - 既に持っているコンテンツIDを使用 */
	function NextChihiroCheck1(def){
		if(!tumb_hit_flag){
			if(ps4_tc_flag && cid_array.length>0){
				/* titlecontainerで失敗した場合はcontainerの使用に切り替え */
				ps4_tc_flag = false;
				ChihiroCheck(def,cid_array[0]);
			}else if(cid_array.length==1){
				/* コンテンツIDを1つしか持っていない場合はコンテンツIDを探す */
				NextChihiroCheck2(def);
			}else if(cid_array.length>1){
				chi_cid_index++;
				if(chi_cid_index>cid_array.length-1){
					/* コンテンツIDを探す */
					NextChihiroCheck2(def);
				}else{
					/* 別のコンテンツIDでChihiroCheck */
					ChihiroCheck(def,cid_array[chi_cid_index]);
				}
			}else{
				/* コンテンツIDを探す */
				NextChihiroCheck2(def);
			}
		}else{
			/* Tumbler SearchでコンテンツID発見済みの場合は処理終了 */
			def.reject();
		}
	}
	/* スクレイピングが失敗した場合にChihiroCheckの継続を試みる - コンテンツIDを探す */
	function NextChihiroCheck2(def){
		GetCidFromTid().then(
			function(cid){
				ps4_tc_flag = false;
				ChihiroCheck(def,cid);
			},function(){
				TumblerSearch1(def);
			}
		);
	}
}

/* TumblerSearchの検索条件を作成 */
function TumblerSearch1(def){
	console.log("--- Tumbler Search"+(tumb_search_index+1)+" - 検索条件の準備開始 ---");
	//console.log(title_array);
	/* 検索ワードの作成 */
	const search_word_array = [];
	if(create_search_word_flag){
		const reject_str_array = [" ","　","(","（","\n","?","？","!","！",".","・","™","®","Ⓡ","'","-","－",":","/","\\","。","★","☆","’","：","･"];
		$.each(title_array,function(i,title_name){
			const reject_index_array = [];
			$.each(reject_str_array,function(x,reject_str){
				const reject_index = title_name.indexOf(reject_str);
				if(reject_index>0){
					reject_index_array.push(reject_index);
				}
			})
			var slice_index = title_name.length;
			if(reject_index_array.length>0){
				slice_index = Math.min.apply(null,reject_index_array);
			}
			const search_word = title_name.slice(0,slice_index);
			if(search_word_array.indexOf(search_word)==-1){
				search_word_array.push(search_word);
			}
		})
		create_search_word_flag = false;
		//console.log(search_word_array);
	}
	/* 
		検索条件の作成の前準備。Array.from()のPolyfill
		https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#Polyfill
	*/
	if(!Array.from){
	  Array.from = (function () {
		var toStr = Object.prototype.toString;
		var isCallable = function (fn) {
		  return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
		};
		var toInteger = function (value) {
		  var number = Number(value);
		  if (isNaN(number)) { return 0; }
		  if (number === 0 || !isFinite(number)) { return number; }
		  return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
		};
		var maxSafeInteger = Math.pow(2, 53) - 1;
		var toLength = function (value) {
		  var len = toInteger(value);
		  return Math.min(Math.max(len, 0), maxSafeInteger);
		};
		return function from(arrayLike) {
		  var C = this;
		  var items = Object(arrayLike);
		  if (arrayLike == null) {
			throw new TypeError('Array.from requires an array-like object - not null or undefined');
		  }
		  var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
		  var T;
		  if (typeof mapFn !== 'undefined') {
			if (!isCallable(mapFn)) {
			  throw new TypeError('Array.from: when provided, the second argument must be a function');
			}
			if (arguments.length > 2) {
			  T = arguments[2];
			}
		  }
		  var len = toLength(items.length);
		  var A = isCallable(C) ? Object(new C(len)) : new Array(len);
		  var k = 0;
		  var kValue;
		  while (k < len) {
			kValue = items[k];
			if (mapFn) {
			  A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
			} else {
			  A[k] = kValue;
			}
			k += 1;
		  }
		  A.length = len;
		  return A;
		};
	  }());
	}
	/* 検索条件の作成 */
	const tumb_search_len_pre = tumb_search_array.length;
	if(chi_cl==null)FuzzyCountryLangFromRegion();
	$.each(search_word_array,function(i,word){
		if(tumb_search_array.length==0){
			tumb_search_array.push([word,chi_cl,title_array,Array.from(cid_array)]);
		}else{
			for(var x in tumb_search_array){
				/* 検索ワード、国/言語コード、title_array、cid_arrayの何れかが異なれば新たな検索条件とする */
				const flag1 = tumb_search_array[x][0]!=word;
				const flag2 = tumb_search_array[x][1]!=chi_cl;
				const flag3 = tumb_search_array[x][2].toString()!=title_array.toString();
				const flag4 = tumb_search_array[x][3].toString()!=Array.from(cid_array).toString();
				if(flag1 || flag2 || flag3 || flag4){
					tumb_search_array.push([word,chi_cl,title_array,Array.from(cid_array)]);
					break;
				}
			}
		}
	})
	const tumb_search_len = tumb_search_array.length;
	/* URLの作成 */
	if(tumb_search_len_pre!=tumb_search_len){
		console.log("--- Tumbler Search"+(tumb_search_index+1)+" - 検索条件の準備完了 ---");
		TumblerSearch2(def);
	}else{
		/* 検索条件が存在しない場合は処理終了 */
		const notice = "Tumbler Search failed.<br>Chihiro Check is not executed."
		OutputNotice(output6,notice);
		console.log("--- Tumbler Search"+(tumb_search_index+1)+" - 検索条件準備失敗。終了 ---");
		def.reject();
	}
}

/* TumblerSearchのURLを作成し、jsonのデータを取得 */
function TumblerSearch2(def){
	//console.log(tumb_search_array);
	/* URLの作成*/
	console.log("--- Tumbler Search"+(tumb_search_index+1)+" - URL作成開始 ---");
	const chi_cl_array = chi_cl.split("/");
	const temp_chi_lc = chi_cl_array[1] + "/" + chi_cl_array[0];
	const path = "https://store.playstation.com/valkyrie-api/" + temp_chi_lc + "/999/tumbler-search/";
	const search_param = encodeURI(tumb_search_array[tumb_search_index][0]);
	const size_param = "?suggested_size=99999" // 最大値が分からないのでとりあえず99999
	var platform_param = "&platform=" + console_name;
	if(console_name=="ps1_2"){
		platform_param = "&platform=" + "ps3";
	}
	const tumbler_search_url = path + search_param + size_param + platform_param;
	console.log("--- Tumbler Search"+(tumb_search_index+1)+" - URL作成完了 ---");
	console.log(tumbler_search_url);
	console.log("--- Tumbler Search"+(tumb_search_index+1)+" - データ取得開始 ---");
	/* データ取得 */
	GetPageData(tumbler_search_url,"json").then(
		function(data){
			console.log("--- Tumbler Search"+(tumb_search_index+1)+" - データ取得成功 ---");
			TumblerSearch3(data,tumbler_search_url,def);
		},function(){
			/* データ取得に失敗した場合は別の検索条件に切り替え、或いは処理終了 */
			console.log("--- Tumbler Search"+(tumb_search_index+1)+" - データ取得失敗 ---");
			tumb_search_index++;
			if(tumb_search_index==tumb_search_array.length){
				const notice = "Tumbler Search failed.<br>Chihiro Check is not executed."
				OutputNotice(output6,notice);
				console.log("--- Tumbler Search"+(tumb_search_index)+" - 検索終了。コンテンツID発見出来ず ---");
				def.reject();
			}else{
				console.log("--- Tumbler Search"+(tumb_search_index)+" - 別の検索条件に切り替え ---");
				TumblerSearch2(def);
			}
		}
	)
}

/* 検索結果からコンテンツIDを探す */
function TumblerSearch3(data,tumbler_search_url,def){
	//console.log(data);
	const total_suggested = data.data.attributes.total_suggested;
	if(total_suggested>0){
		var new_cid = null;
		/* URLの出力 */
		/* 添字は、ChihiroCheckを複数回実行する場合に分かりやすくするために表示させている */
		var item_name = "Search json";
		var item_length = $(".search").length + 1;
		if(item_length==1) item_length="";
		item_name = item_name + item_length;
		OutputLink(output1,item_name,tumbler_search_url);
		/* リンクの隣に国コード/言語コードを出力　*/
		$(".search").last().append(" ("+chi_cl+")");
		/* タイトルIDが一致するかどうかを調べる */
		const children = data.data.relationships.children.data;
		for(var i in children){
			const cid = children[i].id;
			const temp_tid = cid.match(tid_reg)[0];
			if(tid==temp_tid){
				console.log("--- Tumbler Search"+(tumb_search_index+1)+" - タイトルID一致 ---");
				/*
					"tumbler-search"はおそらく、ゲーム本編のみを検索する
					よって仮にtypeが"game-related"でもおそらく問題無し
					("tumbler-search"ではPSP,PS3のディスクのタイトルがおそらく"game-related"として扱われる)
					(PSP,PS3のディスクのタイトルもPS Storeに登録されている事がある)
				*/
				new_cid = cid;
				tumb_hit_flag = true;
				break;
			}
		}
		/* タイトル名が一致するかどうかを調べる */
		if(!tumb_hit_flag && data.included!=undefined){
			const included = data.included;
			for(var i in included){
				const inc = data.included[i];
				var name = inc.attributes.name;
				if(name!=undefined){
					for(var x in tumb_search_array[tumb_search_index][2]){
						const correct_name = tumb_search_array[tumb_search_index][2][x];
						if(name==correct_name){
							console.log("--- Tumbler Search"+(tumb_search_index+1)+" - タイトル名一致 ---");
							new_cid = inc.id;
							tumb_hit_flag = true;
							break;
						}
						if(new_cid==null){
							name = name.replace(/(®|™)/g,"")
							if(name==correct_name){
								console.log("--- Tumbler Search"+(tumb_search_index+1)+" - タイトル名一致 ---");
								new_cid = inc.id;
								tumb_hit_flag = true;
								break;
							}							
						}
					}
				}
				if(tumb_hit_flag){
					break;
				}
			}
		}
		/* コンテンツIDの末尾16文字が一致するかどうかを調べる
			(別のタイトルを取得してしまう可能性があるため、このチェックは最後) */
		if(!tumb_hit_flag && cid_array.length>0){
			for(var i in children){
				const cid = children[i].id;
				const end_str1 = cid.substr(20,16);
				for(var x in tumb_search_array[tumb_search_index][3]){
					const temp_cid = tumb_search_array[tumb_search_index][3][x];
					const end_str2 = temp_cid.substr(20,16);
					if(end_str1==end_str2){
						console.log("--- Tumbler Search"+(tumb_search_index+1)+" - コンテンツIDの末尾16文字一致 ---");
						new_cid = cid;
						tumb_hit_flag = true;
						break;
					}
				}
				if(tumb_hit_flag){
					break;
				}				
			}
		}
		//tumb_hit_flag = false; // 全検索条件で検索されるかのテスト時にコメントを外す
		if(tumb_hit_flag && new_cid!=null){
			/* コンテンツIDを発見した場合はChihiroCheckへ */
			console.log(new_cid);
			NewCidPush(new_cid);
			ChihiroCheck(def,new_cid)
		}else{
			/* コンテンツIDを発見出来なかった場合は別の検索条件に切り替え、或いは処理終了 */
			tumb_search_index++;
			if(tumb_search_index==tumb_search_array.length){
				const notice = "Tumbler Search finished.<br>Couldn't find valid content id."
				OutputNotice(output6,notice);
				console.log("--- Tumbler Search"+(tumb_search_index)+" - 検索終了。コンテンツID発見出来ず ---");
				def.reject();
			}else{
				console.log("--- Tumbler Search"+(tumb_search_index)+" - 別の検索条件に切り替え ---");
				TumblerSearch2(def);
			}
		}
	}else{
		/* 検索結果が0件だった場合は別の検索条件に切り替え、或いは処理終了 */
		console.log("--- Tumbler Search"+(tumb_search_index+1)+" - 検索結果0 ---");
		tumb_search_index++;
		if(tumb_search_index==tumb_search_array.length){
			const notice = "Tumbler Search finished.<br>Couldn't find valid content id."
			OutputNotice(output6,notice);
			console.log("--- Tumbler Search"+(tumb_search_index)+" - 検索終了。コンテンツID発見出来ず ---");
			def.reject();
		}else{
			console.log("--- Tumbler Search"+(tumb_search_index)+" - 別の検索条件に切り替え ---");
			TumblerSearch2(def);
		}
	}
}

/* Chihiroのjsonの情報を出力 */
function ChihiroOut(data,chihiro_json_url,def){
	/* タイトル名の出力 */
	OutputItem(output6,"Title",data.name);
	/* タイトルIDの出力 */
	const tid2 = data.id.match(tid_reg)[0];
	if(tid!=tid2){
		OutputItem(output6,"Title ID",tid2);
	}
	/* コンテンツIDの出力 */
	const cid = data.id;
	NewCidPush(cid);
	OutputItem(output6,"Content ID",cid);
	/* 製品ページのURLの出力 */
	const chi_cl_array = chi_cl.split("/");
	const country = chi_cl_array[0];
	var lang = chi_cl_array[1];
	if(lang=="ch"){
		lang = "zh-hant";
	}else if(lang=="zh"){
		lang = "zh-hans";
	}
	const path = "https://store.playstation.com/";
	const prod_url2 = path + lang + "-" + country + "/product/" + cid;
	OutputLink(output6,"Product",prod_url2);
	/* 製品アイコンの出力 */
	const img_url_array = [];
	const img_name_array = [];
	if(data.images!=undefined && data.images.length>0){
		$.each(data.images,function(i,image_array){
			img_url_array.push(image_array.url);
			const img_name = "Type : " + image_array.type;
			img_name_array.push(img_name);
		})
		const img_elem = GenVideoImgElemStr([],img_url_array.reverse(),img_name_array.reverse());
		OutputDialogLink(output6,"Product Images",img_elem);
	}
	/* パブリッシャーの出力 */
	OutputItem(output6,"Publisher",data.provider_name);
	/* 発売日の出力 */
	const release_date = new Date(data.release_date).toLocaleDateString();
	if(release_date!="Invalid Date"){
		OutputItem(output6,"Release Date",release_date);
	}
	/* レーティングの出力 */
	const content_rating = data.content_rating.description;
	if(content_rating!=undefined){
		OutputItem(output6,"Content Rating",content_rating);
	}
	/* コンテンツの種別(ゲーム本編,追加アイテム等)の出力 */
	OutputItem(output6,"Content Type",data.game_contentType);
	/* プラットフォームの出力 */
	if(data.playable_platform!=undefined && data.playable_platform.length>0){
		var platform = data.playable_platform;
		platform = platform.join(" / ");
		platform = platform.replace(/(®|™)/g,"");
		OutputItem(output6,"Playable Platform",platform);
	}
	/* default_skuの情報の出力 */
	if(data.default_sku!=undefined){
		/* eligibilitiesの出力 */
		const eligibilities = data.default_sku.eligibilities;
		if(eligibilities.length>0){
			GetEligibilities(output6,eligibilities,cid,false);
		}
		/* entitlementsの出力 */
		const entitlements = data.default_sku.entitlements;
		if(entitlements.length>1){
			GetEntitlements(output6,entitlements,cid,false);
		}
		/* 価格とrewards情報の出力 */
		const price = data.default_sku.display_price;
		OutputItem(output6,"Price",price);
		const rewards = data.default_sku.rewards;
		if(rewards.length>0){
			GetRewards(output6,rewards,false);
		}
		/* サイズの出力 */
		var size = 0;
		try{
			for(var i in entitlements){
				if(entitlements[i].drms!=undefined && entitlements[i].drms.length>0){
					size = size + entitlements[i].drms[0].size;
				}
				if(entitlements[i].packages!=undefined && entitlements[i].packages.length>0){
					size = size + entitlements[i].packages[0].size;
				}
			}
			if(size>0) OutputItem(output6,"Content Size",FixSize(size));
		}catch(e){}
	}else{
		//OutputItem(output6,"Price",null);
		//OutputItem(output6,"Content Size",null);
	}
	/* skuの情報の出力 */
	if(data.skus!=undefined && data.skus.length>1){
		GetSkus(output6,data.skus);
	}
	/* 動画,画像の出力 */
	var video_img_elem_str="", video_exist=false, img_exist=false;
	const mediaList = data.mediaList;
	const promo = data.promomedia;
	if(promo!=undefined && promo.length!=0){
		video_img_elem_str = GetVideoImg_promomedia(promo);
	}
	if(video_img_elem_str=="" && mediaList!=undefined){
		video_img_elem_str = GetVideoImg_mediaList(mediaList);
	}
	if(video_img_elem_str!=""){
		if(video_img_elem_str.indexOf("</video>")>-1){
			video_exist = true;
		}
		if(video_img_elem_str.indexOf("<img src=")>-1){
			img_exist = true;
		}
		var item_name = "";
		if(video_exist && img_exist){
			item_name = "Video/Screenshot";
		}else if(video_exist){
			item_name = "Video";
		}else if(img_exist){
			item_name = "Screenshot";
		}
		if(item_name!=""){
			OutputDialogLink(output6,item_name,video_img_elem_str)
		}
	}
	/* 説明文の出力 */
	if(data.long_desc!=undefined){
		OutputDialogLink(output6,"Description",data.long_desc);
	}
	/* 購入者からの評価(星)の出力 */
	const star = data.star_rating;
	if(star.total!=null){
		OutputItem(output6,"Total Star",star.total);
		OutputItem(output6,"Average",star.score);
		for(var i in star.count){
			const star_n = 5 - i;
			const star_c = 4 - i;
			OutputItem(output6,star_n + "-Star",star.count[star_c].count);
		}
	}
	/* relationships(関連製品)のリンクの出力 */
	const relation = data.relationships
	if(relation!=undefined){
		for(var i in relation){
			var relation_url = prod_url2 + "/1?relationship=" + relation[i].key_name
			relation_url = relation_url.replace(/\/product\//,"/grid/");
			const count = " (" + relation[i].count + ")";
			OutputLink(output6,relation[i].name + count, relation_url)
		}
	}
	/* 親製品のタイトル名とURLの出力 */
	if(data.parent_links!=undefined && data.parent_links.length>0){
		const parent_links = data.parent_links;
		/* タイトル名 */
		if(parent_links[0].name!=undefined && parent_links[0].name.length>0){
			const parent_name = parent_links[0].name;
			OutputItem(output6,"Parent Title",parent_name);
		}else if(parent_links[0].short_name!=undefined && parent_links[0].short_name.length>0){
			const parent_name = parent_links[0].short_name;
			OutputItem(output6,"Parent Title",parent_name);
		}
		/* URL */
		if(parent_links[0].id!=undefined){
			const parent_url = path + lang + "-" + country + "/product/" + parent_links[0].id;
			OutputLink(output6,"Parent Product",parent_url);
			OutputLink(output6,"Get the Parent's chihiro",parent_url);
			$("#output6_Get_the_Parent_s_chihiro a").on("click",function(){
				if(parent_url.match(cid_reg)){
					const cid = parent_url.match(cid_reg)[0];
					$("#input_id").val(cid);
					ReChihiroCheck(cid);
				}
				return false;
			});
		}
	}
	def.resolve();
}

/* Chihiroのjsonの情報を出力 (PS Video) */
function ChihiroOut_Video(data,chihiro_json_url,def){
	/* タイトル名の出力 */
	const sub_cat = data.sub_category;
	if(sub_cat=="series"){
		OutputItem(output6,"Series",data.series_name);
	}else if(sub_cat=="season"){
		if(data.parent_name!=undefined){
			OutputItem(output6,"Title",data.parent_name);
		}else if(data.series_name!=undefined){
			OutputItem(output6,"Title",data.series_name);
		}else{
			OutputItem(output6,"Title",data.title_name);
		}
	}else if(sub_cat=="episode"){
		OutputItem(output6,"Title",data.series_name);
		const ep_num = data.episode_number;
		OutputItem(output6,"Episode "+ep_num,data.name);
	}else if(data.top_category=="film"){
		OutputItem(output6,"Title",data.title_name);
	}
	/* 製品ページのURLの出力 */
	const chi_cl_array = chi_cl.split("/");
	const country = chi_cl_array[0];
	var lang = chi_cl_array[1];
	if(lang=="ch"){
		lang = "zh-hant";
	}else if(lang=="zh"){
		lang = "zh-hans";
	}
	const path = "https://store.playstation.com/";
	const prod_url2 = path + lang + "-" + country + "/product/" + data.id;
	OutputLink(output6,"Product",prod_url2);
	/* 製品アイコンの出力 */
	const img_url_array = [];
	const img_name_array = [];
	if(data.images!=undefined && data.images.length>0){
		$.each(data.images,function(i,image_array){
			img_url_array.push(image_array.url);
			const img_name = "Type : " + image_array.type;
			img_name_array.push(img_name);
		})
		const img_elem = GenVideoImgElemStr([],img_url_array.reverse(),img_name_array.reverse());
		OutputDialogLink(output6,"Product Images",img_elem);
	}
	/* パブリッシャーの出力 */
	OutputItem(output6,"Publisher",data.provider_name);
	/* 発売日の出力 */
	const release_date = new Date(data.release_date).toLocaleDateString();
	if(release_date!="Invalid Date"){
		OutputItem(output6,"Release Date",release_date);
	}
	/* メタデータの出力 */
	const meta = data.metadata;
	if(meta!=undefined){
		try{
			const copyright = meta.copyright_notice;
			if(copyright!=undefined){
				OutputItem(output6,copyright.name,copyright.values.toString());
			}
			if(meta.genre!=undefined){
				OutputItem(output6,meta.genre.name,meta.genre.values.toString());
			}
			if(meta.display_studio!=undefined){
				OutputItem(output6,meta.display_studio.name,meta.display_studio.values.toString());
			}
		}catch(e){}
	}	
	/* 価格とrewards情報の出力 */
	if(data.default_sku!=undefined && data.default_sku.display_price!=undefined){
		OutputItem(output6,"Price",data.default_sku.display_price);
		if(data.skus!=undefined && data.skus[0].rewards!=undefined && data.skus[0].rewards.length>0){
			GetRewards(output6,data.skus[0].rewards,false);
		}
	}	
	/* 説明文の出力 */
	OutputDialogLink(output6,"Description",data.long_desc);	
	/* エピソードリストの出力 */
	const links = data.links;
	if(sub_cat=="season" && data.attributes.facets.sub_category[0].key=="episode"){
		var epi_elem_array = [];
		$.each(links,function(i,ep){
			var elem_array = [];
			const epi_num = "Episode " + ep.episode_number + " : ";
			const epi_name = epi_num + ep.name;
			const link_elem = "<a href='' class='epi_chihiro'>"+ep.id+"</a>"
			const epi_id = "Content ID : " + link_elem;
			elem_array.push(epi_name,epi_id);
			var epi_elem = elem_array.join("<br>");
			epi_elem = "<li>" + epi_elem + "</li>";
			epi_elem_array.push(epi_elem);
		})
		if(epi_elem_array.length>0){
			const epi_elem = "<ul>" + epi_elem_array.join("") + "</ul>";
			OutputDialogLink(output6,"Episode List",epi_elem)
			$(".epi_chihiro").on("click",function(){
				$("#input_id").val($(this).text());
				const cid = $(this).text();
				$("#output6_Episode_List_dialog").dialog("close");
				ReChihiroCheck(cid);
				return false;
			});
		}
	}
	/* 購入者からの評価(星)の出力 */
	const star = data.star_rating;
	if(star.total!=null){
		OutputItem(output6,"Total Star",star.total);
		OutputItem(output6,"Average",star.score);
		for(var i in star.count){
			const star_n = 5 - i;
			const star_c = 4 - i;
			OutputItem(output6,star_n + "-Star",star.count[star_c].count);
		}
	}
	/* seasonのChiroCheckを行うリンクの出力 */
	const p_links = data.parent_links;
	if(sub_cat=="episode" && p_links!=undefined && p_links.length>0){
		if(p_links[0].sub_category=="season"){
			OutputLink(output6,"Get the season's chihiro","");
			const item_selector = "output6_Get_the_season_s_chihiro a";
			$("#"+item_selector).removeAttr("target");
			$("#"+item_selector).on("click",function(){
				$("#input_id").val(p_links[0].id);
				const cid = p_links[0].id;
				ReChihiroCheck(cid);
				return false;
			});
		}
	}
	if(sub_cat=="series" && links!=undefined && links.length>0){
		if(links[0].sub_category=="season"){
			OutputLink(output6,"Get the season's chihiro","");
			const item_selector = "output6_Get_the_season_s_chihiro a";
			$("#"+item_selector).removeAttr("target");
			$("#"+item_selector).on("click",function(){
				$("#input_id").val(links[0].id);
				const cid = links[0].id;
				ReChihiroCheck(cid);
				return false;
			});
		}
	}	
	def.resolve();
}

/* PS1,PS2,PSP - Redumpからデータを取得*/
function RedumpCheck(def){
	const first_tid = $("#output1_Title_ID .item").text();
	if($("#redump").prop("checked") && (console_name=="ps1_2" || console_name=="psp" || console_name=="unknown")){
		const redump_tid = StrIns(first_tid,4,"+");
		console.log("--- Redump Check - 開始 ---");
		GetRedumpData(redump_tid).then(
			function(data){
				var d = $.Deferred();
				data = data.replace(/(src="\/images\/)/g,'src="http://redump.org/images/');
				const tracks = $(data).find("table.tracks");
				const result_i = data.indexOf("Displaying results");
				if(tracks.length==0 && result_i>-1){
					/* 複数登録されている場合 */
					console.log("--- Redump Check - 複数登録されているため、選択ページにリダイレクト ---");
					GetRedumpUrl(data,d)
				}else{
					/* 1つだけ登録されている場合 */
					d.resolve(data);
				}
				return d.promise();
			},function(){
				/* Redumpに登録されていない場合 */
				console.log("--- Redump Check - 未登録。終了 ---");
				const notice = "Redump Check finished.<br>This title id is not registered.";
				OutputNotice(output7,notice)
				var d = $.Deferred();
				/* main()に戻る */
				def.resolve();
				/* ここで処理を止める(dはpending) */
				return d.promise();
			}
		).then(
			function(data){
				/* データの取得成功。Redumpのデータを出力 */
				console.log("--- Redump Check - 発見。出力 ---");
				RedumpOut(data,def);
			},function(){
				/* GetRedumpUrlで失敗した場合 */
				console.log("--- Redump Check - 失敗 ---");
				const notice = "Redump Check failed.";
				OutputNotice(output7,notice)
				def.resolve();
			}
		)
	}else{
		def.resolve();
	}
	/* 同じタイトルIDの項目が複数ある場合に、最初の項目のURLを取得する */
	function GetRedumpUrl(data,d){
		const redump_tid = StrIns(first_tid,4,"-");
		const quicksearch_path = "http://redump.org/discs/quicksearch/";
		const quicksearch_url = quicksearch_path + redump_tid.toLowerCase();
		OutputLink(output1,"Redump results",quicksearch_url);
		data = data.replace(/(src="\/images\/)/g,'src="http://redump.org/images/');
		const tbody = $(data).find(".games").find("tbody");
		var redump_url = null;
		if(tbody.length==1){
			const tr = $(data).find("tr");
			for(var i=1; i<tr.length; i++){
				const td = $(tr[i]).find("td");
				for(var x=1; x<td.length; x++){
					if(x==1){
						redump_url = $(td[x]).find("a").attr("href");
					}
					if(redump_url!=null)break;
				}
				if(redump_url!=null)break;
			}
		}
		if(redump_url!=null){
			console.log("--- Redump Check - 選択ページから最初の項目のURLを取得 ---");
			redump_url = "http://redump.org" + redump_url;
			GetPageData(redump_url).then(
				function(data){
					data = data.replace(/(src="\/images\/)/g,'src="http://redump.org/images/');
					d.resolve(data);
				},function(){
					console.log("--- Redump Check - データ取得失敗 ---");
					d.reject();
				}
			)
		}else{
			console.log("--- Redump Check - 選択ページからURLを取得失敗 ---");
			d.reject();
		}
	}
}

/* Redumpの情報を出力 */
function RedumpOut(data,def){
	/* URLの出力 */
	const tools = $(data).find(".tools");
	const tools_a = $(tools).find("a");
	var redump_url = null;
	for(var i=0; i<tools_a.length; i++){
		const tool_str = $(tools_a[i]).text();
		switch(tool_str){
			case "SHA1":
					redump_url = $(tools_a[i]).attr("href");
					i = tools_a.length;
				break;
			case "MD5":
					redump_url = $(tools_a[i]).attr("href");
					i = tools_a.length;
				break;
			case "SFV":
					redump_url = $(tools_a[i]).attr("href");
					i = tools_a.length;
				break;
		}
	}
	if(redump_url!=null){
		redump_url = "http://redump.org" + redump_url;
		redump_url = redump_url.match(/http:\/\/redump.org\/disc\/[0-9]{1,10}/)[0];
		OutputLink(output1,"Redump",redump_url);
	}
	/* タイトルの出力 */
	const h1_title = $(tools).next();
	if(h1_title.length==1){
		OutputItem(output7,"Title",$(h1_title).text());
	}
	/* 情報取得1 */
	const info_tr = $(data).find(".gameinfo").find("tr");
	var media_str = null;
	var region_str = null;
	var lang_a = [];
	var tids_str = null;
	var exe_str = null;
	var ver_str = null;
	var edi_str = null;
	var layerbreak_str = null;
	var numt_srt = null;
	var writeo_str = null;
	for(var i=0; i<info_tr.length; i++){
		const info_td = $(info_tr[i]).find("td");
		const th_str = $(info_tr[i]).find("th").text();
		switch(th_str){
			case "Media":
				media_str = $(info_td).text();
				break
			case "Region":
				region_str = $(info_td).find("img").attr("alt");
				if(region_str==undefined || region_str==""){
					region_str = null;
				}
				break;
			case "Languages":
				const lang_imgs = $(info_td).find("img");
				for(var x=0; x<lang_imgs.length; x++){
					const lang_name = $(lang_imgs[x]).attr("alt");
					if(lang_name!=undefined && lang_name!=null && lang_name!=""){
						lang_a.push(lang_name);
					}
				}
				break;
			case "Serial":
				tids_str = $(info_td).text();
				break;
			case "EXE date":
				exe_str = $(info_td).text();;
				break;
			case "Version":
				ver_str = $(info_td).text();
				break
			case "Edition":
				edi_str = $(info_td).text();
				break;
			case "Layerbreak":
				layerbreak_str = $(info_td).text();
				break
			case "Number of tracks":
				numt_srt = $(info_td).text();
				break;
			case "Write offset":
				writeo_str = $(info_td).text();
				break;
		}
	}
	/* 情報取得2 */
	const com_tr = $(data).find(".gamecomments").find("tr");
	var barcode_flag = false;
	var barcode_str = null;
	const tid_reg2 = /[a-zA-Z]{4}-\d{5}/;
	var in_seri_str = null;
	for(var i=0; i<com_tr.length; i++){
		const com_td = $(com_tr[i]).find("td");
		var th_str = $(com_tr[i]).find("th").text();
		if(th_str=="Barcode"){
			barcode_flag = true;
		}else if(barcode_flag){
			barcode_str = $(com_td).text();
			barcode_flag = false;
		}
		if($(com_td).text().match(tid_reg2)){
			in_seri_str = $(com_td).text().match(tid_reg2)[0];
		}
	}
	/* 情報出力 */
	if(media_str!=null){
		OutputItem(output7,"Media",media_str);
	}
	if(region_str!=null){
		OutputItem(output7,"Region",region_str);
	}
	if(lang_a.length>0){
		OutputItem(output7,"Launguage",lang_a.join(","));
	}
	if(tids_str!=null){
		OutputItem(output7,"Serial",tids_str);
	}
	if(exe_str!=null){
		OutputItem(output7,"EXE date",exe_str);
	}
	if(ver_str!=null){
		OutputItem(output7,"Version",ver_str);
	}
	if(edi_str!=null){
		OutputItem(output7,"Edition",edi_str);
	}
	if(layerbreak_str!=null){
		OutputItem(output7,"Layerbreak",layerbreak_str);
	}
	if(numt_srt!=null){
		OutputItem(output7,"Number of tracks",numt_srt);
	}
	if(writeo_str!=null){
		OutputItem(output7,"Write offset",writeo_str);
	}
	if(barcode_str!=null){
		OutputItem(output7,"Barcode",barcode_str);
	}
	if(in_seri_str!=null){
		OutputItem(output7,"Internal Serial",in_seri_str);
	}
	/* サイズ・ハッシュの出力 */
	var tracks = $(data).find("table.tracks");
	const tr = $(tracks).find("tbody").find("tr");
	if(tr.length>3){
		//マルチトラックの場合はダイアログで出力
		tracks = '<table class="tracks" cellspacing="0">' + tracks.html() + "</table>";
		OutputDialogLink(output7,"Tracks info",tracks);
	}else{
		//マルチトラックでない場合はそれぞれを出力
		var size_i = null;
		var crc32_i = null;
		var md5_i = null;
		var sha1_i = null;
		const th = $(tr[1]).find("th");
		for(var i=0; i<th.length; i++){
			const th_str = $(th[i]).text();
			switch(th_str){
				case "Size":
					size_i = i;
					break;
				case "CRC-32":
					crc32_i = i;
					break;
				case "MD5":
					md5_i = i;
					break;
				case "SHA-1":
					sha1_i = i;
					break;
			}
		}
		const td = $(tr[2]).find("td");
		if(size_i!=null){
			const size_str = $(td[size_i]).text();
			OutputItem(output7,"Size",size_str);
			
		}
		if(crc32_i!=null){
			const crc32_str = $(td[crc32_i]).text();
			OutputItem(output7,"CRC-32",crc32_str);
		}
		if(md5_i!=null){
			const md5_str = $(td[md5_i]).text();
			OutputItem(output7,"MD5",md5_str);
		}
		if(sha1_i!=null){
			const sha1_str = $(td[sha1_i]).text();
			OutputItem(output7,"SHA-1",sha1_str);
		}
	}
	/* リング情報をダイアログで出力 */
	if($(data).find("table.rings").length==1){
		const rings = '<table class="rings" cellspacing="0">' + $(data).find("table.rings").html() + '</table>';
		OutputDialogLink(output7,"Rings",rings);
	}
	/* 完了 */
	def.resolve();
}

/* PS1,PS2 - PSXDatacenterからデータを取得 */
function PSXDcCheck(def){
	const first_tid = $("#output1_Title_ID .item").text();
	if($("#psxdc").prop("checked")){
		console.log("--- PSXDatacenter Check - 開始 ---");
		GetPSXDcURL(first_tid).then(
			function(psxdc_url){
				console.log("--- PSXDatacenter Check - 発見。データ取得開始 ---\n" + psxdc_url);
				GetPageData(psxdc_url).then(
					function(data){
						console.log("--- PSXDatacenter Check - データ取得成功。出力 ---");
						def.resolve(psxdc_url,data);
					},function(){
						console.log("--- PSXDatacenter Check - データ取得失敗。終了 ---");
						const notice = "PSXDatacenter Check failed.";
						OutputNotice(output8,notice)
						def.reject();
					}
				)
			},function(){
				console.log("--- PSXDatacenter Check - 未登録。終了 ---");
				const notice = "PSXDatacenter Check finished.<br>This title is not registered.";
				OutputNotice(output8,notice)
				def.reject();
			}
		)
	}else{
		def.reject();
	}
}

/* PSXDatacenterの情報を出力 */
function PSXDcOut(psxdc_url,data,def){
	try{
		/* エラー防止 */
		const user_agent = window.navigator.userAgent.toLowerCase();
		if(user_agent.indexOf("edge")>0 || user_agent.indexOf("trident")>0){
			data = data.replace(/��/,"");
			data = data.replace(/src\=\"\.\.\/\.\.\/\.\.\/images\//g,'src="https://psxdatacenter.com/images/');
			data = data.replace(/src\=\"\.\.\/images2\//g,'src="https://psxdatacenter.com/psx2/images2/');
			if($(data).length==1){
				data = $(data)[0].data;
				data = data.replace(/(&|nbsp;)/g,"");
			}
		}
		data = data.replace(/src\=\"\.\.\/\.\.\/\.\.\/images\//g,'src="https://psxdatacenter.com/images/');
		data = data.replace(/src\=\"\.\.\/images2\//g,'src="https://psxdatacenter.com/psx2/images2/');
		/* URLの出力 */
		OutputLink(output1,"PSXDatacenter",psxdc_url);
		/* 情報の取得,出力 */
		const t4td = $(data).find("#table4").find("td");
		$.each(t4td,function(i,td){
			var td_txt = $(td).text().trim();
			var td_txt_next = $(t4td[i+1]).text().trim();
			/* タイトル名の出力 */
			if(td_txt=="Official Title" || td_txt=="OFFICIAL TITLE"){
				OutputItem(output8,"Title",td_txt_next);
			}
			/* シリアルナンバー(タイトルID)の出力 */
			if(td_txt=="Serial Number(s)" || td_txt=="SERIAL NUMBER(S)"){
				OutputItem(output8,"Serial Number",td_txt_next);
			}
			/* リージョンの出力 */
			if(td_txt=="Region" || td_txt=="REGION"){
				OutputItem(output8,"Region",td_txt_next);
			}
			/* ジャンルの出力 */
			if(td_txt=="Genre / Style" || td_txt=="GENRE / STYLE"){
				OutputItem(output8,"Genre/Style",td_txt_next);
			}
			/* デベロッパーの出力 */
			if(td_txt=="Developer" || td_txt=="DEVELOPER"){
				OutputItem(output8,"Developer",td_txt_next);
			}
			/* パブリッシャーの出力 */
			if(td_txt=="Publisher" || td_txt=="PUBLISHER"){
				OutputItem(output8,"Publisher",td_txt_next);
			}
			/* 発売日の出力 */
			if(td_txt=="Date Released" || td_txt=="DATE RELEASED"){
				OutputItem(output8,"Release Date",td_txt_next);
			}
		})
		/* ゲームカバーの出力 */;
		const img = $(data).find("img");
		var screenshots_array = [];
		for(var i=0;i<img.length;i++){
			const img_url = $(img[i]).attr("src");
			if(img_url.indexOf("covers")>0 && $("#output8_Game_Cover").length==0){
				const img_elem_str = GenVideoImgElemStr([],[img_url]);
				OutputDialogLink(output8,"Game Cover",img_elem_str);
				//break;
			}
			if(img_url.indexOf("screens")>0 && img_url.indexOf("screens.jpg")==-1){
				screenshots_array.push(img_url);
			}
		}
		/* ディスク情報の出力 */
		const disc_info_tb = "<table>" + $(data).find("#table7").html() + "</table>";
		OutputDialogLink(output8,"Disc Information",disc_info_tb);
		/* タイトル紹介の出力 */
		OutputDialogLink(output8,"Description",$($(data).find("#table16")[0]).html())
		/* 特徴の出力 */
		const game_features_tb = "<table>" + $(data).find("#table19").html() + "</table>";
		OutputDialogLink(output8,"Game Features",game_features_tb);
		/* スクリーンショットの出力 */
		var screenshots_tb = "<table>" + $(data).find("#table22").html() + "</table>";
		OutputDialogLink(output8,"Screenshots",screenshots_tb);	
		/* エミュの互換性の出力 (なぜか#table25が取れない事があるため、この方法で) */
		const emu_i1 = data.indexOf("<!-- Emulation Compatibility Sectional -->");
		const emu_i2 = data.indexOf("<!-- Game Controls Table -->");
		if(emu_i1>0 && emu_i2>0){
			if($(data.slice(emu_i1,emu_i2)).text().trim() != ""){
				OutputDialogLink(output8,"Emulation Compatibility",data.slice(emu_i1,emu_i2));
			}
		}
		/* 操作説明の出力 */
		OutputDialogLink(output8,"Game Controls",$($(data).find("#table16")[1]).html())
		/* チートコードの出力 */
		if($($(data).find("#table16")[2]).text().trim()!=""){
			OutputDialogLink(output8,"Game Cheats",$($(data).find("#table16")[2]).html())
		}
		/* 高解像度カバー一覧の出力 */
		data = data.replace(/href\=\"\.\.\/images2\//g,'href="https://psxdatacenter.com/psx2/images2/');
		data = data.replace(/href\=\"\.\.\/\.\.\/\.\.\/images\//g,'href="https://psxdatacenter.com/images/');
		var high_reso_count = 1;
		$.each($(data).find("#table28"),function(i,tb28){
			var high_reso_tb = "<table>" + $(tb28).html() + "</table>";
			high_reso_tb = high_reso_tb.replace(/#FFFF00/g,"#000");
			const item_name = "High Resolution Covers " + high_reso_count;
			OutputDialogLink(output8,item_name,high_reso_tb);
			high_reso_count++;
		})
		$.each($(data).find("#table29"),function(i,tb29){
			var high_reso_tb = "<table>" + $(tb29).html() + "</table>";
			high_reso_tb = high_reso_tb.replace(/#FFFF00/g,"#000");
			const item_name = "High Resolution Covers " + high_reso_count;
			OutputDialogLink(output8,item_name,high_reso_tb);
			high_reso_count++;
		})
		/* 他のリージョンの情報の出力 */
		if($(data).find("#table32").text().trim()!=""){
			OutputDialogLink(output8,"Other Regions Released",$(data).find("#table32").html())
		}
	}catch(e){
		console.log(e);
	}
	def.resolve();
}


/////////////////////////////////////////////////////


/* manual mode */
function ManualMode(manual){
	switch(manual){
		case "psp":
			var update_path = "https://a0.ww.np.dl.playstation.net/tpl/np/";
			var update_url = update_path + tid + "/" + tid + "-ver.xml";
			OutputLink(output1,"Update xml",update_url);
			GetPageData_call_manual($("#output1_Update_xml"),update_url,"xml",true);
			break;
		case "ps3":
			var tmdb_key = "F5DE66D2680E255B2DF79E74F890EBF349262F618BCAE2A9ACCDEE5156CE8DF2CDF2D48C71173CDC2594465B87405D197CF1AED3B7E9671EEB56CA6753C2E6B0";
			var tmdb_msg = tid + "_00";
			var tmdb_hmac = GetHmacSha1(tmdb_key,tmdb_msg).toUpperCase();
			var tmdb_path = "http://tmdb.np.dl.playstation.net/tmdb/";
			var tmdb_url = tmdb_path + tmdb_msg + "_" + tmdb_hmac + "/" + tmdb_msg + ".xml";
			OutputLink(output1,"Tmdb xml",tmdb_url);
			GetPageData_call_manual($("#output1_Tmdb_xml"),tmdb_url,"xml");
			var update_path = "https://a0.ww.np.dl.playstation.net/tpl/np/";
			var update_url = update_path + tid + "/" + tid + "-ver.xml";
			OutputLink(output1,"Update xml",update_url);
			GetPageData_call_manual($("#output1_Update_xml"),update_url,"xml",true);
			break;
		case "vita":
			var update_key = "E5E278AA1EE34082A088279C83F9BBC806821C52F2AB5D2B4ABD995450355114";
			var update_msg = "np_" + tid;
			var update_hmac = GetHmacSha256(update_key,update_msg);
			var update_path = "http://gs-sec.ww.np.dl.playstation.net/pl/np/";
			var update_url = update_path + tid + "/" + update_hmac + "/" + tid + "-ver.xml";
			OutputLink(output1,"Update xml",update_url);
			GetPageData_call_manual($("#output1_Update_xml"),update_url,"xml",true);
			break;
		case "ps4":
			var tmdb_key = "F5DE66D2680E255B2DF79E74F890EBF349262F618BCAE2A9ACCDEE5156CE8DF2CDF2D48C71173CDC2594465B87405D197CF1AED3B7E9671EEB56CA6753C2E6B0";
			var tmdb_msg = tid + "_00";
			var tmdb_hmac = GetHmacSha1(tmdb_key,tmdb_msg).toUpperCase();
			var tmdb_path = "http://tmdb.np.dl.playstation.net/tmdb2/";
			var tmdb_url = tmdb_path + tmdb_msg + "_" + tmdb_hmac + "/" + tmdb_msg + ".json";
			OutputLink(output1,"Tmdb json",tmdb_url);
			GetPageData_call_manual($("#output1_Tmdb_json"),tmdb_url,"json");
			var update_key = "AD62E37F905E06BC19593142281C112CEC0E7EC3E97EFDCAEFCDBAAFA6378D84";
			var update_msg = "np_" + tid;
			var update_hmac = GetHmacSha256(update_key,update_msg);
			var update_path = "http://gs-sec.ww.np.dl.playstation.net/plo/np/";
			var update_url = update_path + tid + "/" + update_hmac + "/" + tid + "-ver.xml";
			OutputLink(output1,"Update xml",update_url);
			GetPageData_call_manual($("#output1_Update_xml"),update_url,"xml",true);	
			break;
	}
	function GetPageData_call_manual(out,url,type,enable_input){
		GetPageData(url,type).then(
			function(data){
				if(enable_input!=undefined && enable_input){
					EnableInput();
					$("#reset").hide();
				}
			},function(){
				out.append(notfound);
				if(enable_input!=undefined && enable_input){
					EnableInput();
					$("#reset").hide();				
				}
			}
		)
	}
}


/////////////////////////////////////////////////////


/* TmdbCheckを再実行*/
function ReTmdbCheck(){
	if(console_name!=undefined && !ps4_v_phys_flag){
		$(".tmdb").remove();
		EmptyOa(4);
		if(console_name=="ps1_2" || console_name=="ps3" || console_name=="ps4"){
			(function(){
				DisableInput();
				var def = $.Deferred();
				PS3PS4_TmdbCheck(def);
				return def.promise();
			}()).then(
				function(data){
					var def = $.Deferred();
					if(console_name=="ps1_2" || console_name=="ps3"){
						PS3_TmdbOut(data,def);
					}else{
						PS4_TmdbOut(data,def);
					}
					return def.promise();
				},function(){
					return $.Deferred().resolve().promise();
				}	
			).then(
				function(){
					EnableInput();
				}
			)
		}
	}
}

/* UpdateCheckを再実行 */
function ReUpdateCheck(){
	var check_flag = false; // チェック実行フラグ
	if(console_name!=undefined && !ps4_v_phys_flag){
		switch(console_name){
			case "ps4":
			case "ps3":
			case "vita":
			case "psp":
				$(".update").remove();
				EmptyOa(5);
				check_flag = true;
				break;
		}
	}
	/* チェック実行 */
	if(check_flag){
		if(console_name=="psp" || console_name=="ps3"){
			/* PSP,PS3 - UpdateCheck */
			$.Deferred().resolve().promise().then(
				function(){
					DisableInput();
					var def = new $.Deferred();
					PSPPS3_UpdateCheck(def);
					return def.promise();
				}
			).then(
				function(data){
					var def = new $.Deferred();
					PSPPS3_UpdateOut(data,def);
					return def.promise();
				},function(){
					return $.Deferred().resolve().promise();
				}
			).then(
				function(){
					EnableInput();
				}
			);
		}else if(console_name=="vita"){
			/* PSVita - UpdateCheck */
			$.Deferred().resolve().promise().then(
				function(){
					DisableInput();
					var def = $.Deferred();
					PSVITA_UpdateCheck(def);
					return def.promise();
				}
			).then(
				function(data){
					var def = $.Deferred();
					PSVITA_UpdateOut(data,def);
					return def.promise();
				},function(){
					return $.Deferred().resolve().promise();
				}
			).then(
				function(){
					EnableInput();
				}
			);
		}else if(console_name=="ps4"){
			/* PS4 - UpdateCheck */
			$.Deferred().resolve().promise().then(
				function(){
					DisableInput();
					var def = $.Deferred();
					PS4_UpdateCheck(def);
					return def.promise();
				}
			).then(
				function(data){
					var def = $.Deferred();
					PS4_UpdateOut(data,def);
					return def.promise();
				},function(){
					return $.Deferred().resolve().promise();
				}
			).then(
				function(){
					EnableInput();
				}
			);
		}
	}
}

/* ChihiroCheckを再実行 */
function ReChihiroCheck(cid){
	/* 呼び出し側でコンテンツIDを引数として指定している場合はフラグを立てる */
	var cid_arg_flag = false;
	if(cid!=undefined){
		cid_arg_flag = true;
	}
	/* 引数のcidが存在せずコンテンツIDを用意出来る場合は用意する */
	if(cid_array!=undefined){
		GetCidFromTid().then(
			function(){
				return $.Deferred().resolve().promise();
			},function(){
				return $.Deferred().resolve().promise();
			}
		).then(
			function(){
				if(cid==undefined && cid_array.length>0 && !ps4_tc_flag){
					if(chi_out_cid!=null){
						cid = chi_out_cid;
					}else{
						cid = cid_array[0];
					}
				}
				var check_flag = false; // チェック実行フラグ
				if($(".chihiro").length){
					/* 既に一度実行している場合 */
					check_flag = true;
					/* ReChihiroCheckをコンテンツIDを引数にして実行するのはこの場合のみなので */
					/* (これをやっておかないとtitlecontainerのURLが作成されてしまう事がある) */
					if(cid_arg_flag){
						ps4_tc_flag = false;
					}
				}else if(ps4_tc_flag || tid.match(/^CUSA/)!=null){
					/* PS4タイトル(CUSAxxxxx)がtidに入っている場合 */
					ps4_tc_flag = true;
					check_flag = true;
				}else if(cid!=undefined){
					/* cidにコンテンツIDが入っている場合は */
					check_flag = true;
				}else if(tid!=undefined && title_array.length>0){
					/* Tumbler Searchが機能する事を期待して */
					check_flag = true;
				}
				/* チェック実行 */
				if(check_flag){
					$(".chihiro").remove();
					$(".search").remove();
					chi_hist_array = [];
					chi_cid_index = 0;
					create_search_word_flag = true;
					tumb_search_array = [];
					tumb_search_index = 0;
					tumb_hit_flag = false;
					EmptyOa(6);			
					(function(){
						DisableInput();
						var def = $.Deferred();
						if(ps4_tc_flag){
							ChihiroCheck(def);
						}else{
							ChihiroCheck(def,cid);
						}
						return def.promise();
					}()).then(
						function(data,chihiro_json_url){
							var def = $.Deferred();
							if(console_name=="video"){
								ChihiroOut_Video(data,chihiro_json_url,def);
							}else{
								ChihiroOut(data,chihiro_json_url,def);
							}
							return def.promise();
						},function(){
							return $.Deferred().resolve().promise();
						}
					).then(
						function(){
							EnableInput();
						}
					)
				}
			}
		)
	}
}

/* OfficialCheckを再実行 */
function ReOfficialCheck(){
	if($("#official").prop("checked") && !ps4_v_phys_flag && !ps4_v_phys_flag_fix){
		const sb_val = $("#official_sb").val();
		if((console_name=="ps1_2" && sb_val!="ex") || console_name=="unknown"){
			$(".official").remove();
			EmptyOa(2);
			$.Deferred().resolve().promise().then(
				function(){
					DisableInput();
					var def = $.Deferred();
					GetOfficial(def,tid);
					return def.promise();
				}
			).then(
				function(official_url,data){
					var def = $.Deferred();
					OutputOfficial(official_url,data,def);
					return def.promise();
				},function(){
					return $.Deferred().resolve().promise();
				}
			).then(
				function(){
					var def = $.Deferred();
					if(cid_array.length>0){
						ChihiroCheck(def);
					}else{
						def.reject();
					}
					return def.promise();
				}
			).then(
				function(data,chihiro_json_url){
					var def = $.Deferred();
					ChihiroOut(data,chihiro_json_url,def);
					return def.promise();
				},function(){
					return $.Deferred().resolve().promise();
				}
			).then(
				function(){
					EnableInput();
				}
			)
		}else if(console_name=="ps3" || console_name=="psp" || console_name=="vita"){
			if(sb_val=="ex"){
				$(".official").remove();
				EmptyOa(2);
				$.Deferred().resolve().promise().then(
					function(){
						DisableInput();
						var def = $.Deferred();
						GetOfficial_PS3PSPPSVITA(def,[],0);
						return def.promise();
					}
				).then(
					function(){
						EnableInput();
					}
				)
			}
		}
	}
}

/* RedumpCheckを再実行 */
function ReRedumpCheck(){
	const check_flag = $("#redump").prop("checked");
	if(check_flag && (console_name=="ps1_2" || console_name=="psp" || console_name=="unknown")){
		const first_tid = $("#output1_Title_ID .item").text();
		if(first_tid.indexOf("NP")==-1){
			$(".redump").remove();
			EmptyOa(7);
			$.Deferred().resolve().promise().then(
				function(){
					DisableInput();
					var def = $.Deferred();
					RedumpCheck(def);
					return def.promise();
				}
			).then(
				function(){
					EnableInput();
				}
			);
		}
	}
}

/* PSXDatacenterCheckを再実行 */
function RePSXDcCheck(){
	const check_flag = $("#psxdc").prop("checked");
	if(check_flag && console_name=="ps1_2"){
		$(".psxdc").remove();
		EmptyOa(8);
		$.Deferred().resolve().promise().then(
			function(){
				DisableInput();
				var def = $.Deferred();
				PSXDcCheck(def);
				return def.promise();
			}
		).then(
			function(psxdc_url,data){
				var def = $.Deferred();
				PSXDcOut(psxdc_url,data,def);
				return def.promise();
			},function(){
				return $.Deferred().resolve().promise();
			}
		).then(
			function(){
				EnableInput();
			}
		);	
	}
}


/////////////////////////////////////////////////////


/* スクレイピング(xml/json/html) */
function GetPageData(url,data_type){
	/* data_typeは"xml"か"json"。htmlで取得する場合は指定しない */
	var def = $.Deferred();
	var php_url = "ajax.php?url=" + encodeURIComponent(url);
	if(data_type=="xml" || data_type=="json"){
		php_url += "&no_ua";
	}
	$.ajax({
		type: "GET",
		url: php_url
	}).done(function(data){
		//console.log(data);
		if(data==""){
			data = null;
		}else if(data.indexOf("HTTP request failed")<0){
			if(data_type=="xml"){
				try{
					data = $.parseXML(data);
				}catch(e){
					var byte_str = string_to_utf8_bytes(data);
					var hex_str = bytes_to_hex_string(byte_str);
					hex_str = hex_str.replace(/(00)/g,"");
					var byte_str2 = hex_string_to_bytes(hex_str);
					data = utf8_bytes_to_string(byte_str2);
					$.parseXML(data)
				}
			}else if(data_type=="json"){
				data = $.parseJSON(data);
			}
		}else{
			data = null;
		}
		if(data==null){
			def.reject();
		}else{
			def.resolve(data);
		}
	}).fail(function(data){
		def.reject();
	});
	return def.promise();
}

/* スクレイピング(Redump専用) */
function GetRedumpData(redump_tid){
	var def = $.Deferred();
	$.ajax({
		type: "GET",
		url: "redump.php?tid=" + redump_tid
	}).done(function(data){
		if(data!=undefined && data!=null && data!="" && data.indexOf("HTTP request failed")==-1 &&
		data.indexOf("<div>No discs found.</div>")==-1){
			def.resolve(data);
		}else{
			def.reject();
		}
	}).fail(function(data){
		def.reject();
	});	
	return def.promise();
}

/* タイトルIDからコンテンツIDを検索 (ps3_psp_psv_psx_tid_cid.json) */
function GetCidFromTid(){
	var def = $.Deferred();
	if(tid_j_hist_array.indexOf(tid)==-1){
		var check_flag = false;
		switch(console_name){
			case "ps3":
			case "psp":
			case "vita":
			case "ps1c":
				check_flag = true;
				break;
		}
		if(check_flag){
			tid_j_hist_array.push(tid);
			$.ajax({
				type: "GET",
				url: "tid_cid.php?tid=" + tid
			}).done(function(data){
				if(data.match(cid_reg)){
					const cid = data.match(cid_reg)[0];
					if(NewCidPush(cid)){
						console.log("--- tid_cid.json Check - 成功 ---\n" + cid);
						def.resolve(cid);
					}else{
						console.log("--- tid_cid.json Check - 既に同じIDを所持 ---");
						def.reject();
					}
				}else{
					console.log("--- tid_cid.json Check - 該当無し。失敗 ---");
					def.reject();
				}
			}).fail(function(data){
				console.log("--- tid_cid.json Check - エラー。失敗 ---");
				def.reject();
			});
		}else{
			def.reject();
		}
	}else{
		def.reject();
	}
	return def.promise();
}

/* PSXDatacenterのURLを検索 (ps1_ps2_psxdatacenter.json) */
function GetPSXDcURL(first_tid){
	var def = $.Deferred();
	$.ajax({
		type: "GET",
		url: "psxdatacenter.php?tid=" + tid
	}).done(function(psxdc_url){
		if(psxdc_url!=""){
			def.resolve(psxdc_url);
		}else{
			def.reject();
		}
	}).fail(function(data){
		def.reject();
	});
	return def.promise();
}

/* HMAC-SHA1 */
function GetHmacSha1(key,msg){
	var shaObj = new jsSHA("SHA-1", "TEXT");
	shaObj.setHMACKey(key, "HEX");
	shaObj.update(msg);
	const hmac = shaObj.getHMAC("HEX");
	return hmac;
}

/* HMAC-SHA256 */
function GetHmacSha256(key,msg){
	var shaObj = new jsSHA("SHA-256", "TEXT");
	shaObj.setHMACKey(key, "HEX");
	shaObj.update(msg);
	const hmac = shaObj.getHMAC("HEX");
	return hmac;
}

/* PS4,PSVitaのUpdateのxmlから取得したFWバージョンの変換 */
function FixSysVer(sys_ver){
	sys_ver = (parseFloat(sys_ver).toString(16)/1000000).toFixed(3);
	sys_ver = sys_ver.slice(0,4);
	return sys_ver;
}

/* バイト表記のサイズの変換 */
function FixSize(size){
	const unit_array = ["Byte","KB","MB","GB","TB"];
	var unit_i = 0;
	for(size; size>=1024; size=Math.floor((size/1024)*10)/10){
		unit_i++;
	}
	return size.toString() + unit_array[unit_i];
}

/* リージョンからPS Storeの国コード/言語コードを決定 */
function FuzzyCountryLangFromRegion(){
	if(chi_region==null){
		chi_region = "US";
	}
	switch(chi_region){
		case "EU": chi_cl = "gb/en"; break;
		case "US": chi_cl = "us/en"; break;
		case "JP": chi_cl = "jp/ja"; break;
		case "HK": chi_cl = "hk/zh"; break;
		case "KR": chi_cl = "kr/ko"; break;
		case "ASIA": chi_cl = "hk/en"; break;
	}
}


/////////////////////////////////////////////////////


/* タイトル名をtitle_arrayに格納、タイトル名を出力 */
function OutputTitle(out,temp_array){
	const out_title_array = [];
	$.each(temp_array,function(i,temp_title){
		if(out_title_array.indexOf(temp_title)==-1){
			out_title_array.push(temp_title);
		}
		if(title_array.indexOf(temp_title)==-1){
			title_array.push(temp_title);
		}
	})
	OutputItemPrepend(out,"Title",out_title_array[0]);
	/* タイトル名が複数ある場合に、矢印アイコンをクリックして表示を切り替えられるように */
	if(out_title_array.length>1){
		const out_id = out.attr("id");
		const item_id = out_id + "_title_arrow";
		const deno_id = out_id + "_deno"; // 分子表示のID
		const fraction_elem = "(<span id='"+deno_id+"'>1</span>"+"<span>/"+out_title_array.length+")</span>";
		const arrow_elem = fraction_elem + "<span id='"+item_id+"' class='arrow_right'></span>"
		const title_out_id = out_id + "_Title";
		$("#"+title_out_id).find(".item").before(arrow_elem);
		$("#"+item_id).on("mouseover",function(){
			$("#"+item_id).css("color","deepskyblue");
		});
		$("#"+item_id).on("mouseout",function(){
			$("#"+item_id).css("color","green");
		});
		var title_index = 1;
		$("#"+item_id).on("click",function(){
			$("#"+title_out_id).find(".item").html(out_title_array[title_index]);
			$("#"+deno_id).html((title_index+1));
			title_index++;
			if(title_index>=out_title_array.length) title_index = 0;
		});
	}
}

/* PS4タイトルのTmdbにあるpronunciationのxmlのURLを使用して情報を取得 */
function GetPronunciation(out,pron_xml){
	GetPageData(pron_xml,"xml").then(
		function(data){
			const langs = $(data).find("language");
			const pron_elem_array = [];
			$.each(langs,function(i,pron){
				const elem_array = [];
				const lang_id = "Language ID : " + $(pron).attr("id");
				elem_array.push(lang_id);
				const words = $(pron).find("speechRecognitionWords");
				$.each(words,function(x,word){
					const pron_text = "Text : " + $(word).find("text").text();
					const pron_pron = "Pron : " + $(word).find("pronunciation").text();
					elem_array.push(pron_text,pron_pron);
				})
				var pron_elem = elem_array.join("<br>");
				pron_elem = "<li>" + pron_elem + "</li>";
				pron_elem_array.push(pron_elem);
			})
			if(pron_elem_array.length>0){
				var pron_elem = "<ul>" + pron_elem_array.join("") + "</ul>";
				const pron_link = "<a href='"+pron_xml+"'>Pronunciation xml</a>";
				pron_elem = pron_link + pron_elem;
				OutputDialogLink(out,"Pronunciation",pron_elem);
				$("#output4_Pronunciation").insertAfter("#output4_PS4Pro_Support")[0];
			}
		}
	);
}

/* URLのリストを元に、ダイアログとして出力する要素を作成 */
function HrefStr(urls){
	/* ( urls[偶数]はURL , urls[奇数]は名前 ) */
	const href_a = [];
	for(var i=0;i<urls.length/2; i++){
		const href_str = "<a href='"+urls[(i*2)]+"' target='_blank'>"+urls[(i*2)+1]+"</a><br>"
		href_a.push(href_str);
	}
	const elem_str = href_a.join("");
	return elem_str;
}

/* eligibilitiesの出力 - ChihiroCheck */
function GetEligibilities(out,eligibilities,cid,getsku_flag){
	/* 
		eligibilities ... 製品を購入するために必要となる製品のリスト？ 
		operator ... trueは「この製品が購入に必要」の意味、falseは「この製品を持ってる場合は購入出来ない」の意味？
		name, id, operator を出力
	*/
	const eli_elem_array = [];
	$.each(eligibilities,function(i,eli){
		if(eli.id!=cid){
			const elem_array = [];
			const eli_name = "Title : " + eli.name;
			var link_elem = null;
			if(!getsku_flag){
				if(eli.id.match(cid_reg)){
					link_elem = "<a href class='eligibility'>"+eli.id+"</a>";
				}else{
					link_elem = eli.id;
				}
			}else{
				link_elem = eli.id;
			}
			const eli_id = "ID : " + link_elem;
			const eli_ope = "Operator : " + eli.operator;
			elem_array.push(eli_name,eli_id,eli_ope);
			var eli_elem = elem_array.join("<br>");
			eli_elem = "<li>" + eli_elem + "</li>";
			eli_elem_array.push(eli_elem);
		}
	})
	if(eli_elem_array.length>0){
		const eli_elem = "<ul>" + eli_elem_array.join("") + "</ul>";
		if(!getsku_flag){
			OutputDialogLink(out,"Eligibilities",eli_elem)
			/* コンテンツIDクリック時にReChihiroCheck */
			$(".eligibility").on("click",function(){
				cid = $(this).text();
				$("#input_id").val(cid);
				$("#output6_Eligibilities_dialog").dialog("close");
				ReChihiroCheck(cid);
				return false;
			});
		}else{
			return eli_elem;
		}
	}else{
		if(getsku_flag){
			return null;
		}
	}
}

/* entitlementsの出力 - ChihiroCheck */
function GetEntitlements(out,entitlements,cid,getsku_flag){
	/* 
		entitlements　... その製品を購入する事で実際に得られる製品のリスト？ 
		name, id, size を出力
	*/
	const en_elem_array = [];
	$.each(entitlements,function(i,en){
		const elem_array = [];
		const en_name = "Title : " + en.name;
		const en_id = "ID : " + en.id;
		var size = 0;
		if(en.drms!=undefined && en.drms.length>0){
			$.each(en.drms,function(x,drm){
				size += drm.size;
			})
		}
		if(en.packages!=undefined && en.packages.length>0){
			$.each(en.packages,function(y,pkg){
				size += pkg.size;
			})
		}
		var en_size = "";
		if(size>0){
			en_size = "Size : " + FixSize(size);
		}
		elem_array.push(en_name,en_id,en_size);
		var en_elem = elem_array.join("<br>");
		en_elem = "<li>" + en_elem + "</li>";
		en_elem_array.push(en_elem);
	})
	if(en_elem_array.length>0){
		const en_elem = "<ul>" + en_elem_array.join("") + "</ul>";
		if(!getsku_flag){
			if(en_elem_array.length==1 && en_elem.indexOf(cid)==-1){
				/* 1つかつ製品と同じコンテンツIDの場合は出力しない */
				OutputDialogLink(out,"Entitlements",en_elem);
			}else if(en_elem_array.length>1){
				OutputDialogLink(out,"Entitlements",en_elem);
			}
			/* chihiroのjsonが取得出来ないコンテンツIDもあるため、ここではReChihiroCheckは非採用 */
		}else{
			return en_elem;
		}
	}else{
		if(getsku_flag){
			return null;
		}
	}
}

/* rewards情報の出力 - ChihiroCheck */
function GetRewards(out,rewards,getsku_flag){
	/* rewards ... 割引情報のリスト */
	const reward_elem_array = [];
	$.each(rewards,function(i,reward){
		const elem_array = [];
		const re_id = "Reward ID : " + reward.id;
		elem_array.push(re_id);
		var re_enid = "";
		if(reward.entitlement_id!=undefined){
			re_enid = "Entitlement ID : " + reward.entitlement_id;
			elem_array.push(re_enid);
		}
		var re_plus = "";
		if(reward.isPlus){
			re_plus = "for PS Plus members : Yes";
			elem_array.push(re_plus);
		}
		var re_ea = "";
		if(reward.isEAAccess){
			re_ea = "for EA Access members : Yes";
			elem_array.push(re_ea);
		}
		const price = reward.display_price;
		var save = "";
		if(reward.discount!=0){
			save = " (SAVE " + reward.discount + "%)";
		}
		const re_price = "Price : " + price + save;
		elem_array.push(re_price);
		const end_date = new Date(reward.end_date).toLocaleDateString();
		var re_end = "";
		if(end_date!="Invalid Date"){
			re_end = "Discount/Reward Period : " + end_date;
			elem_array.push(re_end);
		}
		var re_b_enid = reward.bonus_entitlement_id;
		var b_price = reward.bonus_display_price;
		var b_save = reward.bonus_discount;
		if(re_b_enid!=undefined && b_price!=undefined && b_save!=undefined){
			re_b_enid = "Bonus Entitlement ID : " + re_b_enid;
			elem_array.push(re_b_enid);
			b_save = " (SAVE " + b_save + "%)";
			b_price = "Bonus Price : " + b_price + b_save;
			elem_array.push(b_price);
		}
		var re_elem = elem_array.join("<br>");
		re_elem = "<li>" + re_elem + "</li>";
		reward_elem_array.push(re_elem);
	})
	if(reward_elem_array.length>0){
		const re_elem = "<ul>"+reward_elem_array.join("")+"</ul>";
		if(!getsku_flag){
			OutputDialogLink(out,"Discount/Reward",re_elem);
		}else{
			return re_elem;
		}
	}else{
		if(getsku_flag){
			return null;
		}
	}
}

/* skusの情報の出力 - ChihiroCheck */
function GetSkus(out,skus){
	/* 	
		skusに複数件登録されている場合に、その情報をダイアログとして出力
		(ChihiroOut側でskusのlengthが2以上だと判定しているので、こちらではその判定は不要)
	*/
	/*
		defaultSkuがある物を避けるために、最初にdefaultSkuの場所を探す
		(default_skuの情報を取得/出力済みなので、同内容だと思われるdefaultSkuは不要)
	*/
	var default_sku_index = null;
	for(var i in skus){
		const default_flag = skus[i].defaultSku
		if(default_flag!=undefined && default_flag){
			default_sku_index = i;
			break;
		}
	}
	/* 情報の取得/出力 */
	if(default_sku_index!=null){
		const sku_elem_array = [];
		$.each(skus,function(i,sku){
			if(i!=default_sku_index){
				const elem_array = [];
				const sku_id = "ID : " + sku.id;
				const sku_price = "Price : " + sku.display_price;
				elem_array.push(sku_id,sku_price);
				if(sku.eligibilities!=undefined && sku.eligibilities.length>0){
					const eli_elem = GetEligibilities(null,sku.eligibilities,"",true);
					if(eli_elem!=undefined && eli_elem!=null){
						elem_array.push("Eligibilities : ",eli_elem);
					}
				}
				if(sku.entitlements!=undefined && sku.entitlements.length>1){
					const en_elem = GetEntitlements(null,sku.entitlements,"",true);
					if(en_elem!=undefined && en_elem!=null){
						elem_array.push("Entitlements : ",en_elem);
					}
				}
				if(sku.rewards!=undefined && sku.rewards.length>0){
					const re_elem = GetRewards(null,sku.rewards,true);
					if(re_elem!=undefined && re_elem!=null){
						elem_array.push("Discount/Reward : ",re_elem);
					}
				}
				var sku_elem = elem_array.join("<br>");
				sku_elem = sku_elem.replace("</ul><br>","</ul>");
				sku_elem = "<li>" + sku_elem + "</li>";
				sku_elem_array.push(sku_elem);
			}
		});
		if(sku_elem_array.length>0){
			const sku_elem = "<ul>" + sku_elem_array.join("") + "</ul>";
			OutputDialogLink(out,"Non default sku",sku_elem)
			
		}
	}
}

/* mediaListを元に、ダイアログとして出力する要素を作成 - ChihiroCheck */
function GetVideoImg_mediaList(mediaList){
	const mp4_url_array = [];
	const img_url_array =[];
	var previews = mediaList.previews;
	for(var i in previews){
		mp4_url_array.push(previews[i].url);
	}
	var screenshots = mediaList.screenshots;
	for(var i in screenshots){
		img_url_array.push(screenshots[i].url);
	}
	const elem_str = GenVideoImgElemStr(mp4_url_array,img_url_array);
	return elem_str;
}

/* promomediaを元に、ダイアログとして出力する要素を作成 - ChihiroCheck */
function GetVideoImg_promomedia(promo){
	/* URLを取得 */
	const video_img_array =[];
	$.each(promo,function(i,pr){
		if(pr.key=="preview"){
			video_img_array.push(pr.url);
		}
		if(pr.key=="space"){
			$.each(pr.materials,function(x,material){
				if(material.urls!=undefined){
					const material_url = material.urls[0].url;
					if(console_name=="vita" && material.urls[0].type!=undefined){
						if(material.urls[0].type!="132"){
							video_img_array.push(material_url);
						}
					}else{
						video_img_array.push(material_url);
					}
				}
			})
		}
	})
	/* 動画,画像を分別 */
	const mp4_url_array = [];
	const img_url_array = [];
	$.each(video_img_array,function(i,material){
		if(material.match(/\.mp4\?country/)){
			mp4_url_array.push(material);
		}else if(material.match(/(\.jpg$|\.png$)/)){
			img_url_array.push(material);
		}
	})
	/* 要素を作成 */
	const elem_str = GenVideoImgElemStr(mp4_url_array,img_url_array);
	return elem_str;
}

/* 動画、画像の配列を元に、ダイアログとして出力する要素を作成 */
function GenVideoImgElemStr(mp4_url_array,img_url_array,img_name_array){
	var video_array = [], image_array =[];
	for(var i in mp4_url_array){
		const video_str = "<div><video src='"+mp4_url_array[i]+"' controls></video></div>"
		video_array.push(video_str);
	}
	for(var i in img_url_array){
		var image_str = "<img src='js/gray530.jpg' class='lazy' data-original='"+img_url_array[i]+"' >";
		if(img_name_array!=undefined){
			const image_name_str = "<div class='pic_name'><a href='"+img_url_array[i]+"' target='_blank'>"+img_name_array[i]+"</a></div>";
			image_str = image_name_str + image_str;
		}
		image_str = "<div class='pic'>" + image_str + "</div>";
		image_array.push(image_str);
	}
	const elem_str = video_array.join("") + image_array.join("");
	return elem_str;
}

/* "Char 0x0 out of allowed range" エラーが出るxmlをサポート (NPEB00900のtmdb) */
function string_to_utf8_bytes(str){
    var result = [];
    if(str == null) return result;
    for(var i = 0; i < str.length; i++){
        var c = str.charCodeAt(i);
        if(c <= 0x7f){
            result.push(c);
        }else if(c <= 0x07ff){
            result.push(((c >> 6) & 0x1F) | 0xC0);
            result.push((c & 0x3F) | 0x80);
        }else{
            result.push(((c >> 12) & 0x0F) | 0xE0);
            result.push(((c >> 6) & 0x3F) | 0x80);
            result.push((c & 0x3F) | 0x80);
        }
    }
    return result;
}
function byte_to_hex(byte_num){
	var digits = (byte_num).toString(16);
    if (byte_num < 16) return '0' + digits;
    return digits;
}
function bytes_to_hex_string(bytes){
	var	result = "";
	for (var i = 0; i < bytes.length; i++) {
		result += byte_to_hex(bytes[i]);
	}
	return result;
}
function hex_to_byte(hex_str){
	return parseInt(hex_str, 16);
}
function hex_string_to_bytes(hex_str){
	var	result = [];
	for (var i = 0; i < hex_str.length; i+=2) {
		result.push(hex_to_byte(hex_str.substr(i,2)));
	}
	return result;
}
function utf8_bytes_to_string(arr){
    if (arr == null)
        return null;
    var result = "";
    var i;
    while (i = arr.shift()) {
        if (i <= 0x7f) {
            result += String.fromCharCode(i);
        } else if (i <= 0xdf) {
            var c = ((i&0x1f)<<6);
            c += arr.shift()&0x3f;
            result += String.fromCharCode(c);
        } else if (i <= 0xe0) {
            var c = ((arr.shift()&0x1f)<<6)|0x0800;
            c += arr.shift()&0x3f;
            result += String.fromCharCode(c);
        } else {
            var c = ((i&0x0f)<<12);
            c += (arr.shift()&0x3f)<<6;
            c += arr.shift() & 0x3f;
            result += String.fromCharCode(c);
        }
    }
    return result;
}


/////////////////////////////////////////////////////


/* 文字列(str1)の特定の場所(index)に特定の文字列(str2)を挿入 */
function StrIns(str1,index,str2){
	const new_str = str1.slice(0,index) + str2 + str1.slice(index);
	return new_str;
};

/* 文字列の項目を作成,末尾に出力 */
function OutputItem(out,item_name,str){
	out.append(ElemStr(out,item_name,str));
}

/* 文字列の項目を作成,前に出力 */
function OutputItemBefore(out,item_name,str){
	out.before(ElemStr(out,item_name,str));
}

/* 文字列の項目を作成,次に出力 */
function OutputItemAfter(out,item_name,str){
	out.after(ElemStr(out,item_name,str));
}

/* 文字列の項目を作成,先頭に出力 */
function OutputItemPrepend(out,item_name,str){
	out.prepend(ElemStr(out,item_name,str));
}

/* リンクの項目を作成,出力　*/
function OutputLink(out,item_name,url){
	var link_elm;
	if(url!=undefined){
		const href = " href='" + url + "'";
		const target = " target='_blank'";
		link_elm = "<a" + href + target + ">Click here</a>";
	}else{
		link_elm = "-";
	}
	out.append(ElemStr(out,item_name,link_elm));
}

/* ダイアログを作成、ダイアログを表示するリンクの出力 */
function OutputDialogLink(out,item_name,str){
	const out_id = out.attr("id");
	var dialog_id = item_name.replace(/(\/|\'| |\(|\)|\.)/g,"_");
	dialog_id = [out_id,dialog_id,"dialog"].join("_");
	const dialog_str = "<div class='dialog_inner'>" + str + "</div>";
	const dialog_elem = "<div class='dialog' title='"+item_name+"' id='"+dialog_id+"'>"+dialog_str+"</div>";
	/* ダイアログ要素の出力(cssでdialogクラスを非表示にしている) */
	out.append(dialog_elem);
	/* font要素がある場合に、色を変更(見やすくするため)(chihiroのdescriptionでのみ確認) */
	$("#"+dialog_id).find("font").attr("color","darkblue");
	/* リンクの出力、target属性の削除 */
	OutputLink(out,item_name,"");
	var item_id = item_name.replace(/(\/|\'| |\(|\)|\.)/g,"_");
	item_id = [out_id,item_id].join("_");
	const link_selector = item_id + " .item a";
	$("#"+link_selector).removeAttr("target");
	/* リンクをクリックした時にダイアログを表示 */
	$("#"+link_selector).on("click",function(){
		$("#"+dialog_id).dialog({
			modal:true,
			maxHeight:600,
			width: "auto",
			position: {
				my: "center top",
				at: "center top+15%",
			},			
			create: function(event,ui){
				/* 微調整 */
				const user_agent = window.navigator.userAgent.toLowerCase();
				$(this).css("padding","0.5em 0");
				$(".dialog").css("margin-left","1em");
				if(user_agent.indexOf("edge")!=-1){
					$(".dialog_inner").css("margin-right","2.3em");
				}else if(user_agent.indexOf("chrome")!=-1){
					$(".dialog_inner").css("margin-right","1.2em");
				}else{
					$(".dialog_inner").css("margin-right","2.3em");
				}
				if($("#"+dialog_id).find(".lazy").attr("src")==undefined){
					/* テキストのダイアログ */
					$(".ui-dialog").css("background","#f9f9f9");
				}else{
					/* 画像のダイアログ */
					$(".ui-dialog").css("background","gray");
					$(".ui-dialog-content").css("overflow-x","hidden");
				}
			},
			open: function(){
				/* スクロールバーを非表示に */
				$("body").css("overflow", "hidden");
				/* lazyloadを実行 */
				$("#"+dialog_id+" .lazy").lazyload();
				/* lazyloadを使用する要素がある場合にダイアログの位置を調整 */
				var position_change = function(){
					const attr_src = $("#"+dialog_id).find(".lazy").attr("src");
					if(attr_src!=undefined && attr_src!="js/gray530.jpg"){
						if(!$("#"+dialog_id).hasClass("position_changed")){
							const dialog_position = ($(window).width()-$(".ui-dialog").width())/2;
							$(".ui-dialog").css("left",dialog_position);
							$("#"+dialog_id).addClass("position_changed");
							clearInterval(position_change_interval);
							clearTimeout(interval_clear_timeout);
						}else{
							clearInterval(position_change_interval);
							clearTimeout(interval_clear_timeout);
						}
					}else{
						if(attr_src==undefined){
							clearInterval(position_change_interval);
							clearTimeout(interval_clear_timeout);
						}
					}
				}
				var position_change_interval = setInterval(position_change,100);
				var interval_clear_timeout = setTimeout(function(){
					clearInterval(position_change_interval);
				},6000);
				/* chihiroから取得した製品画像の並び替え(type1をtype9の前に移動) */
				if(dialog_id=="output6_Product_Images_dialog"){
					var t1,t9;
					var pic_elems = $("#"+dialog_id).find(".pic");
					var pic_name = pic_elems.find(".pic_name");
					for(var i=0; i<pic_elems.length; i++){
						if($(pic_name[i]).text()=="Type : 9"){
							t9=i;
						}else if($(pic_name[i]).text()=="Type : 1"){
							t1=i;
						}
					}
					if(t1!=undefined && t9!=undefined){
						const img_origin = $(pic_elems[t1]).find(".lazy").attr("data-original");
						$(pic_elems[t1]).find(".lazy").attr("src",img_origin)
						$(pic_elems[t1]).remove();
						$(pic_elems[t9]).before("<div class='pic'>"+$(pic_elems[t1]).html()+"</div>")
					}
				}
				$("#"+dialog_id).scrollTop(0);
			},
			close: function(){
				/* スクロールバーを表示するように */
				$("body").css("overflow", "auto");
				/* ダイアログのキャッシュとして生成された要素の削除 */
				$(".ui-dialog").remove();
			}	
		});
		/* lazyloadを確実に実行するために */
		var lazy_count = 0;
		$("#"+dialog_id).on("scroll", function(e){
			if(lazy_count<100){
				$("#"+dialog_id+" .lazy").lazyload();
				lazy_count++;
			}
		});
		/* ダイアログの外をクリックした際にダイアログを閉じ、動画を停止させる */
		$(document).on('click',function(e){
			if(!$(e.target).closest("#"+dialog_id).length){
				if($("#"+dialog_id).hasClass("ui-dialog-content")){
					$("#"+dialog_id).dialog("close");
					$("body").css("overflow", "auto");
				}
				for(var i=0; i<$("video").length; i++){
					$("video").get(i).pause();
				}
			}else{}
		});		
		/* リンクをクリックしてもページが再読み込みされないように */
		return false;
	});
}

/* 警告等の出力 */
function OutputNotice(out,str){
	out.append("<li class='notice'>" + str + "</li>");
}

/* 出力する項目の生成 */
function ElemStr(out,item_name,str){
	if(str==undefined || str==null) str="?";
	str = str.toString();
	var item = "<span class='item'>" + str + "</span>";
	item = "<span class='item_name'>" + item_name + " : </span>" + item;
	var item_class = "";
	if(item_name.indexOf("Chihiro json")>-1){
		item_class = "class='chihiro'";
	}else if(item_name.indexOf("Search json")>-1){
		item_class = "class='search'";
	}else if(item_name.indexOf("Update xml")>-1){
		item_class = "class='update'";
	}else if(item_name.indexOf("Tmdb xml")>-1 || item_name.indexOf("Tmdb json")>-1){
		item_class = "class='tmdb'";
	}else if(item_name.indexOf("Official")>-1){
		item_class = "class='official'";
	}else if(item_name.indexOf("GameFAQs")>-1){
		item_class = "class='gamefaqs'";
	}else if(item_name.indexOf("Redump")>-1){
		item_class = "class='redump'";
	}else if(item_name.indexOf("PSXDatacenter")>-1){
		item_class = "class='psxdc'";
	}
	item_name = item_name.replace(/(\/|\'| |\(|\)|\.)/g,"_");
	const item_id = [out.attr("id"),item_name].join("_");
	const elem = "<li id='"+item_id+"' "+item_class+" >" + item + "</li>";
	return elem;
}