/***********************************************************************************************************************
 * **********************************财人汇网上开户项目*******************************************
 * ***********************************研发人员工具代码********************************************
 **********************************************************************************************************************/

/**
 * 提示弹出层
 * @param content提示内容
 * @param type提示类型(warn,suc,error)
 */
function devShowDialog(content, type) {
	new Dialog(undefined, {
		title : '提示',
		tipType : null == type || type == "" ? 'error' : type,
		message : content,
		needDestroy : true,
		hasBtn : true,
		btnText : [ '确定' ],
		btnRole : [ 'cancel' ]
	});
}
/**
 * 提示弹出层
 * @param content提示内容
 * @param type提示类型(warn,suc,error)
 */
function devShowAjaxDialog(data, type) {
	var content="</br>";
	if(data){
		content+="["+data["std_error_no"]+"]["+data["std_error_info"]+"]</br>";
		debugger;
        if(data["busin_param"]){
        	var busin_param =data["busin_param"];
        	var param="";
            for(var pkey in busin_param){
            	if($.trim(param)==""){
                    param +="["+pkey+"="+busin_param[pkey];
				}else{
                    param +=","+pkey+"="+busin_param[pkey];
				}
            }
            param+="]</br>"
            content+=param;
		}
        if(data["logger_error_path"]){
            content+="["+data["logger_error_path"]+"]";
        }
	}
    new Dialog(undefined, {
        title : '提示',
        tipType : null == type || type == "" ? 'error' : type,
        message : content,
        needDestroy : true,
        hasBtn : true,
        btnText : [ '确定' ],
        btnRole : [ 'cancel' ]
    });
}
/**
 * 提示弹出层，关闭窗体后执行给定函数
 * @param content
 * @param func
 * @param type 提示类型(warn,suc,error)
 */
function devActAfterShowDialog(content, func, type) {
	var devDialog = new Dialog(null, {
		btnRole: ['confirm'],
        btnText: ["确定"],
        confirm: function() {
        	devDialog.hide();
        },
        hasBtn: true,
        message: content,
        needDestroy: true,
        tipType : null == type || type == "" ? 'error' : type,
        title: '提示',        
	});
	
	devDialog.destroy = function() {
		// 原destroy中的调用
		if (this.options.hasMask) {
	    	var $dialog = $('.' + this.options.dialogClass);
	      	if ($dialog.length > 1) {
	        	this.mask.hide();
	      	} else {
	        	this.mask.remove();
	      	}
	   	}
	
	    this.dialog.remove();
	
	    if (this.el) {
	      	$(this.el).off('click.dialog');
	    }
	    // destroy后调用
	    func();
	};
}

/**
 * 提示弹出层，关闭窗体后和点击确认后分别执行给定函数，两个函数均是可选的
 * @param content
 * @param destroyFunc 框体destroy后执行
 * @param confirmFunc 点击确定后执行
 */
function devActAfterConfirmAndClose(content, confirmFunc, destroyFunc, type) {
	var devDialog = new Dialog(null, {
		btnRole: ['cancel','confirm'],
		btnCls: ['cancel','confirm'],
        btnText: ["取消","确定"],
        confirm: function() {
        	if (typeof confirmFunc == "function") {
        		confirmFunc();
        	}
        	devDialog.hide();
        },
        hasBtn: true,
        message: content,
        needDestroy: true,
        tipType : null == type || type == "" ? 'error' : type,
        title: '提示',        
	});
	
	devDialog.destroy = function() {
		// 原destroy中的调用
		if (this.options.hasMask) {
	    	var $dialog = $('.' + this.options.dialogClass);
	      	if ($dialog.length > 1) {
	        	this.mask.hide();
	      	} else {
	        	this.mask.remove();
	      	}
	   	}
	
	    this.dialog.remove();
	
	    if (this.el) {
	      	$(this.el).off('click.dialog');
	    }
	    // destroy后调用
	    if (typeof destroyFunc == "function") {
	    	destroyFunc();
	    }
	};
}

/**
 * 提示弹出层，关闭窗体后和点击确认后分别执行给定函数，两个函数均是可选的
 * @param content
 * @param destroyFunc 框体destroy后执行
 * @param confirmFunc 点击确定后执行
 */
