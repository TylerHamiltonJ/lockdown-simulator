const { ranInt } = require("../helpers");
const controls = require("./controls");
const gameCanvas = document.getElementById("game");
const ctx = gameCanvas.getContext("2d");
// const sprite = require("./sprite");
const sprite = new Image();
sprite.src = "img/covidSprite_13.png";

const powerUps = {
  elements: [],
  width: 40,
  height: 55,
  spY: 0,
  types: {
    scomo: {
      happinessDecrease: 0.1,
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
    const y = ranInt(this.height, gameCanvas.height - this.height - controls.controls.height);
    this.elements.push({
      powerUpType,
      x,
      y
    });
  }
};

module.exports = { powerUps };
