function removeParam(key, sourceURL) {
	var rtn = sourceURL.split("?")[0],
		param, params_arr = [],
		queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
	if (queryString !== "") {
		params_arr = queryString.split("&");
		for (var i = params_arr.length - 1; i >= 0; i -= 1) {
			param = params_arr[i].split("=")[0];
			if (param === key) {
				params_arr.splice(i, 1);
			}
		}
		rtn = rtn + "?" + params_arr.join("&");
	}
	return rtn;
}

$(document)
	.ready(function () {
		var url_string = window.location.href;
		var url = new URL(url_string);
		var c = url.searchParams.get("sku");
		if (c) {
            fetch_images(c)
			window.history.replaceState({}, document.title, removeParam("sku", url_string))
		}
    });

var img_extensions = [
    "_01_standard.jpg",
    "_02_standard.jpg",
    "_03_standard.jpg",
    "_04_standard.jpg",
    "_05_standard.jpg",
    "_06_standard.jpg",
    "_07_standard.jpg",
    "_08_hover_frv.jpg",
    "_41_detail.jpg",
    "_42_detail.jpg",
    "_43_detail.jpg"
];

function preload(arrayOfImages) {
    $(arrayOfImages).each(function(){
        $('<img/>')[0].src = this.src;
        $('<img/>')[0].src = this.thumbnail;
    });
}

function submit_sku() {
$('#imgs').imagesGrid('destroy')
$("#label_status")[0].innerText = "Status: SEARCHING FOR SKU...";
$("#button_submit")[0].setAttribute("disabled", true);

var sku = $("#input_sku")[0].value.toUpperCase();

$.ajax({
    dataType: "json",
    url: "https://www.adidas.dk/api/products/" + sku,
    success: function(data) {
    $("#label_status")[0].innerText = "Status: SKU FOUND. FETCHING IMAGES...";
    console.log(data["id"]);
    fetch_images(sku)
    },
    error: function(data, textstatus) {
    if ($.parseJSON(data.responseText)["message"] == "Product redirect") {
        $("#label_status")[0].innerText = "Status: SKU FOUND. ATTEMPTING TO FETCH PRODUCT IMAGES...";
        fetch_images(sku)
    } else {
        $("#label_status")[0].innerText = "Status: SKU NOT FOUND. WAITING FOR INPUT.";
        $("#button_submit")[0].removeAttribute("disabled");
    }
    }
});

return false;
}

function fetch_images(sku) {
var images = [],
    images_temp = [];

var base_img_url = "https://www.adidas.dk/dis/dw/image/v2/aagl_prd/on/demandware.static/-/Sites-adidas-products/default/dw12345678/zoom/" + sku;

img_extensions.forEach((ext) => {
    images_temp.push($.ajax({
    type: "HEAD",
    url: base_img_url + ext,
    async: true,
    success: (data) => {
        images.push({
        "thumbnail": base_img_url + ext + "?sw=300&sfrm=jpg",
        "src": base_img_url + ext
        });
    }
    }));
});

$(document).ajaxStop(function() { // () => {} dosen't work :(
    $(this).unbind("ajaxStop");

    images = sort_array(images);
    console.log(images);
    if (images.length == 0) {
    $("#label_status")[0].innerText = "Status: " + images.length + " IMAGES FOUND. WAITING FOR NEW SKU.";
    $("#button_submit")[0].removeAttribute("disabled");
    } else {
    $("#label_status")[0].innerText = "Status: " + images.length + " IMAGES FOUND. DISPLAYING IMAGES...";
    preload(images)
    $('#imgs').imagesGrid({
        images: images,
        cells: 6,
        onGridLoaded: function() {
        $("#label_status")[0].innerText = "Status: " + images.length + " IMAGES LOADED. WAITING FOR NEW SKU.";
        $("#button_submit")[0].removeAttribute("disabled");
        },
        getViewAllText: function(imagesCount) {
        return 'VIEW ALL ' + imagesCount + ' IMAGES.';
        }
    });



    }

});
}

function sort_array(array) {
    var sorted_array = [];

    img_extensions.forEach((ext) => {
        array.forEach((arr) => {
        if (JSON.stringify(arr).indexOf(ext) != -1) {
            sorted_array.push(arr);
        }
        });
    });

    return sorted_array;
}