function devActAfterConfirmAndClose(content, confirmFunc, destroyFunc, type, title) {
    var devDialog = new Dialog(null, {
        btnRole: ['cancel','confirm'],
        btnCls: ['cancel','confirm'],
        btnText: ["取消","确定"],
        confirm: function() {
            if (typeof confirmFunc == "function") {
                confirmFunc();
            }
            devDialog.hide();
        },
        hasBtn: true,
        message: content,
        needDestroy: true,
        tipType : null == type || type == "" ? 'error' : type,
        title: title == null ? '提示' : title,
    });

    devDialog.destroy = function() {
        // 原destroy中的调用
        if (this.options.hasMask) {
            var $dialog = $('.' + this.options.dialogClass);
            if ($dialog.length > 1) {
                this.mask.hide();
            } else {
                this.mask.remove();
            }
        }

        this.dialog.remove();

        if (this.el) {
            $(this.el).off('click.dialog');
        }
        // destroy后调用
        if (typeof destroyFunc == "function") {
            destroyFunc();
        }
    };
}

/**
 * 提示弹出层
 * @param content提示内容
 * @param type提示类型(warn,suc,error)
 */
function devShowControlPkgInstallDialog(message,plugin_url) {

    message = message == undefined ? '为保障您在网上业务办理过程中的信息安全和操作顺畅，' + '请先<span style="font-weight:bold">下载和安装安全控件</span>，' + '安装完毕后需要刷新浏览器。' : message;
	var pluginDialog = new Dialog(undefined, {
		width : 500,
		message : message,
		tipType : 'warn',
		noClose : false,
		hasBtn : true,
		btnText : [ '确定' ],
		btnRole : [ 'confirm' ],
		needDestroy : true,
		confirm : function() {
			if(plugin_url == undefined){
				window.location.href = _staticResourcesAddr + "/plugin/" + _controlPkgPath;
			}else{
				window.location.href = plugin_url;
			}
			

			var layer = this;
			var $btn = this.dialog.overlay.find('.btn-dialog-process');
			this.dialog.overlay.off("click", "[data-role=confirm]");
			$btn.text('安装完毕，请刷新');
			$btn.on("click", function() {
				if (navigator.plugins && navigator.plugins.length) {
					window.navigator.plugins.refresh(false);
				}

				window.location.reload(1);
			});
		}
	});
}

/**
 * 获取当前时间串 格式为: 年-月-日-小时-分-秒
 */
function devGetNowTimeStr() {
	var date = new Date();
	var year = date.getFullYear();
	var month = (date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1);
	var day = date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate();
	var hour = date.getHours() < 10 ? ("0" + date.getHours()) : date.getHours();
	var minute = date.getMinutes() < 10 ? ("0" + date.getMinutes()) : date.getMinutes();
	var second = date.getSeconds() < 10 ? ("0" + date.getSeconds()) : date.getSeconds();

	var dateStr = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
	return dateStr;
}

/**
 * 获取当前时间串 格式为: 年-月-日-小时-分-秒-毫秒时间戳 本时间串主要用于调试日志语句
 */
function devGetNowMsecStr() {
	var date = new Date();
	var year = date.getFullYear();
	var month = (date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1);
	var day = date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate();
	var hour = date.getHours() < 10 ? ("0" + date.getHours()) : date.getHours();
	var minute = date.getMinutes() < 10 ? ("0" + date.getMinutes()) : date.getMinutes();
	var second = date.getSeconds() < 10 ? ("0" + date.getSeconds()) : date.getSeconds();
	var mm = date.getTime();
	var dateStr = "[" + year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second + ":" + mm + "]";
	return dateStr;
}

/**
 * 打印控制台日志
 * @param str 日志内容
 */
function devConsoleLog(str) {
	/*
	 * if(typeof console !="undefined"){ console.log(str); }
	 */
	$.ajax({
		type : "post",
		data : {
			"str" : str
		},
		url : "/ajaxLog/writeLog.json?rnd=" + new Date().getTime(),
		success : function(data) {
		}
	});
}

/**
 * 检查未填项目并高亮
 * @returns false=表示未选中，true=表示选中
 */
