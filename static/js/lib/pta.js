﻿
//  密钥用法选项
var KEY_USAGE_UNDEFINED		= 0x00;
var KEY_USAGE_ALL			= 0x01;
var KEY_USAGE_CRL_SIGN		= 0x02;
var KEY_USAGE_CERT_SIGN		= 0x04;
var KEY_USAGE_KEY_AGREEMENT	= 0x08;
var KEY_USAGE_DATA_ENCIPHERMENT	= 0x10;
var KEY_USAGE_KEY_ENCIPHERMENT	= 0x20;
var KEY_USAGE_NON_REPUDIATION	= 0x40;
var KEY_USAGE_DIGITAL_SIGNATURE	= 0x80;

//  签名验签选项
var INPUT_BASE64		= 0x01; //SignMessage和VerifySignature输入参数
var INPUT_HEX			= 0x02; //SignMessage和VerifySignature输入参数
var OUTPUT_BASE64		= 0x04; //以BASE64编码pkcs7签名值
var OUTPUT_HEX			= 0x08; //以16进制字符串编码pkcs7签名值
var	INNER_CONTENT		= 0x10; //SignMessage...signSourceData参数：是否包含原文
var	PLAINTEXT_UTF8		= 0x20; //原文UTF-8编码(SignMessage & VerifySignature函数)，缺省使用GB2312编码原文
var	MIN_CERTSTORE		= 0x40; //最小化证书链(仅包含签名证书)
var	HTML_SHOW			= 0x80; //接受HTML数据并渲染
var	MSG_BASE64			= 0x04; //VerifySignature输入参数
var MSG_HEX				= 0x08; //VerifySignature输入参数
var MSG_IMAGE			= 0x100; //VerifySignature输入参数

//  证书导入导出选项
var MARK_CERT_TO_UNEXPORTABLE = 0x02;//标记证书为不可导出
var DELETE_CERT = 0x04;//删除该证书

//  全局变量
var iTrusPTA;
var ienroll;

var PLUGIN_ITRUS_PTA = true;

$(function () {
	var shtml = "";
	var u = window.navigator.userAgent.toLocaleLowerCase().toString();//为了判断IE11
	if(B.ie) { 
		
		if (!document.getElementById("iTrusPTA")) {
			shtml += '<object width="0" height="0" style="display:none;" id="iTrusPTA" type="application/iTrusPTA.iTrusPTA" classid="clsid:F1F0506B-E2DC-4910-9CFC-4D7B18FEA5F9"></object>';
		}
		if (!document.getElementById("pta_ienroll")) {
			shtml += '<object width="0" height="0" style="display:none;" id="pta_ienroll" type="application/iTrusCertEnroll.CertEnroll" classid="clsid:DD2257CE-4FEE-455A-AD8B-860BEEE25ED6"></object>';
		}
		
		
	}
	else if(u.indexOf("rv:11")>=0){//判断IE11
		
		if (!document.getElementById("iTrusPTA")) {
			shtml += '<object width="0" height="0" style="display:none;" id="iTrusPTA" type="application/iTrusPTA.iTrusPTA" classid="clsid:F1F0506B-E2DC-4910-9CFC-4D7B18FEA5F9"></object>';
		}
		if (!document.getElementById("pta_ienroll")) {
			shtml += '<object width="0" height="0" style="display:none;" id="pta_ienroll" type="application/iTrusCertEnroll.CertEnroll" classid="clsid:DD2257CE-4FEE-455A-AD8B-860BEEE25ED6"></object>';
		}
	
	}
	else {
		if (!document.getElementById("iTrusPTA")) {
			shtml += '<embed id="iTrusPTA" type="application/iTrusPTA.iTrusPTA.Version.1" width="0" height="0" />';
		}
		if (!document.getElementById("pta_ienroll")) {
			shtml += '<embed id="pta_ienroll" type="application/iTrusCertEnroll.CertEnroll.Version.1" width="0" height="0" />';
		}
	}
	if (shtml != '') {
		var oSpan = document.createElement("span");
		oSpan.innerHTML = shtml;
		document.body.appendChild(oSpan);
	}
	iTrusPTA = document.getElementById("iTrusPTA");
	ienroll = document.getElementById("pta_ienroll");
});


/*
function encrypt(msg){
	alert(msg);
	var CertFilter = iTrusPTA.Filter;
	CertFilter.Clear();
	CertFilter.Issuer = ftIssuer.value;
	CertFilter.SerialNumber = ftSerial.value;
	CertFilter.Subject = ftSubject.value;
	var certs = iTrusPTA.MyCertificates;
	return certs.EncryptMessage(msg,OUTPUT_BASE64);
}

function encryptFile(srcPath,desPath){
	var CertFilter = iTrusPTA.Filter;
	CertFilter.Clear();
	CertFilter.Issuer = ftIssuer.value;
	CertFilter.SerialNumber = ftSerial.value;
	CertFilter.Subject = ftSubject.value;
	var certs = iTrusPTA.MyCertificates;
	return certs.EncryptFileEx(srcPath,desPath,OUTPUT_BASE64);
}
*/

function decrypt(msg){
	try{
		alert(iTrusPTA.DecryptMessage(msg,INPUT_BASE64));
		}catch(e){
		alert( "解密失败\n错误代码：0x" + (e.number>0?e.number: 0x100000000+e.number).toString(16));
	}
	
}

