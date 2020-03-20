/*************************************************************************************************
 ***********************************财人汇网上开户项目**********************************************
 *************************************验证字段相关js************************************************
 *************************************************************************************************/

/**
 * 各券商密码验证回调
 */
var idevValidatePwdCallback = {};

function addValidatePwdCallback(func) {
    idevValidatePwdCallback[securityAlias] = func
}

/**
 * 手机号码校验
 *
 * @param sMobile
 */
function devValidateMobile(sMobile) {
    // 手机号码规则(11位)
    var regMobile = /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
    if (!regMobile.test($.trim(sMobile))) {
        return "手机号码填写错误";
    } else {
        return "success";
    }
}

// 验证验证码
function devValidateCode(validateCode) {
    if (/^\d{4}$/.test(validateCode)) {
        return "success";
    } else {
        return "验证码填写错误";
    }
}

/**
 * 姓名校验
 *
 * @param sName
 */
function devValidateName(sName) {
    // 姓名规则(2-20个字符)
    var sLength = devGetLength(sName);
    if (sLength <= 15 && sLength >= 2) {
        return "success";
    } else {
        return "姓名不符合规范";
    }
}

/**
 * 身份证号校验
 *
 * @param cidStr
 */
function devValidateCID(cidStr) {
    var iSum = 0;

    // 身份证正则表达式(18位)
    // var regCID =
    // /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{4}$/;
    cidStr = cidStr.replace(/x/g, "X");

    if (!/^\d{17}(\d|X)$/i.test(cidStr))
        return "身份证号码填写错误";// 身份证号码位数有误

    if (cidCity[parseInt(cidStr.substr(0, 2))] == null)
        return "身份证号码填写错误";// 地区编码有误

    try {
        var today = new Date();
        var delt = parseInt(today.getFullYear())
            - parseInt(cidStr.substr(6, 4));

        if (delt > 150)
            return "身份证号码填写错误";// 你活得太久了，快去申请吉尼斯吧
        if (delt <= 0)
            return "身份证号码填写错误";// 好有远见，这么快就在为后代申请身份证了啊，佩服！

        var sBirthday = cidStr.substr(6, 4) + "-"
            + Number(cidStr.substr(10, 2)) + "-"
            + Number(cidStr.substr(12, 2));
        var d = new Date(sBirthday.replace(/-/g, "/"));
        if (sBirthday != (d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d
            .getDate()))
            return "身份证号码填写错误";// 生日有误

        if (devCalcAge(cidStr.substring(6, 14)) < 18)
            return "未满18周岁不能开户";

        var ai = cidStr.substr(0, 17);

        var totalMulAiWi = 0;
        for (var i = 0; i < 17; i++) {
            totalMulAiWi = totalMulAiWi + parseInt(ai.charAt(i))
                * parseInt(wi[i]);
        }
        var modValue = totalMulAiWi % 11;
        var strVerifyCode = valCodeArr[modValue];
        ai = ai + strVerifyCode;

        if (ai != cidStr) {
            return "身份证号码填写错误";// 校验位有误
        }
    } catch (e) {
        return "身份证号码填写错误";
    }

    return "success";
}

// 身份证地区编码
var cidCity = {
    11: "北京",
    12: "天津",
    13: "河北",
    14: "山西",
    15: "内蒙古",
    21: "辽宁",
    22: "吉林",
    23: "黑龙江",
    31: "上海",
    32: "江苏",
    33: "浙江",
    34: "安徽",
    35: "福建",
    36: "江西",
    37: "山东",
    41: "河南",
    42: "湖北",
    43: "湖南",
    44: "广东",
    45: "广西",
    46: "海南",
    50: "重庆",
    51: "四川",
    52: "贵州",
    53: "云南",
    54: "西藏",
    61: "陕西",
    62: "甘肃",
    63: "青海",
    64: "宁夏",
    65: "新疆",
    71: "台湾",
    81: "香港",
    82: "澳门",
    91: "国外"
};
var valCodeArr = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];
var wi = ["7", "9", "10", "5", "8", "4", "2", "1", "6", "3", "7", "9", "10",
    "5", "8", "4", "2"];

/**
 * 计算周岁
 *
 * @param dateText
 *            '19880101'
 */
function devCalcAge(dateText) {
    var bir = new Date(dateText.substring(0, 4), parseInt(dateText.substring(4,
        6)) - 1, dateText.substring(6, 8));
    var cur = new Date();
    var ageDate = new Date(cur.getTime() - bir.getTime() - 24 * 60 * 60 * 1000);

    return ageDate.getFullYear() - 1970;
}

/**
 * 发证机关校验
 *
 * @param sCIDCert
 */
function devValidateCIDCert(sCIDCert) {
    // 发证机关规则(6-30个字符)
    var sLength = devGetLength(sCIDCert);
    if (sLength < 6) {
        return "请按照身份证填写";
    } else if (sLength > 30) {
        return "发证机关填写错误";
    } else {
        return "success";
    }
}

/**
 * 证件地址校验
 *
 * @param sCIDAddr
 */
