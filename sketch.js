let sistema;
let palabras = ["yo", "mirada", "reflejo", "presencia", "interior", "ella", "luz"];
let paleta = [];
let fuentes = [];
let baseSize = 900;
let escala = 1;

function preload() {
  fuentes.push(loadFont('assets/Parisienne-Regular.ttf'));
  fuentes.push(loadFont('assets/Gloock-Regular.ttf'));
  fuentes.push(loadFont('assets/DancingScript-Regular.ttf'));
  fuentes.push(loadFont('assets/GreatVibes-Regular.ttf'));
}

function setup() {
  let canvas = createCanvas(100, 100);
  canvas.parent('p5-container');

  setTimeout(() => {
    ajustarCanvas();
    iniciarSketch();
  }, 50);
}

function windowResized() {
  ajustarCanvas();
}

function ajustarCanvas() {
  let tam = min(windowWidth, windowHeight);
  resizeCanvas(tam, tam);
  escala = tam / baseSize;
}

function iniciarSketch() {
  textFont(fuentes[0]);

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
  if (!sistema) return;

  background(245, 240, 235, 20); // efecto de estela

  scale(escala);

  sistema.run();

  noFill();
  stroke(200, 100);
  strokeWeight(1);
  rectMode(CENTER);
  rect(baseSize / 2, baseSize / 2, 300, 400);
}

// ------------------ CLASES ------------------

class Particula {
  constructor(generarTexto) {
    let side = floor(random(4));
    let x, y;
    let w = 300, h = 400;
    if (side === 0) {
      x = random(baseSize / 2 - w / 2, baseSize / 2 + w / 2);
      y = baseSize / 2 - h / 2;
    } else if (side === 1) {
      x = random(baseSize / 2 - w / 2, baseSize / 2 + w / 2);
      y = baseSize / 2 + h / 2;
    } else if (side === 2) {
      x = baseSize / 2 - w / 2;
      y = random(baseSize / 2 - h / 2, baseSize / 2 + h / 2);
    } else {
      x = baseSize / 2 + w / 2;
      y = random(baseSize / 2 - h / 2, baseSize / 2 + h / 2);
    }

    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(0.3, 1));
    this.acc = createVector(0, 0);
    this.lifespan = 255;
    this.tam = random(2, 6);
    this.esTexto = generarTexto && random(1) < 0.15;
    this.dejaEstela = random(1) < 0.1;
    this.color = random(paleta);

    if (this.esTexto) {
      this.texto = random(palabras);
      this.tam = random(18, 28);
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

    let mouseXCorr = mouseX / escala;
    let mouseYCorr = mouseY / escala;

    let fueraDelMarco = mouseXCorr < baseSize / 2 - 150 || mouseXCorr > baseSize / 2 + 150 ||
                        mouseYCorr < baseSize / 2 - 200 || mouseYCorr > baseSize / 2 + 200;

    if (this.dejaEstela && !this.esTexto && fueraDelMarco) {
      noStroke();
      fill(red(this.color), green(this.color), blue(this.color), 1.5);
      ellipse(this.pos.x, this.pos.y, this.tam, this.tam);
    }
  }

  mostrar() {
    noStroke();
    fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.lifespan);
    if (this.esTexto) {
      textFont(this.fuente);
      textSize(this.tam);
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
    this.framesDesdeInicio = 0;
  }

  addParticula() {
    if (this.framesDesdeInicio < 5) return;
    if (width < 100 || height < 100) return;

    let mouseXCorr = mouseX / escala;
    let mouseYCorr = mouseY / escala;

    let dentro =
      mouseXCorr > baseSize / 2 - 150 &&
      mouseXCorr < baseSize / 2 + 150 &&
      mouseYCorr > baseSize / 2 - 200 &&
      mouseYCorr < baseSize / 2 + 200;

    this.particulas.push(new Particula(dentro));
  }

  run() {
    this.framesDesdeInicio++;

    this.addParticula();

    let mouseXCorr = mouseX / escala;
    let mouseYCorr = mouseY / escala;

    let dentro =
      mouseXCorr > baseSize / 2 - 150 &&
      mouseXCorr < baseSize / 2 + 150 &&
      mouseYCorr > baseSize / 2 - 200 &&
      mouseYCorr < baseSize / 2 + 200;

    for (let i = this.particulas.length - 1; i >= 0; i--) {
      let p = this.particulas[i];

      if (dentro) {
        let objetivo = createVector(mouseXCorr, mouseYCorr);
        let dir = p5.Vector.sub(objetivo, p.pos);
        dir.setMag(0.02);
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



