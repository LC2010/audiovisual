// 初始化一个新的context
context = new webkitAudioContext();

window.requestAnimFrame = (function() {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
		window.setTimeout(callback, 1000 / 60);
	};
})();

function playSound(buffer, time) {
	var source = context.createBufferSource();
	source.buffer = buffer;
	source.connect(context.destination);
	source.start(time);
}

function loadSounds(obj, soundMap, callback) {
	var names = [];
	var paths = [];
	for (var name in soundMap) {
		var path = soundMap[name];
		names.push(name);
		paths.push(path);
	}
	bufferLoader = new BufferLoader(context, paths, function(bufferList) {
		for (var i = 0; i < bufferList.length; i++) {
			var buffer = bufferList[i];
			var name = names[i];
			obj[name] = buffer;
		}
		if (callback) {
			callback();
		}
	});
	bufferLoader.load();
}

function BufferLoader(context, urlList, callback) {
	this.context = context;
	this.urlList = urlList;
	this.onload = callback;
	this.bufferList = new Array();
	this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
	console.log(url, index);
	// 异步加载
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = "arraybuffer";

	var loader = this;
	request.onload = function() {
		console.log(request.response);
		// 解码audio文件
		loader.context.decodeAudioData(
			request.response,

			function(buffer) {
				if (!buffer) {
					alert('解码失败, url==> ' + url);
					return;
				}
				loader.bufferList[index] = buffer;
				if (++loader.loadCount == loader.urlList.length) loader.onload(loader.bufferList);				
			},

			function(error) {
				console.error('decodeAudioData error', error);
			}
		);
	};

	request.onerror = function() {
		alert('BufferLoader: XHR error');
	};

	request.send();
};

BufferLoader.prototype.load = function() {
	for (var i = 0; i < this.urlList.length; ++i)
		this.loadBuffer(this.urlList[i], i);
};