function decryptFile(srcPath,desPath){
	iTrusPTA.DecryptFileEx(srcPath,desPath,INPUT_BASE64);
}

/**获取证书信息
 *@param cert证书对象
 *@param field要获取的证书属性字段
 *@return 相应属性的值，如果输入了不支持属性，返回null
 */
function getCertField(cert,field){
	var value =null;
	if(field=="subject"){
		value=cert.Subject;
	}else if(field=="issuer"){
		value=cert.Issuer;
	}else if(field=="serialNumber"){
		value=cert.SerialNumber;
	}else if(field=="validFrom"){
		value=new Date(eval(cert.ValidFrom));
	}else if(field=="validTo"){
		value=new Date(eval(cert.ValidTo));
	}else if(field=="keyContainer"){
		value=cert.KeyContainer;
	}else if(field=="commonName"){
		value=cert.CommonName;
	}else if(field=="keyUsage"){
		var KeyUsage=cert.KeyUsage;
		usage="";
		if (KeyUsage == 0) usage = " UNDEFINED";
		if (KeyUsage & KEY_USAGE_CRL_SIGN )			usage += " CRL_SIGN";
		if (KeyUsage & KEY_USAGE_CERT_SIGN)			usage += " CERT_SIGN";
		if (KeyUsage & KEY_USAGE_KEY_AGREEMENT)		usage += " KEY_AGREEMENT";
		if (KeyUsage & KEY_USAGE_DATA_ENCIPHERMENT) usage += " DATA_ENCIPHERMENT";
		if (KeyUsage & KEY_USAGE_KEY_ENCIPHERMENT)	usage += " KEY_ENCIPHERMENT";
		if (KeyUsage & KEY_USAGE_NON_REPUDIATION)	usage += " NON_REPUDIATION";
		if (KeyUsage & KEY_USAGE_DIGITAL_SIGNATURE)	usage += " DIGITAL_SIGNATURE";
		value=usage.substr(1);
	}else if(field=="csp"){
		value=cert.CSP;
	}
	return value;
}

/**
 * 获取mac地址 (only for ie) <p>
 * //TODO 多浏览器支持
 * @returns
 */
function getClientMacInfo(){
    var locator =new ActiveXObject ("WbemScripting.SWbemLocator");
    var service = locator.ConnectServer(".");
    var properties = service.ExecQuery("Select * from Win32_NetworkAdapterConfiguration Where IPEnabled =True");
    var e =new Enumerator (properties);
    var p = e.item();
    var mac = p.MACAddress;
    return mac;
}

/**签名
 * @param plainType 明文的类型，可以为 base64,hex,image,file,
 * @param signedType 输出的签名值的类型，可以为base64,hex
 * @param detached 当为false时，签名数据将会含有原文，当为true时，签名数据没有原文
 * @param plainData 代签名数据，当plainType为image时，该项为图片的url;
 * @param cert 签名使用的私钥对应的证书
 * @return 签名后的数据，签名失败返回null
 */
function SignMessage(plainType,signedType,detached,plainData,cert){
	var signopt=0;
	var signedData = null;
	//设置原文的类型标识
	if(plainType=="base64"){
		signopt=INPUT_BASE64;
	}else if(plainType=="hex"){
		signopt=INPUT_HEX;
	}
//	else if(plainType=="image"){
//		signopt=MSG_IMAGE;
//	}
	//设置签名值类型的标识
	if(signedType == "hex"){
		signopt |= OUTPUT_HEX;
	}else if (signedType=="base64"){		
		signopt |= OUTPUT_BASE64;
	}
	//设置签名值里是否含有原文
	if(!detached){
		signopt|=INNER_CONTENT;
	}
	signopt|=MIN_CERTSTORE;//在签名中，最小化证书列，可以减少签名值长度
//	signopt|=HTML_SHOW;		//弹出的确认框，采用IE引擎渲染样式
//	signopt|=PLAINTEXT_UTF8;//如果签名值是UTF-8编码，需要加上此行，默认UTF-8;
//	signopt|=512;
	try{
		if(plainType=="image") {
			signedData =cert.SignImage(plainData,signopt);
		}else if(plainType=="file"){
			//TODO:
		}else if (plainType=="logon"){
			signedData = cert.SignLogonData(plainData,signopt);
		}else{
			signedData = cert.SignMessageEx(plainData,signopt);
		}
	}catch(e){
		if (e.number == -2146951165) {//点击取消按钮
			signedData = 'btn_cancel';
		}else{
			signedData = 'sign_error';
		}
		//alert(e.message+"["+e.number+"]");
	}
	return signedData;
}

/**验证签名
 * @param msgType 明文的类型，可以为 base64,hex,image,file,
 * @param signedType 输出的签名值的类型，可以为base64,hex
 * @param detached 当为false时，签名数据里含有原文，当为true时，签名数据里没有原文
 * @param plainData 代签名数据，当plainType为image时，该项为图片的url;
 * @param signedData 签名后的数据
 * @return 验签结果，验签成功返回对应证书，验签失败，返回null;
 */
