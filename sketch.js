// --- GLOBAL CONTROL VARIABLES ---
let emotionSlider;
let emotionLabel; // To show the name of the emotion
let previousEmotion = 0; 

// These will hold our emotion "objects"
let joy;
let sadness;
let anger;

// --- MAIN SETUP & DRAW ---

function setup() {
  createCanvas(800, 600); // <-- UPDATED to fixed size
  
  emotionSlider = createSlider(0, 2, 0, 1);
  emotionLabel = select('#emotion-label'); 

  joy = new Joy();
  sadness = new Sadness();
  anger = new Anger();
  
  // Call the setup for the first emotion
  joy.setup();
}

function draw() {
  let currentEmotion = emotionSlider.value();

  // Check if the emotion has changed
  if (currentEmotion !== previousEmotion) {
    // Call the setup function for the NEW emotion
    if (currentEmotion === 0) {
      joy.setup();
    } else if (currentEmotion === 1) {
      sadness.setup();
    } else if (currentEmotion === 2) {
      anger.setup();
    }
    // Update the previous emotion
    previousEmotion = currentEmotion;
  }

  // This part runs every frame to draw the active emotion
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
  resizeCanvas(800, 600); // <-- UPDATED to fixed size
  
  // Tell emotions to handle resize (e.g., recalculate grid)
  joy.onResize();
  sadness.onResize();
  anger.onResize();
  
  // Redraw the background of the *current* emotion immediately
  let currentEmotion = emotionSlider.value();
  if (currentEmotion === 0) background(joy.backgroundColor);
  if (currentEmotion === 1) background(sadness.backgroundColor);
  if (currentEmotion === 2) background(anger.backgroundColor);
}


// JOY 

class Joy {
  constructor() {
    this.bouncers = [];
    this.backgroundColor = '#FFF8E1'; // Bright, pale yellow
  }
  
  setup() {
    background(this.backgroundColor);
    // bouncers
    this.bouncers = [];
    // Create 40  bouncer objects
    for (let i = 0; i < 40; i++) {
      this.bouncers.push(new Bouncer(random(width), random(height)));
    }
  }

  draw() {
    background(this.backgroundColor); // Redraw background every frame
    // Update and display every bouncer
    for (let b of this.bouncers) {
      b.update();
      b.display();
    }
  }
  
  onResize() {
    
    // filter bouncers if they somehow get outside the canvas area
    this.bouncers = this.bouncers.filter(b => b.x < width && b.y < height && b.x > 0 && b.y > 0);
  }
}

// This class defines what a "Bouncer" is
class Bouncer {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-2, -4); // Horizontal velocity (always moves left)
    this.vy = random(-2, 4); // Vertical velocity
    this.radius = random(5, 30);
    this.color = color(random(['#FFD70060', '#FFB30050', '#FF8F0080', '#f2f02b70'])); 
    // Warm colours, Glows, Golds and oranges
    // Varying opacity so colours combine when cross path
  }
  
  update() {
    // Move the bouncer
    this.x += this.vx;
    this.y += this.vy;
    
    // Check for collision with walls and reverse direction
    if (this.x - this.radius < 0 || this.x + this.radius > width) {
      this.vx *= -1;
    }
    if (this.y - this.radius < 0 || this.y + this.radius > height) {
      this.vy *= -1; // Fixed the space
    }
  }
  
  display() {
    fill(this.color);
    noStroke();
    ellipse(this.x, this.y, this.radius * 4); // Draws ellipse larger
  }
}

//SADNESS 
class Sadness {
  constructor() {
    this.lines = [];
    this.lineCount = 160;
    this.collectedWeight = 0;
    this.maxWeight = 10;
    this.backgroundColor = '#345369';
    this.mainLineColor = '#b4def6';
    this.subtleLineColor = '#506d7f';
    this.accumulatedColor = '#34536950';
  }
  
  setup() {
    background(this.backgroundColor);
    strokeCap(ROUND);
    if (this.lines.length === 0) {
      for (let i = 0; i < this.lineCount; i++) {
        this.lines.push(new SadLine(random(width), random(-height, height), this));
      }
    }
    this.collectedWeight = 0; 
  }

  draw() {
    fill(red(this.backgroundColor), green(this.backgroundColor), blue(this.backgroundColor), 10);
    rect(0, 0, width, height);

    fill(this.accumulatedColor);
    noStroke();
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
    if (this.collectedWeight < this.maxWeight) {
      this.collectedWeight += 0.01;
    }
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


// ANGER 
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

        rectMode(CENTER);
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