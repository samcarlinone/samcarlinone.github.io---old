const tree = '♣';
const fireChar = '✶';
const fireColor = '#EC4E20';
const fire = `<span style="color:${fireColor}">${fireChar}</span>`;
const ashChar = '▪';
const ash = [
  `<span style="color:${fireColor}">${ashChar}</span>`,
  `<span style="color:#575757">${ashChar}</span>`,
  `<span style="color:#868686">${ashChar}</span>`
];

let trees, spans, forest;
let update;

window.onload = function() {
  beginSim();
}

window.onresize = function() {
  beginSim();
}

function beginSim() {
  window.clearInterval(update);

  if(window.innerWidth < window.innerHeight)
    return;

  trees = document.querySelector("#trees");

  forest = new ForestWorld(10, 10);

  trees.innerHTML = printSpans(forest.getMap());

  let testSpan = trees.children[0].style.display = 'inline';
  let bounds = trees.children[0].getBoundingClientRect();
  let charSize = [bounds.width / 10, bounds.height];

  forest = new ForestWorld(Math.ceil(window.innerWidth / charSize[0]), Math.ceil(window.innerHeight / charSize[1]));
  forest.getMap().set(Math.ceil(window.innerWidth / charSize[0] / 2), Math.ceil(window.innerHeight / charSize[1] / 2), tree);

  trees.innerHTML = printSpans(forest.getMap());

  update = window.setInterval(updateFunc, 1000);
}

window.onblur = function() {
  window.clearInterval(update);
  update = "paused";
}

window.onfocus = function() {
  if(update === "paused" || update === -1)
    update = window.setInterval(updateFunc, 1000);
}

function updateFunc() {
  let start = performance.now();

  forest.step();
  trees.innerHTML = printSpans(forest.getMap());

  let timeTaken = performance.now() - start;
  if(timeTaken > 45 || window.innerWidth < window.innerHeight) {
    window.clearInterval(update);
    update = -1;
    trees.innerHTML = '';
  }
}

function printSpans(StringMap) {
  let val = '';

  for(let y=0; y<StringMap.height; y++) {
    val += '<span>';

    for(let x=0; x<StringMap.width; x++)
      val += StringMap.get(x, y);

    val += '</span>';
  }

  return val
}

class ForestWorld {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.maps = [new StringMap(width, height), new StringMap(width, height)];
    this.cMap = 0;
  }

  getMap() {
    return this.maps[this.cMap];
  }

  step () {
    let oMap = this.maps[this.cMap];
    let nMap = this.maps[(this.cMap)? 0 : 1];

    for(let x=0; x<this.width; x++) {
      for(let y=0; y<this.height; y++) {
        let val = oMap.get(x, y);

        switch (val) {
            case tree:
              if(Math.random() < 0.0001)
                nMap.set(x, y, fire);
              else {
                nMap.set(x, y, tree);

                for(let dx=-1; dx<2; dx++)
                  for(let dy=-1; dy<2; dy++)
                    if(oMap.get(x+dx, y+dy) === fire) {
                      nMap.set(x, y, fire);
                      break;
                    }
              }

              break;
            case ' ':
              nMap.set(x, y, (Math.random() < 0.00005? tree : ' '));

              if(0 < x && x < this.width-1 && 0 < y && y < this.height-1) {
                let count = (oMap.get(x-1, y) === tree) + (oMap.get(x+1, y) === tree) + (oMap.get(x, y-1) === tree) + (oMap.get(x, y+1) === tree);
                if(count > 0) {
                  nMap.set(x, y, (Math.random() < 0.1 * (count+1)/2 ? tree : ' '));
                  break;
                }
              }

              break;
            case fire:
              nMap.set(x, y, ash[0]);
              break;
            case ash[0]:
              nMap.set(x, y, ash[1]);
              break;
            case ash[1]:
              nMap.set(x, y, ash[2]);
              break;
            case ash[2]:
              nMap.set(x, y, ' ');
              break;
        }
      }
    }

    this.cMap = (this.cMap)? 0 : 1;
  }
}

class StringMap {
  constructor(width, height, start = ' ') {
    this.width = width;
    this.height = height;
    this.data = new Array(width * height).fill(start);
  }

  get(x, y) {
    return this.data[this.index(x,y)];
  }

  set(x, y, val) {
    this.data[this.index(x, y)] = val;
  }

  index(x, y) {
    return y * this.width + x;
  }
}
