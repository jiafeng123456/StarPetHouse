if (!String.prototype.trim) {
  String.prototype.trim = function () {
    // Make sure we trim BOM and NBSP
    rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    return this.replace(rtrim, "");
  }
}

/**
* @authors yuk (yukan@cairenhui.com)
*/
	var B = (function(ua) {
	var b = {
		msie: /\b(?:msie |ie |trident)/.test(ua) && !/opera/.test(ua),
		opera: /opera/.test(ua),
		safari: /webkit/.test(ua) && !/chrome/.test(ua),
		firefox: /firefox/.test(ua),
		chrome: /chrome/.test(ua)
	};
	var vMark = "";
	for (var i in b) {
		if (b[i]) {
			vMark = "safari" == i ? "version" : i;
			break;
		}
	}
	b.version = vMark && RegExp("(?:" + vMark + ")[\\/: ]([\\d.]+)").test(ua) ? RegExp.$1 : "0";

	b.ie = b.msie;
	b.ie6 = b.msie && parseInt(b.version, 10) == 6;
	b.ie7 = b.msie && parseInt(b.version, 10) == 7;
	b.ie8 = b.msie && parseInt(b.version, 10) == 8;
	b.ie9 = b.msie && parseInt(b.version, 10) == 9;
	b.ie10 = b.msie && parseInt(b.version, 10) == 10;

	b.win2000 = ua.indexOf('windows nt 5.0') > 1 ? true : false;
	b.winxp = ua.indexOf('windows nt 5.1') > 1 ? true : false;
	b.win2003 = ua.indexOf('windows nt 5.2') > 1 ? true : false;
	b.winvista = ua.indexOf('windows nt 6.0') > 1 ? true : false;
	b.win7 = ua.indexOf('windows nt 6.1') > 1 ? true : false;
	b.win8 = ua.indexOf('windows nt 6.2') > 1 ? true : false;
	
	return b;
})(window.navigator.userAgent.toLowerCase());
var isIE6 = B.ie6
var DiySelect = function (select, options) {
    options = $.extend({}, $.fn.diySelect.defaults, options);

    this.options = options;
    this.hasInit = false;

    this.init(select);
};

DiySelect.prototype = {

    constructor: DiySelect,

    init: function (select) {
        // 是否初始化且目标元素是否为 `select`
        if (this.hasInit && select.tagName.toLowerCase !== 'select') {
            return;
        }

        var id = select.id;
        this.unique(id); // 去重

        this.selectSpan = $('<span/>').addClass(this.options.selectClass).attr('id', id + '-select');
        this.optionDiv = $('<div/>').addClass(this.options.optionClass).attr('id', id + '-option');
        this.optionUl = $('<ul/>');
        this.option = $(select).find('option');
        this.optionSize = this.option.length;
        this.arrowHtml = '<i class="' + this.options.arrowClass + '"></i>';
        this.bgIframe = $('<iframe/>').addClass('bgiframe').attr('frameborder', '0');

        // 组装模拟元件
        this.setupOption();
        this.setupSelect();

        // DOM 操作：
        // 隐藏原 `select`，再其后加入模拟的 `HTMLElement`
        $(select).hide();
        this.selectSpan.insertAfter($(select));
        this.optionDiv.insertAfter(this.selectSpan).hide();

        // 初始化完成标记
        this.hasInit = true;

        var that = this;
        var active = -1;
        var list = this.optionDiv.find('li');

        // 事件绑定
        list.on('click', function (e) {
            var text = $(this).text();

            e.preventDefault();
            e.stopPropagation();

            that.chooseOption(text);
            $(select).trigger('change');
        });

        list.on('mouseenter', function () {
            list.removeClass('active');
            $(this).addClass('active');
            active = list.filter(':visible').index(this);
        });

        this.selectSpan.on('click', function (e) { 
            e.preventDefault();
            e.stopPropagation();

            // 自定义事件
            if (that.options.beforeSelect) {
                that.options.beforeSelect.apply(this);
            };

            $('.' + that.options.optionClass).hide();

            // if (that.optionVisible) {
            //  that.hideOption();
            // } else {
            //  that.showOption();
            // }
            that.showOption();
        });

        $(select).on('choose', function (e, text) {
            e.stopPropagation();
            that.chooseOption(text);
        });

        $(select).on('revert', function (e) {
            e.stopPropagation();
            that.revert();
        });

        // 窗口变化时调整位置
        $(window).on('resize', $.proxy(this.setPosition, this));

        // 模拟 `select` 失焦
        $(document).on('click', function () {
            if (that.optionVisible) { that.hideOption(); }
        });

        // 键盘事件
        $(document).on('keydown', function (e) {
            if (that.optionDiv.is(':visible')) {
                switch (e.keyCode) {
                    case 13: // enter
                        if (active !== -1) {
                            var text = list.slice(active, active + 1).text();
                            that.chooseOption(text);
                        }

                        that.hideOption();
                        $(select).trigger('change');
                        break;
                    case 27: // esc
                        that.hideOption();
                        break;
                    case 38: // up
                        e.preventDefault();
                        moveSelect(-1);
                        break;
                    case 40: // down
                        e.preventDefault();
                        moveSelect(1);
                        break;
                }
            }
        });

        /**
         * 焦点位移
         * @param  {float} step 位移步长
         */
        function moveSelect(step) {
            var count = list.length;

            active += step;

            if (active < 0) {
                active =  0;
            } else if (active >= count) {
                active = count - 1;
            } else {
                list.removeClass('active');
                list.slice(active, active + 1).addClass('active');

                // 出现滚动条的情况
                if ( active >= (that.options.maxSize / 2) && count > that.options.maxSize) {
                    that.optionDiv.scrollTop(list.height() * (active - (that.options.maxSize / 2)));
                }
            }
        }
    },

    setupOption: function () {
        var fragment = document.createDocumentFragment();

        for (var i = 0; i < this.optionSize; i++) {
            var li = document.createElement('li');
            var value = this.option[i].value;
            var text = this.option[i].text;

            li.innerHTML = text;

            if (value) { 
                li.setAttribute('data-' + this.options.valueAttr, value); 
            }

            fragment.appendChild(li);
        }

        this.optionDiv.append(this.optionUl);
        this.optionUl.get(0).appendChild(fragment);
        this.optionVisible = false;
    },

    setupSelect: function () {
        var checkText = this.options.checkText || this.option.filter(':selected').text();

        // 初始选择（可设置）
        this.chooseOption(checkText);

        if (this.options.width) {
            this.selectSpan.width(this.options.width);
        }
            
        var spanStyle = this.selectSpan.attr('style');
        
        if (spanStyle) {
            spanStyle += ';' + this.options.style;
        }

        this.selectSpan.attr('style', spanStyle);
    },

    setPosition: function () {
        // 可视窗口顶部到 `selectSpan` 的距离
        var top_height = this.selectSpan.offset().top + this.selectSpan.outerHeight() - $(window).scrollTop();

        // 可视窗口剩余空间与 `optionDiv` 高度的差值
        var diff = $(window).height() - top_height - this.optionDiv.height();

        // 差值大于零，说明剩余空间还可容纳 `optionDiv`
        // `optionDiv` 就位居 `selectSpan` 正下方展示
        // 反之亦然
        if ( diff > 0 ) {
            this.optionDiv.pin({
                base: this.selectSpan,
                baseXY: [0, '100%-1px']
            });
        } else {
            this.optionDiv.pin({
                base: this.selectSpan,
                selfXY: [0, '100%-1px']
            });
        }
    },

    chooseOption: function(text) {
        this.hideOption();
        this.selectSpan.html(text + this.arrowHtml);
        // this.option.attr('selected', false);
        
        for (var i = 0; i < this.optionSize; i++) {
            if (text === this.option[i].text) {
                // 原生 `select` 跟随选择
                this.option[i].selected = true;
                break;
            }
        }

        if (this.options.afterChoose) {
            this.options.afterChoose.apply(this);
        }
    },

    showOption: function () {
        this.optionDiv.show();

        this.optionDiv.height(Math.min(this.optionDiv.height(), 
            this.optionDiv.find('li').height() * this.options.maxSize));

        this.optionDiv.css({
            'min-width': this.selectSpan.outerWidth()-2,
            'z-index': this.options.zIndex
        });

        if (isIE6) {
            this.optionDiv.css('zoom', 1);
        }

        this.setPosition();
        this.optionVisible = true;
    },

    hideOption: function () {
        this.optionDiv.hide();
        this.optionVisible = false;
    },

    unique: function (id) {
        if ($('#' + id + '-select')) { $('#' + id + '-select').remove(); }
        if ($('#' + id + '-option')) { $('#' + id + '-option').remove(); }
    },

    revert: function () {
        this.selectSpan.remove();
        this.optionDiv.remove();
    }
};

