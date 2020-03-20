var initData;// 页面数据

var uc_addr = "/backenduc";

var uc_ajax = "http://127.0.0.1/8081";

function commonInit(pageflag){
	if(pageflag == "1"){
		$('.resultPage').load('include/page.html');
	}
	$("#ui-datepicker-div").remove();
	initData = {};
}

function appendPageResult(paginator){
	var ul = "";
	if(paginator.totalPages>1){
		ul = "<ul>";
		if(paginator.hasPrePage){
			ul += '<li class="pageUp"><a class="btn page_btn" href="javascript:void(0);" onclick="resultPage('+paginator.prePageNum+')"><em>上一页</em></a></li>';
		}
		if(paginator.showFirstPage){
			ul += '<li><a class="btn page_btn" href="javascript:void(0);" onclick="resultPage(1)"><em>1</em></a></li>';
		}
		if(paginator.hasBegDotDot){
			ul += '<li>...</li>';
		}
		var numList = paginator.numList;
		for(var i=0;i<numList.length;i++){
			if(paginator.pageNum == numList[i]){
				ul +=  '<li><a class="btn page_btn thisPage"><em>'+numList[i]+'</em></a></li>';
			}else{
				ul +=  '<li><a class="btn page_btn" href="javascript:void(0);" onclick="resultPage('+numList[i]+')"><em>'+numList[i]+'</em><a></li>';
			}
		}
		if(paginator.hasEndDotDot){
			ul += '<li>...</li>';
		}
		if(paginator.showLastPage){
			ul += '<li><a class="btn page_btn" href="javascript:void(0);" onclick="resultPage('+paginator.totalPages+')"><em>'+paginator.totalPages+'</em></a></li>';
		}
		if(paginator.hasNextPage){
			ul += '<li class="pageDown"><a class="btn page_btn" href="#" onclick="resultPage('+paginator.nextPageNum+')"><em>下一页</em></a></li>';
		}
		ul += "</ul>"
	}
	return '<div id="pages"><div class="page">'+ul+'</div></div>';
}


//显示弹出框
function showDialog(content) {
	new Dialog(undefined, {
		boxId : "failBox",
		needDestroy : true,
		hasBtn : true,
		btnText : [ "确定" ],
		btnRole : [ 'confirm' ],
		width : 420,
		confirm : function() {
			this.hide();
		},
		content : '<div class="tip_cont" style="max-height: 240px;overflow: auto;margin-left: 0;word-wrap:break-word; word-break:break-all;padding: 0 40px;"><b class="error_icon" style="float:left;width: 45px;"></b><p style="float:right;width: 200px;margin-top: 0;">'+ content + '</p></div>'
	});
}


/**
 * 获取页面请求参数
 * @param name
 * @returns
 */
//function getUrlParams(name, defaultValue) {
//	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
//	var r = window.location.search.substr(1).match(reg);
//	if (r != null) {
//		if(name == "back_handle_page"){
//			return r[2];
//		}
//		return unescape(r[2]);
//	}
//	return defaultValue ? defaultValue : "";
//}


var html_params = {};

/**
 * 获取页面请求参数
 * @param name
 * @returns
 */
function getUrlParams(name, defaultValue,url) {
	var paramValue;
	if(!url){
		url = window.location.href;
	}
	if(url.indexOf("?")>-1 && url.indexOf("=")>-1){
		var vars = url.split("?")[1].split("&");
		for (var i=0;i<vars.length;i++) {
	        var pair = vars[i].split("=");
	        html_params[pair[0]] = pair[1];
	        if(pair[0] == name ){
	        	paramValue =  pair[1];
	        }
		}
	}
	if(!paramValue){
		defaultValue = defaultValue?defaultValue : "";
		paramValue = defaultValue;
	}
	return paramValue;
}

function getHtmlParams(url,data){
	$("#ui-content").load(url,data,function(result) {
		getUrlParams("","",url);
    }); 
}

/**
 * 过滤查询条件为空的元素
 * @param formData
 * @returns
 */
function checkRequestParam(formData){
	for(var i = 0; i<formData.length; i++){
		var value = formData[i].value;
		if(!value || value==""){
			formData.splice(i, 1);
			 i--;  
		}
	}
	return formData;
}



function appendTextarea(id,name,tt_id,tt_name,placeholder,value){
	var tt = '<div class="item">';
		tt += '	<span class="name">'+name+'</span>';
		tt += '	<div class="item-inner">';
		tt += '		<label class="w-300">';
		tt += '			<textarea style="width: 500px;height: 100px;" id='+tt_id+' name='+tt_name+' placeholder="'+placeholder+'" class="txt">'+value+'</textarea>';
		tt += '		</label>';
		tt += '	</div>';
		tt += '</div>';
		$("#"+id).append(tt);
}

/**
 * 操作菜单js效果
 */
var mousemoveCount = 0;
var mouseoutCount = 0;
$("body").on("mousemove",".list_dt",function (event) {
	event.stopPropagation();
	if(mousemoveCount>0){
		mouseoutCount = 0;
		return;
	}
	mousemoveCount ++;
	var $elm = $(this);
	$elm.attr("id","op_menu").next().slideDown();
	
});

$("body").on("mousemove",".list_li",function (event) {
	event.stopPropagation();
});

$("body").on("mousemove",".table_data",function () {
	if(mouseoutCount>0){
		mousemoveCount = 0;
		return;
	}
	mouseoutCount ++;
	var $elm = $(this);
	$elm.find("tr").each(function(){
		$(this).find("dt").removeAttr("id");
		$(this).find("dd").slideUp();
	});
});

/**
 * 清除查询条件
 * @returns
 */
function cleanQryCondition(){
	$(".search-group :input").each(function(){
		if($(this).is("select")){
			$( this).find('option:first').attr("selected",true);
			debugger;
			var width=$(".js-select").css('width');
			$( this).diySelect({width: width});
		}else if($(this).is("input")){
			$(this).val("");
		}
	});
}

/**
 * 当前日期加减
 * @param aa
 * @returns
 */
function getAddDay(aa){
    var date1 = new Date(),
    time1=date1.getFullYear()+"-"+(date1.getMonth()+1)+"-"+date1.getDate();//time1表示当前时间
    var date2 = new Date(date1);
    date2.setDate(date1.getDate()+aa);
    //var time2 = date2.getFullYear()+"-"+(date2.getMonth()+1)+"-"+date2.getDate();
    var time2 = formatDateTime(date2);
    return time2;
}

/**
 * 当前日期转换为YYYY-MM-DD
 * @param date
 * @returns
 */
function formatDateTime(date) {
	var y = date.getFullYear();
	var m = date.getMonth() + 1;
	m = m < 10 ? ('0' + m) : m;
	var d = date.getDate();
	d = d < 10 ? ('0' + d) : d;
	var h = date.getHours();
	var minute = date.getMinutes();
	minute = minute < 10 ? ('0' + minute) : minute;
	return y + "-" + m + "-" + d;
};

/**
 * 设置echarts y轴最大最小值
 * @param arr
 * @param type
 * @returns
 */
function setYaAxisMaxMin(arr,type){
	var maxN = eval("Math.max(" + arr.toString() + ")");
	maxN = Math.ceil((maxN+1))
	if(type == 2){
		maxN = "-"+maxN;
	}
	return maxN;
}

/**
 * 设置间距
 * @param arr
 * @param num
 * @returns
 */
function setInterval(arr,num){
	debugger;
	var len = arr.length;
	if(len<=num){
		return 0;
	}else{
		var n = len/num;
		n = Math.ceil(n);
		return n;
	}
}