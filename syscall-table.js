var PREFIX="http://localhost/js/posts/linux-system-call-table/";
$(document).ready(function(){
	loadJSON(PREFIX+"jsons/sys.json");
});

//loads json file into memory, formats HTML
function loadJSON(url) {   
	$.getJSON(url, function(data) {
		$("#sys-container").find('ul').remove();
		var items=[];
		$.each(data, function(key, val){
			var rax = Object.keys(val);
			for (var i=0; i < rax.length; i++){
				var syscall = val[rax[i]]["System call"];
				items.push("<div class = sys id = " + syscall + "><div class='call-content'><li class='%ax'>"+rax[i]+"</li>");
				items.push("<li class='syscall'>"+ syscall +"</li>");
				var calls = Object.keys(val[rax[i]]);
				for (var j=0; j < calls.length; j++){
					if(calls[j] !== 'System call')
							items.push("<li class='no-show " + calls[j] + "'><a class='reg-label "+ calls[j]+ "-label'>" + calls[j] + ": </a><a class='info'>" + val[rax[i]][calls[j]] + "</a></li>" );
				}
				items.push("</div><div class='man'><p class='man-button no-show' onclick='getPage(\""+syscall+"\")'> View the Man Page.</p></div></div>");
			}
		});
		$("<ul/>", {
			"id" : "syscall-list",
			html: items.join("")
		}).appendTo("#sys-container");
		setup();
	});
}

//
function setup(){
	var $sysList = $('#syscall-list');
	var $sys = $(".sys");
	
	$(".sys").click(
		function() {
			var $clone =  $(this).clone();
			$clone.attr('id', $clone.attr('id')+'-abs');
			$clone.css("position", "absolute");
			$clone.css("z-index", "5");
			$clone.css("top", $(this).position()["top"]);
			$clone.css("left", $(this).position()["left"]);
			$(this).after($clone);
			$clone.width($sysList.width());
			$clone.height($sysList.height());
			$clone.css("top", "-5px");
			$clone.css("left", "-5px");
			$clone.css("border", "none");
			$clone.css("width", "100%");
			$clone.css("height", "100%");
			$clone.append("<img id='sys-back-arrow' src='"+PREFIX+"backArrow.png'/>");
			setTimeout(function(){$clone.find(".no-show").removeClass("no-show").addClass("show");}, 120);
			$('#sys-back-arrow').click(function(){
				$(".call-content").css("padding", "0px");
				$clone.remove();
			});
			$(".call-content").css("padding", "10px");
		}
	);
	establishSearch();
}

function swapCSS(num){
	$pressed = $('.pressed');
	$unpressed = $('.unpressed');
	if($unpressed.attr('id') === "big-"+num){
		//change button press
		$pressed.removeClass('pressed').addClass('unpressed');
		$unpressed.removeClass('unpressed').addClass('pressed');

		//swap radio buttons
		$show = $('.sys-radio.show');
		$noShow = $('.sys-radio.no-show');
		$show.removeClass('show').addClass('no-show');
		$noShow.removeClass('no-show').addClass('show');
	}	
}

function getPage(jsonName){
	$.getJSON(PREFIX+"jsons/"+jsonName+".json", function(data) {
		$view = $('#'+jsonName+"-abs ");
		$view.css("overflow", "scroll");
		$view.scroll(function() {
			$("#sys-back-arrow").css("top", $view.scrollTop());
		});
		var hide ="<p class='show man' onclick='removePage(\""+jsonName+"\")'>Hide the Man Page.</p>";
		$('#'+jsonName+"-abs .man-button").html("Hide the Man Page").attr("onclick", "removePage(\""+jsonName+"\")");
		$('#'+jsonName+"-abs .man").append("<div class='page'>"+data['Man page']+"</div>");
	});
};

function removePage(jsonName){
		$('#'+jsonName+"-abs .man .page").remove();
		$('#'+jsonName+"-abs .man-button").html("View the Man Page.").attr("onclick", "getPage(\""+jsonName+"\")");
}

function establishSearch(){
	RegExp.escape= function(s) {
		return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	};
	
	var commitSearch = function(){
		var spec =  $(".sys-radio.show input:radio:checked").attr("value");
		var filter = $('#sys-filter').val();
		//why did I use escape characters in CSS? silly me...
		if(spec[0] == '%')
			spec = '\\' + spec;
		if(spec === 'all')
			spec = '';
		else
			spec = '.'+spec;
		$("#syscall-list div").each(function(){
			if($(this).find('li'+spec).length !== 0){
				if ($(this).find('li'+spec).text().search(new RegExp(RegExp.escape(filter))) < 0) {
					$(this).fadeOut(0);
				} 
				else {
					$(this).show();
				}
			}
			else if(!$(this).hasClass('man')){
				$(this).fadeOut(0);
			}
		});
	};
	
	//for button swaps
	commitSearch();
	//live search functionality
	$("#sys-filter").keyup(commitSearch);
	//for radio button click
	$("input[name='search-type']").change(commitSearch);
}