// 注册插件
$.fn.diySelect = function (options) {
    return this.each(function () {
        new DiySelect(this, options);
    });
};

$.fn.chooseSelect = function (value) {
    return this.trigger('choose', [value]);
};

$.fn.revertSelect = function () {
    return this.trigger('revert');
};

// 默认设置
$.fn.diySelect.defaults = {
    selectClass: 'js-select',
    optionClass: 'js-option',
    arrowClass: 'arrow',
    valueAttr: 'select-val',
    zIndex: '10000',
    offsetY: 1,
    maxSize: 6
};

$.fn.Constructor = DiySelect;
// 定义 Overlay 类
var Overlay = function (element, options) { 
    options = $.extend({}, $.fn.overlay.defaults, options);

    this.options = options;
    this.overlay = $(element);

    this.init(options);
};

Overlay.prototype = {

    constructor: Overlay,

    init: function (options) {
        this.overlay.addClass(this.options.className);

        // 添加外部自定义的样式
        this.overlay.attr('style', this.options.style);

        // 基本 CSS
        this.overlay.css({
            width: this.options.width,
            height: this.options.height,
            zIndex: this.options.zIndex
        });

        // 将浮出层插入 DOM 并进行定位
        this.overlay.appendTo($(this.options.parent));
        this.setPosition();

        // 窗口变化重新定位
        $(window).on('resize', $.proxy(this.setPosition, this));
    },

    show: function () {     
        this.overlay.show();
    },

    hide: function () {
        this.overlay.hide();
    },

    remove: function () {
        this.overlay.remove();
    },

    blurHide: function () {
        $(document).on('click', $.proxy(this.hide, this));
        this.overlay.on('click', function (e) {
            e.stopPropagation();
        });
    },

    setPosition: function () {
        this.overlay.pin({
            // 基准定位元素，默认为当前可视区域
            base: this.options.align.base,
            // element 的定位点，默认为中心
            selfXY: this.options.align.selfXY,
            // 基准定位元素的定位点，默认为中心
            baseXY: this.options.align.baseXY
        });
    }
};

// 注册插件
$.fn.overlay = function (options) {
    return this.each(function () {
        new Overlay(this, options);
    });
};

// 默认设置
$.fn.overlay.defaults = {
    className: '',
    style: '',
    width: 'auto',
    height: 'auto',
    zIndex: 999,
    parent: 'body',
    align: {
        base: null,
        selfXY: ['50%', '50%'],
        baseXY: ['50%', '50%']
    }
};

$.fn.overlay.Constructor = Overlay;
/**
 * 名称: pin.js
 * 描述: 通过两个对象分别描述定位元素及其定位点，然后将其定位点重合
 * 属性: 工具
 * 版本: 0.9.0
 * 依赖: jQuery ~> 1.7.2
 * 开发: wuwj
 */

$.fn.pin = function (options, fixed) {
    options = $.extend({
        base: null,
        selfXY: [0, 0],
        baseXY: [0, 0]
    }, options || {});

    // 是否相对于当前可视区域（Window）进行定位
    var isViewport = !options.base,

            // 定位 fixed 元素的标志位，表示需要特殊处理
            isPinFixed = false,

            parent = this.offsetParent(),

            // 基准元素的偏移量
            offsetLeft, offsetTop,

            // 基准元素根据定位点坐标 `baseXY` 分别获得纵横两个方向上的 size
            baseX, baseY,

            // 同上，根据定位点坐标 `selfXY` 获取的横纵两个方向上的 size
            selfX, selfY,

            // 定位元素位置
            left, top;

    // 设定目标元素的 position 为绝对定位
    // 若元素的初始 position 不为 absolute，会影响元素的 display、宽高等属性
    if (this.css('position') !== 'fixed' || isIE6) {
        this.css('position', 'absolute');
        isPinFixed = false;
    } else {
        isPinFixed = true;
    }

    // 修正 ie6 下 absolute 定位不准的 bug
    if (isIE6) {
        this.css('zoom', 1);
        parent.css('zoom', 1);
    }

    // 如果不定义基准元素，则相对于当前可视区域进行定位
    if (isViewport) {
        offsetLeft = $(document).scrollLeft();
        offsetTop = $(document).scrollTop();

        baseX = getSize($(window), options.baseXY[0], 'outerWidth');
        baseY = getSize($(window), options.baseXY[1], 'outerHeight');
    } else {
        // 判断定位元素的祖先是否被定位过，是的话用 `$.position()`，否则用 `$.offset()`
        var offsetFixed = (parent[0] === document.documentElement) ?
                                            options.base.offset() :
                                            options.base.position();

        offsetLeft = offsetFixed.left;
        offsetTop = offsetFixed.top;

        baseX = getSize(options.base, options.baseXY[0], 'outerWidth');
        baseY = getSize(options.base, options.baseXY[1], 'outerHeight');
    }

    selfX = getSize(this, options.selfXY[0], 'outerWidth');
    selfY = getSize(this, options.selfXY[1], 'outerHeight');

    // 计算定位元素位置
    // 若定位 fixed 元素，则父元素的 offset 没有意义
    left = (isPinFixed? 0 : offsetLeft) + baseX - selfX;
    top = (isPinFixed? 0 : offsetTop) + baseY - selfY;

    // 进行定位
    this.css({ left: left, top: top });
};

// 扩展：相对于当前可视区域页面上某一元素的居中定位
$.fn.pinCenter = function (options) {
    this.pin({
        base: (options) ? options.base : null,
        selfXY: ['50%', '50%'],
        baseXY: ['50%', '50%']
    });
};

/**
 * 根据坐标点获取对应尺寸值
 * @param  {jquery} object 被获取尺寸的元素
 * @param  {array}  coord  坐标点
 * @param  {string} type   尺寸类型
 * @return {number}
 */
function getSize(object, coord, type) {
    // 参考 `https://github.com/aralejs/position/blob/master/src/position.js`
    // 中的 `xyConverter` 方法
    // 先将坐标值转成字符串
    var x = coord + '';

    // 处理 alias，此处正则表达式内的 `:?` 表示此括号为非捕获型括号
    if (/\D/.test(x)) {
        x = x.replace(/(?:top|left)/gi, '0%')
                    .replace(/center/gi, '50%')
                    .replace(/(?:bottom|right)/gi, '100%');
    }

    // 处理 `px`
    if (x.indexOf('px') !== -1) {
        x = x.replace(/px/gi, '');
    }

    // 将百分比转为像素值
    if (x.indexOf('%') !== -1) {
        // 支持小数
        x = x.replace(/(\d+(?:\.\d+)?)%/gi, function (m, d) {
            return object[type]() * (d / 100.0);
        });
    }

    // 处理类似 100%+20px 的情况
    if (/[+\-*\/]/.test(x)) {
        try {
            x = (new Function('return ' + x))();
        } catch (e) {
            throw new Error('Invalid position value: ' + x);
        }
    }

    // 转回为数字
    return parseFloat(x, 10);
}

