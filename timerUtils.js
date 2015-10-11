    // We want the rectangle to move at speed pixels/s (there are 60 frames in a second)
    // If we are really running at 60 frames/s, the delay between frames should be 1/60
    // = 16.66 ms, so the number of pixels to move = (speed * del)/1000. If the delay is twice
    // longer, the formula works : let's move the rectangle twice longer!
  var calcDistanceToMove = function(delta, speed) {
    //console.log("#delta = " + delta + " speed = " + speed);
    return (speed * delta) / 1000; 
  };
  