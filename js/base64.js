
var encodeChars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var decodeChars=new Array(
		-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
		-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
		-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,62,-1,-1,-1,63,
		52,53,54,55,56,57,58,59,60,61,-1,-1,-1,-1,-1,-1,
		-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,
		15,16,17,18,19,20,21,22,23,24,25,-1,-1,-1,-1,-1,
		-1,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,
		41,42,43,44,45,46,47,48,49,50,51,-1,-1,-1,-1,-1);
function Encode(str)
{
	var returnVal,i,len;
	var c1,c2,c3;
	len=str.length;
	i=0;
	returnVal="";
	while(i<len)
	{
		c1=str.charCodeAt(i++)&0xff;
		if(i==len)
		{
			returnVal+=encodeChars.charAt(c1>>2);
			returnVal+=encodeChars.charAt((c1&0x3)<<4);
			returnVal+="==";
			break;
		}
		c2=str.charCodeAt(i++);
		if(i==len)
		{
			returnVal+=encodeChars.charAt(c1>>2);
			returnVal+=encodeChars.charAt(((c1&0x3)<<4)|((c2&0xF0)>>4));
			returnVal+=encodeChars.charAt((c2&0xF)<<2);
			returnVal+="=";
			break;
		}
		c3=str.charCodeAt(i++);
		returnVal+=encodeChars.charAt(c1>>2);
		returnVal+=encodeChars.charAt(((c1&0x3)<<4)|((c2&0xF0)>>4));
		returnVal+=encodeChars.charAt(((c2&0xF)<<2)|((c3&0xC0)>>6));
		returnVal+=encodeChars.charAt(c3&0x3F);
	}
	return returnVal;
}


function Decode(str)
{
	var c1,c2,c3,c4;
	var i,len,returnVal;
	len=str.length;
	i=0;
	returnVal="";
	while(i<len)
	{
	/*c1*/
		do
		{
		c1=decodeChars[str.charCodeAt(i++)&0xff];
		}while(i<len&&c1==-1);
		if(c1==-1)
			break;
		/*c2*/
		do
		{
			c2=decodeChars[str.charCodeAt(i++)&0xff];
		}while(i<len&&c2==-1);
		if(c2==-1)
			break;
		returnVal+=String.fromCharCode((c1<<2)|((c2&0x30)>>4));
		/*c3*/
		do
		{
			c3=str.charCodeAt(i++)&0xff;
			if(c3==61)
			return returnVal;
			c3=decodeChars[c3];
		}while(i<len&&c3==-1);
		if(c3==-1)
			break;
		returnVal+=String.fromCharCode(((c2&0XF)<<4)|((c3&0x3C)>>2));
		/*c4*/
		do
		{
			c4=str.charCodeAt(i++)&0xff;
			if(c4==61)
			return returnVal;
			c4=decodeChars[c4];
		}while(i<len&&c4==-1);
		if(c4==-1)
			break;
		returnVal+=String.fromCharCode(((c3&0x03)<<6)|c4);
	}

	return returnVal;
}