function checkHighlight() {
	var $container, type, length, originColor, changeColor;

	$container = $('[data-check]'); // 检查项容器
	originColor = '#ffffff';
	changeColor = '#ffede5';
	checkResult = true;

	$container.each(function() {
		var $self = $(this);
		type = $self.data('check');
		length = $self.find('input[type=' + type + ']').filter(':checked').length;	
		if (!length) {
			// 目标未在当前视窗内，则滚动页面
			if ($self.offset().top < $(window).scrollTop()) {
				$('html, body').animate({
					scrollTop : $self.offset().top
				}, 200);
			}
			// 操作检查项恢复初始背景色
			$self.one('change', 'input[type=' + type + ']', function() {
				$self.css('background-color', originColor);
			});
			// 闪烁渐变目标背景色
			colorTran(this, originColor, changeColor, 10, 4);
			return checkResult = false;
		}	
	});

	return checkResult;
}

function indexLogout() {
	var url = "register/ajaxLoginOut.json?rnd=" + new Date().getTime();
	// var url = "/ajaxregister!ajaxLoginOut.action?rnd=" + new Date().getTime();
	$.getJSON(url, {}, function(json) {
	});
}

/***********************************************************************************************************************
 * 获取浏览器URL参数
 */
var getURLParams = function(name) {
	var search = document.location.search;
	var pattern = new RegExp("[?&]" + name + "\=([^&]+)", "g");
	var matcher = pattern.exec(search);
	var items = null;
	if (null != matcher) {
		try {
			items = decodeURIComponent(decodeURIComponent(matcher[1]));
		} catch (e) {
			try {
				items = decodeURIComponent(matcher[1]);
			} catch (e) {
				items = matcher[1];
			}
		}
	}
	return items;
};

/***********************************************************************************************************************
 * 
 * Jquery扩展
 */
(function($){  
    //判断dom是否存在
    $.fn.exist = function(){ 
        if($(this).length>=1){
            return true;
        }
        return false;
    };
})(jQuery);

/**
 * 判断是否为数组
 */
$.isArray=function(obj){
	return Object.prototype.toString.call(obj) === '[object Array]';   
};

/**
 * JS预加载模板
 */
$.loadTemplates=function(templates){
	function loadTemplate(template){
		$.ajax({
			url : template.url,
			dataType : 'text',
			success : function(contents) {
				var templateHtml="<script id=\""+template.id+"\" type=\"text/html\">";
				templateHtml+=contents;
				templateHtml+="</script>";
				//var $template=$("<script id=\""+template.id+"\" type=\"text/html\"></script>");
				//$template.append(contents);
				$("body").append(templateHtml);
				template.callback(template.id);
			}
		});
	};
	if(templates!=null && $.isArray(templates)){
		for(var i=0,j=templates.length;i<j;i++){
			if(!$("#"+templates[i].id).exist()){
				loadTemplate(templates[i]);
			}else{
				templates[i].callback(templates[i].id);
			}
			
		}
	}else if(templates!=null){
		if(!$("#"+templates.id).exist()){
			loadTemplate(templates);
		}else{
			templates.callback(templates.id);
		}
	}
};

/**
 * 检测cookie是否被禁用
 */
function checkCookieEnabled(){
	if(!navigator.cookieEnabled){
		devShowDialog("您的浏览器cookie被禁用，请设置打开cookie","warn");
	}
}
$(document).ready(function(){
	checkCookieEnabled();
});

// 这个方法会更改浏览器地址栏的url
//$(document).ready(function(e) {	
//	var counter = 0;
//	if(typeof window.history.pushState  === 'undefined'){
//		history.pushState = function(state,title,url){window.location = url;};
//	}
//	if (window.history && window.history.pushState) {
//		$(window).on('popstate', function () {
//			window.history.pushState('forward', null, '#');
//			window.history.forward(1);
//			$("#label").html("第" + (++counter) + "次单击后退按钮。");
//		});
//	}
//	window.history.pushState('forward', null, '#'); //在IE中必须得有这两行
//	window.history.forward(1);
//});

