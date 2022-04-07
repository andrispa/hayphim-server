function viSeo(str){
	 return str.replace(/[':']/gi, '-').replace(/ - /gi, '-').replace(/- /gi, '-').replace(/--/gi, '-').replace(/---/gi, '-').replace(/[^0-9a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ-\s]/gi, '').replace(/['đ|Đ']/gi, 'd').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[' ']/gi, '-').replace(/--/gi, '-');//replace(/[^0-9a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ-\s]/gi, '').replace(/[' ']/gi, '-').replace(/['đ|Đ']/gi, 'd').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); 
}
function keyTag(str){
	return str.replace(/[^0-9a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ,\s]/gi, '').toLowerCase();
}
function content(str){
	return str.replace(/["]/gi, '&quot;').replace(/["]/gi, '&&#39;').replace(/\n|\r\n|\r/g, '<br>');
}
function getIDDrive(str){
	return str.trim().replace('https://drive.google.com/file/d/', '').replace('/view', '').replace(/[\s]/gi, '');
}
function trimStr(str){
	return str.trim().replace(/[\s]/gi, '');
}
 module.exports = {
 	'viSeo': viSeo,
 	'keyTag': keyTag,
	'content': content,
	'getIDDrive': getIDDrive,
	'trimStr': trimStr
 }