function VerifySignature(msgType,signedType,detached,plainData,signedData){
	var signopt=0;
	//设置原文的类型标识
	if(msgType=="base64"){
		signopt=MSG_BASE64;
	}else if(msgType=="hex"){
		signopt=MSG_HEX;
	}else if(msgType=="image"){
		signopt=MSG_IMAGE;
	}
	//设置签名值类型的标识
	if(signedType == "hex"){
		signopt |= INPUT_HEX;
	}else if (signedType=="base64"){		
		signopt |= INPUT_BASE64;
	}
	//设置签名值里是否含有原文
	if(!detached){
		signopt|=INNER_CONTENT;
	}
	var Signer = null;
	try{
		Signer=iTrusPTA.VerifySignature(plainData,signedData,signopt);
	}catch(e){
		alert( "签名验证失败。\n错误代码：0x" + (e.number>0?e.number: 0x100000000+e.number).toString(16));
	}
	return Signer;
}

/**删除证书
 * @param cert 要删除的证书
 * @return void;
 */
function removeCert(cert){
	try{
		cert.Remove();
		return true;
	}catch(e){
		//alert("error code:["+iTrusPTA.ErrorCode+"]");
		return false;
	}
}

/**导入证书
 * @param certPath 待导入的证书路径
 * @param password 待导入证书的密码
 * @param option 0:默认，2:导入后证书不能导出
 * @return void
 */
function importCert(certPath,password,option){	
	try{
		iTrusPTA.ImportPKCS12(certPath,password,option);
		return true;
	}catch(e){
		//alert("error code:["+iTrusPTA.ErrorCode+"]");
		return false;
	}
}

/**导出证书
 * @param certPath 导出的证书路径
 * @param password 导出证书的密码
 * @param option 0:默认，2:备份后当前证书标记为不可导出，4:备份后删除当前证书
 */
function exportCert(cert, option, password){
	try{
		var filePath = iTrusPTA.GetExportPath(cert.CommonName);
		var iRet = cert.ExportPKCS12(password,option,filePath);
		return true;
	}catch(e){
		/*
		if ((e.number == -2147483135) // cancel
		) {
			// User canceled
		} else if(e.number == -2146893813) {
			alert("证书“" + cert.CommonName + "”的安全策略限制导出私钥。");
		} else
			alert("PTA模块发生错误\r\n错误号: " + e.number + "\r\n错误描述: " + e.description);
		*/
		return false;
	}
}

/**
 * 生成请求
 * @param cryptFlag
 *		0表示私钥既不可以导出，又不要求强私钥保护，默认值
 *		1表示私钥可导出
 *		2表示强私钥保护
 *		3(1|2)表示私钥既可以导出，又要求强私钥保护
 *		0x00008000    // 强私钥保护,用户必须设置密码
 *		(0x00008000 | 0x2)	表示既需要强私钥保护，又表示密钥可导出
 * @returns
 */
function createZDCSR(){
	var keyflags = 0;
	var cryptFlag = 0x00008000|3; //强私钥保护
	
	keyflags = keyflags | cryptFlag;
	ienroll.Reset();
	ienroll.DeleteRequestCert = true;
	ienroll.ProviderType = 1;
	ienroll.ProviderName = "Microsoft Enhanced Cryptographic Provider v1.0";//"Microsoft Base Cryptographic Provider v1.0";			
	ienroll.HashAlgorithm = "MD5";
	ienroll.KeySpec = 1;		
	ienroll.GenKeyFlags = 0x08000000 | keyflags; //2048bits
	var p10ret = "";
	try {
		p10ret = ienroll.createPKCS10("CN=csdcca", "1.3.6.1.5.5.7.3.2");
	} catch(e) {	
		//alert(e.number);
		if (e.number == -2146955243) {// 点取消时返回
			p10ret='';	
		} else {// 异常时返回
			p10ret='error';
		}
	}
	return p10ret;
}

/**
 * 生成请求(不需要密码)
 * @param cryptFlag
 *		0表示私钥既不可以导出，又不要求强私钥保护，默认值
 *		1表示私钥可导出
 *		2表示强私钥保护
 *		3(1|2)表示私钥既可以导出，又要求强私钥保护
 *		0x00008000    // 强私钥保护,用户必须设置密码
 *		(0x00008000 | 0x2)	表示既需要强私钥保护，又表示密钥可导出
 * @returns
 */
function createTWCSR(){
	var keyflags = 0;
	var cryptFlag = 0; //强私钥保护
	
	keyflags = keyflags | cryptFlag;
	ienroll.Reset();
	ienroll.DeleteRequestCert = true;
	ienroll.ProviderType = 1;
	ienroll.ProviderName = "Microsoft Enhanced Cryptographic Provider v1.0";//"Microsoft Base Cryptographic Provider v1.0";			
	ienroll.HashAlgorithm = "MD5";
	ienroll.KeySpec = 1;		
	ienroll.GenKeyFlags = 0x08000000 | keyflags; //2048bits
	var p10ret = "";
	try {
		p10ret = ienroll.createPKCS10("CN=csdcca", "1.3.6.1.5.5.7.3.2");
	} catch(e) {	
		//alert(e.number);
		if (e.number == -2146955243) {// 点取消时返回
			p10ret='';	
		} else {// 异常时返回
			p10ret='error';
		}
	}
	return p10ret;
}

/**
 * 生成请求(不需要密码)
 * @param cryptFlag
 *		0表示私钥既不可以导出，又不要求强私钥保护，默认值
 *		1表示私钥可导出
 *		2表示强私钥保护
 *		3(1|2)表示私钥既可以导出，又要求强私钥保护
 *		0x00008000    // 强私钥保护,用户必须设置密码
 *		(0x00008000 | 0x2)	表示既需要强私钥保护，又表示密钥可导出
 * @returns
 */
