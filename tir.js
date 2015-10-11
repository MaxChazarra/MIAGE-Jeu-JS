// constructor function for balls
function Tir(x, y, v) {
  this.x = x;
  this.y = y;
  //this.angle = angle;
  this.v = v;
  this.radius = 20;
  //this.color = color;
  this.dead = false;
  
  this.draw = function(ctx) {
    // si la balle est "morte" on ne fait rien
    if(this.dead) return;
    
    ctx.save();
      ctx.beginPath();
      /*ctx.fillStyle = this.color;
      ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
      ctx.fill();*/
      shot = new Image();
      shot.src = 'image/shot1.png';
      ctx.drawImage(shot, this.x, this.y, this.radius,this.radius);
    ctx.restore();
    //this.color = 'yellow';
  };
  
  this.move = function(delta) {
    // si la balle est "morte" on ne fait rien
    if(this.dead) return;
    
    // add horizontal increment to the x pos
    // add vertical increment to the y pos
    
    var incX = this.v;
    var incY = this.v;
    
    //this.x += calcDistanceToMove(delta, incX);
    this.y -= calcDistanceToMove(delta, incY);
  };
}