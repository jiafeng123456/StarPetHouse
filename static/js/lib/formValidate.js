/**
 * 表单校验，按valid属性中的顺序校验,NotBlank优先校验。
 * 依赖cairh-dev-validate.js、cairh-dev-utils.js
 * @param formName 表单form的id
 * @returns {Boolean} 校验成功，返回true，否则返回false
 */
function formValidate(formName) {
    var validate = true;
    $("#" + formName + " :input").each(function () {
        var thisArg = this;
        var element = $(this).val().trim();
        var valid = $(this).attr("valid");

        if (valid == undefined || valid == null || valid.trim() == "") {
            return;
        }

        if ((valid.indexOf("NotBlank") != "-1") && element == "") {
            devActAfterShowDialog($(this).attr("placeholder"), function () {
                thisArg.focus();
            });
            validate = false;
            return false;
        }

        var formArray = valid.split(",");
        formArray = formArray.filter(formArrayFilter);

        for (var i = 0; i < formArray.length; i++) {
            var executeFunc = formValidateMap[formArray[i]];
            if (executeFunc == undefined) {
                console.log("No corresponding function : " + formArray[i]);
                continue;
            }

            var result = executeFunc(element, this);
            if (result != "success") {
                var errorTip = $(this).attr("errorTip");
                if ((errorTip != undefined) && (errorTip.trim().length > 0)) {
                    devActAfterShowDialog(errorTip, function () {
                        thisArg.focus();
                    });
                } else {
                    devActAfterShowDialog(result, function () {
                        thisArg.focus();
                    });
                }
                validate = false;
                return false;
            }
        }
    });
    return validate;
}

/**
 *  Digital : "数字"
 *    Mobile : "手机号码"
 *    ValidateCode : "验证码"
 *    Name : "姓名"
 *    CID : "身份证号码"
 *    CIDaddr : "身份证地址"
 *    Address : "地址"
 *    PostCode : "邮政编码"
 *    Email : "邮箱"
 *    Tel : "固定电话"
 *    Pwd : "密码"
 *    FixedLength : "固定长度"
 *    MinLength : "最小长度"
 */
var formValidateMap = {
    Digital: devValidateDigit,
    Mobile: devValidateMobile,
    ValidateCode: devValidateCode,
    Name: devValidateName,
    CID: devValidateCID,
    CIDaddr: devValidateCIDAddr,
    Address: devValidateAddress,
    PostCode: devValidatePostCode,
    Email: devValidateEmail,
    Tel: devValidateTel,
    Pwd: devValidatePwd,
    FixedLength: limitFixedLength,
    MinLength: limitMinLength
};


function formArrayFilter(item, index, array) {
    return (item != "NotBlank");
}


/**
 * 检查输入长度为指定长度，maxlength属性是必须的
 * @param input
 * @param thisArg
 * @returns {String}
 */
function limitFixedLength(input, thisArg) {
    var maxlength = $(thisArg).attr("maxlength");
    if (input.trim().length != maxlength) {
        return "指定长度为" + maxlength;
    }
    return "success";
}


/**
 * 检查输入大于或等于最小长度，最小长度的限制定义在minlength属性中
 * @param input
 * @param thisArg
 * @returns {String}
 */
function limitMinLength(input, thisArg) {
    var minlength = $(thisArg).attr("minlength");
    if (input.trim().length < minlength) {
        return "最小长度为" + minlength;
    }
    return "success";
}