function createHNCSR(){
    var keyflags = 0;
    var cryptFlag = 0; //强私钥保护
    
    keyflags = keyflags | cryptFlag;
    ienroll.Reset();
    ienroll.DeleteRequestCert = true;
    ienroll.ProviderType = 1;
    ienroll.ProviderName = "Microsoft Enhanced Cryptographic Provider v1.0";//"Microsoft Base Cryptographic Provider v1.0";			
    ienroll.HashAlgorithm = "SHA1";
    ienroll.KeySpec = 1;		
    ienroll.GenKeyFlags = 0x04000000 | keyflags; //1024bits
    var p10ret = "";
    try {
        p10ret = ienroll.createPKCS10("CN=csdcca", "1.3.6.1.5.5.7.3.2");
    } catch(e) {	
        //alert(e.number);
        if (e.number == -2146955243) {// 点取消时返回
            p10ret='';	
        } else {// 异常时返回
            p10ret='error';
        }
    }
    return p10ret;
}

/**
 * installCert 安装CA颁发下来的证书
 * @param certChain(mandatory) 包含用户证书及证书链的Base64格式P7字符串 <p>
 * (not include "-----BEGIN CERTIFICATE-----" and "-----END CERTIFICATE-----")
 */
function installCert(certChain) {

	try {
        ienroll.Reset();
		ienroll.DeleteRequestCert = false;
		ienroll.WriteCertToCSP = true;
		ienroll.acceptPKCS7(certChain);
		return true;
	} catch(e) {
		if(-2147023673 == e.number) {
			alert("您取消了我们为您颁发的数字证书安装，证书安装失败！\n在您还未离开本页面前，您还可以点击“安装数字证书”按钮安装。");
			return false;
		} else if(-2146885628 == e.number) {
			alert("您的证书已经成功安装过了！");
			return false;
		} else {
			alert("安装证书发生错误！\n错误号: " + e.number + "\n错误描述: " + e.description);
			return false;
		}
	}
}

//让用户选择导出的路径,并返回选择的路径
function exportPath(){
	var path = ienroll.GetExportPath("");
	return path;
}

//让用户选择导入的路径，并返回选择的路径
function importPath(){
	var path = ienroll.GetImportPath("");
	return path;
}

//产生用户登录时随机数
function getLogonData(){
	var logonData="LOGONDATA:"+Date()+"|"+Math.random().toString().substr(2);
	return logonData;
}

/**
 * 过滤证书
 * @param dn (C=X, O=X, OU=X, CN=X)
 * @param serial
 * @returns {Array}
 */
function findCerts(dn, serial) {
	if (dn != '' && dn.indexOf('CN=') == 0) { // like:CN=C@1@1000018881,OU=Customers01,O=CSDC Test,C=CN
		var vs = dn.split(',');
		if (vs.length == 4) {
			dn = vs[3] + ", " + vs[2] + ", " + vs[1] + ", " + vs[0];
		} else {
			alert('无效证书DN');
			return;
		}
		
	}
	
	return filterCerts("",dn,serial,0,1,false);
}

/**
 * 通过证书序列号判断是否已经安装此证书
 * @param serial
 * @returns {Boolean}
 */
function checkCertExist(serial) {
	var certs = findCerts("", serial);	
	return (certs && certs.length > 0) ? true : false;
}

/**
 * 通过证书序列号判获取证书
 * @param sn 多个sn时，可以传递数组或以半角逗号隔开的字符串
 * @returns 最新的一个证书
 */
function findCertBySn(sn) {
	
	if(sn == null || sn == '') {
		return null;
	}
	
	var snArray = null;
	if(typeof sn == 'object' && sn instanceof Array) {
		snArray = sn;
	}
	else if(typeof sn == 'string'){
		snArray = sn.split(',');
	}
	
	var cert = null;
	for(var i=0; i<snArray.length; i++){
		var serial = snArray[i];
		
		if(serial) {
			cert = findCerts("", serial);
			if(cert != null && cert.length != 0) {
				break;
			}
		}
	}
	
	return cert[0];
}

/**
 * 签名
 * @param src
 * @param dn
 * @returns
 */
function signSourceData(src, sn) {
	var cert = findCerts("", sn);
	if (!cert || cert.length == 0) {
		return 'no_cert';
	}
	return SignMessage("txt","base64",false,src,cert[0]);
}


/**
 * filterCerts 根据所设置条件过滤证书
 * @param arrayIssuerDN(optional) Array() or string，缺省为""，证书的颁发者字符串和字符串数组，支持多个CA时使用字符串数组
 * @param arraySerialNumber(optional)缺省为""，证书序列号（微软格式）
 * @param dateFlag(optional) 缺省为0，0表示所有证书，1表示处于有效期内的证书，2表示待更新证书，3表示未生效或已过期证书
 * @param keyUsage(option) 缺省为1;具体可以为密钥用法的各个值及相应组合
 * @return Array(), PTALib.Certificate
 */