function devValidateCIDAddr(sCIDAddr) {
    // 证件地址规则(10-150个字符)
    var sLength = 0;
    // 计算
    var tempStr = sCIDAddr.replace(/[^\x00-\xff]/g, '**').replace(/\s+/g, '*');
    sLength = tempStr.length / 2;
    //var sLength = devGetLength(sCIDAddr);
    if (sLength < 8) {
        return "证件地址错误，最少8个字";
    } else if (sLength > 150) {
        return "证件地址错误，最多150个字";
    } else {
        return "success";
    }
}

/**
 * 证件有效期限校验
 *
 * @param sCIDAddr
 */
function devValidateCIDAble(sCIDAble) {
    var sLength = devGetLength(sCIDAble);
    if (sLength <= 4) {
        return "日期格式错误";
    } else {
        return "success";
    }
}

/**
 * 联系地址校验：详细地址
 *
 * @param sAddress
 */
function devValidateAddress(sAddress) {
    // 联系地址规则
    //var sLength = devGetLength(sAddress);
    var sLengths = 0;
    // 计算
    var tempStr = sAddress.replace(/[^\x00-\xff]/g, '**').replace(/\s+/g, '*');
    sLength = tempStr.length / 2;
    if (sLength < 8) {
        return "请填写详细的联系地址，最少8个字";
    } else if (sLength > 40) {
        return "联系地址填写错误，最多40个字";
    } else {
        return "success";
    }
}

/**
 * 邮政编码校验
 *
 * @param sPostCode
 */
function devValidatePostCode(sPostCode) {
    // 邮政编码规则
    var regPostCode = /^\d{6}$/;
    if (!regPostCode.test(sPostCode)) {
        return "邮政编码填写错误";
    } else {
        return "success";
    }
}

/**
 * 邮箱校验
 *
 * @param sEmail
 */
function devValidateEmail(sEmail) {
    // 邮箱规则
    var regEmail = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
    if (!regEmail.test(sEmail)) {
        return "邮箱填写错误";
    } else {
        return "success";
    }
}

/**
 * 固定电话校验
 *
 * @param sTel
 */
function devValidateTel(sTel) {
    if (null != sTel && sTel != "") {
        // 固定电话规则
        var regTel = /^(0(10|2[1-3]|[3-9]\d{2}))?(-|\s)?[1-9]\d{6,7}$/;
        if (!regTel.test(sTel)) {
            return "固定电话填写错误";
        } else {
            return "success";
        }
    } else {
        return "success";
    }
}

/**
 * 电子邮件校验
 *
 * @param sEmail
 */
function devValidateEmail(sEmail) {
    // 电子邮件规则
    var regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    if (!(null == sEmail || sEmail == '' || regEmail.test(sEmail))) {
        return "电子邮件填写错误";
    } else {
        return "success";
    }
}

/**
 * 职业校验
 *
 * @param sJob
 */
function devValidateJob(sJob) {
    // 职业规则
    if (sJob == -1) {
        return "请选择职业";
    }
    return "success";
}

/**
 * 行业校验
 *
 * @param sIndustry
 */
function devValidateIndustry(sIndustry) {
    // 行业
    if (sIndustry == -1) {
        return "请选择行业";
    } else {
        return "success";
    }
}

/**
 * 反洗钱风险等级校验
 *
 * @param sArmrisklevel
 */
function devValidateArmrisklevel(sArmrisklevel) {
    // 反洗钱风险等级   M201503090005 20150422 wmy add
    if (sArmrisklevel < 0) {
        return "请选择反洗钱风险等级";
    } else {
        return "success";
    }
}

/**
 * 营业部校验
 *
 * @param sBranch
 */
function devValidateBranch(sBranch) {
    // 开户营业部
    if (sBranch >= 0) {
        return "success";
    } else {
        return "请选择开户营业部";
    }
}

/**
 * 学历校验
 *
 * @param sEdu
 */
function devValidateEdu(sEdu) {
    // 学历规则
    if (sEdu >= 1) {
        return "success";
    } else if (sEdu == -1) {
        return "请选择学历";
    } else {
        return "学历选择错误";
    }
}

/**
 * 年收入校验
 *
 * @param sYear
 */
function devValidateYear(sYear) {
    // 学历规则
    if (sYear >= 1) {
        return "success";
    } else if (sYear == -1) {
        return "请选择年收入";
    } else {
        return "年收入选择错误";
    }
}

/**
 * 民族校验
 *
 * @param sEdu
 */
function devValidateMinzu(sMinzu) {
    // 民族
    if (sMinzu >= 0) {
        return "success";
    } else if (sMinzu == -1) {
        return "请选择民族";
    } else {
        return "民族选择错误";
    }
}

/**
 * 计算字符串长度
 *
 * @param str
 * @return
 */
function devGetLength(str) {
    if (!str)
        return 0;
    // 计算
    var tempStr = str.replace(/[^\x00-\xff]/g, '**').replace(/\s+/g, '*');
    var len = Math.ceil(tempStr.length / 2);

    return len;
}

/**
 * 过滤特殊字符
 *
 * @param str
 * @returns
 */
