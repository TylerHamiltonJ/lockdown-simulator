const globalGameValue = require("./gameStorage");
const controls = require("./controls");
const { ranArr, ranInt } = require("../helpers");
const gameCanvas = document.getElementById("game");
const ctx = gameCanvas.getContext("2d");
// const sprite = require("./sprite");
const sprite = new Image();
sprite.src = "img/covidSprite_13.png";

const covid = {
  elements: [],
  width: 42,
  height: 44,
  gridX: 45,
  gridY: 47,
  scale: 2,
  strains: {
    alpha: { minRep: 0, maxRep: 1, ref: 1, sY: 44 * 1 },
    beta: { minRep: 1, maxRep: 2, ref: 2, sY: 44 * 2 },
    gamma: { minRep: 1, maxRep: 2, ref: 3, sY: 44 * 3 },
    delta: { minRep: 1, maxRep: 4, ref: 5, sY: 44 * 0 },
    lambda: { minRep: 1, maxRep: 3, ref: 4, sY: 44 * 4 }
  },
  draw: function () {
    this.elements.forEach(e => {
      const drawWidth = this.width * this.scale;
      const drawHeight = this.height * this.scale;
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
    const endX = ranInt(this.width, gameCanvas.width - this.width);
    const endyY = ranInt(this.height, gameCanvas.height - this.height - controls.controls.height);
    this.elements.push({
      strain,
      color,
      x,
      y,
      endX: replicant ? endX : x,
      endY: replicant ? endyY : y,
      cycle: globalGameValue.cycle
    });
  },
  replicate: function () {
    globalGameValue.cycle += 1;
    const difficulty = Math.ceil(globalGameValue.frame / 100);
    for (let i = 0; i <= 1; i += 1) {
      const element = ranArr(this.elements);
      if (!element) {
        return true;
      }
      const strain = this.strains[element.strain];
      const inLockdown = globalGameValue.lockdownMeter < 100;
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
    }
  },
  update: function () {
    this.elements.forEach(element => {
      const inLockdown = globalGameValue.lockdownMeter < 100;
      // Slow the covid moving during lockdown
      const speed = inLockdown ? 0.2 : 1;
      // if (inLockdown) {
      //   element.endX = element.x;
      //   element.endY = element.y;
      //   return true;
      // }
      if (element.x - element.endX < 0) {
        element.x += speed;
      }
      if (element.x - element.endX > 0) {
        element.x -= speed;
      }

      if (element.y - element.endY < 0) {
        element.y += speed;
      }
      if (element.y - element.endY > 0) {
        element.y -= speed;
      }
    });
  },
  reset: function () {
    this.elements = [];
  }
};
module.exports.covid = covid;