// 定义 Dialog 类
var Dialog = function (element, options) {
    options = $.extend({}, $.fn.dialog.defaults, options);

    this.options = options;
    this.hasInit = false;

    this.setup(element);
    this.element = element;
};

Dialog.prototype = {

    constructor: Dialog,

    init: function () {
        // 创建弹出层
    	if(this.options.needIframe){
    		this.options.template = '<iframe class="no-border"></iframe><table> <tr> <td class="edge top-edge" colspan="3"></td> </tr> <tr> <td class="edge left-edge"></td> <td class="center"> <div class="content"> <div class="hd"> <h2>提示</h2> </div> <div class="bd"></div> <div class="close js-close" style="cursor:pointer"></div> </div> </td> <td class="edge right-edge"></td> </tr> <tr> <td class="edge bottom-edge" colspan="3"></td> </tr> </table>'
    	}
        this.dialog = new Overlay(this.options.template, {
            className: this.options.dialogClass,
            width: this.options.width,
            height: this.options.height,
            zIndex: this.options.zIndex
        });

        if (this.options.hasMask) {
            var $mask = $('.' + this.options.maskClass);

            if ($mask.length === 0) {
                // 创建遮罩
                this.mask = new Overlay(document.createElement('div'), {
                    className: this.options.maskClass,
                    width: isIE6? $(document).outerWidth() : '100%',
                    height: isIE6? $(document).outerHeight() : '100%',
                    zIndex: this.options.zIndex - 1,
                    position: 'fixed'
                });
            } else {
                // 已有遮罩
                this.mask = $mask;
            }
        }

        // 内容填充
        this.render();

        // 先隐藏浮动层与遮罩
        this.dialog.hide();
        if (this.options.hasMask) {
            this.mask.hide();
        }

        // 关闭按钮事件绑定
        $(this.dialog.overlay).find('.js-close').on('click', $.proxy(this.hide, this));

        // 其它按钮事件绑定
        $(this.dialog.overlay).find('[data-role=confirm]').on('click', $.proxy(this.confirm, this));
        $(this.dialog.overlay).find('[data-role=confirmTwo]').on('click', $.proxy(this.confirmTwo, this));
        $(this.dialog.overlay).find('[data-role=cancel]').on('click', $.proxy(this.hide, this));

        // 初始化完成标志
        this.hasInit = true;
    },

    setup: function (element) {
        var that = this;

        if (element) {
            // 触发绑定
            $(element).on('click', function (e) {
                e.preventDefault();

                that.trigger();
            });
        } else {
            that.trigger();
        }

        // 用于一些初始化的操作
        if (that.options.once) {
            $(element).one('click', function (e) {
                e.preventDefault();
                that.options.once();
            });
        }
    },

    trigger: function () {
        if (!this.hasInit) {
            this.init();
        }

        this.show();
    },

    show: function () {
        if (this.options.beforeShow) {
            this.options.beforeShow.apply(this);
        }

        this.dialog.setPosition();
        this.dialog.show();
        if (this.options.hasMask) {
            this.mask.show();
        }

        if (this.options.afterShow) {
            this.options.afterShow.apply(this);
        }
    },

    hide: function () {
        if (this.options.beforeHide) {
            this.options.beforeHide.apply(this);
        }

        this.dialog.hide();
        if (this.options.hasMask) {
            this.mask.hide();
        }

        if (this.options.afterHide) {
            this.options.afterHide.apply(this);
        }

        if (this.options.needDestroy) {
            this.destroy();
        }
    },

    render: function () {
        var $head = $(this.dialog.overlay).find('.hd');
        var $body = $(this.dialog.overlay).find('.bd');
        var $close = $(this.dialog.overlay).find('.close');
        var html;

        if (!this.options.hasTitle) {
            $head.remove();
        } else {
            $head.find('h2').text(this.options.title);
        }

        if (this.options.noClose) {
            $close.remove();
        }

        if (this.options.confirmType) {
            html = '<p class="confirm-wrap"><i class="icon-sprite icon icon-' + this.options.confirmType + '-32"></i>' + this.options.message + '</p>'
        } else {
            html = this.options.content;
        }

        if (this.options.hasBtn) {
            var btnCls;
            html += '<div class="btn-wrap">';
            for (var i = 0; i < this.options.btnText.length; i++) {
                if (this.options.btnRole[i] === 'cancel' || this.options.btnRole[i] === 'confirmTwo') {
                    btnCls = 'gray';
                } else {
                    btnCls = 'blue';
                }

                html += '<input type="button" data-role="' + this.options.btnRole[i] + '" class="dialog_btn btn-default-' + btnCls + '" value="'+ this.options.btnText[i] +'"/>' 
            }
            html += '</div>'
        };

        $body.html(html).css('padding', this.options.padding);
    },

    closeDelay: function (time) {
        setTimeout($.proxy(this.hide, this), time);
    },

    destroy: function () {
        this.dialog.remove();
        if (this.options.hasMask) {
            this.mask.hide();
        }
        this.destroyed = true;
    },

    confirm: function () {
        this.options.confirm.apply(this);
    },

	confirmTwo: function () {
        this.options.confirmTwo.apply(this);
    }
}

// 注册插件
$.fn.dialog = function (options) {
    return this.each(function () {
        new Dialog(this, options);
    });
};

// 默认设置
$.fn.dialog.defaults = {
    dialogClass: 'js-dialog',
    maskClass: 'js-mask',
    template: '<table> <tr> <td class="edge top-edge" colspan="3"></td> </tr> <tr> <td class="edge left-edge"></td> <td class="center"> <div class="content"> <div class="hd"> <h2>提示</h2> </div> <div class="bd"></div> <div class="close"> <a href="javascript:;" class="js-close"></a> </div> </div> </td> <td class="edge right-edge"></td> </tr> <tr> <td class="edge bottom-edge" colspan="3"></td> </tr> </table>',
    width: 450,
    height: 'auto',
    zIndex: 999,
    hasMask: true,
    hasTitle: true,
    title: '提示',
    cotent: '',
    padding: '20px',
    hasBtn: false,
    btnText: ['确定', '取消'],
    btnRole: ['confirm', 'cancel'],
    message: '',
    needIframe:true
};

$.fn.dialog.Constructor = Dialog;

/**
 * 针对不支持 Html5 placeholder 的占位符兼容解决方案
 */

