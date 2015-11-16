// constructor function for balls
function Ball(x, y, angle, v, diameter, color) {
  this.x = x;
  this.y = y;
  this.angle = angle;
  this.v = v;
  this.radius = diameter/2;
  this.color = color;
  this.dead = false;
  
  this.draw = function(ctx) {
    // si la balle est "morte" on ne fait rien
    if(this.dead) return;
    
    ctx.save();
      ctx.beginPath();
      ctx.drawImage(ennemis, this.x, this.y, this.radius,this.radius);
    ctx.restore();
  };
  
  this.move = function(delta) {
    // si la balle est "morte" on ne fait rien
    if(this.dead) return;
    
    // add horizontal increment to the x pos
    // add vertical increment to the y pos
    
    var incX = this.v * Math.cos(this.angle);
    var incY = this.v * Math.sin(this.angle);
    
    this.x += calcDistanceToMove(delta, incX);
    this.y += calcDistanceToMove(delta, incY);
  };
}
