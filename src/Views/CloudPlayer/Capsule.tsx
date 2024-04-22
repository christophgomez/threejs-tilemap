import Tools from "../../lib/utils/Tools";
// const NUM_BANDS = 256;
const SCALE = {
  MIN: 15.0,
  MAX: 50.0,
};
const SPEED = {
  MIN: 0.2,
  MAX: 0.8,
};
const ALPHA = {
  MIN: 0.5,
  MAX: 0.8,
};
const SPIN = {
  MIN: 0.001,
  MAX: 0.005,
};
const SIZE = {
  MIN: 1.0,
  MAX: 1.25,
};

export default class Capsule {
  public x;
  public y;
  public color;
  public level;
  public scale;
  public alpha;
  public speed;
  public size;
  public spin;
  // public band: number;

  public data: { [key: string]: any } = {};

  static num = 0;

  private _num = 0;
  static COLORS = [
    "#F44336",
    "#E91E63",
    "#9C27B0",
    "#673AB7",
    "#3F51B5",
    "#2196F3",
    "#03A9F4",
    "#00BCD4",
    "#009688",
    "#4CAF50",
    "#8BC34A",
    "#CDDC39",
    "#FFEB3B",
    "#FFC107",
    "#FF9800",
    "#FF5722",
    "#795548",
    "#9E9E9E",
    "#607D8B",
  ];

  private hexToRgba(hex, alpha = 1) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgba(${r},${g},${b},${alpha})`;
  }

  constructor(x1 = 0, y1 = 0, color = null, label = "") {
    Capsule.num++;
    this._num = Capsule.num;
    this.x = x1;
    this.y = y1;

    if (color) this.color = color;
    // for (var i = 0; i < this.COLORS.length; i++) {
    //   let symb = "#";
    //   let color = `${symb}${this.COLORS[i]}`;
    //   this.COLORS[i] = color;
    // }

    // Initialize the off-screen canvas and context
    // this.offscreenCanvas = document.createElement("canvas");
    // this.offscreenCtx = this.offscreenCanvas.getContext("2d");

    // // Set the dimensions of the off-screen canvas
    // // You may need to adjust these values based on your text size
    // this.offscreenCanvas.width = 50; // Adjust width as needed
    // this.offscreenCanvas.height = 50; // Adjust height as needed

    // this.drawText();
    this.label = label;
    this.reset();
  }

  label: string = "";

  resetColor() {
    this.color = Tools.randomElement(Capsule.COLORS);
  }

  public smoothedScale;
  public smoothedAlpha;
  public decayScale;
  public decayAlpha;
  public rotation;
  public energy = 0;

  reset() {
    this.level = 1 + Math.floor(Tools.random(4));
    this.scale = Tools.random(SCALE.MIN, SCALE.MAX);
    this.alpha = Tools.random(ALPHA.MIN, ALPHA.MAX);
    this.speed = Tools.random(SPEED.MIN, SPEED.MAX);
    if (!this.color) this.color = Tools.randomElement(Capsule.COLORS);
    this.size = Tools.random(SIZE.MIN, SIZE.MAX);
    this.spin = Tools.random(SPIN.MAX, SPIN.MAX);
    // this.band = Math.floor(Tools.random(NUM_BANDS));
    if (Tools.random() < 0.5) {
      this.spin = -this.spin;
    }
    this.smoothedScale = 0.0;
    this.smoothedAlpha = 0.0;
    this.decayScale = 0.0;
    this.decayAlpha = 0.0;
    this.rotation = Tools.random(Math.PI * 2);
    // this.energy = 1;
    this.energy = 0;
  }

  move() {
    this.rotation += this.spin;
    return (this.y -= (this.speed / 1.5) * this.level);
  }

  public transparencyMode: "CONTROLLED" | "DYNAMIC" = "DYNAMIC";
  public transparency: number = 0.5;

  draw(ctx) {
    var alpha, power, scale;
    power = Math.exp(this.energy);
    scale = this.scale * power;
    alpha = this.alpha * this.energy * 1.5;
    this.decayScale = Math.max(this.decayScale, scale);
    this.decayAlpha = Math.max(this.decayAlpha, alpha);
    this.smoothedScale += (this.decayScale - this.smoothedScale) * 0.3;
    this.smoothedAlpha += (this.decayAlpha - this.smoothedAlpha) * 0.3;
    this.decayScale *= 0.985;
    this.decayAlpha *= 0.975;
    ctx.save();
    ctx.beginPath();
    ctx.translate(this.x + Math.cos(this.rotation * this.speed) * 250, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(
      this.smoothedScale * (this.level / 2.5),
      this.smoothedScale * (this.level / 2.5)
    );
    ctx.moveTo(this.size * 0.5, 0);
    ctx.lineTo(this.size * -0.5, 0);
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    if (this.transparencyMode !== "CONTROLLED")
      ctx.globalAlpha = this.smoothedAlpha / this.level;
    // else ctx.globalAlpha = 1;
    // ctx.globalAlpha = this.smoothedAlpha / this.level;

    ctx.strokeStyle = this.hexToRgba(
      this.color,
      this.transparencyMode === "CONTROLLED"
        ? this.transparency
        : ctx.globalAlpha
    );
    // ctx.fillStyle = this.hexToRgba(this.color, .25);
    ctx.stroke();

    // // // Text rendering code starts here
    // ctx.font = ".5px Arial"; // Set the font size and font-family as you need
    // ctx.fillStyle = "#ffffff"; // Set the fill color for the text
    // ctx.textAlign = "center"; // Center align the text
    // ctx.textBaseline = "middle"; // Vertical alignment to middle
    // ctx.fillText(this.label === "" ? this._num : this.label, 0, 0); // Render the text in the middle of the capsule
    // ctx.drawImage(this.offscreenCanvas, 0, 0);

    return ctx.restore();
  }

  // drawText() {
  //   // Draw the text onto the off-screen canvas
  //   this.offscreenCtx.font = "20px Arial"; // Set the font size and style
  //   this.offscreenCtx.fillStyle = "#ffffff"; // Set the text color
  //   this.offscreenCtx.textAlign = "center";
  //   this.offscreenCtx.textBaseline = "middle";
  //   this.offscreenCtx.fillText(
  //     this._num.toString(),
  //     this.offscreenCanvas.width / 2,
  //     this.offscreenCanvas.height / 2
  //   );
  // }

  // // Add properties for the off-screen canvas and context
  // private offscreenCanvas: HTMLCanvasElement;
  // private offscreenCtx: CanvasRenderingContext2D;
}