function filterCerts(arrayIssuerDN, subject, arraySerialNumber, dateFlag, keyUsage, weak) {
	var m_certs = new Array();
	var i = 0;var m=0;
	if (typeof(arrayIssuerDN) == "undefined") {
		arrayIssuerDN = new Array("");
	} else if (typeof(arrayIssuerDN) == "string") {
		arrayIssuerDN = new Array(arrayIssuerDN);
	}
	if (typeof(arraySerialNumber) == "undefined"){
		arraySerialNumber = new Array("");
	} else if (typeof(arraySerialNumber) == "string") {
		arraySerialNumber = new Array(arraySerialNumber);
	}
	
	if(typeof(subject) == "undefined")
		subject = "";
	for (i = 0; i < arrayIssuerDN.length; i++) {
		for(m = 0; m < arraySerialNumber.length; m++){
			var CertFilter = iTrusPTA.Filter;
			CertFilter.Clear();
//			alert(arrayIssuerDN[i].length);
			CertFilter.Issuer = arrayIssuerDN[i];
//			alert(arraySerialNumber[m].length);
			CertFilter.SerialNumber = arraySerialNumber[m];
//			alert(subject.length);
			CertFilter.Subject = subject;
//			alert("issuer:"+arrayIssuerDN[i]+":"+CertFilter.Issuer);
//			alert("serial:"+arraySerialNumber[m]+":"+CertFilter.SerialNumber);
			var t_Certs = iTrusPTA.MyCertificates; // 临时变量
			var now = new Date();
			var t_count = parseInt(t_Certs.Count);
			if ( t_count> 0) { // 找到了证书
				for (var j = 1; j <= t_count; j++) {
					if(!containUsage(t_Certs.Item(j),keyUsage,weak))
						continue;
					var validFrom = eval(t_Certs.Item(j).ValidFrom);
					var validTo = eval(t_Certs.Item(j).ValidTo);
					switch (dateFlag) {
						case 0 :// 所有证书
							m_certs.push(t_Certs.Item(j));
							break;
						case 1 :// 处于有效期内的证书
							if (validFrom < now && now < validTo)
								m_certs.push(t_Certs.Item(j));
							break;
						case 2 :// 待更新证书
							if (JSDateAdd(validTo, -30) < now && now < validTo)
								m_certs.push(t_Certs.Item(j));
							break;
						case 3 :// 未生效或已过期证书
							if (now < validFrom || validTo < now)
								m_certs.push(t_Certs.Item(j));
							break;
						default :// 缺省当作所有证书处理
							m_certs.push(t_Certs.Item(j));
							break;
					}
				}
			}
		}
	}
	return m_certs;
}




/**
 * 根据sn检查证书是否安装
 * @param {Object} sn
 * @return {TypeName} 
 */
function devDetectCert(sn){
	var cert = findCerts("", sn);
	if (!cert|| cert.length == 0) {
		return false;
	}
	return true;
}

/**
 * 根据sn列表检查证书是否安装
 * @param {Object} certSnArray
 * @return {TypeName} 
 */
function devDetectCertArray(snArray){
	var certSnArray = snArray.split(",");
	if(certSnArray.length > 0){
		for(var i = 0; i < certSnArray.length; i++){
			var certSn = certSnArray[i];
			if(certSn != "" && devDetectCert(certSn)){
				return certSn;
			}
		}
	}
	return "";
}


/**判断该证书是否包含给出的密钥用法
 * @param cert  要判断的证书；
 * @param usage 要判断的密钥用法；
 * @param weak  判断的模式，当weak为true时，只要证书的
 *			密钥用法包含所给出用法的任意一个就返回true。否则需要包含所有的给出的用法,才返回true
 *
*/
function containUsage(cert,usage,weak){
	var keyUsage=cert.KeyUsage;
	var flag = true;
	if(weak){
		if((keyUsage&usage)==0){
			flag=false;
		}
	}else{
		if (usage & KEY_USAGE_CRL_SIGN)
			flag= flag &&(keyUsage & KEY_USAGE_CRL_SIGN);
		if (usage & KEY_USAGE_CERT_SIGN)
			flag= flag &&(keyUsage & KEY_USAGE_CERT_SIGN);
		if (usage & KEY_USAGE_KEY_AGREEMENT)
			flag= flag &&(keyUsage & KEY_USAGE_KEY_AGREEMENT);
		if (usage & KEY_USAGE_DATA_ENCIPHERMENT)
			flag= flag &&(keyUsage & KEY_USAGE_DATA_ENCIPHERMENT);
		if (usage & KEY_USAGE_KEY_ENCIPHERMENT)
			flag= flag &&(keyUsage & KEY_USAGE_KEY_ENCIPHERMENT);
		if (usage & KEY_USAGE_NON_REPUDIATION)
			flag= flag &&(keyUsage & KEY_USAGE_NON_REPUDIATION);
		if (usage & KEY_USAGE_NON_REPUDIATION)
			flag= flag &&(keyUsage & KEY_USAGE_NON_REPUDIATION);
	}
	return flag;
}

/**
 * JSDateAdd Javascript 计算给定日期+天数
 * @param theDate:给定日期，Date类型
 * @param days:整型
 * @return 计算结果，Date类型
 */
function JSDateAdd(theDate, days) {
	var dateValue = theDate.valueOf();
	dateValue += days * 1000 * 60 * 60 * 24;
	var newDate = new Date(dateValue);
	return newDate;
}

/**
 * JSDateDiffByDays Javascript 计算两个日期之间的间隔天数
 * @param date1:给定日期1，Date类型
 * @param date2:给定日期2，Date类型
 * @return 天数，整型
 */
function JSDateDiffByDays(date1, date2) {
	var mill = date1.valueOf() - date2.valueOf();
	var millStr = new String(mill / 1000 / 60 / 60 / 24);
	return parseInt(millStr);
}

