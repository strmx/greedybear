class FPSCounter {
	private startTime = performance.now();
	private prevTime = this.startTime;
	private frames = 0;
	private domElement: Element;
	private prevFPS = -1;

	fps = 0;
	fpsMin = Infinity;
	fpsMax = 0;

	constructor(domElement: Element) {
		this.domElement = domElement
	}

	begin() {
		this.startTime = performance.now();
	}

	end() {
		let time = performance.now();

		this.frames ++;

		if ( time > this.prevTime + 1000 ) {
			this.fps = Math.round((this.frames * 1000) / (time - this.prevTime));
			this.fpsMin = Math.min(this.fpsMin, this.fps);
			this.fpsMax = Math.max(this.fpsMax, this.fps);

			this.prevTime = time;
			this.frames = 0;

			// update dom
			if (this.domElement && this.prevFPS !== this.fps) {
				this.prevFPS = this.fps;
				this.domElement.textContent = '' + this.fps;
			}
		}

		return time;
	}
}

export = FPSCounter;
