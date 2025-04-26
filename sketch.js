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
  createCanvas(225, 225); // canvas pequeño real
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

  scale(225 / 900); // Escala todo tu sistema

  sistema.run();

  noFill();
  stroke(200, 100);
  strokeWeight(1);
  rectMode(CENTER);
  rect(900 / 2, 900 / 2, 300, 400); // Siempre basado en 900
}

// ------------------ CLASES ------------------

class Particula {
  constructor(generarTexto) {
    let side = floor(random(4));
    let x, y;
    let w = 300, h = 400;
    if (side === 0) {
      x = random(900 / 2 - w / 2, 900 / 2 + w / 2);
      y = 900 / 2 - h / 2;
    } else if (side === 1) {
      x = random(900 / 2 - w / 2, 900 / 2 + w / 2);
      y = 900 / 2 + h / 2;
    } else if (side === 2) {
      x = 900 / 2 - w / 2;
      y = random(900 / 2 - h / 2, 900 / 2 + h / 2);
    } else {
      x = 900 / 2 + w / 2;
      y = random(900 / 2 - h / 2, 900 / 2 + h / 2);
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

    let fueraDelMarco = mouseX * (900 / 225) < 900 / 2 - 150 || mouseX * (900 / 225) > 900 / 2 + 150 ||
                        mouseY * (900 / 225) < 900 / 2 - 200 || mouseY * (900 / 225) > 900 / 2 + 200;

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

    let dentro =
      mouseX * (900 / 225) > 900 / 2 - 150 &&
      mouseX * (900 / 225) < 900 / 2 + 150 &&
      mouseY * (900 / 225) > 900 / 2 - 200 &&
      mouseY * (900 / 225) < 900 / 2 + 200;

    this.particulas.push(new Particula(dentro));
  }

  run() {
    this.framesDesdeInicio++;

    this.addParticula();

    let dentro =
      mouseX * (900 / 225) > 900 / 2 - 150 &&
      mouseX * (900 / 225) < 900 / 2 + 150 &&
      mouseY * (900 / 225) > 900 / 2 - 200 &&
      mouseY * (900 / 225) < 900 / 2 + 200;

    for (let i = this.particulas.length - 1; i >= 0; i--) {
      let p = this.particulas[i];

      if (dentro) {
        let objetivo = createVector(mouseX * (900 / 225), mouseY * (900 / 225));
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
