var WIDTH = 840;
var HEIGHT = 360;

var SMOOTHING = 0.6;
var FFT_SIZE = 2048;

function VisualizerSample() {
	this.analyser = context.createAnalyser();
	this.analyser.connect(context.destination);
	this.analyser.minDecibels = -140;
	this.analyser.maxDecibels = 0;
	loadSounds(this, {
		// buffer: 'cunzai.mp3'
		buffer: '存在.mp3'
		// buffer: 'chrono.mp3'
	});
	this.freqs = new Uint8Array(this.analyser.frequencyBinCount);
	this.times = new Uint8Array(this.analyser.frequencyBinCount);

	this.isPlaying = false;
	this.startTime = 0;
	this.startOffset = 0;
}

// Toggle playback
VisualizerSample.prototype.togglePlayback = function() {
	if (this.isPlaying) {
		this.source.noteOff(0);
		this.startOffset += context.currentTime - this.startTime;
		console.log('paused at', this.startOffset);
	} else {
		this.startTime = context.currentTime;
		console.log('started at', this.startOffset);
		this.source = context.createBufferSource();
		this.source.connect(this.analyser);
		this.source.buffer = this.buffer;
		this.source.loop = true;
		this.source.start(0, this.startOffset % this.buffer.duration);
		// 可视化
		requestAnimFrame(this.draw.bind(this));
	}
	this.isPlaying = !this.isPlaying;
};

VisualizerSample.prototype.draw = function() {
	this.analyser.smoothingTimeConstant = SMOOTHING;
	this.analyser.fftSize = FFT_SIZE;

	this.analyser.getByteFrequencyData(this.freqs);
	this.analyser.getByteTimeDomainData(this.times);

	var width = Math.floor(1 / this.freqs.length, 10);

	var canvas = document.querySelector('canvas');
	var drawContext = canvas.getContext('2d');
	canvas.width = WIDTH;
	canvas.height = HEIGHT;

	for (var i = 0; i < this.analyser.frequencyBinCount; i++) {
		var value = this.freqs[i];
		var percent = value / 256;
		var height = HEIGHT * percent;
		var offset = HEIGHT - height - 1;
		var barWidth = WIDTH / this.analyser.frequencyBinCount;
		var hue = i / this.analyser.frequencyBinCount * 360;
		drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
		drawContext.fillRect(i * barWidth, offset, barWidth, height);
	}

	for (var i = 0; i < this.analyser.frequencyBinCount; i++) {
		var value = this.times[i];
		var percent = value / 256;
		var height = HEIGHT * percent;
		var offset = HEIGHT - height - 1;
		var barWidth = WIDTH / this.analyser.frequencyBinCount;
		drawContext.fillStyle = 'white';
		drawContext.fillRect(i * barWidth, offset, 1, 2);
	}

	if (this.isPlaying) {
		requestAnimFrame(this.draw.bind(this));
	}
};

VisualizerSample.prototype.getFrequencyValue = function(freq) {
	var nyquist = context.sampleRate / 2;
	var index = Math.round(freq / nyquist * this.freqs.length);
	return this.freqs[index];

};