function specialCharFilter(str) {
    // 过滤特殊字符，可包含符号'#','(',')','-','_'，其它符号及空格和换行符过滤
    var pattern = new RegExp(
        "[`~!@$%^&*=|{}':;',\\[\\].<>/\\\\?~<>«+＋－×＼《》！％@￥……&*（）——|{}【】‘；：”“'。，、？\\s]+",
        "g");
    var newStr = str.replace(pattern, '');
    return newStr;
}

/**
 * start M201506290191 2015-0629 wangmy
 * 将字符串中全角数字替换为半角数字
 *
 * @param str
 * @returns {String}
 */
function replaceSBCCaseNumber(str) {
    var pattern = new RegExp("０", "g");
    var newStr = str.replace(pattern, '0');

    pattern = new RegExp("１", "g");
    newStr = newStr.replace(pattern, '1');

    pattern = new RegExp("２", "g");
    newStr = newStr.replace(pattern, '2');

    pattern = new RegExp("３", "g");
    newStr = newStr.replace(pattern, '3');

    pattern = new RegExp("４", "g");
    newStr = newStr.replace(pattern, '4');

    pattern = new RegExp("５", "g");
    newStr = newStr.replace(pattern, '5');

    pattern = new RegExp("６", "g");
    newStr = newStr.replace(pattern, '6');

    pattern = new RegExp("７", "g");
    newStr = newStr.replace(pattern, '7');

    pattern = new RegExp("８", "g");
    newStr = newStr.replace(pattern, '8');

    pattern = new RegExp("９", "g");
    newStr = newStr.replace(pattern, '9');
    return newStr;
}

// end M201506290191 2015-0629 wangmy
/*******************************************************************************************************************
 * BASE64编码
 */
function base64_encode(sourc) {
    var str = CryptoJS.enc.Utf8.parse(sourc);
    var base64 = CryptoJS.enc.Base64.stringify(str);
    return base64;
}

/**
 * 验证密码
 *
 * @param {Object}
 *            field
 * @return {TypeName}
 */
function devValidatePwd(pwd) {

    if (idevValidatePwdCallback.hasOwnProperty(securityAlias)) {
        return idevValidatePwdCallback[securityAlias](pwd);
    } else {
        if (/^\d{6}$/.test(pwd)) {

            var pass123456 = "01234567890";
            var pass654321 = "9876543210";
            if (pass123456.indexOf(pwd) >= 0) {
                return "密码不能为连续的数字，如123456";
            }

            if (pass654321.indexOf(pwd) >= 0) {
                return "密码不能为连续的数字，如654321";
            }

            var sub5_1 = pwd.substring(0, 4);
            var n6 = parseInt(sub5_1, 10);

            var sub5_2 = pwd.substring(1, 5);
            var n7 = parseInt(sub5_2, 10);

            var sub5_3 = pwd.substring(2, 6);
            var n8 = parseInt(sub5_3, 10);
            if (n6 % 1111 == 0 || n7 % 1111 == 0 || n8 % 1111 == 0) {
                return "相同数字不得连续出现4次，如11112";
            }

            var sub3 = pwd.substring(0, 3);
            var _sub3 = pwd.replace(new RegExp(sub3, "gm"), "");
            if (_sub3 == '' || _sub3.length == 0) {
                return "密码不能过于简单，如123123";
            }

            var sub2 = pwd.substring(0, 2);
            var _sub2 = pwd.replace(new RegExp(sub2, "gm"), "");
            if (_sub2 == '' || _sub2.length == 0) {
                return "密码不能过于简单，如121212";
            }

            var sub2_1 = pwd.substring(0, 2);
            var sub2_2 = pwd.substring(2, 4);
            var sub2_3 = pwd.substring(4, 6);
            var n1 = parseInt(sub2_1, 10);
            var n2 = parseInt(sub2_2, 10);
            var n3 = parseInt(sub2_3, 10);

            if (n1 % 11 == 0 && n2 % 11 == 0 && n3 % 11 == 0) {
                return "密码不能过于简单，如112233";
            }

            var sub3_1 = pwd.substring(0, 3);
            var sub3_2 = pwd.substring(3, 6);
            var n4 = parseInt(sub3_1, 10);
            var n5 = parseInt(sub3_2, 10);

            if (n4 % 111 == 0 && n5 % 111 == 0) {
                return "密码不能过于简单，如111222";
            }

            return "success";
        } else {
            return "密码为6位数字";
        }
    }
}

/**
 * 数字校验
 *
 * @param sMobile
 */
function devValidateDigit(s) {
    var patrn = /^\d*$/;
    if (patrn.test(s)) {
        return "success";
    } else {
        return "必须为数字";
    }
    return false;
}

/**
 * 员工编号校验
 *
 * @param brokercode
 */
function devValidateBrokerCode(s) {
    var patrn = /^\w*$/;
    if (patrn.test(s)) {
        if (s.length > 20) {
            return "开户推荐人员工号不能超过二十位";
        } else {
            return "success";

        }
    } else {
        return "只能由数字、字符或下划线字符组成";
    }
    return false;
}