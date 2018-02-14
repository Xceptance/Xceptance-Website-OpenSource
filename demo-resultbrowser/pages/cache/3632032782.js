$(document).ready(hideMessages);

function hideMessages() {
	$("#errorMessage").hide();
	$("#successMessage").hide();
	$("#infoMessage").hide();
}

function deleteFromCart(cartProductId, cartIndex) {
	hideMessages();
	var url = CONTEXT_PATH + '/deleteFromCart?cartProductId=' + cartProductId;
	$.get(url, function(data) {
		// remove product from cart overview
		$('#product' + cartIndex).remove();
		// update cart in header
		$("#headerCartOverview span").text(data.headerCartOverview);
		// update total price
		$("#totalPrice:first-child").text(data.totalPrice);
		// update cart slider
		getCartSliderText();
	});
}

function updateProductCount(cartProductId, count, cartIndex) {
	var url = CONTEXT_PATH + '/updateProductCount?cartProductId=' + cartProductId
			+ '&productCount=' + count;
	$.get(url).always(function() {
		hideMessages();
	}).done(function(data) {
		// update cart in header
		$("#headerCartOverview span").text(data.headerCartOverview);
		// update total price
		$("#totalPrice:first-child").text(data.totalPrice);
		// update cart slider
		getCartSliderText();
		// update cart overview, if count was zero
		if (count == 0) {
			// remove product from cart overview
			$('#product' + cartIndex).remove();
		}
	}).error(function(data) {
		var err = eval("(" + data.responseText + ")");
		$("#infoMessage").show();
		$("#infoMessage div strong").text(err.message);
	});
}

// update price of product if the selected size has changed
function updatePrice(selectedField, productId) {
	var url = CONTEXT_PATH + '/updatePrice';
	$.post(url, {
		size : selectedField.value,
		productId : productId
	}, function(data) {
		$('#prodPrice').text(data.newPrice);
	});
}

function updateProductOverview(data) {
	var i = 0;
	// show all products
	while ($('#product' + i).length) {
		$('#product' + i).show();
		i++;
	}
	// set new content of products
	for (i = 0; i < data.products.length; i++) {
		$('#product' + i + " h3").text(data.products[i].name);
		$('#product' + i + " a").attr(
				"href",
				CONTEXT_PATH + "/productDetail/" + encodeURIComponent(data.products[i].name) + "?productId="
						+ data.products[i].id);
		$('#product' + i + " a img").attr("src", CONTEXT_PATH + data.products[i].imageURL);
		$('#product' + i + "DescriptionOverview").text(
				data.products[i].descriptionOverview);
		$('#product' + i + "Price").text(data.products[i].priceAsString);
	}
	// hide not updated products
	while ($('#product' + i).length) {
		$('#product' + i).hide();
		i++;
	}
	// set current page attribute
	$('#productOverview').attr("currentPage",data.currentPage);
}
