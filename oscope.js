(function(AudioContext, requestAnimationFrame) {
	var audio = new Audio();
	var file = (location.search.match(/[?&]file=([^?&]+)/) || ['']).pop();

	if (!file)
		location.href = location.href + '?file=http://oscillo.app.9k1.us/oscillofun.ogg';

	audio.src = file;

	var context = new AudioContext();
	var source = context.createMediaElementSource(audio);
	var splitter = context.createChannelSplitter(2);
	var leftAnalyser = context.createAnalyser();
	var rightAnalyser = context.createAnalyser();

	source.connect(context.destination);
	source.connect(splitter);

	splitter.connect(leftAnalyser, 0);
	splitter.connect(rightAnalyser, 1);

	var canvas = document.querySelector('canvas');
	var ctx = canvas.getContext('2d');

	var left = new Uint8Array(leftAnalyser.frequencyBinCount);
	var right = new Uint8Array(rightAnalyser.frequencyBinCount);

	var size, point;
	(window.onresize = function resize() {
		size = Math.min(window.innerWidth, window.innerHeight);

		point = size / 100;

		canvas.setAttribute('width', point * 2);
		canvas.setAttribute('height', point * 2);

		var grad = ctx.createRadialGradient(point, point, point / 30, point + 1, point + 1, point);
		grad.addColorStop(0, 'rgba(255, 255, 95, 0.4)');
		grad.addColorStop(1, 'rgba(255, 71, 16, 0)');

		ctx.fillStyle = grad;
		ctx.fillRect(0, 0, point * 2, point * 2);

		point = new Image();
		point.src = canvas.toDataURL('image/png');

		canvas.style.top = (window.innerHeight - size) / 2 + 'px';
		canvas.style.left = (window.innerWidth - size) / 2 + 'px';
		canvas.setAttribute('width', size);
		canvas.setAttribute('height', size);
	})();

	(function animate() {
		leftAnalyser.getByteTimeDomainData(left);
		rightAnalyser.getByteTimeDomainData(right);

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		for (var i=0; i<1024; i++) {
			ctx.globalCompositeOperation = 'lighter';
			ctx.drawImage(point,
				(256 - left[i]) / 256 * size,
				right[i] / 256 * size
			);
		}

		requestAnimationFrame(animate);
	})();

	audio.play();
})(window.AudioContext || window.webkitAudioContext, window.requestAnimationFrame || window.webkitRequestAnimationFrame);
