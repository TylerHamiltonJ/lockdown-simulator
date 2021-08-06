var gameCanvas = document.getElementById("game");
// const debugInfo = document.getElementById("debug");
// const slider = document.getElementById("lockdownRange");
var ctx = gameCanvas.getContext("2d");

// LOAD SPRITE IMAGE
const sprite = new Image();
sprite.src = "img/covidSprite_13.png";

const gameOverImg = new Image();
gameOverImg.src = "img/gameOver2.png";

// Global Game Variables
let frame = 0;
let missedCovidChance = 0;
let state = "play";
let cycle = 0;
let happiness = 100;
let lockdownMeter = 100;
let buttonState = "up";
// slider.value = 2;

const breachMessages = ["HOTEL QURANTINE BREACH!", "INTERSTATE ARRIVAL!", "REMOVALISTS!"];

function resetGame() {
  covid.reset();
  powerUps.reset();
  textElement.reset();
  frame = 0;
  cycle = 0;
  missedCovidChance = 0;
  state = "play";
  happiness = 100;
  lockdownMeter = 100;
  buttonState = "up";
  // slider.value = 2;
}

const HIT = new Audio();
const LOCKDOWN = new Audio();
LOCKDOWN.src = `audio/lockdown.wav`;
const LOCKDOWNEMPTY = new Audio();
LOCKDOWNEMPTY.src = `audio/lockdown_empty.wav`;
const SCOMOSFX = new Audio();
SCOMOSFX.src = `audio/scomo.wav`;

// Helpful Functions
function ranArr(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function ranInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function removeItemFromArray(array, index) {
  array.splice(index, 1);
}

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

const covidSettings = {
  gridX: 45,
  gridY: 47
};

const controls = {
  height: 100,
  barGap: 22,
  buttonHitbox: {},
  lockdownbutton: {
    width: 23,
    height: 17,
    spX: 416,
    spY: 205,
    scale: 5
  },
  lockdownbuttonDown: {
    width: 23,
    height: 17,
    spX: 416,
    spY: 187,
    scale: 5
  },
  smile: {
    startSpriteX: 377,
    startSpriteY: 145,
    height: 11,
    width: 11,
    spriteGrid: 12,
    numOfSprites: 6
  },
  meter: {
    height: 11,
    width: 4,
    spX: 388,
    spY: 205,
    endSpX: 397,
    startX: 30
  },
  score: {
    spX: 404,
    spY: 205,
    height: 11,
    width: 11
  },
  scale: 4.5,
  lockdown: function () {
    if (lockdownMeter < 99) {
      LOCKDOWNEMPTY.play();
      return true;
    }
    happiness -= 25;
    lockdownMeter = 0;
    LOCKDOWN.play();
  },
  update: function () {
    const numCovid = covid.elements.length;
    const multiplier = numCovid - 20;
    const inLockdown = lockdownMeter < 100;
    const happinessIncrease = multiplier * 0.001 * -1;
    const happinessLockdownMult = inLockdown ? happinessIncrease * 0.1 : happinessIncrease;
    if (lockdownMeter < 100) lockdownMeter += 0.1;
    if (happiness < 100) happiness += happinessLockdownMult;
    if (powerUps.elements.some(s => s.powerUpType === "scomo")) happiness -= 0.6;
  },
  draw: function () {
    // Draw lockdown button and meter

    // Meter fill
    ctx.fillStyle = `rgb(0,255,0)`;
    ctx.fillRect(
      0,
      gameCanvas.height - this.meter.height * this.scale,
      (gameCanvas.width - this.lockdownbutton.width * this.lockdownbutton.scale) *
        (lockdownMeter / 100),
      this.meter.height * this.scale
    );
    // Draw meter
    for (let i = 0; i <= gameCanvas.width / this.meter.width; i += this.meter.width) {
      ctx.drawImage(
        sprite,
        this.meter.spX + this.meter.width,
        this.meter.spY,
        this.meter.width,
        this.meter.height,
        this.meter.width * i,
        gameCanvas.height - this.meter.height * this.scale,
        this.meter.width * this.scale,
        this.meter.height * this.scale
      );
    }
    // lockdown Button
    const lockdownBtnStartX =
      gameCanvas.width - this.lockdownbutton.width * this.lockdownbutton.scale;
    const lockdownBtnStartY =
      gameCanvas.height - this.lockdownbutton.height * this.lockdownbutton.scale;

    ctx.drawImage(
      sprite,
      buttonState === "up" ? this.lockdownbutton.spX : this.lockdownbuttonDown.spX,
      buttonState === "up" ? this.lockdownbutton.spY : this.lockdownbuttonDown.spY,
      this.lockdownbutton.width,
      this.lockdownbutton.height,
      lockdownBtnStartX,
      lockdownBtnStartY,
      this.lockdownbutton.width * this.lockdownbutton.scale,
      this.lockdownbutton.height * this.lockdownbutton.scale
    );
    // Button hitbox
    const hitBox = new Path2D();
    hitBox.rect(
      lockdownBtnStartX,
      lockdownBtnStartY,
      this.lockdownbutton.width * this.lockdownbutton.scale,
      this.lockdownbutton.height * this.lockdownbutton.scale
    );

    this.buttonHitbox = hitBox;

    // Draw meter
    ctx.fillStyle = `rgb(0,255,0)`;
    ctx.fillRect(
      this.meter.startX,
      0,
      (gameCanvas.width - this.score.width * this.scale * 1.5) * (happiness / 100),
      this.meter.height * this.scale
    );
    ctx.drawImage(
      sprite,
      this.meter.spX,
      this.meter.spY,
      this.meter.width,
      this.meter.height,
      this.meter.startX,
      0,
      this.meter.width * this.scale,
      this.meter.height * this.scale
    );
    for (let i = 0; i <= gameCanvas.width / this.meter.width; i += this.meter.width) {
      ctx.drawImage(
        sprite,
        this.meter.spX + this.meter.width,
        this.meter.spY,
        this.meter.width,
        this.meter.height,
        this.meter.startX + this.meter.width * i,
        0,
        this.meter.width * this.scale,
        this.meter.height * this.scale
      );
    }
    ctx.drawImage(
      sprite,
      this.meter.endSpX,
      this.meter.spY,
      this.meter.width,
      this.meter.height,
      gameCanvas.width - this.meter.width * this.scale,
      0,
      this.meter.width * this.scale,
      this.meter.height * this.scale
    );
    // Draw Smile
    const getSpriteY = () => {
      if (happiness < 10) return 5;
      else if (happiness < 25) return 4;
      else if (happiness < 40) return 3;
      else if (happiness < 50) return 2;
      else if (happiness < 75) return 1;
      else return 0;
    };
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      sprite,
      this.smile.startSpriteX,
      getSpriteY() * this.smile.spriteGrid + this.smile.startSpriteY,
      this.smile.height,
      this.smile.width,
      0,
      0,
      this.smile.height * this.scale,
      this.smile.width * this.scale
    );
    // Draw Score
    ctx.drawImage(
      sprite,
      this.score.spX,
      this.score.spY,
      this.score.width,
      this.score.height,
      gameCanvas.width - this.score.width * this.scale * 1.5,
      0,
      this.score.width * this.scale * 1.5,
      this.score.height * this.scale
    );
    ctx.font = "35px VT323";
    ctx.fillStyle = `#fff`;
    ctx.fillText(Math.round(frame / 100), gameCanvas.width - this.score.width * this.scale, 35);
  }
};

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