var ret = (function($){

    var isInputSupported = 'placeholder' in document.createElement('input'),
        isTextareaSupported = 'placeholder' in document.createElement('textarea'),
    
    // 这里的修改是为了防止修改$.fn
    // prototype = $.fn,
    prototype = {},
    valHooks = $.valHooks,
    hooks,
    placeholder;

    if (isInputSupported && isTextareaSupported) {

        placeholder = prototype.placeholder = function() {
            return this;
        };

        placeholder.input = placeholder.textarea = true;

    } else {

        placeholder = prototype.placeholder = function() {
            var $this = this;
            $this
            .filter((isInputSupported ? 'textarea' : ':input') + '[placeholder]')
            .unbind({
                'focus.placeholder': clearPlaceholder,
                'blur.placeholder': setPlaceholder
            })
            .bind({
                'focus.placeholder': clearPlaceholder,
                'blur.placeholder': setPlaceholder
            })
            .data('placeholder-enabled', true)
            .trigger('blur.placeholder');
            return $this;
        };

        placeholder.input = isInputSupported;
        placeholder.textarea = isTextareaSupported;

        hooks = {
            'get': function(element) {
                var $element = $(element);
                return $element.data('placeholder-enabled') && $element.hasClass('placeholder') ? '' : element.value;
            },

            'set': function(element, value) {
                var $element = $(element);
                if (!$element.data('placeholder-enabled')) {
                    return element.value = value;
                }
                if (value == '') {
                    element.value = value;
                    // Issue #56: Setting the placeholder causes problems if the element continues to have focus.
                    if (element != document.activeElement) {
                        // We can't use `triggerHandler` here because of dummy text/password inputs :(
                        setPlaceholder.call(element);
                    }
                } else if ($element.hasClass('placeholder')) {
                    clearPlaceholder.call(element, true, value) || (element.value = value);
                } else {
                    element.value = value;
                }
                // `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363
                return $element;
            }
        };

        //isInputSupported || (valHooks.input = hooks);
        //isTextareaSupported || (valHooks.textarea = hooks);

        // 这里的修改是为了防止别的hooks被覆盖
        if(!isInputSupported){
            var _old = valHooks.input;

            if(_old){
                valHooks.input = {
                    'get': function(){
                        if(_old.get){
                            _old.get.apply(this, arguments);
                        }

                        return hooks.get.apply(this, arguments);
                    },
                    'set': function(){
                        if(_old.set){
                            _old.set.apply(this, arguments);
                        }

                        return hooks.set.apply(this, arguments);
                    }
                };
            } else {
                valHooks.input = hooks;
            }
        }

        if(!isTextareaSupported){
            var _old = valHooks.textarea;

            if(_old){
                valHooks.textarea = {
                    'get': function(){
                        if(_old.get){
                            _old.get.apply(this, arguments);
                        }

                        return hooks.get.apply(this, arguments);
                    },
                    'set': function(){
                        if(_old.set){
                            _old.set.apply(this, arguments);
                        }   

                        return hooks.set.apply(this, arguments);
                    }
                };
            } else {
                valHooks.textarea = hooks;
            }
        }

        $(function() {
            // Look for forms
            $(document).delegate('form', 'submit.placeholder', function() {
                // Clear the placeholder values so they don't get submitted
                var $inputs = $('.placeholder', this).each(clearPlaceholder);
                setTimeout(function() {
                    $inputs.each(setPlaceholder);
                }, 10);
            });
        });

        // Clear placeholder values upon page reload
        $(window).bind('beforeunload.placeholder', function() {
            $('.placeholder').each(function() {
                this.value = '';
            });
        });

    }

    function args(elem) {
        // Return an object of element attributes
        var newAttrs = {},
        rinlinejQuery = /^jQuery\d+$/;
        $.each(elem.attributes, function(i, attr) {
            if (attr.specified && !rinlinejQuery.test(attr.name)) {
                newAttrs[attr.name] = attr.value;
            }
        });
        return newAttrs;
    }

    function clearPlaceholder(event, value) {
        var input = this,
        $input = $(input);
        // 修改演示四出现的问题
        if ((input.value == $input.attr('placeholder') || input.value == '') && $input.hasClass('placeholder')) {
            if ($input.data('placeholder-password')) {
                $input = $input.hide().next().show().attr('id', $input.removeAttr('id').data('placeholder-id'));
                // If `clearPlaceholder` was called from `$.valHooks.input.set`
                if (event === true) {
                    return $input[0].value = value;
                }
                $input.focus();
            } else {
                input.value = '';
                $input.removeClass('placeholder');
                input == document.activeElement && input.select();
            }
        }
    }

    function setPlaceholder() {
        var $replacement,
        input = this,
        $input = $(input),
        $origInput = $input,
        id = this.id;
        if ($(input).val() == '') {
            if (input.type == 'password') {
                if (!$input.data('placeholder-textinput')) {
                    try {
                        $replacement = $input.clone().attr({ 'type': 'text' });
                    } catch(e) {
                        $replacement = $('<input>').attr($.extend(args(this), { 'type': 'text' }));
                    }
                    $replacement
                    .removeAttr('name')
                    .data({
                        'placeholder-password': true,
                        'placeholder-id': id
                    })
                    .bind('focus.placeholder', clearPlaceholder);
                    $input
                    .data({
                        'placeholder-textinput': $replacement,
                        'placeholder-id': id
                    })
                    .before($replacement);
                }
                $input = $input.removeAttr('id').hide().prev().attr('id', id).show();
                // Note: `$input[0] != input` now!
            }
            $input.addClass('placeholder');
            $input[0].value = $input.attr('placeholder');
        } else {
            $input.removeClass('placeholder');
        }
    }

    return placeholder;

})($);

// 做简单的api封装
placeholder = (!ret.input || !ret.textarea) ? function(element){
    if(!element){
        element = $('input, textarea');
    }
    if(element){
        ret.call($(element));
    }
} : function(){};

// 提供清除 input.value 的方法
placeholder.clear = function(element) {
    element = $(element);
    if (element[0].tagName === "FORM") {
        // 寻找表单下所有的 input 元素
        clearInput(element.find("input.placeholder, textarea.placeholder"));
    } else {
        // 清除指定的 input 元素
        clearInput(element);
    }
    function clearInput(input) {
        input.each(function(i, item) {
            item = $(item);
            if (item[0].value === item.attr("placeholder") && item.hasClass("placeholder")) {
                item[0].value = "";
            }
        });
    }
};

$(function () {
    // 默认运行，这样就不需要手动调用
    placeholder();
});

