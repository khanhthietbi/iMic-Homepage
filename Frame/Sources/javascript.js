
function lz_global_base64_url_encode(_text)
{ 
	if(_text.length == 0)
		return "";

	_text = lz_global_base64_encode(lz_global_utf8_encode(_text.toString()));
	_text = _text.replace(/=/g, "_");
	_text = _text.replace(/\+/g, "-");
	_text = _text.replace(/\//g, ",");
	return _text;
}

function lz_global_base64_url_decode(_text)
{
	if(!(_text != null && _text.length > 0))
		return "";
		
	_text = _text.replace("_","=");
	_text = _text.replace("-","+");
	_text = _text.replace(",","/");
	_text = lz_global_utf8_decode(lz_global_base64_decode(_text));
	return _text;
}
	
function lz_global_base64_decode(_text)
{
	var base64_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	var bits;
	var decOut = '';
	var i = 0;
	for(; i<_text.length; i += 4)
	{
		bits = (base64_chars.indexOf(_text.charAt(i)) & 0xff) <<18 |
		(base64_chars.indexOf(_text.charAt(i +1)) & 0xff) <<12 |
		(base64_chars.indexOf(_text.charAt(i +2)) & 0xff) << 6 |
		base64_chars.indexOf(_text.charAt(i +3)) & 0xff;
		decOut += String.fromCharCode((bits & 0xff0000) >>16, (bits & 0xff00) >>8, bits & 0xff);
	}
	if(_text.charCodeAt(i -2) == 61)
		return(decOut.substring(0, decOut.length -2));
	else if(_text.charCodeAt(i -1) == 61)
		return(decOut.substring(0, decOut.length -1));
	else 
		return(decOut);
}

function lz_global_base64_encode(_input) 
{
	var base64_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
   	var output = "";
   	var chr1, chr2, chr3;
   	var enc1, enc2, enc3, enc4;
	var i = 0;
	
	do 
	{
	   chr1 = _input.charCodeAt(i++);
	   chr2 = _input.charCodeAt(i++);
	   chr3 = _input.charCodeAt(i++);
	
	   enc1 = chr1 >> 2;
	   enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
	   enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
	   enc4 = chr3 & 63;
	
	   if (isNaN(chr2)) 
	      enc3 = enc4 = 64;
	   else if (isNaN(chr3)) 
	      enc4 = 64;
	
	   output = output + base64_chars.charAt(enc1) + base64_chars.charAt(enc2) +
	      base64_chars.charAt(enc3) + base64_chars.charAt(enc4);
	} 
	while (i < _input.length);
	return output;
}

function lz_global_utf8_encode(_string,_encodeuri) 
{
	_string = _string.replace(/\r\n/g,"\n");
	var utftext = "";
	for (var n = 0; n < _string.length; n++) 
	{
	    var c = _string.charCodeAt(n);
	    if (c < 128) 
		{
	        utftext += String.fromCharCode(c);
	    }
	    else if((c > 127) && (c < 2048)) 
		{
	        utftext += String.fromCharCode((c >> 6) | 192);
	        utftext += String.fromCharCode((c & 63) | 128);
	    }
	    else 
		{
	        utftext += String.fromCharCode((c >> 12) | 224);
	        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
	        utftext += String.fromCharCode((c & 63) | 128);
	    }
	}
	if(_encodeuri)
		return encodeURIComponent(utftext);
	else
		return utftext;
}

function lz_global_utf8_decode(utftext) 
{
	var string = "";
    var i = 0;
	var c, c1, c2
    c = c1 = c2 = 0;

    while ( i < utftext.length ) 
	{
        c = utftext.charCodeAt(i);
        if (c < 128) 
		{
            string += String.fromCharCode(c);
            i++;
        }
        else if((c > 191) && (c < 224)) 
		{
            c2 = utftext.charCodeAt(i+1);
            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
        }
        else 
		{
            c2 = utftext.charCodeAt(i+1);
            c3 = utftext.charCodeAt(i+2);
            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }
    }
    return string;
}
function send_invi()
{

	
	groupid	=	lz_global_base64_url_encode(document.getElementById('lz_chat_form_groups').value);
	user_name	=	lz_global_base64_url_encode(document.getElementById('lz_invitation_name').value);
	if((user_name=="")||(groupid==""))
		return false;
	//else
		//window.open('/Lienhe.aspx','width=590,height=610,left=0,top=0,resizable=yes,menubar=no,location=no,status=yes,slidebars=no');
}
var chat_inv_flag=0;
var chat_inv_init=0;
function lz_livebox_close()
{
	if(chat_inv_flag==0)
	{
		chat_inv_flag=-1;
		jQuery("#chat_hand").css("background-image", "url()"); 
		if(chat_inv_init==0)
		{
			jQuery("#chat_content").hide();
			jQuery('#lz_request_window').animate({bottom: '0',right:'0'}, 1000, function() {
				// Animation complete.
				jQuery("#chat_content").show();
				jQuery("#msg").typewriter();
				
			});
			setTimeout(function(){

			   chat_inv_init=1;
			   chat_inv_flag=1;

			}, 5000);
		}
		else
		{
		
			//jQuery("#chat_content").hide();

			jQuery('#lz_request_window').animate({bottom: '0',right:'0'}, 1000, function() {
				// Animation complete.
				//jQuery("#chat_content").show();
				//jQuery("#msg_type").typewriter();
				chat_inv_flag=1;

			});
			
			
		}
		
		jQuery("#lz_invitation_name").focus();
		
	}
	else if(chat_inv_flag==1)
	{
		jQuery("#chat_hand").css("background-image", "url()"); 
		jQuery('#lz_request_window').animate({bottom: '-480',right:'-120'}, 500, function() {
			// Animation complete.
			//jQuery("#msg_type").typewriter();
		});
		chat_inv_flag=0;
	}
		
	
}
jQuery(document).ready(function(){
	if(chat_inv_flag==1)
	{
		setTimeout(function(){
		   lz_livebox_close();
		}, 3000); 

	}

});

(function($)
  {$.fn.typewriter = function() {	this.each(function() {		var $ele = $(this), str = $ele.text(), progress = 0;		$ele.text('');		var timer = setInterval(function() {			$ele.text(str.substring(0, progress++) + (progress & 1 ? '|' : ''));			if (progress >= str.length) clearInterval(timer);		}, 30);	});	return this;};})(jQuery);
  