const powerUps = {
  elements: [],
  width: 40,
  height: 55,
  spY: 0,
  types: {
    scomo: {
      spX: 360
    },
    brett: {
      spX: 400
    },
    jeroen: {
      spX: 442
    }
  },
  reset: function () {
    this.elements = [];
  },
  draw: function () {
    this.elements.forEach(e => {
      const drawWidth = this.width * 1.5;
      const drawHeight = this.height * 1.5;
      const hitBox = new Path2D();
      hitBox.arc(e.x + drawHeight / 2, e.y + drawHeight / 2, drawHeight / 2, 0, 2 * Math.PI);
      e.hitBox = hitBox;
      const powerUpType = this.types[e.powerUpType];
      ctx.strokeStyle = "rgba(0,0,0,0)";
      ctx.stroke(e.hitBox);
      ctx.drawImage(
        sprite,
        powerUpType.spX,
        0,
        this.width,
        this.height,
        e.x,
        e.y,
        drawWidth,
        drawHeight
      );
    });
  },
  create: function (powerUpType) {
    const x = ranInt(this.width, gameCanvas.width - this.width);
    const y = ranInt(this.height, gameCanvas.height - this.height - controls.height);
    this.elements.push({
      powerUpType,
      x,
      y
    });
  }
};

const covid = {
  elements: [],
  width: 42,
  height: 44,
  strains: {
    alpha: { minRep: 0, maxRep: 1, ref: 1, sY: 44 * 1 },
    beta: { minRep: 1, maxRep: 2, ref: 2, sY: 44 * 2 },
    gamma: { minRep: 1, maxRep: 2, ref: 3, sY: 44 * 3 },
    delta: { minRep: 1, maxRep: 4, ref: 5, sY: 44 * 0 },
    lambda: { minRep: 1, maxRep: 3, ref: 4, sY: 44 * 4 }
  },
  reset: function () {
    this.elements = [];
  },
  draw: function () {
    this.elements.forEach(e => {
      const drawWidth = this.width * 1.5;
      const drawHeight = this.height * 1.5;
      const hitBox = new Path2D();
      hitBox.arc(e.x + drawHeight / 2, e.y + drawHeight / 2, drawHeight / 2, 0, 2 * Math.PI);
      e.hitBox = hitBox;
      const strain = this.strains[e.strain];
      ctx.strokeStyle = "rgba(0,0,0,0)";
      ctx.stroke(e.hitBox);
      ctx.drawImage(
        sprite,
        e.color,
        strain.sY,
        this.width,
        this.height,
        e.x,
        e.y,
        drawWidth,
        drawHeight
      );
    });
  },
  create: function (strain, color, x, y, replicant) {
    const endX = ranInt(covid.width, gameCanvas.width - covid.width);
    const endyY = ranInt(covid.height, gameCanvas.height - covid.height - controls.height);
    this.elements.push({
      strain,
      color,
      x,
      y,
      endX: replicant ? endX : x,
      endY: replicant ? endyY : y,
      cycle
    });
  },
  replicate: function () {
    cycle += 1;
    const element = ranArr(this.elements);
    if (!element) {
      return true;
    }
    const strain = this.strains[element.strain];
    const inLockdown = lockdownMeter < 100;
    const chanceMultiplier = inLockdown ? 0.8 : 0.5;
    if (Math.random() > 1 * chanceMultiplier) {
      const ranRep = ranInt(strain.minRep, strain.maxRep);
      const numOfReplications = inLockdown ? ranRep - 1 : ranRep;
      if (numOfReplications > 0) {
        for (let i = 0; i <= numOfReplications; i += 1) {
          this.create(element.strain, element.color, element.x, element.y, true);
        }
      }
    }
  },
  update: function () {
    this.elements.forEach(element => {
      if (element.x - element.endX < 0) {
        element.x += 1;
      }
      if (element.x - element.endX > 0) {
        element.x -= 1;
      }

      if (element.y - element.endY < 0) {
        element.y += 1;
      }
      if (element.y - element.endY > 0) {
        element.y -= 1;
      }
    });
  }
};

