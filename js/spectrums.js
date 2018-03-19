'use strict';

function Spectrum(name, exponent, render) {
	this.name = name;
	this.exponent = exponent;
	this.renderer = render;
}

/**
 * @type Object
 */
var spectrum_renders = {
	default: new Spectrum(
		"default",
		7,
		function (canvas, spectrums, canvasContext) {
			var barWidth = canvas.width / spectrums.length / 2;
			var barMargin = barWidth;
			for (var i = 0, len = spectrums.length; i < len; i++) {
				var barHeight = spectrums[i];
				var posX = barMargin + i * (barWidth + barMargin);
				var posY = canvas.height - barHeight - barMargin;

				canvasContext.fillStyle = 'white';
				canvasContext.globalAlpha = 0.8;
				canvasContext.fillRect(posX, posY, barWidth, barHeight);
			}
		}
	),
};


//init spectrum_types
//*
var spectrum_types_element = document.getElementById('spectrum_types');
for (var id in spectrum_renders){
	var value = spectrum_renders[id];
	var element = document.createElement("option");
	element.value = id;
	element.innerText = value.name;
	spectrum_types_element.appendChild(element);
	console.log(id, value);
}
// */