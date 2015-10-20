  // Inits

  window.onload = function init() {
    var game = new GF();
    game.start();
  };


  // GAME FRAMEWORK STARTS HERE
  var GF = function() {
    // Vars relative to the canvas
    var canvas, ctx, w, h;

    // etat du jeu
    var tempsTotal = 0;

    var etats = {
      menuPrincipal: 0,
      jeuEnCours: 1,
      gameOver: 2,
    };
    var etatCourant = etats.menuPrincipal;

    // vars for counting frames/s, used by the measureFPS function
    var frameCount = 0;
    var lastTime;
    var fpsContainer;
    var fps;
    // for time based animation
    var delta, oldTime = 0;

    // vars for handling inputs
    var inputStates = {};

    // The monster !
    var monster = {
      x: 100,
      y: 100,
      speed: 100, // pixels/s this time !
      size: 50,
      boundingCircleRadius: 70
    };

    // array of balls to animate
    var ballArray = [];

    var tirArray = [];

    var sound = new Howl({
      urls: ['sounds/laser.wav'],
      sprite: {
        laser: [2000, 1000],
      }
    });

    var explosion = new Howl({
      urls: ['sounds/explosion.ogg'],
      sprite: {
        explosion: [2000, 800],
      }
    });

    var gameover = new Howl({
      urls: ['sounds/gameover.wav'],
      sprite: {
        gameover: [2000, 800],
      }
    });

    var music = new Howl({
      urls: ['sounds/music.wav'],
      loop: true,
    });


    var measureFPS = function(newTime) {

      // test for the very first invocation
      if (lastTime === undefined) {
        lastTime = newTime;
        return;
      }

      //calculate the difference between last & current frame
      var diffTime = newTime - lastTime;

      if (diffTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = newTime;
      }

      //and display it in an element we appended to the 
      // document in the start() function
      fpsContainer.innerHTML = 'FPS: ' + fps;
      frameCount++;
    };

    // clears the canvas content
    function clearCanvas() {
      ctx.clearRect(0, 0, w, h);
    }

    // Functions for drawing the monster and maybe other objects
    function drawMyMonster(x, y) {
      // save the context
      ctx.save();

      // translate the coordinate system, draw relative to it
      ctx.translate(x, y);

      battleship = new Image();
      battleship.src = 'image/battleship.png';
      ctx.drawImage(battleship, 0, 0, monster.size, monster.size);

      // restore the context
      ctx.restore();
    }

    function timer(currentTime) {
      var delta = currentTime - oldTime;
      oldTime = currentTime;
      return delta;

    }

    var mainLoop = function(time) {
      // Clear the canvas
      clearCanvas();

      if (monster.dead) {
        etatCourant = etats.gameOver;
      }

      switch (etatCourant) {
        case etats.jeuEnCours:
          //main function, called each frame 
          measureFPS(time);

          // number of ms since last frame draw
          delta = timer(time);
          tempsTotal += delta;
          ctx.fillText((tempsTotal / 1000).toFixed(2), 100, 100);

          // draw the monster
          drawMyMonster(monster.x, monster.y);

          // Check inputs and move the monster
          updateMonsterPosition(delta);

          // update and draw tirs
          updateTirs(delta);

          // update and draw balls
          updateBalls(delta);

          ctx.beginPath();

          if (inputStates.space) {
            inputStates.space = false;
            createTir();
            sound.play('laser');
          }

          break;

        case etats.gameOver:
          //console.log("GAME OVER");
          music.pause();
          ctx.fillText("GAME OVER", 250, 200);
          ctx.fillText("Press SPACE to start playing !", 200, 300);
          ctx.fillText("Use arrow key to move", 240, 400);
          ctx.fillText("Space : shot | Right-Clic : speed", 190, 440);
          ballArray = [];
          tirArray = [];
          tempsTotal = 0;
          ctx.beginPath();
          if (inputStates.space) {
            console.log("space enfoncee");
            monster.x = Math.round(w / 2) + monster.size / 2;
            monster.y = Math.round((3 * h) / 2) + monster.size;
            createBalls(10);
            monster.dead = false;
            etatCourant = etats.jeuEnCours;
            measureFPS();
            music.play();
          }
          break;

        case etats.menuPrincipal:
          music.pause();
          ctx.fillText("MENU PRINCIPAL", 250, 200);
          ctx.fillText("Press SPACE to start playing !", 200, 300);
          ctx.fillText("Use arrow key to move", 240, 400);
          ctx.fillText("Space : shot | Right-Clic : speed", 190, 440);
          ballArray = [];
          tirArray = [];
          tempsTotal = 0;
          ctx.beginPath();
          if (inputStates.space) {
            console.log("space enfoncee");
            monster.x = Math.round(w / 2) - monster.size / 4;
            monster.y = Math.round((3 * h) / 4) - monster.size;
            createBalls(10);
            monster.dead = false;
            etatCourant = etats.jeuEnCours;
            measureFPS();
            music.play();
          }
          break;

      }
      requestAnimationFrame(mainLoop);
    };


    function updateMonsterPosition(delta) {
      monster.speedX = monster.speedY = 0;
      // check inputStates
      if (inputStates.left) {
        monster.speedX = -monster.speed;
      }
      if (inputStates.up) {
        monster.speedY = -monster.speed;
      }
      if (inputStates.right) {
        monster.speedX = monster.speed;
      }
      if (inputStates.down) {
        monster.speedY = monster.speed;
      }
      if (inputStates.space) {}
      if (inputStates.mousePos) {}
      if (inputStates.mousedown) {
        monster.speed = 500;
      } else {
        // mouse up
        monster.speed = 100;
      }

      // COmpute the incX and inY in pixels depending
      // on the time elasped since last redraw
      monster.x += calcDistanceToMove(delta, monster.speedX);
      monster.y += calcDistanceToMove(delta, monster.speedY);

      // left
      if (monster.x < 0) {
        monster.x = 0;
      }
      // right
      if (monster.x > w - monster.size) {
        monster.x = w - monster.size;
      }
      // up
      if (monster.y < 0) {
        monster.y = 0;
      }
      // down
      if (monster.y > h - monster.size) {
        monster.y = h - monster.size;
      }

      var pos = {'x':monster.x, 'y':monster.y}
      socket.emit('sendpos', pos);
    }

    function updateTirs(delta) {

      for (var i = 0; i < tirArray.length; i++) {
        var tir = tirArray[i];

        // 1) move the ball
        tir.move(delta);

        // 2) test if the ball collides with a wall
        testCollisionWithBalls(tir);

        // 3) draw the ball
        tir.draw(ctx);
      }

    }


    function testCollisionWithBalls(tir) {

      if (tir.y < 0) {
        tir.dead = true;
      }

      for (var i = 0; i < ballArray.length; i++) {
        var ball = ballArray[i];

        if (!tir.dead && circRectsOverlap(tir.x, tir.y, 30, 30, ball.x, ball.y, ball.radius / 2)) {

          //console.log("destruction");
          tir.dead = true;
          ball.y = -10;
          ball.color = 'red';
          ball.dead = true;
          explosion.play('explosion');
          createBalls(1);

        }
      }
    }

    function updateBalls(delta) {
      // for each ball in the array
      for (var i = 0; i < ballArray.length; i++) {
        var ball = ballArray[i];

        // 1) move the ball
        ball.move(delta);

        // 2) test if the ball collides with a wall
        testCollisionWithWalls(ball);

        // teste collisions avec monstre
        if (circleCollide(ball.x, ball.y, ball.radius,
            monster.x + monster.size / 2, monster.y + monster.size / 2, monster.size / 2)) {
          //console.log("collision");
          ball.color = 'red';
          monster.dead = true;
          gameover.play('gameover');
          etatCourant = etats.gameOver;
        }

        /*if(circRectsOverlap(monster.x-50, monster.y-50, 100, 100, ball.x, ball.y, ball.radius)) {
                            
        //console.log("collision");
        ball.color = 'red';
        monster.dead = true;

        }*/

        /*if(rectsOverlap(monster.x, monster.y, monster.size, monster.size, ball.x, ball.y, ball.radius/2, ball.radius/2)){
        console.log("collision");
        ball.color = 'red';
        monster.dead = true;
        }*/

        // 3) draw the ball
        ball.draw(ctx);
      }
    }

    // Teste collisions entre cercles


    function testCollisionWithWalls(ball) {
      // left
      if (ball.x < ball.radius) {
        ball.x = ball.radius;
        ball.angle = -ball.angle + Math.PI;
      }
      // right
      if (ball.x > w - (ball.radius)) {
        ball.x = w - (ball.radius);
        ball.angle = -ball.angle + Math.PI;
      }
      // up
      /*if (ball.y < ball.radius) {
      ball.y = ball.radius;
      ball.angle = -ball.angle;     
      }  
      */

      // down
      if (ball.y > h) {
        ball.y = -10;
        ball.angle = -ball.angle;
        ball.dead = true;
        //console.log(Math.round(((tempsTotal/1000)/20)+1));
        createBalls(Math.round(((tempsTotal / 1000) / 60) + 1));
      }
    }

    function getMousePos(evt) {
      // necessary to take into account CSS boudaries
      var rect = canvas.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
      };
    }

    function createBalls(numberOfBalls) {
      for (var i = 0; i < numberOfBalls; i++) {
        // Create a ball with random position and speed. 
        // You can change the radius
        var ball = new Ball(w * Math.random(),
          0,
          Math.PI * Math.random(),
          50,
          80);

        if (!circleCollide(ball.x, ball.y, ball.radius,
            monster.x, monster.y, monster.boundingCircleRadius)) {
          // On la rajoute au tableau
          ballArray[ballArray.length] = ball;
        } else {
          i--;
        }
      }
    }


    function createTir() {
      var tir = new Tir(monster.x + monster.size / 2, monster.y, 200);
      tirArray[tirArray.length] = tir;
    }


    var start = function() {
      // adds a div for displaying the fps value
      fpsContainer = document.createElement('div');
      document.body.appendChild(fpsContainer);

      // Canvas, context etc.
      canvas = document.querySelector("#myCanvas");

      // often useful
      w = canvas.width;
      h = canvas.height;

      // important, we will draw with this object
      ctx = canvas.getContext('2d');
      // default police for text
      ctx.font = "20px Arial";
      ctx.fillStyle = 'white';

      //add the listener to the main, window object, and update the states
      window.addEventListener('keydown', function(event) {
        if (event.keyCode === 37) {
          inputStates.left = true;
        } else if (event.keyCode === 38) {
          inputStates.up = true;
        } else if (event.keyCode === 39) {
          inputStates.right = true;
        } else if (event.keyCode === 40) {
          inputStates.down = true;
        } else if (event.keyCode === 32) {
          inputStates.space = true;
        }
      }, false);

      //if the key will be released, change the states object 
      window.addEventListener('keyup', function(event) {
        if (event.keyCode === 37) {
          inputStates.left = false;
        } else if (event.keyCode === 38) {
          inputStates.up = false;
        } else if (event.keyCode === 39) {
          inputStates.right = false;
        } else if (event.keyCode === 40) {
          inputStates.down = false;
        } else if (event.keyCode === 32) {
          inputStates.space = false;
        }
      }, false);

      // Mouse event listeners
      canvas.addEventListener('mousemove', function(evt) {
        inputStates.mousePos = getMousePos(evt);
      }, false);

      canvas.addEventListener('mousedown', function(evt) {
        inputStates.mousedown = true;
        inputStates.mouseButton = evt.button;
      }, false);

      canvas.addEventListener('mouseup', function(evt) {
        inputStates.mousedown = false;
      }, false);

      // start the animation
      requestAnimationFrame(mainLoop);
    };

    //our GameFramework returns a public API visible from outside its scope
    return {
      start: start
    };
  };