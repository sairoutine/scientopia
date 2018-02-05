'use strict';
/* global Uint8Array */

window.onload = function(){
	var source, animationId;
	var audioContext = new (window.AudioContext || window.webkitAudioContext);
	var fileReader   = new FileReader;

	var analyser = audioContext.createAnalyser();
	analyser.fftSize = 128;
	analyser.connect(audioContext.destination);

	var canvas        = document.getElementById('visualizer');
	var canvasContext = canvas.getContext('2d');

	fileReader.onload = function(){
		audioContext.decodeAudioData(fileReader.result, function(buffer){
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

	document.getElementById('file').addEventListener('change', function(e){
		fileReader.readAsArrayBuffer(e.target.files[0]);
	});

	var render = function(){
		var spectrums = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteFrequencyData(spectrums);

		canvasContext.fillStyle = 'black';
		canvasContext.fillRect(0, 0, canvas.width, canvas.height);
		for(var i=0, len=spectrums.length; i<len; i++){
			canvasContext.fillStyle = 'white';
			canvasContext.fillRect(i*10, 0, 5, spectrums[i]);
		}

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


