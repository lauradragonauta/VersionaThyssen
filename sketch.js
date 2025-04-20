/*
VERSIÓN INTERACTIVA PARA #VERSIONATHYSSEN — “El espejo psiqué” (Berthe Morisot)

Este proyecto es una reinterpretación interactiva del cuadro El espejo psiqué de Berthe Morisot, pensada para la edición XXII del concurso #VersionaThyssen. He decidido, así, convertirlo en algo más personal que también pudiera formar parte de mi portfolio.

Técnicamente, el sketch crea un sistema de partículas que nacen desde los bordes de un marco (que representa el espejo) y flotan libremente por la pantalla. Algunas de estas partículas son palabras poéticas elegidas al azar. Cuando el ratón entra en el marco (es decir, cuando el usuario “se asoma” al espejo), las partículas comienzan a seguir al cursor, y aparecen algunas de esas palabras flotando, como si fueran pensamientos.

Cuando el ratón está fuera del marco, las partículas ya no se sienten atraídas y algunas —de forma aleatoria— dejan estelas de color muy sutiles que permanecen en el lienzo. Para esto he usado createGraphics(), que me permite tener una capa extra donde puedo dibujar sin que se borre al refrescar el fondo. Así se va generando una especie de cuadro que se pinta solo cuando el espectador no está “mirando”.

A nivel de código:
- Uso clases (Particula y SistemaParticulas) para organizar mejor el comportamiento de cada elemento.
- Uso condiciones para diferenciar el comportamiento dentro y fuera del espejo.
- Las palabras están escritas en distintas fuentes tipográficas, que se asignan aleatoriamente para reforzar la idea de que cada pensamiento es único y que han sido elegidas basándome en el estilo impresionista.
- Los colores los he sacado directamente del cuadro (a través de un análisis de imagen) y los he distribuido en función de su proporción visual real: los más comunes aparecen más, y los colores más intensos como el negro o el granate, menos.

Referencias externas que consulté y que me ayudaron a resolver algunas partes que no estaban explicadas en clase:
· createGraphics() para dibujar capas permanentes: https://p5js.org/reference/#/p5/createGraphics
· Un ejemplo de partículas con blending que me sirvió de inspiración visual: https://editor.p5js.org/abeatrize/sketches/r1aMl_7Mb
· Herramienta para extraer paletas de color desde una imagen: https://lospec.com/palette-list

*/

/*
CONCEPTO: RECONSTRUIR EL REFLEJO

El espejo psiqué (1876) de Berthe Morisot es una pintura intimista, suave y etérea, en la que una figura femenina se muestra de espaldas, reflejada en un espejo de cuerpo entero. Es una escena que habla de la intimidad, de la contemplación y del acto de mirarse a una misma desde fuera. Su atmósfera tenue, los tonos empolvados y la pincelada vaporosa son elementos que me resultaron muy sugerentes desde el primer momento.

De entre las obras propuestas por el concurso #VersionaThyssen, elegí esta porque sentí que tenía muchas posibilidades desde lo conceptual, pero también desde lo visual y lo emocional. Me permitía trabajar una interacción delicada, con un ritmo pausado, donde las decisiones técnicas pudieran convertirse en metáforas: movimiento, ausencia, presencia, reflejo... Además, encajaba muy bien con mi forma de trabajar desde lo visual y con la idea de crear una pieza que pudiera formar parte también de mi portfolio artístico.

En el cuadro original vemos a una mujer de espaldas mirándose al espejo. En esta versión he querido invertir esa perspectiva: ahora somos nosotros quienes nos colocamos frente al espejo, y al hacerlo, el código reacciona. Cuando el ratón entra en el marco, las partículas se activan y empiezan a girar alrededor del cursor, como si reflejaran nuestros pensamientos más íntimos.

Las palabras que aparecen (“yo”, “reflejo”, “ella”, “presencia”...) están pensadas como fragmentos de identidad, pensamientos breves o susurros. No se ven siempre, solo cuando nos “acercamos” a ese reflejo, lo que me parecía una metáfora bonita de lo que pasa cuando realmente paramos a mirarnos por dentro.

Los colores son los del cuadro, pero los he organizado según cuánto aparecen en la obra: los grises y beiges son los más frecuentes, y los más intensos solo aparecen de forma sutil, como ocurre también en la pintura original. Quería que el conjunto mantuviera esa atmósfera suave y etérea.

Además, cuando el ratón no está en el espejo, algunas partículas dejan pequeñas estelas, como pinceladas digitales. Esto hace que el lienzo se vaya “pintando” de forma autónoma, como si el recuerdo de lo que ha pasado se quedara suspendido. Me gustaba esa idea de que hay una parte que sucede sin que la controlemos, como una huella silenciosa. Además, esas estelas forman trazos que evocan a los de la técnica impresionista que el autor utiliza en el propio cuadro.

En conjunto, la pieza habla de la relación entre identidad, memoria y mirada. Y aunque parte de una obra concreta, lo que he intentado es abrir un espacio íntimo, calmado y sensible, donde la tecnología no distrae, sino que acompaña.

*/

