import React, { Component } from 'react'
import '../layouts/shooter.css'

import gooseImage from '../images/goose-icon.png'
import spaceBackground from '../images/space-wallpaper.png'

class Shooter extends Component {
    render = () => (
        <div id="shooterGame">
            <div id="gameCanvasDiv">
                <canvas id="gameCanvas"></canvas>
            </div>
            <div id="score"></div>
            <div id="gameover">GAME OVER</div>
            <div id="instructions">
                <p>Use "UP"/"DOWN"/"LEFT"/"RIGHT" Arrows to Move</p>
                <p>Press "SPACE" to Shoot</p>
                <p>Press Q to restart</p>
            </div>
        </div>
    )
    componentDidMount = () => {

        //keyCodes
        var leftKey = 37;
        var upKey = 38;
        var rightKey = 39;
        var downKey = 40;
        var spaceKey = 32;
        var qKey = 81;

        //"speed" at which objects move
        //bigger number means faster
        var heroSpeed = 6;
        var laserSpeed = 12;
        var enemySpeedY = 4;


        //so the gameLoop() will end
        var previousLoopRun = 0;

        //game score
        var score = 0;

        //game iterations (for difficulty)
        var iterations = 0;

        //controller saves info about what key was pressed,
        var controller = new Object();

        //enemies array
        var enemies = [];

        //lasers
        var lasers = [];

        //background stuff
        var spaceWallpaper = new Image();
        spaceWallpaper.src = spaceBackground;

        var wallpaperWidth = 500;
        var wallpaperHeight = 500;

        //hero stuff
        var hero;
        var goose = new Image();
        goose.src = gooseImage;

        //keeps track of heros life/death
        var heroAlive = true;

        //function for creating the game-sprites
        //function for creating the game-sprites
        var Sprite = function(type, x, y, w, h, color) {
            if (color != 'goose'){
                this.type = type;
                this.x = x;
                this.y = y;
                this.w = w;
                this.h = h;
                this.update = function() {
                    this.context = gameCanvas.context;
                    this.context.fillStyle = color;
                    this.context.fillRect(this.x, this.y, this.w, this.h);
                }
            } else {
                this.x = x;
                this.y = y;
                this.w = w;
                this.h = h;
                this.update = function() {
                    this.context = gameCanvas.context;
                    this.context.drawImage(goose, this.x, this.y, this.w, this.h);
                }

            }
        }

        //toggleKey tells us which key was pressed and if it is pressed,
        //saves that info inside the controller object
        var toggleKey = function(keyCode, isPressed) {
            if(keyCode === leftKey) {
                controller.left = isPressed;
            }
            if(keyCode === rightKey) {
                controller.right = isPressed;
            }
            if(keyCode === upKey) {
                controller.up = isPressed;
            }
            if(keyCode === downKey) {
                controller.down = isPressed;
            }
            if(keyCode === spaceKey) {
                controller.space = isPressed;
            }
            if(keyCode === qKey){
                location.reload();
            }
        }

        function intersects(a,b) {
            return(a.x < b.x + b.w) && (a.x + a.w > b.x) && (a.y < b.y + b.h) && (a.y + a.h > b.y);
        }

        //makes sure sprite doesnt leave game border of 480 by 480
        //sprite.x is left side, sprite.y is top
        //if i do not pass in an ignoreY arguemnt, then it will default to false
        var ensureBounds = function(sprite, ignoreY) {
            if(sprite.x < 20) {
                sprite.x = 20;
            }
            if((!ignoreY) && (sprite.y <20)) {
                sprite.y = 20;
            }

            if(sprite.x + sprite.w > 480) {
                sprite.x = 480 - sprite.w;
            }
            if((!ignoreY) && (sprite.y + sprite.h > 480)) {
                sprite.y = 480 - sprite.h;
            }
        }

        //moves hero after checking what key is pressed in controller
        var handleControls = function() {
            //if controller.up keyPressed is true, do stuff
            //others are the same
            if (controller.up) {
                hero.y -= heroSpeed;
            }
            if (controller.down) {
                hero.y += heroSpeed;
            }
            if (controller.left) {
                hero.x -= heroSpeed;
            }
            if (controller.right) {
                hero.x += heroSpeed;
            }

            if(controller.space) {
                var laser = getFireableLaser();
                if(laser) {
                    laser.y = hero.y - laser.h;
                    laser.x = hero.x + 9;
                }
            }

            ensureBounds(hero);
        }

        //forEach, when you return inside of it, it does not end the forEach loop, you simply go on to the next iteration
        var getFireableLaser = function() {

            for (var k = 0; k < lasers.length; k++) {
                if (lasers[k].y <= -120) {
                    return lasers[k];
                }
            }
            return null;

        }
        var checkLaserCollisions = function(enemy) {
            for (var k = 0; k < lasers.length; k++) {
                if(intersects(lasers[k], enemy)) {
                    return lasers[k];
                }
            }
            return null;
        }

        //runs when player dies
        var gameOver = function() {
            //makes player invis
            heroAlive = false;

            lasers = [];

            //reveals gameover text
            var element = document.getElementById('gameover');
            element.style.visibility = 'visible';
        }

        //* need to work on
        //checks for collisions, if one is detected, an object is deleted.
        var checkCollisions = function() {
            for(var k = 0; k < enemies.length; k++) {
                var laser = checkLaserCollisions(enemies[k]);
                if (laser) {
                    enemies.splice(k, 1);
                    k--;
                    //off the screen
                    laser.y = -laser.h;
        
                    //give player score points
                    score += 100;
                } 
                else if (intersects(hero, enemies[k])) {
                    gameOver();
                }
                else if (enemies[k].y + enemies[k].h >= 500) {
                    enemies.splice(k, 1);
                    k--;
                }
            }
        }

        var showSprites = function() {
            if (heroAlive === true) {

                hero.update();
        
                lasers.forEach(function(aLaser){
                    aLaser.update();
                });
            
                enemies.forEach(function(anEnemy){
                    anEnemy.update();
                });
            
                var scoreElement = document.getElementById('score');
                scoreElement.innerHTML = 'Score: ' + score;
            }
            else {
                lasers.forEach(function(aLaser){
                    aLaser.update();
                });
        
                enemies.forEach(function(anEnemy){
                    anEnemy.update();
                });
        
                var scoreElement = document.getElementById('score');
                scoreElement.innerHTML = 'Score: ' + score;
            }
        }

        //updates positions of objects we dont have control over, ex. laser
        var updatePositions = function() {

            //updates each and every one of the enemy positions
            enemies.forEach(function(anEnemy) {
                anEnemy.y += enemySpeedY;
                anEnemy.x += getRandom(7) - 3;
                ensureBounds(anEnemy, true);
            });

            lasers.forEach(function(aLaser){
                aLaser.y -= laserSpeed;
            });
        }

        //makes an enemy object
        var addEnemy = function() {

            var interval = 50;
            if (iterations > 2000) {
                interval = 2;
            }
            else if (iterations > 1500) {
                interval = 5;
            }
            else if (iterations > 1000) {
                interval = 20;
            }
            else if (iterations > 500) {
                interval = 35;
            }
            //== so that i dont need to type convert :p
            if (getRandom(interval) == 0) {
                //creates enemy object
                var enemyNumber = 'enemy' + getRandom(10000000);
                var enemy = new Sprite(enemyNumber, getRandom(450), -40, 35, 35, '#414A4C');

                //add to enemies array
                enemies.push(enemy);
            }
        }

        function getRandom(maxSize) {
            return parseInt(Math.random() * maxSize);
        }

        //the loop for gameplay

        let intervalID = setInterval(function() {

            //gets the date (from 1970, in milliseconds), subtracts lastLoopRun,
            //makes it so this runs ever 41 seconds
            //this if statement updates the game
            if (new Date().getTime() - previousLoopRun > 40) {
                
                gameCanvas.clear();

                //redraws the gamecavas
                gameCanvas.start();

                //updates the positions of things not in player control
                updatePositions();
                //checks buttons pressed and moves hero
                handleControls();

                checkCollisions();
                //adds another enemy
                addEnemy();

                showSprites();

                
                //clears the game canvas before we draw other stuff

                //sets previousLoopRun as the last date this code ran
                previousLoopRun = new Date().getTime();
                iterations++;
            }
        }, 2);
        this.setState({intervalID: intervalID});

        //tells document to check for when keys are pressed
        document.onkeydown = function(event) {
            toggleKey(event.keyCode, true);
        }
        document.onkeyup = function(event) {
            toggleKey(event.keyCode, false);
        }


        //creating canvas
        var gameCanvas = {
            canvas: document.getElementById('gameCanvas'),
            start: function() {
                this.canvas.width = wallpaperWidth;
                this.canvas.height = wallpaperHeight;
                this.context = this.canvas.getContext("2d");
                this.context.drawImage(spaceWallpaper, 0, 0, this.canvas.width, this.canvas.height);
                /*this.context.fillStyle="#00000C";
                this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
                */
            },
            clear : function() {
                this.context = this.canvas.getContext("2d");
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }

        
        //getting space wallpaper
        spaceWallpaper.onload = function() {
            //making game canvas for the first time
            gameCanvas.start();
        }

        goose.onload = function() {
            //creating hero and laser sprites/objects
            hero = new Sprite('goose', wallpaperWidth/2, wallpaperHeight+40, 35, 35, 'goose');
        }

        for (var k = 0; k < 4; k++) {
            var laser = new Sprite('laser' + k, 0, -120, 2, 50, 'green');
            lasers.push(laser);
        }

    }
    componentWillUnmount = () => {
        clearInterval(this.state.intervalID);
    }
}

export default Shooter
