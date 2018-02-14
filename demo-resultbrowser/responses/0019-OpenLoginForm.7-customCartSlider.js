$(document).ready(function(){ 
	$("#cartSliderItemsWrap li:first").hide();
	$("#slidingTopContent").hide();
	$("#slidingTopTriggerHide").hide();
});

function showCartSlider()
{
    $("#slidingTopContent").slideToggle("slow", function(){
    	if ($("#slidingTopContent").is(":visible"))
    	{
    		getCartSliderText();
    		$("#slidingTopTriggerShow").hide();
    		$("#slidingTopTriggerHide").show();
    	}
    	else
    	{
    		$("#slidingTopTriggerShow").show();
    		$("#slidingTopTriggerHide").hide();
    	}
	});	
}

function getCartSliderText()
{
	var url = CONTEXT_PATH + '/getCartElementSlider';
	$.get(url, updateCartSlider);
}

function updateCartSlider(data)
{
	// clear list
	$('#cartSliderElementList').empty();
	// add products to list
	for (var i=0; i<data.cartElements.length; i++)
	{
		var liId = "productId" + data.cartElements[i].productId + data.cartElements[i].finish + data.cartElements[i].size.width + "x" + data.cartElements[i].size.height;
		var inner = setCartSliderElementInnerHtml(data.cartElements[i], data.currency, data.unitLength);
		var liElement = $("<li id='" + liId + "'></li>").html(inner);
		$("#cartSliderElementList").append(liElement);
	}
	// update total price in cart slider
	$('#cartSliderTotalPrice').text(data.totalPrice + data.currency);
}

function setCartSliderElementInnerHtml(product, currency, unitLength)
{
	return "<span id='sliderProdName'>" + product.productName + "</span> - <span id='sliderProdFinish'>" + product.finish + "</span> </br>" +
			" - <span id='sliderProdSize'>" + product.size.width + " x " + product.size.height + " " + unitLength + "</span>" +
			" - <span id='sliderProdPrice'>" + product.productPrice + currency + "</span>" +
			" (<span id='sliderProdCount'>" + product.productCount + "</span> items)";
}

function addToCart(productId, finish, size)
{
	getCartSliderText();
	if ($("#slidingTopContent").is(":visible"))
	{
		addToCartSlider(productId, finish, size);
	}
	else
	{
		$("#slidingTopContent").slideToggle("slow", function(){		
			$("#slidingTopTriggerShow").hide();
			$("#slidingTopTriggerHide").show();
			addToCartSlider(productId, finish, size);
			$("#slidingTopTriggerHide").fadeTo(4000, 1, function(){
				$("#slidingTopContent").slideToggle("slow", function(){
					$("#slidingTopTriggerShow").show();
					$("#slidingTopTriggerHide").hide();
				});
			});
		});
	}
}

function addToCartSlider(productId, finish, size)
{
	$("#notificationsLoader").html('<img src="' + CONTEXT_PATH + '/assets/img/loader.gif">');
	
	$.ajax({  
		type: "GET",  
		url: CONTEXT_PATH + '/addToCartSlider' + '?productId=' + productId + '&finish=' + finish + '&size=' + size, 
		success: function(data) {
			// create new <li> element
			var liId = "productId" + data.product.productId + data.product.finish + data.product.size.width + "x" + data.product.size.height;
			var inner = setCartSliderElementInnerHtml(data.product, data.currency, data.unitLength);
			var liElement = $("<li id='" + liId + "'></li>").html(inner);
			if( $("#" + liId).length > 0)
			{
				$("#" + liId).remove();
				$("#cartSliderElementList").prepend(liElement);
			}
			else
			{
				$("#cartSliderElementList").prepend(liElement);
			}
			// update total price in cart slider
			$('#cartSliderTotalPrice').text(data.totalPrice + data.currency);
			$("#notificationsLoader").empty();
			// update cart in header
			$("#headerCartOverview span").text(data.headerCartOverview);
		}
	});
}
