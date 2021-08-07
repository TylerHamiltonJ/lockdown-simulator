const { covid } = require("./game/covid");
const { controls } = require("./game/controls");
const { powerUps } = require("./game/powerUps");
const globalGameValue = require("./game/globalGameValues");
const { ranArr, ranInt, removeItemFromArray } = require("./helpers");
var gameCanvas = document.getElementById("game");
var ctx = gameCanvas.getContext("2d");

const gameOverImg = new Image();
gameOverImg.src = "img/gameOver2.png";

const SCOMOSFX = new Audio();
SCOMOSFX.src = `audio/scomo.wav`;

const breachMessages = ["HOTEL QURANTINE BREACH!", "INTERSTATE ARRIVAL!", "REMOVALISTS!"];

function resetGame() {
  console.log("Resetting game.");
  powerUps.reset();
  covid.reset();
  textElement.reset();
  globalGameValue.frame = 0;
  globalGameValue.missedCovidChance = 0;
  globalGameValue.state = "play";
  globalGameValue.cycle = 0;
  globalGameValue.happiness = 100;
  globalGameValue.lockdownMeter = 100;
  globalGameValue.buttonState = "up";
  console.log(globalGameValue);
}

const HIT = new Audio();

function initialize() {
  // Register an event listener to call the resizeCanvas() function
  // each time the window is resized.
  window.addEventListener("resize", resizeCanvas, false);
  // Draw canvas border for the first time.
  resizeCanvas();
}

function draw() {
  ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
}

// Runs each time the DOM window resize event fires.
// Resets the canvas dimensions to match window,
// then draws the new borders accordingly.
function resizeCanvas() {
  const maxWidth = 500;
  gameCanvas.width = window.innerWidth < maxWidth ? window.innerWidth : maxWidth;
  gameCanvas.height = window.innerHeight;
  draw();
}
// Start listening to resize events and draw canvas.
initialize();
window.addEventListener("resize", resizeCanvas);

const textElement = {
  elements: [],
  reset: function () {
    this.elements = [];
  },
  draw: function () {
    this.elements.forEach(element => {
      ctx.font = "35px VT323";
      ctx.fillStyle = `rgba(0,0,0,${element.alpha})`;
      element.alpha -= 0.01;
      element.y -= 1;
      ctx.fillText(element.text, element.x, element.y);
      if (element.alpha <= 0) {
        this.elements.shift();
        return true;
      }
    });
  },
  create: function (text, x, y) {
    const minX = Math.min(gameCanvas.width - 250, x);
    this.elements.push({ text, x: minX, y, alpha: 1 });
  }
};

// Listen for mouse click
gameCanvas.addEventListener("click", function (event) {
  if (globalGameValue.state !== "play") {
    resetGame();
  }
  // Check whether point is inside circle
  if (ctx.isPointInPath(controls.buttonHitbox, event.offsetX, event.offsetY)) {
    controls.lockdown();
  }
  // buttonHitbox
  covid.elements.some((element, i) => {
    if (ctx.isPointInPath(element.hitBox, event.offsetX, event.offsetY)) {
      removeItemFromArray(covid.elements, i);
      // HIT.src = `audio/collect${ranInt(1, 10)}.wav`;
      // HIT.play();
      draw();
      return true;
    }
  });

  powerUps.elements.some((element, i) => {
    if (ctx.isPointInPath(element.hitBox, event.offsetX, event.offsetY)) {
      removeItemFromArray(powerUps.elements, i);
      draw();
      return true;
    }
  });
});

function getTouches(e) {
  if (
    e.type == "touchstart" ||
    e.type == "touchmove" ||
    e.type == "touchend" ||
    e.type == "touchcancel"
  ) {
    var touch = e.touches[0] || e.changedTouches[0];
    return { x: touch.pageX, y: touch.pageY };
  } else {
    return { x: e.offsetX, y: e.offsetY };
  }
}

function mouseDown(event) {
  const cords = getTouches(event);
  // Check whether point is inside circle
  if (ctx.isPointInPath(controls.buttonHitbox, cords.x, cords.y)) {
    console.log("Button Down");
    globalGameValue.buttonState = "down";
  } else {
    globalGameValue.buttonState = "up";
  }
}
function mouseUp() {
  globalGameValue.buttonState = "up";
}

gameCanvas.addEventListener("mousedown", mouseDown);
gameCanvas.addEventListener("mouseup", mouseUp);
gameCanvas.addEventListener("touchstart", mouseDown);
gameCanvas.addEventListener("touchend", mouseUp);

function createNewStrainChance() {
  const ran = ranInt(0, 1);
  if (ran === 1 || globalGameValue.missedCovidChance > 7) {
    const x = ranInt(covid.width, gameCanvas.width - covid.width);
    const y = ranInt(covid.height, gameCanvas.height - covid.height - controls.height);
    const strainName = ranArr(Object.keys(covid.strains));
    const color = ranInt(0, 7) * covid.gridX;
    textElement.create(ranArr(breachMessages), x, y);
    covid.create(strainName, color, x, y);
    // HIT.src = `audio/collect${ranInt(1, 10)}.wav`;
    // HIT.play();
    globalGameValue.missedCovidChance = 0;
  } else {
    globalGameValue.missedCovidChance += 1;
  }
}

const gameOver = {
  draw: function () {
    if (globalGameValue.state === "gameOverCovid") {
      ctx.drawImage(gameOverImg, 0, 0, 800, 1159, 0, 0, gameCanvas.width, gameCanvas.height);
    }
    if (globalGameValue.state === "gameOverProtest") {
      ctx.drawImage(gameOverImg, 800, 0, 800, 1159, 0, 0, gameCanvas.width, gameCanvas.height);
    }
  }
};

function createPowerUpChance() {
  if (Math.random() > 1 * 0.9) {
    const powerupTypes = Object.keys(powerUps.types);
    const powerUp = ranArr(powerupTypes);
    powerUps.create(powerUp);
    if (powerUp === "scomo") {
      SCOMOSFX.play();
    }
  }
}
// LOOP
function loop() {
  draw();
  update();
  covid.draw();
  textElement.draw();
  covid.update();
  powerUps.draw();
  controls.draw();
  gameOver.draw();
  requestAnimationFrame(loop);
}
resetGame();
loop();

setInterval(function () {
  if (globalGameValue.state === "play") createNewStrainChance();
}, 1000);

setInterval(function () {
  if (globalGameValue.state === "play") createPowerUpChance();
}, 1500);

setInterval(function () {
  if (globalGameValue.state === "play") covid.replicate();
}, 800);

function update() {
  controls.update();
  if (covid.elements.length > 100) {
    globalGameValue.state = "gameOverCovid";
  }
  if (globalGameValue.happiness <= 0) {
    globalGameValue.state = "gameOverProtest";
  }

  globalGameValue.frame += 1;
}