//从证书数组里获取，主题中的name为value的证书
function chooseCertFromArray(certs,name,value){
	var cert = null;
	var i,count = certs.length;
	for(i=0;i<count;i++){
		cert = certs[i];
		var names = new Names(getCertField(certs[i],"subject"));
		if(value==names.getItem(name))
			return certs[i];
	}
	return null;
}

//根据颁发者和序列号过滤证书，如果存在，返回第一张证书，否则返回null
function selectSingleCert(issuer,serial) {
	var filter=iTrusPTA.Filter;
	filter.Clear();
	if(issuer.length>0)
		filter.Issuer=issuer;
	if(serial.length>0)
		filter.SerialNumber=serial;
	if(iTrusPTA.MyCertificates.Count==0){
		alert("未找到指定的数字证书");
		return null;
	}

	return iTrusPTA.MyCertificates.Item(1);
}

//将数据转化为十六进制格式
function toHex(number)
{
	number = number >>> 0;
	return number.toString(16);
}
//Base64Encode
function Base64Encode(str) {
	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	var encoded = [];
	var c = 0;
	while (c < str.length) {
		var b0 = str.charCodeAt(c++);
		var b1 = str.charCodeAt(c++);
		var b2 = str.charCodeAt(c++);
		var buf = (b0 << 16) + ((b1 || 0) << 8) + (b2 || 0);
		var i0 = (buf & (63 << 18)) >> 18;
		var i1 = (buf & (63 << 12)) >> 12;
		var i2 = isNaN(b1) ? 64 : (buf & (63 << 6)) >> 6;
		var i3 = isNaN(b2) ? 64 : (buf & 63);
		encoded[encoded.length] = chars.charAt(i0);
		encoded[encoded.length] = chars.charAt(i1);
		encoded[encoded.length] = chars.charAt(i2);
		encoded[encoded.length] = chars.charAt(i3);
	}
	return encoded.join('');
}
//Base64Decode
function Base64Decode(str) {
	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	var invalid = {
		strlen: (str.length % 4 != 0),
		chars:  new RegExp('[^' + chars + ']').test(str),
		equals: (/=/.test(str) && (/=[^=]/.test(str) || /={3}/.test(str)))
	};
	if (invalid.strlen || invalid.chars || invalid.equals)
		alert('Invalid base64 data');
	var decoded = [];
	var c = 0;
	while (c < str.length) {
		var i0 = chars.indexOf(str.charAt(c++));
		var i1 = chars.indexOf(str.charAt(c++));
		var i2 = chars.indexOf(str.charAt(c++));
		var i3 = chars.indexOf(str.charAt(c++));
		var buf = (i0 << 18) + (i1 << 12) + ((i2 & 63) << 6) + (i3 & 63);
		var b0 = (buf & (255 << 16)) >> 16;
		var b1 = (i2 == 64) ? -1 : (buf & (255 << 8)) >> 8;
		var b2 = (i3 == 64) ? -1 : (buf & 255);
		decoded[decoded.length] = String.fromCharCode(b0);
		if (b1 >= 0) decoded[decoded.length] = String.fromCharCode(b1);
		if (b2 >= 0) decoded[decoded.length] = String.fromCharCode(b2);
	}
	return decoded.join('');
}

// ------------------------- 天威自建CA相关 start-------------------
/**
 * signCSR 更新天威自建CA证书时需要调用，对更新证书的CSR
 * @param objOldCert(mandatory) 要更新的证书对象（PTALib.Certificate）
 * @param csr(mandatory) 证书签名请求
 */
function signCSR(objOldCert, csr) {
	try {
		var signedData = "";
		var ptaVersion = iTrusPTA.Version;
		if(ptaVersion == null){ 
			//PTA Version = 1.0.0.3
			signedData = objOldCert.SignMessage("LOGONDATA:" + csr, OUTPUT_BASE64);
		} else {
			//PTA Version > 2
			signedData = objOldCert.SignLogonData("LOGONDATA:" + csr, OUTPUT_BASE64);
		}
		return signedData;
	} catch (e) {
		if(-2147483135 == e.number) {
			//用户取消签名
			return "";
		}	else if(e.number == -2146885621) {
			alert("您不拥有证书“" + objOldCert.CommonName + "”的私钥，签名失败。");
			return "";
		} else {
			alert("PTA签名时发生错误\n错误号: " + e.number + "\n错误描述: " + e.description);
			return "";
		}
	}
}

/**
 * genRenewCSR 更新证书（用在更新天威自建CA证书），生成更新证书的证书签名请求
 * @param objProviderList(mandatory) 加密服务提供者列表的<select>对象
 * @param cryptFlag(mandatory)
 *		0x0表示私钥既不可以导出，又不要求强私钥保护
 *		0x1表示私钥可导出，默认值
 *		0x2表示强私钥保护
 *		0x3(0x1|0x2)表示私钥既可以导出，又要求强私钥保护
 * @param objOldCert(mandatory) 要更新的证书对象（PTALib.Certificate）
 */
