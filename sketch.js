// --- GLOBAL CONTROL VARIABLES ---
let emotionSlider;
let emotionLabel; 
let previousEmotion = 0; 

let joy;
let sadness;
let anger;

// --- MAIN SETUP & DRAW ---

function setup() {
  createCanvas(800, 600); 
  
  emotionSlider = createSlider(0, 2, 0, 1);
  emotionLabel = select('#emotion-label'); 

  joy = new Joy();
  sadness = new Sadness();
  anger = new Anger();
  
  // Call the setup for the first emotion
  joy.setup();
  
  // --- ADDED ---
  // Set the *initial* body background to match Joy
  select('body').style('background-color', joy.backgroundColor)
                .style('color', '#333333');
}

function draw() {
  let currentEmotion = emotionSlider.value();

  if (currentEmotion !== previousEmotion) {
    if (currentEmotion === 0) {
      joy.setup();
      // --- UPDATED ---
      select('body').style('color', '#333333')
                    .style('background-color', joy.backgroundColor);
    } else if (currentEmotion === 1) {
      sadness.setup();
      // --- UPDATED ---
      select('body').style('color', '#E0E0E0')
                    .style('background-color', sadness.backgroundColor);
    } else if (currentEmotion === 2) {
      anger.setup();
      // --- UPDATED ---
      select('body').style('color', '#E0E0E0')
                    .style('background-color', anger.backgroundColor);
    }
    previousEmotion = currentEmotion;
  }

  // Draw the active emotion
  if (currentEmotion === 0) {
    joy.draw();
    emotionLabel.html('Joy');
  } else if (currentEmotion === 1) {
    sadness.draw();
    emotionLabel.html('Sadness');
  } else if (currentEmotion === 2) {
    anger.draw();
    emotionLabel.html('Anger');
  }
}

function windowResized() {
  // (This function remains unchanged, but is needed for the sketch)
  resizeCanvas(800, 600); 
  joy.onResize();
  sadness.onResize();
  anger.onResize();
  
  let currentEmotion = emotionSlider.value();
  if (currentEmotion === 0) background(joy.backgroundColor);
  if (currentEmotion === 1) background(sadness.backgroundColor);
  if (currentEmotion === 2) background(anger.backgroundColor);
}

// ===================================================================
// CLASS 0: JOY (Unchanged)
// ===================================================================
class Joy {
  constructor() {
    this.bouncers = [];
    this.backgroundColor = '#FFF8E1'; 
  }
  setup() {
    background(this.backgroundColor);
    rectMode(CORNER); 
    this.bouncers = [];
    for (let i = 0; i < 40; i++) {
      this.bouncers.push(new Bouncer(random(width), random(height)));
    }
  }
  draw() {
    background(this.backgroundColor); 
    for (let b of this.bouncers) {
      b.update();
      b.display();
    }
  }
  onResize() {
    this.bouncers = this.bouncers.filter(b => b.x < width && b.y < height && b.x > 0 && b.y > 0);
  }
}
class Bouncer {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-2, -4); 
    this.vy = random(-2, 4); 
    this.radius = random(5, 30);
    this.color = color(random(['#FFD70060', '#FFB30050', '#FF8F0080', '#f2f02b70'])); 
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x - this.radius < 0 || this.x + this.radius > width) this.vx *= -1;
    if (this.y - this.radius < 0 || this.y + this.radius > height) this.vy *= -1; 
  }
  display() {
    fill(this.color);
    noStroke();
    ellipse(this.x, this.y, this.radius * 4); 
  }
}

