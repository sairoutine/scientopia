'use strict';
/* global Uint8Array */

window.onload = function(){
	var source, img, animationId;
	var audioContext = new (window.AudioContext || window.webkitAudioContext);
	var audioFileReader   = new FileReader;
	var imageFileReader   = new FileReader;

	var analyser = audioContext.createAnalyser();
	analyser.fftSize = 128;
	analyser.connect(audioContext.destination);

	var canvas        = document.getElementById('visualizer');
	var canvasContext = canvas.getContext('2d');

	audioFileReader.onload = function(){
		audioContext.decodeAudioData(audioFileReader.result, function(buffer){
			// 既に再生していたら止める
			if(source) {
				source.stop();
				cancelAnimationFrame(animationId);
			}
			source = audioContext.createBufferSource();

			source.buffer = buffer;
			source.connect(analyser);
			source.start(0);

			animationId = requestAnimationFrame(render);
		});
	};

	imageFileReader.onload = function(){
		var tmpImg = new Image();
		tmpImg.src = imageFileReader.result;
		tmpImg.onload = function() {
			img = tmpImg;
		};
	};




	document.getElementById('audio_file').addEventListener('change', function(e){
		audioFileReader.readAsArrayBuffer(e.target.files[0]);
	});

	document.getElementById('image_file').addEventListener('change', function(e){
		imageFileReader.readAsDataURL(e.target.files[0]);
	});



	var render = function(){
		var spectrums = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteFrequencyData(spectrums);

		canvasContext.save();
		canvasContext.fillStyle = 'black';
		canvasContext.clearRect(0, 0, canvas.width, canvas.height);
		canvasContext.fillRect(0, 0, canvas.width, canvas.height);
		canvasContext.restore();

		if (img) {
			canvasContext.drawImage(img,
				0,
				0,
				img.width,
				img.height,
				0,
				0,
				canvas.width,
				canvas.height
			);

		}

		var barWidth = canvas.width / spectrums.length /2;
		var barMargin = barWidth;

		canvasContext.save();
		for(var i=0, len=spectrums.length; i<len; i++){
			var barHeight = spectrums[i];
			var posX = barMargin + i * (barWidth + barMargin);
			var posY = canvas.height - barHeight - barMargin;

			canvasContext.fillStyle = 'white';
			canvasContext.globalAlpha = 0.8;
			canvasContext.fillRect(posX, posY, barWidth, barHeight);
		}
		canvasContext.restore();

		animationId = requestAnimationFrame(render);
	};
};

(function() {
  var canvas = document.getElementById('visualizer');
  var container = document.getElementById('wrap');
  sizing();

  function sizing() {
    canvas.height = container.offsetHeight;
    canvas.width = container.offsetWidth;
  }

  window.addEventListener('resize', function() {
	sizing();
  });
})();


