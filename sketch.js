let sistema;
let palabras = ["yo", "mirada", "reflejo", "presencia", "interior", "ella", "luz"];
let paleta = [];
let fuentes = [];
let estelas;

// NUEVO: Variables para guardar una posición segura del ratón
let ratonActivo = false;
let ratonSeguro = { x: 0, y: 0 };

function preload() {
  fuentes.push(loadFont('assets/Parisienne-Regular.ttf'));
  fuentes.push(loadFont('assets/Gloock-Regular.ttf'));
  fuentes.push(loadFont('assets/DancingScript-Regular.ttf'));
  fuentes.push(loadFont('assets/GreatVibes-Regular.ttf'));
}

function setup() {
  const container = document.getElementById('p5-container');
  const w = container.offsetWidth;
  const h = container.offsetHeight;

  let canvas = createCanvas(w, h);
  canvas.parent('p5-container');
  estelas = createGraphics(w, h);
  
  // Inicializamos la posición segura al centro
  ratonSeguro.x = width / 2;
  ratonSeguro.y = height / 2;

  iniciarSketch();
}

function windowResized() {
  const container = document.getElementById('p5-container');
  const w = container.offsetWidth;
  const h = container.offsetHeight;

  resizeCanvas(w, h);
  estelas = createGraphics(w, h);
}

function iniciarSketch() {
  textFont(fuentes[0]);
  text('Parisienne-Regular', 50, 100);
  textFont(fuentes[1]);
  text('Gloock-Regular', 50, 170);
  textFont(fuentes[2]);
  text('DancingScript-Regular', 50, 240);
  textFont(fuentes[3]);
  text('GreatVibes-Regular', 50, 310);

  let dominantes = [
    [232, 212, 200],
    [243, 238, 230],
    [202, 183, 170],
    [214, 194, 184],
    [180, 180, 180],
    [255, 255, 255]
  ];

  let secundarios = [
    [98, 89, 88],
    [160, 130, 128],
    [172, 158, 155],
    [132, 111, 111],
    [200, 175, 160],
    [134, 144, 156]
  ];

  let acentos = [
    [80, 64, 66],
    [0, 0, 0],
    [190, 190, 190]
  ];

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      paleta.push(color(...dominantes[i]));
    }
  }
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 3; j++) {
      paleta.push(color(...secundarios[i]));
    }
  }
  for (let i = 0; i < 3; i++) {
    paleta.push(color(...acentos[i]));
  }

  sistema = new SistemaParticulas();
}

function draw() {
  if (!sistema || !estelas) return;

  background(245, 240, 235, 20);

  let escalar = width < 800;

  if (escalar) {
    push();
    scale(0.5);
    translate(200, 200);
  }

  image(estelas, 0, 0);

  sistema.run();

  noFill();
  stroke(200, 100);
  strokeWeight(1.5);
  rectMode(CENTER);
  rect(width / 2, height / 2, 450, 600);

  if (escalar) {
    pop();
  }
}

function mouseMoved() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    ratonActivo = true;
    ratonSeguro.x = mouseX;
    ratonSeguro.y = mouseY;
  }
}

// ------------------ CLASES ------------------

class Particula {
  constructor(generarTexto) {
    let side = floor(random(4));
    let x, y;
    let w = 450, h = 600;
    if (side === 0) {
      x = random(width / 2 - w / 2, width / 2 + w / 2);
      y = height / 2 - h / 2;
    } else if (side === 1) {
      x = random(width / 2 - w / 2, width / 2 + w / 2);
      y = height / 2 + h / 2;
    } else if (side === 2) {
      x = width / 2 - w / 2;
      y = random(height / 2 - h / 2, height / 2 + h / 2);
    } else {
      x = width / 2 + w / 2;
      y = random(height / 2 - h / 2, height / 2 + h / 2);
    }

    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(0.3, 0.8));
    this.acc = createVector(0, 0);
    this.lifespan = 255;
    this.tam = random(4, 10);
    this.esTexto = generarTexto && random(1) < 0.15;
    this.dejaEstela = random(1) < 0.15;
    this.color = random(paleta);

    if (this.esTexto) {
      this.texto = random(palabras);
      this.tamTexto = random(24, 36);
      this.fuente = random(fuentes);
    }
  }

  aplicarFuerza(f) {
    this.acc.add(f);
  }

  actualizar() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.lifespan -= 2;

    let fueraDelMarco = ratonSeguro.x < width / 2 - 225 || ratonSeguro.x > width / 2 + 225 ||
                        ratonSeguro.y < height / 2 - 300 || ratonSeguro.y > height / 2 + 300;

    if (this.dejaEstela && !this.esTexto && fueraDelMarco) {
      estelas.noStroke();
      estelas.fill(red(this.color), green(this.color), blue(this.color), 1.5);
      estelas.ellipse(this.pos.x, this.pos.y, this.tam, this.tam);
    }
  }

  mostrar() {
    noStroke();
    fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.lifespan);
    if (this.esTexto) {
      textFont(this.fuente);
      textSize(this.tamTexto);
      textAlign(CENTER, CENTER);
      text(this.texto, this.pos.x, this.pos.y);
    } else {
      ellipse(this.pos.x, this.pos.y, this.tam);
    }
  }

  estaMuerta() {
    return this.lifespan < 0;
  }
}

class SistemaParticulas {
  constructor() {
    this.particulas = [];
  }

  addParticula() {
    // Siempre generar una nueva partícula
    let dentro =
      ratonSeguro.x > width / 2 - 225 &&
      ratonSeguro.x < width / 2 + 225 &&
      ratonSeguro.y > height / 2 - 300 &&
      ratonSeguro.y < height / 2 + 300;

    this.particulas.push(new Particula(dentro));
  }

  run() {
    this.addParticula();

    let dentro =
      ratonSeguro.x > width / 2 - 225 &&
      ratonSeguro.x < width / 2 + 225 &&
      ratonSeguro.y > height / 2 - 300 &&
      ratonSeguro.y < height / 2 + 300;

    for (let i = this.particulas.length - 1; i >= 0; i--) {
      let p = this.particulas[i];

      if (dentro) {
        let objetivo = createVector(ratonSeguro.x, ratonSeguro.y);
        let dir = p5.Vector.sub(objetivo, p.pos);
        dir.setMag(0.015);
        p.aplicarFuerza(dir);
      }

      p.actualizar();
      p.mostrar();

      if (p.estaMuerta()) {
        this.particulas.splice(i, 1);
      }
    }
  }
}




