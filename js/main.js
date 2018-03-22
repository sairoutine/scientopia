'use strict';
/* global Uint8Array */

var DATABASE_VERSION = 1;
var PAGE_ID = 1;

/*
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"};
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
*/

window.onload = function() {
	var spectrum_render = spectrum_renders[document.getElementById('spectrum_types').value];
	var renderer;

	var source, audio_data, img, animationId, db;
	var audioContext = new (window.AudioContext || window.webkitAudioContext);
	var audioFileReader = new FileReader;
	var imageFileReader = new FileReader;

	var analyser = audioContext.createAnalyser();
	//analyser.fftSize = spectrum_render.exponent;
	analyser.connect(audioContext.destination);

	var canvas = document.getElementById('visualizer');
	var canvasContext = canvas.getContext('2d');

	function update_spectrum_render() {
		analyser.fftSize = Math.pow(2, spectrum_render.exponent);
		renderer = spectrum_render.renderer;
	}

	update_spectrum_render();

	audioFileReader.onload = function () {
		setAudio(audioFileReader.result);
	};

	imageFileReader.onload = function () {
		setImage(imageFileReader.result);
	};

	var setImage = function (base64) {
		var tmpImg = new Image();
		tmpImg.src = base64;
		tmpImg.onload = function () {
			img = tmpImg;

			if (source && img) {
				document.getElementById('initial').style.display = "none";
				document.getElementById('playing').style.display = "block";
				writeToDatabase();
			}
		};
	};
	var setAudio = function (tmp_audio_data) {
		// decodeAudioData が audio_data を破壊するので、cloneしておく
		audio_data = tmp_audio_data.slice(0);

		audioContext.decodeAudioData(tmp_audio_data, function (buffer) {
			// 既に再生していたら止める
			if (source) {
				source.stop();
				cancelAnimationFrame(animationId);
			}
			source = audioContext.createBufferSource();

			source.buffer = buffer;
			source.connect(analyser);
			source.start(0);

			if (source && img) {
				document.getElementById('initial').style.display = "none";
				document.getElementById('playing').style.display = "block";
				writeToDatabase();
			}

			animationId = requestAnimationFrame(render);
		});
	};

	var writeToDatabase = function () {
		if (!db) return;

		var transaction = db.transaction("assets", "readwrite");
		transaction.oncomplete = function (event) {
		};
		var objectStore = transaction.objectStore("assets");
		var request = objectStore.put({
			id: PAGE_ID,
			audio: new Blob([audio_data]),
			img: img.src,
			spectrum: spectrum_render.id,
		});
		request.onsuccess = function(event) {};
	};


	document.getElementById('audio_file').addEventListener('change', function (e) {
		audioFileReader.readAsArrayBuffer(e.target.files[0]);
	});

	document.getElementById('image_file').addEventListener('change', function (e) {
		imageFileReader.readAsDataURL(e.target.files[0]);
	});

	document.getElementById('clear').addEventListener('click', function (e) {
		img = undefined;
		// 既に再生していたら止める
		if (source) {
			source.stop();
			cancelAnimationFrame(animationId);
		}
		canvasContext.clearRect(0, 0, canvas.width, canvas.height);

		var transaction = db.transaction("assets", "readwrite");
		transaction.oncomplete = function (event) {
		};
		var objectStore = transaction.objectStore("assets");
		var request = objectStore.delete(PAGE_ID);
		request.onsuccess = function(event) {};



		document.getElementById('audio_file').value = "";
		document.getElementById('image_file').value = "";

		document.getElementById('initial').style.display = "block";
		document.getElementById('playing').style.display = "none";
	});

	document.getElementById('spectrum_types').addEventListener('change', function(e){
		spectrum_render = spectrum_renders[document.getElementById('spectrum_types').value];
		update_spectrum_render();
	});


	var render = function () {
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

		canvasContext.save();
		renderer(canvas, spectrums, canvasContext);
		canvasContext.restore();

		animationId = requestAnimationFrame(render);
	};

	var request = window.indexedDB.open("scientopia", DATABASE_VERSION);
	request.onupgradeneeded = function (event) {
		db = event.target.result;
		// このデータベース用の objectStore を作成します
		db.createObjectStore("assets", {keyPath: "id"});
	}; // onupgradeneeded が発生した場合にも onsuccess は発生する
	request.onsuccess = function (event) {
		db = event.target.result;
		getAssets();
	};

	var getAssets = function () {
		if (!db) return;

		db.transaction("assets", "readwrite").objectStore("assets").get(PAGE_ID).onsuccess = function (event) {
			var data = event.target.result;
			// 再生
			if (data) {
				setImage(data.img);
				var fileReader = new FileReader();
				fileReader.onload = function () {
					setAudio(fileReader.result);
				};
				fileReader.readAsArrayBuffer(data.audio);
				spectrum_render = spectrum_renders[data.spectrum]
			}
		};
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


