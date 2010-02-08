function Hunter() {
  this.src = 'img/hunter_s0.png'
  this.nodes = []
}
Hunter.prototype = new Sprite
Hunter.prototype.update = function() {
  var key = this.stage.keyevent.input
  console.log('key: %o', key)
  if (key.up) this.y = this.y - 1
  if (key.down) this.y = this.y + 1
  if (key.left) this.x = this.x - 1
  if (key.right) this.x = this.x + 1
  this.show()
}

function Grass() {
  this.src = 'img/bg_grass.png'
}
Grass.prototype = new Sprite