// Listen for mouse click
gameCanvas.addEventListener("click", function (event) {
  if (state !== "play") {
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
      HIT.src = `audio/collect${ranInt(1, 10)}.wav`;
      HIT.play();
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
    buttonState = "down";
  } else {
    buttonState = "up";
  }
}
function mouseUp() {
  buttonState = "up";
}

gameCanvas.addEventListener("mousedown", mouseDown);
gameCanvas.addEventListener("mouseup", mouseUp);
gameCanvas.addEventListener("touchstart", mouseDown);
gameCanvas.addEventListener("touchend", mouseUp);

function createNewStrainChance() {
  const ran = ranInt(0, 1);
  if (ran === 1 || missedCovidChance > 7) {
    const x = ranInt(covid.width, gameCanvas.width - covid.width);
    const y = ranInt(covid.height, gameCanvas.height - covid.height - controls.height);
    const strainName = ranArr(Object.keys(covid.strains));
    const color = ranInt(0, 7) * covidSettings.gridX;
    textElement.create(ranArr(breachMessages), x, y);
    covid.create(strainName, color, x, y);
    HIT.src = `audio/collect${ranInt(1, 10)}.wav`;
    HIT.play();
    missedCovidChance = 0;
  } else {
    missedCovidChance += 1;
  }
}

const gameOver = {
  draw: function () {
    if (state === "gameOverCovid") {
      ctx.drawImage(gameOverImg, 0, 0, 800, 1159, 0, 0, gameCanvas.width, gameCanvas.height);
    }
    if (state === "gameOverProtest") {
      ctx.drawImage(gameOverImg, 800, 0, 800, 1159, 0, 0, gameCanvas.width, gameCanvas.height);
    }
  }
};

function createPowerUpChance() {
  if (Math.random() > 1 * 0.9) {
    const powerupTypes = Object.keys(powerUps.types);
    const powerUp = ranArr(powerupTypes);
    console.log("Creating a ", powerUp);
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
  if (state === "play") createNewStrainChance();
}, 1000);

setInterval(function () {
  if (state === "play") createPowerUpChance();
}, 1500);

setInterval(function () {
  if (state === "play") covid.replicate();
}, 800);

function update() {
  controls.update();
  if (covid.elements.length > 100) {
    state = "gameOverCovid";
  }
  if (happiness <= 0) {
    state = "gameOverProtest";
  }

  frame += 1;
}
