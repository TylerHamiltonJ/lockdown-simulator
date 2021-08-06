var gameCanvas = document.getElementById("game");
const happiness = document.getElementById("happiness-meter");
var ctx = gameCanvas.getContext("2d");

// LOAD SPRITE IMAGE
const sprite = new Image();
sprite.src = "img/covidSprite_1.png";

const elements = [];
let frame = 0;
let missedCovidChance = 0;

var slider = new CanvasSlider({
  canvas: "slider",
  range: { min: 0, max: 1 },
  start: [0.1],
  snapToTicks: false,
  showLabels: false,
  showMajorTicks: true,
  showMinorTicks: false,
  showToolTip: false,
  showValueBox: false,
  format: { decimals: 0, prefix: " ", suffix: "" },
  handle: { shape: "ellipse", w: 20, h: 20, hue: 240 },
  baseColor: { h: 207, s: 60, v: 100 }
});

function initialize() {
  // Register an event listener to call the resizeCanvas() function
  // each time the window is resized.
  window.addEventListener("resize", resizeCanvas, false);
  // Draw canvas border for the first time.
  resizeCanvas();
}

function draw() {
  ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  if (elements.length >= 100) {
    alert("Too many covid");
  } else {
    elements.forEach(function (element) {
      console.log(element.shapeData);
      ctx.fillStyle = element.color;
      ctx.fill(element.shapeData);
    });
  }
}

// Runs each time the DOM window resize event fires.
// Resets the canvas dimensions to match window,
// then draws the new borders accordingly.
function resizeCanvas() {
  const maxWidth = 500;
  gameCanvas.width = window.innerWidth < maxWidth ? window.innerWidth : maxWidth;
  gameCanvas.height = window.innerHeight * 0.9;
  draw();
}
// Start listening to resize events and draw canvas.
initialize();
window.addEventListener("resize", resizeCanvas);

const covidSettings = {
  gridX: 46,
  gridY: 44
};

const covid = {
  elements: [],
  width: 42,
  height: 45,
  strains: {
    alpha: { minRep: 0, maxRep: 1, speed: 5, sY: 44 * 1 },
    beta: { minRep: 0, maxRep: 1, speed: 5, sY: 44 * 2 },
    gamma: { minRep: 0, maxRep: 1, speed: 5, sY: 44 * 3 },
    delta: { minRep: 0, maxRep: 1, speed: 5, sY: 44 * 0 },
    lambda: { minRep: 0, maxRep: 1, speed: 5, sY: 44 * 4 }
  },
  draw: function () {
    this.elements.forEach(e => {
      const strain = this.strains[e.strain];
      console.log(strain);
      ctx.drawImage(
        sprite,
        0,
        strain.sY,
        this.width,
        this.height,
        100,
        100,
        this.width,
        this.height
      );
    });
  },
  create: function (strain, color, x, y) {
    this.elements.push({ strain, color, x, y });
  }
};
console.log(covid);

// // GAME CONTENT

function createCovid(strain, color, startX, startY, endX, endY) {
  // Create circle
  const shapeData = new Path2D();
  shapeData.arc(startX, startY, 50, 0, 2 * Math.PI);
  console.log("ADDING A COVID");
  covid.elements.unshift({
    shapeData,
    strain,
    color,
    pos: {
      start: { x: startX, y: startY },
      end: {
        x: endX || randomIntFromInterval(0, gameCanvas.width),
        y: endY || randomIntFromInterval(0, gameCanvas.height)
      }
    }
  });
}

// Listen for mouse moves
gameCanvas.addEventListener("click", function (event) {
  // Check whether point is inside circle
  covid.elements.forEach((element, i) => {
    if (ctx.isPointInPath(element.shapeData, event.offsetX, event.offsetY)) {
      removeItemFromArray(elements, i);
      draw();
    }
  });
});

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function removeItemFromArray(array, index) {
  array.splice(index, 1);
}

function calculateCovid() {
  console.log("Calculating Covid Replication Chance.");
  elements.forEach(e => {
    // const strain = covidStrains[e.strain];
    const maxValue = Math.floor(5 + slider.getValue(0) * 10);
    if (randomIntFromInterval(0, maxValue) === 1) {
      const numOfReplications = randomIntFromInterval(strain.minRep, strain.maxRep);
      if (numOfReplications > 0) {
        console.log(`REPLICATING COVID ${numOfReplications} times`);
        for (let i = 0; i <= numOfReplications; i += 1) {
          console.log("replicated", i);
          const x = randomIntFromInterval(0, gameCanvas.width);
          const y = randomIntFromInterval(0, gameCanvas.height);
          createCovid(e.strain, e.color, x, y);
        }
      }
    }
  });
}

function createNewStrainChance() {
  const ran = randomIntFromInterval(0, 10);
  if (ran === 1 || missedCovidChance > 7) {
    const x = randomIntFromInterval(0, gameCanvas.width);
    const y = randomIntFromInterval(0, gameCanvas.height);
    console.log("CREATING");
    covid.create("delta", 0, 100, 100);
    missedCovidChance = 0;
  } else {
    missedCovidChance += 1;
  }
}

// LOOP
function loop() {
  update();
  // frames++;
  covid.draw();
  requestAnimationFrame(loop);
}
loop();
setInterval(function () {
  createNewStrainChance();
}, 1000);

setInterval(function () {
  // calculateCovid();
}, 500);

function update() {
  const happyVal = happiness.value;
  const sliderAdd = 0.02 - slider.getValue(0) / 10;
  happiness.value = happyVal + sliderAdd;
  if (happiness.value <= 0) {
    alert("Protest!");
  }
  frame += 1;
  if (frame > 1000) {
    frame = 0;
  }
}