function genRenewCSR(cryptFlag, objOldCert) {
	
	var oldCertCSP = objOldCert.CSP; //旧证书CSP
	var providerName, providerType;
	
	/*
	if(typeof(objProviderList) == "string") {
		providerName = objProviderList;
		providerType = 1;
	} else if(typeof(objProviderList) == "object") {
		providerName = objProviderList.item(objProviderList.selectedIndex).text;
		providerType = objProviderList.item(objProviderList.selectedIndex).value;
	} else {
		alert("Paramter [objProviderList] is not correct.");
		return "";
	}
	*/
	
	// 默认加密服务提供者
	providerType = 1;
	providerName = "Microsoft Enhanced Cryptographic Provider v1.0";
	
	var useOldKey = true;
	if(oldCertCSP != providerName) {
		var info = "您选择的密钥服务提供者与您正在更新的证书不匹配！"
			+ "\n如果您点击“确定”，将会生成新的密钥对进行更新，点击“取消”重新选择密钥服务提供者。";

		if(!window.confirm(info)) {
			return "";
		} else
			useOldKey = false;
	}
	if(useOldKey) {
		//使用旧的密钥对，更新后的证书只是更新了证书有效期
		return genKeyAndCSR(providerName, providerType, cryptFlag, objOldCert.KeyContainer);
	} else {
		//生成新的密钥对，更新后的证书不仅更新了证书有效期，而且换了密钥对
		return genKeyAndCSR(providerName, providerType, cryptFlag);
	}	
}


/**
 * genKeyAndCSR()必须包含xenroll_install.js和xenroll_function.js
 * genKeyAndCSR 产生密钥对，并返回证书签名请求CSR
 * @param providerName(mandatory) 密钥服务提供者名称
 * @param providerType(mandatory) 密钥服务提供者类型
 * @param cryptFlag(optional)
 *		0x0表示私钥既不可以导出，又不要求强私钥保护
 *		0x1表示私钥可导出，默认值
 *		0x2表示强私钥保护
 *		0x3(0x1|0x2)表示私钥既可以导出，又要求强私钥保护
 * @param keyContainer(optional)
 *		可使用PTALib.Certificate对象的.KeyContainer方法获取原证书的密钥容器
 *		密钥容器名称，更新证书时需要设置，会使用原来的密钥对发出签名请求。
 *		如果在原证书存储在USB KEY中，更新的证书会自动覆盖老证书
 * @return 证书申请请求CSR
 */
function genKeyAndCSR(providerName, providerType, cryptFlag, keyContainer) {
	
	try {
		ienroll.Reset(); //首先Reset
				
		ienroll.ProviderName = providerName;
		ienroll.ProviderType = providerType;
		
		var keyflags = 0;
		if(typeof(cryptFlag) != "number") {
			cryptFlag = 0x00000001; //表示私钥可导出，默认值
		}
		keyflags = keyflags | cryptFlag;
		
		if(typeof(keyContainer) == "string" && keyContainer != "") {//适用于更新证书
			ienroll.UseExistingKeySet = true;
			ienroll.ContainerName = keyContainer;
		}
		ienroll.HashAlgorithm = "MD5"; //SHA1
		ienroll.KeySpec = 1;
		
		var csr = "";
		ienroll.GenKeyFlags = 0x08000000 | keyflags; //2048bits
		//objCEnroll.GenKeyFlags = 0x02000000 | keyflags; //512bits，一旦出错，不再尝试512bits的密钥对
		try {
			csr = ienroll.createPKCS10("CN=itrus_enroll", "1.3.6.1.5.5.7.3.2");
		} catch (e) {};
		
		return csr.replace(/\r*\n/g, "");
	} catch(e) {
		var keyNotPresent = "指定的密钥服务提供者不能提供服务！可能出现的原因："
				+ "\n1、您没有插入USB KEY，或者插入的USB KEY不能识别。"
				+ "\n2、您的USB KEY还没有初始化。";
		var keyContainerNotPresent = "指定的KeyContainer不能提供服务！\n如果您正在更新证书，请选择原证书的密钥服务提供者(CSP)。";
		if(-2147023673 == e.number //800704C7 User Canceled
		 || -2147418113 == e.number || -2146893795 == e.number //Zhong chao USB key User Canceled when input PIN
		 || -2146434962 == e.number //FT ePass2001 USB key User Canceld
		 ) {
			return "";
		} else if(-2146893802 == e.number) { //80090016
			if(providerName.indexOf("SafeSign") != -1)
				alert(keyNotPresent); //捷德的KEY没插KEY会报这个错误	
			else
				alert(keyContainerNotPresent); //当KeyContainer无法提供服务时，其他KEY会报这个错误
			return "";
		} else if(-2146435060 == e.number //8010000C FTSafe ePass2000没插KEY会报
			|| -2146893792 == e.number //80090020 FEITIAN ePassNG没插KEY会报
			) {
			alert(keyNotPresent); //捷德的KEY没插KEY会报这个错误			
			return "";
		} else {//创建1024位密钥对或产生CSR时发生其他未知错误，将错误报告给用户
			alert("在证书请求过程中发生错误！\n错误原因：" + e.description + "\n错误代码：" + e.number);
			return "";
		}
	}
}
//------------------------- 天威自建CA相关 end-------------------
/**
 * class Names
 * 
 * @method getItem(name) return names' first value
 * @method getItems(name) return names' value sting array object
 */