/*视频验证*/
var swfobject = function() {
    
    var UNDEF = "undefined",
        OBJECT = "object",
        SHOCKWAVE_FLASH = "Shockwave Flash",
        SHOCKWAVE_FLASH_AX = "ShockwaveFlash.ShockwaveFlash",
        FLASH_MIME_TYPE = "application/x-shockwave-flash",
        EXPRESS_INSTALL_ID = "SWFObjectExprInst",
        ON_READY_STATE_CHANGE = "onreadystatechange",
        
        win = window,
        doc = document,
        nav = navigator,
        
        plugin = false,
        domLoadFnArr = [main],
        regObjArr = [],
        objIdArr = [],
        listenersArr = [],
        storedAltContent,
        storedAltContentId,
        storedCallbackFn,
        storedCallbackObj,
        isDomLoaded = false,
        isExpressInstallActive = false,
        dynamicStylesheet,
        dynamicStylesheetMedia,
        autoHideShow = true,
    
    /* Centralized function for browser feature detection
        - User agent string detection is only used when no good alternative is possible
        - Is executed directly for optimal performance
    */  
    ua = function() {
        var w3cdom = typeof doc.getElementById != UNDEF && typeof doc.getElementsByTagName != UNDEF && typeof doc.createElement != UNDEF,
            u = nav.userAgent.toLowerCase(),
            p = nav.platform.toLowerCase(),
            windows = p ? /win/.test(p) : /win/.test(u),
            mac = p ? /mac/.test(p) : /mac/.test(u),
            webkit = /webkit/.test(u) ? parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false, // returns either the webkit version or false if not webkit
            ie = !+"\v1", // feature detection based on Andrea Giammarchi's solution: http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
            playerVersion = [0,0,0],
            d = null;
        if (typeof nav.plugins != UNDEF && typeof nav.plugins[SHOCKWAVE_FLASH] == OBJECT) {
            d = nav.plugins[SHOCKWAVE_FLASH].description;
            if (d && !(typeof nav.mimeTypes != UNDEF && nav.mimeTypes[FLASH_MIME_TYPE] && !nav.mimeTypes[FLASH_MIME_TYPE].enabledPlugin)) { // navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin indicates whether plug-ins are enabled or disabled in Safari 3+
                plugin = true;
                ie = false; // cascaded feature detection for Internet Explorer
                d = d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
                playerVersion[0] = parseInt(d.replace(/^(.*)\..*$/, "$1"), 10);
                playerVersion[1] = parseInt(d.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
                playerVersion[2] = /[a-zA-Z]/.test(d) ? parseInt(d.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0;
            }
        }
        else if (typeof win.ActiveXObject != UNDEF) {
            try {
                var a = new ActiveXObject(SHOCKWAVE_FLASH_AX);
                if (a) { // a will return null when ActiveX is disabled
                    d = a.GetVariable("$version");
                    if (d) {
                        ie = true; // cascaded feature detection for Internet Explorer
                        d = d.split(" ")[1].split(",");
                        playerVersion = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
                    }
                }
            }
            catch(e) {}
        }
        return { w3:w3cdom, pv:playerVersion, wk:webkit, ie:ie, win:windows, mac:mac };
    }(),
    
    /* Cross-browser onDomLoad
        - Will fire an event as soon as the DOM of a web page is loaded
        - Internet Explorer workaround based on Diego Perini's solution: http://javascript.nwbox.com/IEContentLoaded/
        - Regular onload serves as fallback
    */ 
    onDomLoad = function() {
        if (!ua.w3) { return; }
        if ((typeof doc.readyState != UNDEF && doc.readyState == "complete") || (typeof doc.readyState == UNDEF && (doc.getElementsByTagName("body")[0] || doc.body))) { // function is fired after onload, e.g. when script is inserted dynamically 
            callDomLoadFunctions();
        }
        if (!isDomLoaded) {
            if (typeof doc.addEventListener != UNDEF) {
                doc.addEventListener("DOMContentLoaded", callDomLoadFunctions, false);
            }       
            if (ua.ie && ua.win) {
                doc.attachEvent(ON_READY_STATE_CHANGE, function() {
                    if (doc.readyState == "complete") {
                        doc.detachEvent(ON_READY_STATE_CHANGE, arguments.callee);
                        callDomLoadFunctions();
                    }
                });
                if (win == top) { // if not inside an iframe
                    (function(){
                        if (isDomLoaded) { return; }
                        try {
                            doc.documentElement.doScroll("left");
                        }
                        catch(e) {
                            setTimeout(arguments.callee, 0);
                            return;
                        }
                        callDomLoadFunctions();
                    })();
                }
            }
            if (ua.wk) {
                (function(){
                    if (isDomLoaded) { return; }
                    if (!/loaded|complete/.test(doc.readyState)) {
                        setTimeout(arguments.callee, 0);
                        return;
                    }
                    callDomLoadFunctions();
                })();
            }
            addLoadEvent(callDomLoadFunctions);
        }
    }();
    
    function callDomLoadFunctions() {
        if (isDomLoaded) { return; }
        try { // test if we can really add/remove elements to/from the DOM; we don't want to fire it too early
            var t = doc.getElementsByTagName("body")[0].appendChild(createElement("span"));
            t.parentNode.removeChild(t);
        }
        catch (e) { return; }
        isDomLoaded = true;
        var dl = domLoadFnArr.length;
        for (var i = 0; i < dl; i++) {
            domLoadFnArr[i]();
        }
    }
    
    function addDomLoadEvent(fn) {
        if (isDomLoaded) {
            fn();
        }
        else { 
            domLoadFnArr[domLoadFnArr.length] = fn; // Array.push() is only available in IE5.5+
        }
    }
    
    /* Cross-browser onload
        - Based on James Edwards' solution: http://brothercake.com/site/resources/scripts/onload/
        - Will fire an event as soon as a web page including all of its assets are loaded 
     */
    function addLoadEvent(fn) {
        if (typeof win.addEventListener != UNDEF) {
            win.addEventListener("load", fn, false);
        }
        else if (typeof doc.addEventListener != UNDEF) {
            doc.addEventListener("load", fn, false);
        }
        else if (typeof win.attachEvent != UNDEF) {
            addListener(win, "onload", fn);
        }
        else if (typeof win.onload == "function") {
            var fnOld = win.onload;
            win.onload = function() {
                fnOld();
                fn();
            };
        }
        else {
            win.onload = fn;
        }
    }
    
    /* Main function
        - Will preferably execute onDomLoad, otherwise onload (as a fallback)
    */
    function main() { 
        if (plugin) {
            testPlayerVersion();
        }
        else {
            matchVersions();
        }
    }
    
    /* Detect the Flash Player version for non-Internet Explorer browsers
        - Detecting the plug-in version via the object element is more precise than using the plugins collection item's description:
          a. Both release and build numbers can be detected
          b. Avoid wrong descriptions by corrupt installers provided by Adobe
          c. Avoid wrong descriptions by multiple Flash Player entries in the plugin Array, caused by incorrect browser imports
        - Disadvantage of this method is that it depends on the availability of the DOM, while the plugins collection is immediately available
    */
    function testPlayerVersion() {
        var b = doc.getElementsByTagName("body")[0];
        var o = createElement(OBJECT);
        o.setAttribute("type", FLASH_MIME_TYPE);
        var t = b.appendChild(o);
        if (t) {
            var counter = 0;
            (function(){
                if (typeof t.GetVariable != UNDEF) {
                    var d = t.GetVariable("$version");
                    if (d) {
                        d = d.split(" ")[1].split(",");
                        ua.pv = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
                    }
                }
                else if (counter < 10) {
                    counter++;
                    setTimeout(arguments.callee, 10);
                    return;
                }
                b.removeChild(o);
                t = null;
                matchVersions();
            })();
        }
        else {
            matchVersions();
        }
    }
    
    /* Perform Flash Player and SWF version matching; static publishing only
    */
    function matchVersions() {
        var rl = regObjArr.length;
        if (rl > 0) {
            for (var i = 0; i < rl; i++) { // for each registered object element
                var id = regObjArr[i].id;
                var cb = regObjArr[i].callbackFn;
                var cbObj = {success:false, id:id};
                if (ua.pv[0] > 0) {
                    var obj = getElementById(id);
                    if (obj) {
                        if (hasPlayerVersion(regObjArr[i].swfVersion) && !(ua.wk && ua.wk < 312)) { // Flash Player version >= published SWF version: Houston, we have a match!
                            setVisibility(id, true);
                            if (cb) {
                                cbObj.success = true;
                                cbObj.ref = getObjectById(id);
                                cb(cbObj);
                            }
                        }
                        else if (regObjArr[i].expressInstall && canExpressInstall()) { // show the Adobe Express Install dialog if set by the web page author and if supported
                            var att = {};
                            att.data = regObjArr[i].expressInstall;
                            att.width = obj.getAttribute("width") || "0";
                            att.height = obj.getAttribute("height") || "0";
                            if (obj.getAttribute("class")) { att.styleclass = obj.getAttribute("class"); }
                            if (obj.getAttribute("align")) { att.align = obj.getAttribute("align"); }
                            // parse HTML object param element's name-value pairs
                            var par = {};
                            var p = obj.getElementsByTagName("param");
                            var pl = p.length;
                            for (var j = 0; j < pl; j++) {
                                if (p[j].getAttribute("name").toLowerCase() != "movie") {
                                    par[p[j].getAttribute("name")] = p[j].getAttribute("value");
                                }
                            }
                            showExpressInstall(att, par, id, cb);
                        }
                        else { // Flash Player and SWF version mismatch or an older Webkit engine that ignores the HTML object element's nested param elements: display alternative content instead of SWF
                            displayAltContent(obj);
                            if (cb) { cb(cbObj); }
                        }
                    }
                }
                else {  // if no Flash Player is installed or the fp version cannot be detected we let the HTML object element do its job (either show a SWF or alternative content)
                    setVisibility(id, true);
                    if (cb) {
                        var o = getObjectById(id); // test whether there is an HTML object element or not
                        if (o && typeof o.SetVariable != UNDEF) { 
                            cbObj.success = true;
                            cbObj.ref = o;
                        }
                        cb(cbObj);
                    }
                }
            }
        }
    }
    
    function getObjectById(objectIdStr) {
        var r = null;
        var o = getElementById(objectIdStr);
        if (o && o.nodeName == "OBJECT") {
            if (typeof o.SetVariable != UNDEF) {
                r = o;
            }
            else {
                var n = o.getElementsByTagName(OBJECT)[0];
                if (n) {
                    r = n;
                }
            }
        }
        return r;
    }
    
    /* Requirements for Adobe Express Install
        - only one instance can be active at a time
        - fp 6.0.65 or higher
        - Win/Mac OS only
        - no Webkit engines older than version 312
    */
    function canExpressInstall() {
        return !isExpressInstallActive && hasPlayerVersion("6.0.65") && (ua.win || ua.mac) && !(ua.wk && ua.wk < 312);
    }
    
    /* Show the Adobe Express Install dialog
        - Reference: http://www.adobe.com/cfusion/knowledgebase/index.cfm?id=6a253b75
    */
    function showExpressInstall(att, par, replaceElemIdStr, callbackFn) {
        isExpressInstallActive = true;
        storedCallbackFn = callbackFn || null;
        storedCallbackObj = {success:false, id:replaceElemIdStr};
        var obj = getElementById(replaceElemIdStr);
        if (obj) {
            if (obj.nodeName == "OBJECT") { // static publishing
                storedAltContent = abstractAltContent(obj);
                storedAltContentId = null;
            }
            else { // dynamic publishing
                storedAltContent = obj;
                storedAltContentId = replaceElemIdStr;
            }
            att.id = EXPRESS_INSTALL_ID;
            if (typeof att.width == UNDEF || (!/%$/.test(att.width) && parseInt(att.width, 10) < 310)) { att.width = "310"; }
            if (typeof att.height == UNDEF || (!/%$/.test(att.height) && parseInt(att.height, 10) < 137)) { att.height = "137"; }
            doc.title = doc.title.slice(0, 47) + " - Flash Player Installation";
            var pt = ua.ie && ua.win ? "ActiveX" : "PlugIn",
                fv = "MMredirectURL=" + encodeURI(window.location).toString().replace(/&/g,"%26") + "&MMplayerType=" + pt + "&MMdoctitle=" + doc.title;
            if (typeof par.flashvars != UNDEF) {
                par.flashvars += "&" + fv;
            }
            else {
                par.flashvars = fv;
            }
            // IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
            // because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
            if (ua.ie && ua.win && obj.readyState != 4) {
                var newObj = createElement("div");
                replaceElemIdStr += "SWFObjectNew";
                newObj.setAttribute("id", replaceElemIdStr);
                obj.parentNode.insertBefore(newObj, obj); // insert placeholder div that will be replaced by the object element that loads expressinstall.swf
                obj.style.display = "none";
                (function(){
                    if (obj.readyState == 4) {
                        obj.parentNode.removeChild(obj);
                    }
                    else {
                        setTimeout(arguments.callee, 10);
                    }
                })();
            }
            createSWF(att, par, replaceElemIdStr);
        }
    }
    
    /* Functions to abstract and display alternative content
    */
    function displayAltContent(obj) {
        if (ua.ie && ua.win && obj.readyState != 4) {
            // IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
            // because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
            var el = createElement("div");
            obj.parentNode.insertBefore(el, obj); // insert placeholder div that will be replaced by the alternative content
            el.parentNode.replaceChild(abstractAltContent(obj), el);
            obj.style.display = "none";
            (function(){
                if (obj.readyState == 4) {
                    obj.parentNode.removeChild(obj);
                }
                else {
                    setTimeout(arguments.callee, 10);
                }
            })();
        }
        else {
            obj.parentNode.replaceChild(abstractAltContent(obj), obj);
        }
    } 

    function abstractAltContent(obj) {
        var ac = createElement("div");
        if (ua.win && ua.ie) {
            ac.innerHTML = obj.innerHTML;
        }
        else {
            var nestedObj = obj.getElementsByTagName(OBJECT)[0];
            if (nestedObj) {
                var c = nestedObj.childNodes;
                if (c) {
                    var cl = c.length;
                    for (var i = 0; i < cl; i++) {
                        if (!(c[i].nodeType == 1 && c[i].nodeName == "PARAM") && !(c[i].nodeType == 8)) {
                            ac.appendChild(c[i].cloneNode(true));
                        }
                    }
                }
            }
        }
        return ac;
    }
    
    /* Cross-browser dynamic SWF creation
    */
    function createSWF(attObj, parObj, id) {
        var r, el = getElementById(id);
        if (ua.wk && ua.wk < 312) { return r; }
        if (el) {
            if (typeof attObj.id == UNDEF) { // if no 'id' is defined for the object element, it will inherit the 'id' from the alternative content
                attObj.id = id;
            }
            if (ua.ie && ua.win) { // Internet Explorer + the HTML object element + W3C DOM methods do not combine: fall back to outerHTML
                var att = "";
                for (var i in attObj) {
                    if (attObj[i] != Object.prototype[i]) { // filter out prototype additions from other potential libraries
                        if (i.toLowerCase() == "data") {
                            parObj.movie = attObj[i];
                        }
                        else if (i.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
                            att += ' class="' + attObj[i] + '"';
                        }
                        else if (i.toLowerCase() != "classid") {
                            att += ' ' + i + '="' + attObj[i] + '"';
                        }
                    }
                }
                var par = "";
                for (var j in parObj) {
                    if (parObj[j] != Object.prototype[j]) { // filter out prototype additions from other potential libraries
                        par += '<param name="' + j + '" value="' + parObj[j] + '" />';
                    }
                }
                el.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + att + '>' + par + '</object>';
                objIdArr[objIdArr.length] = attObj.id; // stored to fix object 'leaks' on unload (dynamic publishing only)
                r = getElementById(attObj.id);  
            }
            else { // well-behaving browsers
                var o = createElement(OBJECT);
                o.setAttribute("type", FLASH_MIME_TYPE);
                for (var m in attObj) {
                    if (attObj[m] != Object.prototype[m]) { // filter out prototype additions from other potential libraries
                        if (m.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
                            o.setAttribute("class", attObj[m]);
                        }
                        else if (m.toLowerCase() != "classid") { // filter out IE specific attribute
                            o.setAttribute(m, attObj[m]);
                        }
                    }
                }
                for (var n in parObj) {
                    if (parObj[n] != Object.prototype[n] && n.toLowerCase() != "movie") { // filter out prototype additions from other potential libraries and IE specific param element
                        createObjParam(o, n, parObj[n]);
                    }
                }
                el.parentNode.replaceChild(o, el);
                r = o;
            }
        }
        return r;
    }
    
    function createObjParam(el, pName, pValue) {
        var p = createElement("param");
        p.setAttribute("name", pName);  
        p.setAttribute("value", pValue);
        el.appendChild(p);
    }
    
    /* Cross-browser SWF removal
        - Especially needed to safely and completely remove a SWF in Internet Explorer
    */
    function removeSWF(id) {
        var obj = getElementById(id);
        if (obj && obj.nodeName == "OBJECT") {
            if (ua.ie && ua.win) {
                obj.style.display = "none";
                (function(){
                    if (obj.readyState == 4) {
                        removeObjectInIE(id);
                    }
                    else {
                        setTimeout(arguments.callee, 10);
                    }
                })();
            }
            else {
                obj.parentNode.removeChild(obj);
            }
        }
    }
    
    function removeObjectInIE(id) {
        var obj = getElementById(id);
        if (obj) {
            for (var i in obj) {
                if (typeof obj[i] == "function") {
                    obj[i] = null;
                }
            }
            obj.parentNode.removeChild(obj);
        }
    }
    
    /* Functions to optimize JavaScript compression
    */
    function getElementById(id) {
        var el = null;
        try {
            el = doc.getElementById(id);
        }
        catch (e) {}
        return el;
    }
    
    function createElement(el) {
        return doc.createElement(el);
    }
    
    /* Updated attachEvent function for Internet Explorer
        - Stores attachEvent information in an Array, so on unload the detachEvent functions can be called to avoid memory leaks
    */  
    function addListener(target, eventType, fn) {
        target.attachEvent(eventType, fn);
        listenersArr[listenersArr.length] = [target, eventType, fn];
    }
    
    /* Flash Player and SWF content version matching
    */
    function hasPlayerVersion(rv) {
        var pv = ua.pv, v = rv.split(".");
        v[0] = parseInt(v[0], 10);
        v[1] = parseInt(v[1], 10) || 0; // supports short notation, e.g. "9" instead of "9.0.0"
        v[2] = parseInt(v[2], 10) || 0;
        return (pv[0] > v[0] || (pv[0] == v[0] && pv[1] > v[1]) || (pv[0] == v[0] && pv[1] == v[1] && pv[2] >= v[2])) ? true : false;
    }
    
    /* Cross-browser dynamic CSS creation
        - Based on Bobby van der Sluis' solution: http://www.bobbyvandersluis.com/articles/dynamicCSS.php
    */  
    function createCSS(sel, decl, media, newStyle) {
        if (ua.ie && ua.mac) { return; }
        var h = doc.getElementsByTagName("head")[0];
        if (!h) { return; } // to also support badly authored HTML pages that lack a head element
        var m = (media && typeof media == "string") ? media : "screen";
        if (newStyle) {
            dynamicStylesheet = null;
            dynamicStylesheetMedia = null;
        }
        if (!dynamicStylesheet || dynamicStylesheetMedia != m) { 
            // create dynamic stylesheet + get a global reference to it
            var s = createElement("style");
            s.setAttribute("type", "text/css");
            s.setAttribute("media", m);
            dynamicStylesheet = h.appendChild(s);
            if (ua.ie && ua.win && typeof doc.styleSheets != UNDEF && doc.styleSheets.length > 0) {
                dynamicStylesheet = doc.styleSheets[doc.styleSheets.length - 1];
            }
            dynamicStylesheetMedia = m;
        }
        // add style rule
        if (ua.ie && ua.win) {
            if (dynamicStylesheet && typeof dynamicStylesheet.addRule == OBJECT) {
                dynamicStylesheet.addRule(sel, decl);
            }
        }
        else {
            if (dynamicStylesheet && typeof doc.createTextNode != UNDEF) {
                dynamicStylesheet.appendChild(doc.createTextNode(sel + " {" + decl + "}"));
            }
        }
    }
    
    function setVisibility(id, isVisible) {
        if (!autoHideShow) { return; }
        var v = isVisible ? "visible" : "hidden";
        if (isDomLoaded && getElementById(id)) {
            getElementById(id).style.visibility = v;
        }
        else {
            createCSS("#" + id, "visibility:" + v);
        }
    }

    /* Filter to avoid XSS attacks
    */
    function urlEncodeIfNecessary(s) {
        var regex = /[\\\"<>\.;]/;
        var hasBadChars = regex.exec(s) != null;
        return hasBadChars && typeof encodeURIComponent != UNDEF ? encodeURIComponent(s) : s;
    }
    
    /* Release memory to avoid memory leaks caused by closures, fix hanging audio/video threads and force open sockets/NetConnections to disconnect (Internet Explorer only)
    */
    var cleanup = function() {
        if (ua.ie && ua.win) {
            window.attachEvent("onunload", function() {
                // remove listeners to avoid memory leaks
                var ll = listenersArr.length;
                for (var i = 0; i < ll; i++) {
                    listenersArr[i][0].detachEvent(listenersArr[i][1], listenersArr[i][2]);
                }
                // cleanup dynamically embedded objects to fix audio/video threads and force open sockets and NetConnections to disconnect
                var il = objIdArr.length;
                for (var j = 0; j < il; j++) {
                    removeSWF(objIdArr[j]);
                }
                // cleanup library's main closures to avoid memory leaks
                for (var k in ua) {
                    ua[k] = null;
                }
                ua = null;
                for (var l in swfobject) {
                    swfobject[l] = null;
                }
                swfobject = null;
            });
        }
    }();
    
    return {
        /* Public API
            - Reference: http://code.google.com/p/swfobject/wiki/documentation
        */ 
        registerObject: function(objectIdStr, swfVersionStr, xiSwfUrlStr, callbackFn) {
            if (ua.w3 && objectIdStr && swfVersionStr) {
                var regObj = {};
                regObj.id = objectIdStr;
                regObj.swfVersion = swfVersionStr;
                regObj.expressInstall = xiSwfUrlStr;
                regObj.callbackFn = callbackFn;
                regObjArr[regObjArr.length] = regObj;
                setVisibility(objectIdStr, false);
            }
            else if (callbackFn) {
                callbackFn({success:false, id:objectIdStr});
            }
        },
        
        getObjectById: function(objectIdStr) {
            if (ua.w3) {
                return getObjectById(objectIdStr);
            }
        },
        
        embedSWF: function(swfUrlStr, replaceElemIdStr, widthStr, heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn) {
            var callbackObj = {success:false, id:replaceElemIdStr};
            if (ua.w3 && !(ua.wk && ua.wk < 312) && swfUrlStr && replaceElemIdStr && widthStr && heightStr && swfVersionStr) {
                setVisibility(replaceElemIdStr, false);
                addDomLoadEvent(function() {
                    widthStr += ""; // auto-convert to string
                    heightStr += "";
                    var att = {};
                    if (attObj && typeof attObj === OBJECT) {
                        for (var i in attObj) { // copy object to avoid the use of references, because web authors often reuse attObj for multiple SWFs
                            att[i] = attObj[i];
                        }
                    }
                    att.data = swfUrlStr;
                    att.width = widthStr;
                    att.height = heightStr;
                    var par = {}; 
                    if (parObj && typeof parObj === OBJECT) {
                        for (var j in parObj) { // copy object to avoid the use of references, because web authors often reuse parObj for multiple SWFs
                            par[j] = parObj[j];
                        }
                    }
                    if (flashvarsObj && typeof flashvarsObj === OBJECT) {
                        for (var k in flashvarsObj) { // copy object to avoid the use of references, because web authors often reuse flashvarsObj for multiple SWFs
                            if (typeof par.flashvars != UNDEF) {
                                par.flashvars += "&" + k + "=" + flashvarsObj[k];
                            }
                            else {
                                par.flashvars = k + "=" + flashvarsObj[k];
                            }
                        }
                    }
                    if (hasPlayerVersion(swfVersionStr)) { // create SWF
                        var obj = createSWF(att, par, replaceElemIdStr);
                        if (att.id == replaceElemIdStr) {
                            setVisibility(replaceElemIdStr, true);
                        }
                        callbackObj.success = true;
                        callbackObj.ref = obj;
                    }
                    else if (xiSwfUrlStr && canExpressInstall()) { // show Adobe Express Install
                        att.data = xiSwfUrlStr;
                        showExpressInstall(att, par, replaceElemIdStr, callbackFn);
                        return;
                    }
                    else { // show alternative content
                        setVisibility(replaceElemIdStr, true);
                    }
                    if (callbackFn) { callbackFn(callbackObj); }
                });
            }
            else if (callbackFn) { callbackFn(callbackObj); }
        },
        
        switchOffAutoHideShow: function() {
            autoHideShow = false;
        },
        
        ua: ua,
        
        getFlashPlayerVersion: function() {
            return { major:ua.pv[0], minor:ua.pv[1], release:ua.pv[2] };
        },
        
        hasFlashPlayerVersion: hasPlayerVersion,
        
        createSWF: function(attObj, parObj, replaceElemIdStr) {
            if (ua.w3) {
                return createSWF(attObj, parObj, replaceElemIdStr);
            }
            else {
                return undefined;
            }
        },
        
        showExpressInstall: function(att, par, replaceElemIdStr, callbackFn) {
            if (ua.w3 && canExpressInstall()) {
                showExpressInstall(att, par, replaceElemIdStr, callbackFn);
            }
        },
        
        removeSWF: function(objElemIdStr) {
            if (ua.w3) {
                removeSWF(objElemIdStr);
            }
        },
        
        createCSS: function(selStr, declStr, mediaStr, newStyleBoolean) {
            if (ua.w3) {
                createCSS(selStr, declStr, mediaStr, newStyleBoolean);
            }
        },
        
        addDomLoadEvent: addDomLoadEvent,
        
        addLoadEvent: addLoadEvent,
        
        getQueryParamValue: function(param) {
            var q = doc.location.search || doc.location.hash;
            if (q) {
                if (/\?/.test(q)) { q = q.split("?")[1]; } // strip question mark
                if (param == null) {
                    return urlEncodeIfNecessary(q);
                }
                var pairs = q.split("&");
                for (var i = 0; i < pairs.length; i++) {
                    if (pairs[i].substring(0, pairs[i].indexOf("=")) == param) {
                        return urlEncodeIfNecessary(pairs[i].substring((pairs[i].indexOf("=") + 1)));
                    }
                }
            }
            return "";
        },
        
        // For internal usage only
        expressInstallCallback: function() {
            if (isExpressInstallActive) {
                var obj = getElementById(EXPRESS_INSTALL_ID);
                if (obj && storedAltContent) {
                    obj.parentNode.replaceChild(storedAltContent, obj);
                    if (storedAltContentId) {
                        setVisibility(storedAltContentId, true);
                        if (ua.ie && ua.win) { storedAltContent.style.display = "block"; }
                    }
                    if (storedCallbackFn) { storedCallbackFn(storedCallbackObj); }
                }
                isExpressInstallActive = false;
            } 
        }
    };
}();






// 阅读并接受协议后，下一步才可点击
    $('#protocol').on('change', 'input[type=checkbox]', function () {
        if (this.checked) {
            $('#submitBtn').prop('disabled', false);
        } else {
            $('#submitBtn').prop('disabled', true);
        }
    });

// 现金数字转换大写
function convertCurrency(currencyDigits) {
// Constants:
var MAXIMUM_NUMBER = 99999999999.99;
// Predefine the radix characters and currency symbols for output:
var CN_ZERO = "零";
var CN_ONE = "壹";
var CN_TWO = "贰";
var CN_THREE = "叁";
var CN_FOUR = "肆";
var CN_FIVE = "伍";
var CN_SIX = "陆";
var CN_SEVEN = "柒";
var CN_EIGHT = "捌";
var CN_NINE = "玖";
var CN_TEN = "拾";
var CN_HUNDRED = "佰";
var CN_THOUSAND = "仟";
var CN_TEN_THOUSAND = "万";
var CN_HUNDRED_MILLION = "亿";
var CN_DOLLAR = "元";
var CN_TEN_CENT = "角";
var CN_CENT = "分";
var CN_INTEGER = "整";

// Variables:
var integral; // Represent integral part of digit number.
var decimal; // Represent decimal part of digit number.
var outputCharacters; // The output result.
var parts;
var digits, radices, bigRadices, decimals;
var zeroCount;
var i, p, d;
var quotient, modulus;

// Validate input string:
currencyDigits = currencyDigits.toString();
if (currencyDigits == "") {
return "不能为空";
}
if (currencyDigits.match(/[^,.\d]/) != null) {
return "请输入数字";
}
if ((currencyDigits).match(/^((\d{1,3}(,\d{3})*(.((\d{3},)*\d{1,3}))?)|(\d+(.\d+)?))$/) == null) {
return "请输入完整的数字";
}

// Normalize the format of input digits:
currencyDigits = currencyDigits.replace(/,/g, ""); // Remove comma delimiters.
currencyDigits = currencyDigits.replace(/^0+/, ""); // Trim zeros at the beginning.
// Assert the number is not greater than the maximum number.
if (Number(currencyDigits) > MAXIMUM_NUMBER) {
return "数字过大";
}

// Process the coversion from currency digits to characters:
// Separate integral and decimal parts before processing coversion:
parts = currencyDigits.split(".");
if (parts.length > 1) {
integral = parts[0];
decimal = parts[1];
// Cut down redundant decimal digits that are after the second.
decimal = decimal.substr(0, 2);
}
else {
integral = parts[0];
decimal = "";
}
// Prepare the characters corresponding to the digits:
digits = new Array(CN_ZERO, CN_ONE, CN_TWO, CN_THREE, CN_FOUR, CN_FIVE, CN_SIX, CN_SEVEN, CN_EIGHT, CN_NINE);
radices = new Array("", CN_TEN, CN_HUNDRED, CN_THOUSAND);
bigRadices = new Array("", CN_TEN_THOUSAND, CN_HUNDRED_MILLION);
decimals = new Array(CN_TEN_CENT, CN_CENT);
// Start processing:
outputCharacters = "";
// Process integral part if it is larger than 0:
if (Number(integral) > 0) {
zeroCount = 0;
for (i = 0; i < integral.length; i++) {
p = integral.length - i - 1;
d = integral.substr(i, 1);
quotient = p / 4;
modulus = p % 4;
if (d == "0") {
zeroCount++;
}
else {
if (zeroCount > 0)
{
outputCharacters += digits[0];
}
zeroCount = 0;
outputCharacters += digits[Number(d)] + radices[modulus];
}
if (modulus == 0 && zeroCount < 4) {
outputCharacters += bigRadices[quotient];
}
}
outputCharacters += CN_DOLLAR;
}
// Process decimal part if there is:
if (decimal != "") {
for (i = 0; i < decimal.length; i++) {
d = decimal.substr(i, 1);
if (d != "0") {
outputCharacters += digits[Number(d)] + decimals[i];
}
}
}
// Confirm and return the final output string:
if (outputCharacters == "") {
outputCharacters = CN_ZERO + CN_DOLLAR;
}
if (decimal == "") {
outputCharacters += CN_INTEGER;
}
outputCharacters =  outputCharacters;
return outputCharacters;
}


 // hoverDelay
(function($){
    $.fn.hoverDelay = function(options){
        var defaults = {
            hoverDuring: 200,
            outDuring: 200,
            hoverEvent: function(){
                $.noop();
            },
            outEvent: function(){
                $.noop();    
            }
        };
        var sets = $.extend(defaults,options || {});
        var hoverTimer, outTimer, that = this;
        return $(this).each(function(){
            $(this).hover(function(){
                clearTimeout(outTimer);
                hoverTimer = setTimeout(function(){sets.hoverEvent.apply(that)}, sets.hoverDuring);
            },function(){
                clearTimeout(hoverTimer);
                outTimer = setTimeout(function(){sets.outEvent.apply(that)}, sets.outDuring);
            });    
        });
    }      
})(jQuery);