// ===================================================================
// CLASS 1: SADNESS (Unchanged)
// ===================================================================
class Sadness {
  constructor() {
    this.lines = [];
    this.lineCount = 160;
    this.collectedWeight = 0;
    this.maxWeight = 10;
    
    // --- HERE IS THE NEW "SADDER" BLUE PALETTE ---
    this.backgroundColor = '#2B3A4F'; // A deep, dark blue-grey
    this.mainLineColor = '#b4def6';   // The light blue lines (unchanged)
    this.subtleLineColor = '#4A6A8C'; // A new mid-tone blue-grey (less green)
    this.accumulatedColor = '#2B3A4F50'; // Match alpha of new background
  }
  
  
  setup() {
    background(this.backgroundColor);
    strokeCap(ROUND);
    rectMode(CORNER); 
    if (this.lines.length === 0) {
      for (let i = 0; i < this.lineCount; i++) {
        this.lines.push(new SadLine(random(width), random(-height, height), this));
      }
    }
    this.collectedWeight = 0; 
  }
  draw() {
    noStroke();
    fill(red(this.backgroundColor), green(this.backgroundColor), blue(this.backgroundColor), 10);
    rect(0, 0, width, height);
    fill(this.accumulatedColor);
    rect(0, height - this.collectedWeight, width, this.collectedWeight);
    for (let i = 0; i < this.collectedWeight; i++) {
      let alpha = map(i, 0, this.collectedWeight, 0, 100);
      fill(red(this.subtleLineColor), green(this.subtleLineColor), blue(this.subtleLineColor), alpha);
      rect(0, height - i, width, 1);
    }
    for (let i = 0; i < this.lines.length; i++) {
      this.lines[i].droop();
      this.lines[i].display();
      this.lines[i].checkBoundaries();
    }
    if (this.collectedWeight < this.maxWeight) this.collectedWeight += 0.01;
  }
  onResize() {
    for (let line of this.lines) {
      if (line.x > width) line.x = random(width);
    }
  }
}
class SadLine {
  constructor(x, y, parent) {
    this.x = x;
    this.y = y;
    this.parent = parent;
    this.len = random(50, 150);
    this.thickness = random(1, 4);
    this.droopSpeed = random(0.05, 0.15);
    this.color = random() > 0.8 ? this.parent.mainLineColor : this.parent.subtleLineColor;
    this.driftX = random(-0.2, 0.2);
    this.currentAngle = PI / 2 + random(-0.2, 0.2);
  }
  droop() {
    this.y += this.droopSpeed;
    this.currentAngle = lerp(this.currentAngle, PI / 2 + sin(frameCount * 0.05 + this.x * 0.01) * 0.1, 0.05);
    this.x += this.driftX * noise(this.y * 0.5, frameCount * 0.001);
  }
  display() {
    stroke(this.color);
    strokeWeight(this.thickness);
    let x2 = this.x + cos(this.currentAngle) * this.len;
    let y2 = this.y + sin(this.currentAngle) * this.len;
    line(this.x, this.y, x2, y2);
  }
  checkBoundaries() {
    if (this.y > height + 50) {
      this.y = random(-100, -50);
      this.x = random(width);
      this.thickness = random(1, 4);
      this.len = random(50, 150);
      this.color = random() > 0.8 ? this.parent.mainLineColor : this.parent.subtleLineColor;
      this.currentAngle = PI / 2 + random(-0.2, 0.2);
    }
  }
}

// ===================================================================
// CLASS 2: ANGER (Unchanged)
// ===================================================================
class Anger {
  constructor() {
    this.cellSize = 30;
    this.noiseScale = 0.03;
    this.colorPrimary = '#E00000';
    this.colorSecondary = '#222222';
    this.colorAccent = '#FFD700';
    this.backgroundColor = '#000000';
    this.backgroundFadeColor = '#0A0A0A50';
    this.colors = [color(this.colorPrimary), color(this.colorSecondary), color(this.colorAccent)];
    this.cols = floor(width / this.cellSize);
    this.rows = floor(height / this.cellSize);
  }
  setup() {
    background(this.backgroundColor);
    noStroke();
    rectMode(CENTER); 
  }
  draw() {
    background(this.backgroundFadeColor);
    let aggressionLevel = map(mouseX, 0, width, 0.01, 0.1);
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        let x = i * this.cellSize + this.cellSize / 2;
        let y = j * this.cellSize + this.cellSize / 2;
        push();
        translate(x, y);
        let noiseVal = noise(x * this.noiseScale, y * this.noiseScale, frameCount * aggressionLevel);
        let maxRotation = TWO_PI / 2.5;
        let rotationAmount = map(noiseVal, 0, 1, -maxRotation, maxRotation);
        rotate(rotationAmount);
        let colorIndex = floor(map(noiseVal, 0, 1, 0, this.colors.length));
        fill(this.colors[colorIndex]);
        let rectSize = this.cellSize * map(noise(x * 0.005, y * 0.005), 0, 1, 0.7, 0.9);
        rect(0, 0, rectSize, rectSize);
        pop();
      }
    }
  }
  onResize() {
    this.cols = floor(width / this.cellSize);
    this.rows = floor(height / this.cellSize);
  }
}