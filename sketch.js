let sistema;
let palabras = ["yo", "mirada", "reflejo", "presencia", "interior", "ella", "luz"];
let paleta = [];
let fuentes = [];

function preload() {
  fuentes.push(loadFont('assets/Parisienne-Regular.ttf'));
  fuentes.push(loadFont('assets/Gloock-Regular.ttf'));
  fuentes.push(loadFont('assets/DancingScript-Regular.ttf'));
  fuentes.push(loadFont('assets/GreatVibes-Regular.ttf'));
}

function setup() {
  let canvas = createCanvas(225, 225);
  canvas.parent('p5-container');
  sistema = new SistemaParticulas();

  textFont(fuentes[0]);

  let dominantes = [
    [232, 212, 200], [243, 238, 230], [202, 183, 170],
    [214, 194, 184], [180, 180, 180], [255, 255, 255]
  ];
  let secundarios = [
    [98, 89, 88], [160, 130, 128], [172, 158, 155],
    [132, 111, 111], [200, 175, 160], [134, 144, 156]
  ];
  let acentos = [
    [80, 64, 66], [0, 0, 0], [190, 190, 190]
  ];

  for (let i = 0; i < dominantes.length; i++) {
    for (let j = 0; j < 6; j++) {
      paleta.push(color(...dominantes[i]));
    }
  }
  for (let i = 0; i < secundarios.length; i++) {
    for (let j = 0; j < 3; j++) {
      paleta.push(color(...secundarios[i]));
    }
  }
  for (let i = 0; i < acentos.length; i++) {
    paleta.push(color(...acentos[i]));
  }
}

function draw() {
  background(245, 240, 235, 20);

  sistema.run();

  noFill();
  stroke(200, 100);
  strokeWeight(1); // más visible
  rectMode(CENTER);
  rect(width / 2, height / 2, 150, 200); // marco más grande
}

// ------------------ CLASES ------------------

class Particula {
  constructor(generarTexto) {
    let side = floor(random(4));
    let x, y;
    let w = 150, h = 200;
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
    this.vel = p5.Vector.random2D().mult(random(0.3, 1));
    this.acc = createVector(0, 0);
    this.lifespan = 255;
    this.tam = random(3, 6); // partículas más grandes
    this.esTexto = generarTexto && random(1) < 0.2;
    this.dejaEstela = random(1) < 0.15;
    this.color = random(paleta);

    if (this.esTexto) {
      this.texto = random(palabras);
      this.tamTexto = random(12, 18); // textos más grandes
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

    let fueraDelMarco = mouseX < width / 2 - 75 || mouseX > width / 2 + 75 ||
                        mouseY < height / 2 - 100 || mouseY > height / 2 + 100;

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
    this.framesDesdeInicio = 0;
  }

  addParticula() {
    if (this.framesDesdeInicio < 5) return;

    let dentro =
      mouseX > width / 2 - 75 &&
      mouseX < width / 2 + 75 &&
      mouseY > height / 2 - 100 &&
      mouseY < height / 2 + 100;

    this.particulas.push(new Particula(dentro));
  }

  run() {
    this.framesDesdeInicio++;

    this.addParticula();

    let dentro =
      mouseX > width / 2 - 75 &&
      mouseX < width / 2 + 75 &&
      mouseY > height / 2 - 100 &&
      mouseY < height / 2 + 100;

    for (let i = this.particulas.length - 1; i >= 0; i--) {
      let p = this.particulas[i];

      if (dentro) {
        let objetivo = createVector(mouseX, mouseY);
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