function obj2string(o) {
	var r = [];
	if (typeof o == "string") {
		return "\"" + o.replace(/([\'\"\\])/g, "\\$1").replace(/(\n)/g, "\\n").replace(/(\r)/g, "\\r").replace(/(\t)/g, "\\t") + "\"";
	}
	if (typeof o == "object") {
		if (!o.sort) {
			for ( var i in o) {
				r.push(i + ":" + obj2string(o[i]));
			}
			if (!!document.all && !/^\n?function\s*toString\(\)\s*\{\n?\s*\[native code\]\n?\s*\}\n?\s*$/.test(o.toString)) {
				r.push("toString:" + o.toString.toString());
			}
			r = "{" + r.join() + "}";
		} else {
			for (var i = 0; i < o.length; i++) {
				r.push(obj2string(o[i]))
			}
			r = "[" + r.join() + "]";
		}
		return r;
	}
	return o.toString();
}

// 上传图片预览
jQuery.fn.extend({
	uploadPreview : function(opts) {
		var _self = this, _this = $(this);
		opts = jQuery.extend({
			Img : "imagesname1",
			Width : 350,
			Height : 120,
			ImgType : [ "gif", "jpeg", "jpg", "bmp", "png", "PNG", "JPG", "JPEG" ],
			Callback : function() {
			}
		}, opts || {});
		_self.getObjectURL = function(file) {
			var url = null;
			if (window.createObjectURL != undefined) {
				url = window.createObjectURL(file);
			} else if (window.URL != undefined) {
				url = window.URL.createObjectURL(file);
			} else if (window.webkitURL != undefined) {
				url = window.webkitURL.createObjectURL(file);
			}
			return url;
		};
		_this.change(function() {
			$("#" + opts.Img).show();
			if (this.value) {
				if (!RegExp("\.(" + opts.ImgType.join("|") + ")$", "i").test(this.value.toLowerCase())) {
					alert("选择文件错误,图片类型必须是" + opts.ImgType.join("，") + "中的一种");
					this.value = "";
					return false;
				}
				if (window.navigator.userAgent.indexOf("MSIE") >= 1) {
					try {
						$("#" + opts.Img).attr('src', _self.getObjectURL(this.files[0]))
					} catch (e) {
						var src = "";
						var obj = $("#" + opts.Img);
						var div = obj.parent("div")[0];
						_self.select();
						if (top != self) {
							window.parent.document.body.focus();
						} else {
							_self.blur();
						}
						src = document.selection.createRange().text;
						document.selection.empty();
						obj.hide();
						obj.parent("div").css({
							'filter' : 'progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale)',
							'width' : opts.Width + 'px',
							'height' : opts.Height + 'px'
						});
						div.filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = src;
					}
				} else {
					$("#" + opts.Img).attr('src', _self.getObjectURL(this.files[0]));
				}
				opts.Callback();
			}
		});
	}
});
function formateFormData(formData) {
	var formatedate = "";
	for (index = 0; index < formData.length; ++index) {
		if(formData[index].name != "item_extend_info"){
			formatedate += "&" + formData[index].name + "=" + encodeURI(encodeURI(formData[index].value));
		}else{
			formatedate += "&" + formData[index].name + "=" + formData[index].value;
		}
	}
	return formatedate;
}

function displayErrorInfo(data, defaultErrorInfo) {
	if (undefined = defaultErrorInfo || null == defaultErrorInfo || defaultErrorInfo == "") {
		defaultErrorInfo = "操作失败";
	}
	var errorInfo = data.error_info == null ? defaultErrorInfo : data.error_info;
	if (data.errors != null && data.errors != undefined) {
		errorInfo += obj2string(data.errors);
	}
	devShowDialog(errorInfo);
}

/**
 * 显示提示信息（模态弹出对话框，主要用于后台审核端）
 * @param message 提示消息
 * @param callback 回调方法
 * @param width 弹出窗口宽度
 * @param height 弹出窗口高度
 */
function showAuditDialogMessage(message, callback, width, height) {
	var success_screen = new Dialog(null, {
		title: '错误提示',
		width: width ? width : '800',
		height: height ? height : '100%',
		needDestroy: true,
		hasBtn: true,
		btnText: ["关闭"],
		btnRole: ['confirm'],
		confirm: function() {
			success_screen.hide();
			if (callback) {
				callback();
			}
		},
		content: message
    });
}
