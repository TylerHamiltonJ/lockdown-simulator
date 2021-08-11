const covid = require("./covid");
const globalGameValue = require("./gameStorage");
const powerUps = require("./powerUps");
const gameCanvas = document.getElementById("game");
const ctx = gameCanvas.getContext("2d");
// const sprite = require("./sprite");
const sprite = new Image();
sprite.src = "img/covidSprite_13.png";

const LOCKDOWN = new Audio();
LOCKDOWN.src = `audio/lockdown.wav`;
const LOCKDOWNEMPTY = new Audio();
LOCKDOWNEMPTY.src = `audio/lockdown_empty.wav`;

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
  lockdownSettings: {
    lockdownMeterTimeIncrease: 0.2
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
    if (globalGameValue.lockdownMeter < 99) {
      LOCKDOWNEMPTY.play();
      return true;
    }
    globalGameValue.happiness -= 25;
    globalGameValue.lockdownMeter = 0;
    LOCKDOWN.play();
  },
  update: function () {
    const numCovid = covid.covid.elements.length;
    const multiplier = numCovid - 20;
    const inLockdown = globalGameValue.lockdownMeter < 100;
    const happinessIncrease = multiplier * 0.001 * -1;
    const happinessLockdownMult = inLockdown ? happinessIncrease * 0.1 : happinessIncrease;
    if (globalGameValue.lockdownMeter < 100)
      globalGameValue.lockdownMeter += this.lockdownSettings.lockdownMeterTimeIncrease;
    if (globalGameValue.happiness < 100) globalGameValue.happiness += happinessLockdownMult;
    if (powerUps.powerUps.elements.some(s => s.powerUpType === "scomo"))
      globalGameValue.happiness -= powerUps.powerUps.types.scomo.happinessDecrease;
  },
  draw: function () {
    // Draw lockdown button and meter
    // Meter fill
    ctx.fillStyle = `rgb(0,255,0)`;
    ctx.fillRect(
      0,
      gameCanvas.height - this.meter.height * this.scale,
      (gameCanvas.width - this.lockdownbutton.width * this.lockdownbutton.scale) *
        (globalGameValue.lockdownMeter / 100),
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
      globalGameValue.buttonState === "up" ? this.lockdownbutton.spX : this.lockdownbuttonDown.spX,
      globalGameValue.buttonState === "up" ? this.lockdownbutton.spY : this.lockdownbuttonDown.spY,
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
      (gameCanvas.width - this.score.width * this.scale * 1.5) * (globalGameValue.happiness / 100),
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
      if (globalGameValue.happiness < 15) return 5;
      else if (globalGameValue.happiness < 30) return 4;
      else if (globalGameValue.happiness < 45) return 3;
      else if (globalGameValue.happiness < 55) return 2;
      else if (globalGameValue.happiness < 75) return 1;
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
    ctx.fillText(
      Math.round(globalGameValue.frame / 100),
      gameCanvas.width - this.score.width * this.scale,
      35
    );
  }
};

module.exports.controls = controls;