function Names(distinguishName) {
	this.names = init(distinguishName);

	this.getItem = function(name) {
		var values = this.names.get(name);
		if (null == values) {
			return null;
		} else {
			return values[0];
		}
	};

	this.getItems = function(name) {
		return this.names.get(name);
	};

	function init(dn) {
		var _names = new Hashtable();
		var partition = ", ";

		var Items = dn.split(partition);
		var itemString = "";
		for (var i = Items.length - 1; i >= 0; i--) {
			if (itemString != "") {
				itemString = Items[i] + itemString;
			} else {
				itemString = Items[i];
			}

			var pos = itemString.indexOf("=");
			if (-1 == pos) {
				itemString = partition + itemString;
				continue;
			} else {
				var name = itemString.substring(0, pos);
				var value = itemString.substring(pos + 1, itemString.length);
				// wipe off the limitrophe quotation marks
				if (value.indexOf("\"") == 0
						&& (value.length - 1) == value.lastIndexOf("\"")) {
					value = value.substring(1, value.length);
					value = value.substring(0, value.length - 1);
				}

				if (_names.containsKey(name)) {
					var array = _names.get(name);

					array.push(value);
					_names.remove(name);
					_names.put(name, array);
				} else {
					var array = new Array();
					array.push(value);
					_names.put(name, array);
				}
				itemString = "";
			}
		}
		return _names;
	}
}


/*******************************************************************************
 * Object: Hashtable Description: Implementation of hashtable Author: Uzi
 * Refaeli
 ******************************************************************************/

// ======================================= Properties
// ========================================
Hashtable.prototype.hash = null;
Hashtable.prototype.keys = null;
Hashtable.prototype.location = null;

/**
 * Hashtable - Constructor Create a new Hashtable object.
 */
function Hashtable() {
	this.hash = new Array();
	this.keys = new Array();

	this.location = 0;
}

Hashtable.prototype.containsKey = function(key) {
	if (this.hash[key] == null)
		return false;
	else
		return true;
};

/**
 * put Add new key param: key - String, key name param: value - Object, the
 * object to insert
 */
Hashtable.prototype.put = function(key, value) {
	if (value == null)
		return;

	if (this.hash[key] == null)
		this.keys[this.keys.length] = key;

	this.hash[key] = value;
};

/**
 * get Return an element param: key - String, key name Return: object - The
 * requested object
 */
Hashtable.prototype.get = function(key) {
	return this.hash[key];
};

/**
 * remove Remove an element param: key - String, key name
 */
Hashtable.prototype.remove = function(key) {
	for (var i = 0; i < this.keys.length; i++) {
		// did we found our key?
		if (key == this.keys[i]) {
			// remove it from the hash
			this.hash[this.keys[i]] = null;
			// and throw away the key...
			this.keys.splice(i, 1);
			return;
		}
	}
};

/**
 * size Return: Number of elements in the hashtable
 */
Hashtable.prototype.size = function() {
	return this.keys.length;
};

/**
 * populateItems Deprecated
 */
Hashtable.prototype.populateItems = function() {
};

/**
 * next Return: true if theres more items
 */
Hashtable.prototype.next = function() {
	if (++this.location < this.keys.length)
		return true;
	else
		return false;
};

/**
 * moveFirst Move to the first item.
 */
Hashtable.prototype.moveFirst = function() {
	try {
		this.location = -1;
	} catch (e) {/* //do nothing here :-) */
	}
};

/**
 * moveLast Move to the last item.
 */
Hashtable.prototype.moveLast = function() {
	try {
		this.location = this.keys.length - 1;
	} catch (e) {/* //do nothing here :-) */
	}
};

/**
 * getKey Return: The value of item in the hash
 */
Hashtable.prototype.getKey = function() {
	try {
		return this.keys[this.location];
	} catch (e) {
		return null;
	}
};

/**
 * getValue Return: The value of item in the hash
 */
Hashtable.prototype.getValue = function() {
	try {
		return this.hash[this.keys[this.location]];
	} catch (e) {
		return null;
	}
};

/**
 * getKey Return: The first key contains the given value, or null if not found
 */
Hashtable.prototype.getKeyOfValue = function(value) {
	for (var i = 0; i < this.keys.length; i++)
		if (this.hash[this.keys[i]] == value)
			return this.keys[i];
	return null;
};

/**
 * toString Returns a string representation of this Hashtable object in the form
 * of a set of entries, enclosed in braces and separated by the ASCII characters ", "
 * (comma and space). Each entry is rendered as the key, an equals sign =, and
 * the associated element, where the toString method is used to convert the key
 * and element to strings. Return: a string representation of this hashtable.
 */
Hashtable.prototype.toString = function() {

	try {
		var s = new Array(this.keys.length);
		s[s.length] = "{";

		for (var i = 0; i < this.keys.length; i++) {
			s[s.length] = this.keys[i];
			s[s.length] = "=";
			var v = this.hash[this.keys[i]];
			if (v)
				s[s.length] = v.toString();
			else
				s[s.length] = "null";

			if (i != this.keys.length - 1)
				s[s.length] = ", ";
		}
	} catch (e) {
		// do nothing here :-)
	} finally {
		s[s.length] = "}";
	}

	return s.join("");
};

/**
 * add Concatanates hashtable to another hashtable.
 */
Hashtable.prototype.add = function(ht) {
	try {
		ht.moveFirst();
		while (ht.next()) {
			var key = ht.getKey();
			// put the new value in both cases (exists or not).
			this.hash[key] = ht.getValue();
			// but if it is a new key also increase the key set
			if (this.get(key) != null) {
				this.keys[this.keys.length] = key;
			}
		}
	} catch (e) {
		// do nothing here :-)
	} finally {
		return this;
	}
};