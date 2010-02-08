function toJSON(data){
  if (data === undefined) return;
  if (data === null) return "null";
  var type = typeof data;
  if (type == 'number' || type == 'boolean') {
    return data.toString();
  } else if (type == 'function' || type == 'unknown') {
    return;
  } else if (type == 'string' || data.constructor == String) {
    return '"' + data.replace(/\"|\n|\\/g, function(c){ return c == "\n" ? "\\n" : '\\' + c }) + '"';
  } else if (data.constructor == Date) {
    return 'new Date("' + data.toString() + '")';
  } else if (data.constructor == Array) {
    var items = [];
    for (var i = 0; i < data.length; i++) {
      var val = toJSON(data[i]);
      if (val != undefined)
          items.push(val);
    }
    return "[" + items.join(",") + "]";
  } else if (data.constructor == Object) {
    var props = [];
    for (var k in data) {
      var val = toJSON(data[k]);
      if (val != undefined)
          props.push(toJSON(k) + ":" + val);
    }
    return "{" + props.join(",") + "}";
  }
}

var KEY = {
  UP:    38, W: 87,
  DOWN:  40, S: 83,
  LEFT:  37, A: 65,
  RIGHT: 39, D: 68
}

function Stage(canvas, socket) {
  this.width = 256
  this.height = 256
  this.nodes = []
  this.socket = socket
  this.canvas = canvas
  this.fps = 12
  this.context = this.canvas.getContext('2d')
  var self = this
  socket.onmessage = function(evt) { self.onmessage(evt) }
  window.onkeydown = function(evt) { self.onkeydown(evt) }
  window.onkeyup = function(evt) { self.onkeyup(evt) }
}
Stage.prototype.add = function(node) {
  node.stage = this
  this.nodes.push(node)
}
Stage.prototype.draw = function() {
  for (var i = 0; i < this.nodes.length; i++) {
    this.nodes[i].draw()
  }
}
Stage.prototype.onkeydown = function(evt) {
  for (var i = 0; i < this.nodes.length; i++) {
    this.nodes[i].onkeydown(evt)
  }
}
Stage.prototype.onkeyup = function(evt) {
  for (var i = 0; i < this.nodes.length; i++) {
    this.nodes[i].onkeyup(evt)
  }
}
Stage.prototype.run = function() {
  var self = this
  window.setInterval(function(){
    self.onenterframe()
  }, 1000 / this.fps)
}
Stage.prototype.onenterframe = function() {
  this.socket.send('refresh')
  for (var i = 0; i < this.nodes.length; i++) {
    this.nodes[i].onenterframe()
  }
}
Stage.prototype.onmessage = function(evt) {
  var entries = eval("("+evt.data+")")
//  console.log('entries: %o: ', entries)

  for (var entry_id in entries) {
    var entry = entries[entry_id]
    var equal = false

    for (var node_id in this.nodes) {
      var node = this.nodes[node_id]

      if (entry_id == node.uid) {
        node.uid = entry.uid
        node.dir = entry.dir
        node.x   = entry.x
        node.y   = entry.y
        equal = true
      }
    }

    if (equal == false) {
      var character = new Character
      character.uid = entry.uid
      character.dir = entry.dir
      character.x   = entry.x
      character.y   = entry.y
      this.add(character)
    }
  }

//  console.log('nodes: %o: ', this.nodes)
}

function Sprite() {
  this.stage = null
  this.src = ''
  this.x = 0
  this.y = 0
}
Sprite.prototype.draw = function() {
//  console.log('abstruct')
}
Sprite.prototype.onkeydown = function(evt) {
//  console.log('abstruct')
}
Sprite.prototype.onkeyup = function(evt) {
//  console.log('abstruct')
}
Sprite.prototype.onenterframe = function(evt) {
//  console.log('abstruct')
}

function Character() {
  this.src = {
    n: 'img/hunter_n0.png',
    e: 'img/hunter_e0.png',
    s: 'img/hunter_s0.png',
    w: 'img/hunter_w0.png'
  }
  this.dir = 's'
  this.mx = 4
  this.my = 4
  this.uid = new Date().getTime()
}
Character.prototype = new Sprite
Character.prototype.onenterframe = function() {
  this.stage.draw()
}
Character.prototype.draw = function() {
  img = new Image
  img.src = this.src[this.dir]
  this.stage.context.drawImage(img, this.x, this.y)
}

function Hunter() {
  this.src = {
    n: 'img/hunter_n0.png',
    e: 'img/hunter_e0.png',
    s: 'img/hunter_s0.png',
    w: 'img/hunter_w0.png'
  }
}
Hunter.prototype = new Character
Hunter.prototype.onkeydown = function(evt) {
  switch(evt.keyCode) {
    case KEY.UP:
    case KEY.W:
      this.dir = 'n'
      this.y = this.y - this.my
      break
    case KEY.RIGHT:
    case KEY.D:
      this.dir = 'e'
      this.x = this.x + this.mx
      break
    case KEY.DOWN:
    case KEY.S:
      this.dir = 's'
      this.y = this.y + this.my
      break
    case KEY.LEFT:
    case KEY.A:
      this.dir = 'w'
      this.x = this.x - this.mx
      break
  }
  this.stage.socket.send(toJSON({
    uid: this.uid,
    dir: this.dir,
    x:   this.x,
    y:   this.y
  }))
}

function Tile() {
}
Tile.prototype = new Sprite
Tile.prototype.draw = function() {
  this.stage.context.beginPath()
  this.stage.context.fillStyle = 'rgb(128, 128, 128)'
  this.stage.context.fillRect(0, 0, 256, 256)
}
