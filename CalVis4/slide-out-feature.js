
$(document).ready(function(){
	
	$(".trigger-event-cal-sliding-panel").click(function() {  
		slideTabOut(".event-cal-sliding-panel", this); 
	});

});


/**
 * Slides Out content of the left Events tab 
 */
slideTabOut = function(tabClass, triggerClass){

		// jQuery's .toggle("drop","slow") creates a bug in our calendar in IE8
		// Hence we create the same effect using a work around
		if ( $(triggerClass).attr("class").indexOf("active") == -1 )
			$(tabClass).animate({"margin-left": "760", "opacity": "toggle"},600); 			
		else
			$(tabClass).animate({"margin-left": "0", "opacity": "toggle"},800); 
		
		$(triggerClass).toggleClass("active");
		
		// Hides any element of type "embed" - such as videos
		$("embed").toggleClass("hideEmbeddedElement");
		
		return false;	
};