let sistema;
let palabras = ["yo", "mirada", "reflejo", "presencia", "interior", "ella", "luz"];
let paleta = [];
let fuentes = [];
let estelas;

function preload() {
  fuentes.push(loadFont('assets/Parisienne-Regular.ttf'));
  fuentes.push(loadFont('assets/Gloock-Regular.ttf'));
  fuentes.push(loadFont('assets/DancingScript-Regular.ttf'));
  fuentes.push(loadFont('assets/GreatVibes-Regular.ttf'));
}

function setup() {
  window.onload = () => {
    requestAnimationFrame(() => {
      const container = document.getElementById('p5-container');
      const w = container.offsetWidth;
      const h = container.offsetHeight;

      let canvas = createCanvas(w, h);
      canvas.parent('p5-container');
      estelas = createGraphics(w, h);
      iniciarSketch();
    });
  };
}

function windowResized() {
  const container = document.getElementById('p5-container');
  const w = container.offsetWidth;
  const h = container.offsetHeight;

  if (w > 0 && h > 0) {
    resizeCanvas(w, h);
    estelas = createGraphics(w, h);
  }
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
  image(estelas, 0, 0);
  sistema.run();

  noFill();
  stroke(200, 100);
  strokeWeight(1);
  rectMode(CENTER);
  rect(width / 2, height / 2, 300, 400);
}

// ------------------ CLASES ------------------

class Particula {
  constructor(generarTexto) {
    let side = floor(random(4));
    let x, y;
    let w = 300, h = 400;
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

    let fueraDelMarco = mouseX < width / 2 - 150 || mouseX > width / 2 + 150 ||
                        mouseY < height / 2 - 200 || mouseY > height / 2 + 200;

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
  }

  addParticula() {
    let dentro =
      mouseX > width / 2 - 150 &&
      mouseX < width / 2 + 150 &&
      mouseY > height / 2 - 200 &&
      mouseY < height / 2 + 200;

    this.particulas.push(new Particula(dentro));
  }

  run() {
    this.addParticula();

    let dentro =
      mouseX > width / 2 - 150 &&
      mouseX < width / 2 + 150 &&
      mouseY > height / 2 - 200 &&
      mouseY < height / 2 + 200;

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





/* Para la parte de los colores, he utilizado chat gpt finalmente para que me diga el porcentaje de ellos:

Hola, para mi clase de algoritmia y programación creativa estoy haciendo un sistema de partículas que reinterpreta de forma conceptual este cuadro https://www.museothyssen.org/sites/default/files/imagen/obras/1977.87_espejo-psique.jpg que forma parte de la nueva convocatoria de https://www.museothyssen.org/actividades/versionathyssen-xxii
Necesito que analices los colores del cuadro y me saques porcentajes de cada uno de ellos, para que yo pueda hacer una paleta de colores que lo represente. Necesito que los distingas entre let dominantes , secundarios y acentos, creando arrays para p5js

Perfecto, aquí tienes la paleta de colores del cuadro El espejo psiqué de Berthe Morisot dividida en tres categorías según tu formato para p5.js:

let dominantes = [
  [232, 212, 200], // beige rosado claro
  [243, 238, 230], // crema suave
  [202, 183, 170], // piel cálida
  [214, 194, 184], // tono base rosado
  [180, 180, 180], // gris neutro claro
  [255, 255, 255]  // blanco de luz
];

let secundarios = [
  [98, 89, 88],   // marrón oscuro (marco)
  [160, 130, 128], // sombras rosadas
  [172, 158, 155], // sombra neutra
  [132, 111, 111], // marrón rojizo
  [200, 175, 160], // beige oscuro
  [134, 144, 156]  // azul grisáceo del vestido
];

let acentos = [
  [80, 64, 66],   // sombras profundas / contraste
  [0, 0, 0],      // contornos / ojos / marco interior
  [190, 190, 190] // gris medio para transiciones o fondos
];

*/
