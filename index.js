const audio = document.getElementById('audio');
const playPauseBtn = document.getElementById('play-pause-btn');
const chooseSongBtn = document.getElementById('choose-song-btn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const audioContext = new AudioContext();
const sourceNode = audioContext.createMediaElementSource(audio);
const analyserNode = audioContext.createAnalyser();

let isPlaying = false;

function resizeCanvas() {
  canvas.width = window.innerWidth * 0.8;
  canvas.height = window.innerHeight * 0.5;
  visualize();
}

function chooseSong() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'audio/*';
  input.onchange = function () {
    const fileReader = new FileReader();
    fileReader.onload = function () {
      audio.src = fileReader.result;
      playPauseBtn.disabled = false;
      playPauseBtn.innerHTML = '<i class="fa fa-play">Play</i>';
      isPlaying = false;
    };
    fileReader.readAsDataURL(this.files[0]);
  };
  input.click();
}

function visualize() {
  let WIDTH = canvas.width;
  let HEIGHT = canvas.height;

  // console.log(`WIDTH=${WIDTH}, HEIGHT=${HEIGHT}`);

  sourceNode.connect(analyserNode);
  analyserNode.connect(audioContext.destination);

  analyserNode.fftSize = 256;

  const bufferLength = analyserNode.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Draw function
  function draw() {
    requestAnimationFrame(draw);

    drawWidth = canvas.width;
    drawHeight = canvas.height;

    analyserNode.getByteFrequencyData(dataArray);

    const gradientCanvas = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradientCanvas.addColorStop(0, '#ff0000'); // Starting color at position 0
    gradientCanvas.addColorStop(1, '#00ff00'); // Ending color at position 1

    ctx.fillStyle = gradientCanvas;
    ctx.fillRect(0, 0, drawWidth, drawHeight);

    // console.log(`drawWidth=${drawWidth}, drawHeight=${drawHeight}`);

    let barWidth = (drawWidth / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] * (drawHeight / 146);

      const gradientLine = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradientLine.addColorStop(0, '#4E4FEB'); // Starting color at position 0
      gradientLine.addColorStop(1, '#EF6262'); // Ending color at position 1

      // Assign the gradientLine as fill style
      ctx.fillStyle = gradientLine;
      ctx.fillRect(x, drawHeight - barHeight / 2, barWidth, barHeight / 2);

      x += barWidth + 1;
    }
  }

  draw();
}

// Handle PlayPause
function playPause() {
  if (audioContext.state == "suspended") {
    audioContext.resume();
  }
  if (isPlaying) {
    audio.pause();
  } else {
    audio.play();
  }
}

audio.addEventListener('pause', () => {
  playPauseBtn.innerHTML = '<i class="fa fa-play">Play</i>';
  isPlaying = false;
});
audio.addEventListener('play', () => {
  playPauseBtn.innerHTML = '<i class="fa fa-play">Pause</i>';
  isPlaying = true;
});

window.addEventListener('resize', resizeCanvas);
playPauseBtn.addEventListener('click', playPause);

chooseSongBtn.addEventListener('click', () => {
  if (audioContext === undefined) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

  }
});
chooseSongBtn.addEventListener('click', chooseSong);
playPauseBtn.innerHTML = '<i class="fa fa-play">Play / Pause</i>';
resizeCanvas();



