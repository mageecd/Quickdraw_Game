//Code for game


//initializing canvas
var canvas;
var canvas2;
var canvasBack;
var ctx;
var ctx2;
var ctxBack;
var canvasWidth = 1538;
var canvasHeight = 1076;
//initial background
var gameBackground = new Image();
gameBackground.src = "Images/WildWestTown.jpg";
//variables for sprites
var srcX;
var srcY;
var srcXRed;
var sheetWidth = 4520;
var sheetHeight = 254;
var cols = 20;
var rows = 1;
var spriteWidth = sheetWidth / cols;
var spriteHeight = sheetHeight / rows;
//images for sprites
//player
var defaultStanding = new Image();
defaultStanding.src = "Images/AnimationSprites/defaultStanding.png";
var step1 = new Image();
step1.src = "Images/AnimationSprites/step1.png";
var step2 = new Image();
step2.src = "Images/AnimationSprites/step2.png";
var turnStand = new Image();
turnStand.src = "Images/AnimationSprites/turnStand.png";
var firing = new Image();
firing.src = "Images/AnimationSprites/firing.png";
var deadGuy = new Image();
deadGuy.src = "Images/AnimationSprites/dead.png";
//opponent
var defaultStandingRed = new Image();
defaultStandingRed.src = "Images/AnimationSprites/defaultStandingRed.png";
var step1Red = new Image();
step1Red.src = "Images/AnimationSprites/step1Red.png";
var step2Red = new Image();
step2Red.src = "Images/AnimationSprites/step2Red.png";
var turnStandRed = new Image();
turnStandRed.src = "Images/AnimationSprites/turnStandRed.png";
var firingRed = new Image();
firingRed.src = "Images/AnimationSprites/firingRed.png";
var deadGuyRed = new Image();
deadGuyRed.src = "Images/AnimationSprites/deadRed.png";
var logo = new Image();
logo.src = "Images/htmlHi5Logo.png";

//audio variables
var gunshot;
var walkJingle;
var harmonica;
var ding;
//variables for game
var beingPressed = false;
var fireKey;
var stateList =
  {
    STANDING: 1,
    WALKING: 2,
    COUNTDOWN: 3,
    READY_TO_TURN: 4,
    READY_TO_FIRE: 5,
    FIRING: 6,
    GAME_OVER: 7,
    INFORMATION: 8,
    CREDITS : 9
  };
var workAroundCounter = 0;
var currentState;
var savedState;
var currentSteps = 0;
var currentFireFrame = 0;
var fireInterval;
var currentFrame = 0;
var stepInterval;
var walkSpeed = 60;
var groundHeight = (canvasHeight * .95 - sheetHeight);
var deadGroundHeight = groundHeight * 1.2;
var stepWidth = (canvasWidth / 200);
var x = (canvasWidth / 2) - 50;
var y = 0;
var badX = x - 80;
var moveForward = 0;
var countdownInterval;
var aiTurnInterval;
var aiSpeed;
var aiFireInterval;
var aiFireSpeed;
var currentAIFireFrame = 0;
var flashInterval;
var flashOpacity = 1.25;
var winner = false;
var gamesPlayed = 0;
var gamesWon = 0;
var gamesWonInARow = 0;
var gamesInARowMultiplier = 1;
var roundScore;
var totalScore = 0;
var timeStamp = 1 + Math.ceil(Math.random() * 5);

window.addEventListener("load", start, false);
function start()
{
  var url = (window.location !== window.parent.location)
    ? document.referrer
    : document.location.href;
  $.post('https://htmlhigh5.com/remotePlay', {url: url, game: 'Wild West Quickdraw Duel'});

  gunshot = document.getElementById("gunshot");
  walkJingle = document.getElementById("walkJingle");
  harmonica = document.getElementById("harmonica");
  ding = document.getElementById("ding");
  canvas = document.getElementById("myCanvas");
  canvas2 = document.getElementById("myCanvas2");
  canvasBack = document.getElementById("myBackgroundCanvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas2.width = canvasWidth;
  canvas2.height = canvasHeight;
  canvasBack.width = canvasWidth;
  canvasBack.height = canvasHeight;
  ctx = canvas.getContext("2d");
  ctx2 = canvas2.getContext("2d");
  ctxBack = canvasBack.getContext("2d");
  ctxBack.drawImage(gameBackground, 0, 0, canvasWidth, canvasHeight);
  window.addEventListener("keydown", checkKey, false);
  window.addEventListener("keyup", setKeyUp, false);
  fontWorkAround();
}
function fontWorkAround()
{
  var fontInterval
  fontInterval = setInterval(function()
    {
      initialDraw();
      if (workAroundCounter === 5)
      {
        clearInterval(fontInterval);
        newGame();
      }
      workAroundCounter++;
    }, 30)
}
function initialDraw()
{
  ctx.drawImage(defaultStanding, x, groundHeight);
  ctx.drawImage(defaultStandingRed, badX, groundHeight);
  ctx2.fillStyle = "#000000";
  ctx2.font = canvasHeight * .1 + "px Vanilla_Whale";
  ctx2.textAlign = "center";
  ctx2.fillText("Wild West Quickdraw Duel", canvasWidth / 2, canvasHeight * .12);
  ctx2.font = canvasHeight * .05 + "px Edmunds";
  ctx2.fillStyle = "#FF0000";
  ctx2.fillText("Press 'I' for intructions", canvasWidth / 2, canvasHeight * .2);
  if (gamesPlayed === 0)
  {
    harmonica.play();
  }
}

function setKeyUp(e)
{
  if (e.keyCode === 73 || e.keyCode === 67)
  {
    beingPressed = false;
  }

}
function checkKey(e)
{
  if (e.keyCode === 73 && (currentState === stateList.STANDING || currentState === stateList.INFORMATION))
  {
    if (currentState !== stateList.INFORMATION && beingPressed === false)
    {
      savedState = currentState;
      setState(stateList.INFORMATION);
      beingPressed = true;
      displayInfo();
    }
    else if (currentState === stateList.INFORMATION && beingPressed === false)
    {
      currentState = savedState;
      beingPressed = true;
      ctx2.clearRect(canvasWidth * .049, canvasHeight * .15, canvasWidth * .91, canvasHeight * .7);
      ctx2.font = canvasHeight * .05 + "px Edmunds";
      ctx2.fillStyle = "#FF0000";
      ctx2.fillText("Press 'I' for instructions", canvasWidth / 2, canvasHeight * .2);
    }
  }
  else if ((e.keyCode === 39 || e.keyCode === 68) && currentState === stateList.STANDING)
  {
    ctx2.clearRect(0, 0, canvasWidth, canvasHeight * .15);
    setState(stateList.WALKING);
    walk();
  }
  else if ((e.keyCode === 37 || e.keyCode === 65) && currentState === stateList.READY_TO_TURN)
  {
    turn();
  }
  else if ((e.keyCode === fireKey || e.keyCode === (fireKey + 48)) && currentState === stateList.READY_TO_FIRE)
  {
    fire();
    setState(stateList.FIRING);
  }
  else if (e.keyCode === 68 && (currentState === stateList.GAME_OVER || currentState === stateList.CREDITS))
  {
    newGame();
  }
  else if (e.keyCode === 67 && (currentState === stateList.GAME_OVER || currentState === stateList.CREDITS))
  {
    if (currentState !== stateList.CREDITS && beingPressed === false)
    {
      if (flashOpacity <=0)
      {
        ctx2.clearRect(0, 0, canvasWidth, canvasHeight);
        displayCredits();
      }
      setState(stateList.CREDITS);
      beingPressed = true;
    }
    else if (currentState === stateList.CREDITS && beingPressed === false)
    {
      setState(stateList.GAME_OVER);
      beingPressed = true;
      if (flashOpacity <=0)
      {
        ctx2.clearRect(0, 0, canvasWidth, canvasHeight);
        displayResults();
      }
    }

  }
  else if (e.keyCode === 82)
  {
    resetValues();
    newGame();
  }
}
function displayInfo()
{
  ctx2.fillStyle = "rgba(242, 242, 242, .8)";
  ctx2.fillRect(canvasWidth * .05, canvasHeight * .15, canvasWidth * .9, canvasHeight * .7);
  ctx2.fillStyle = "#222222";

  ctx2.font = canvasHeight * .075 + "px Edmunds";
  ctx2.textAlign = "center";
  ctx2.fillText("How to Play", canvasWidth /2 , canvasHeight * .25, canvasWidth * .5);
  ctx2.textAlign = "left";
  ctx2.font = canvasHeight * .04 + "px Edmunds";
  ctx2.fillText("1. Take three steps to the right using either the right arrow or 'D' ", canvasWidth * .12,
    canvasHeight * .33);
  ctx2.fillText("2. Watch the countdown timer at the top of the screen to know when to turn", canvasWidth * .12,
    canvasHeight * .37);
  ctx2.fillText("3. Press the left arrow key or 'A' to turn around", canvasWidth * .12, canvasHeight * .41);
  ctx2.fillText("4. Press the indicated number to fire after turning around", canvasWidth * .12, canvasHeight * .45);
  ctx2.fillText("5. Press 'D' to play again!", canvasWidth * .12, canvasHeight * .49);
  ctx2.textAlign = "center";
  ctx2.fillText("Playing the game is simple, but you'll have to be quick to win!", canvasWidth / 2, canvasHeight * .55);
  ctx2.textAlign = "left";
  ctx2.fillText("Each round you win in a row, the multiplier will go up for the round's score,", canvasWidth * .1,
    canvasHeight * .59);
  ctx2.fillText("so each round will be more points than the last! However, the outlaw will get", canvasWidth * .1,
    canvasHeight * .63);
  ctx2.fillText("faster each round, making it harder to keep winning! Once you lose, the", canvasWidth *.1 ,
    canvasHeight * .67);
  ctx2.fillText("score, multiplier, and difficulty will be reset.", canvasWidth * .1, canvasHeight * .71);
  ctx2.textAlign = "center";
  ctx2.fillStyle = "#FF0000";
  ctx2.fillText("Press 'I' to close instructions.", canvasWidth /2 , canvasHeight * .8, canvasWidth * .5);
}

function newGame()
{
  $.post('https://htmlhigh5.com/play/$quickdraw-duel/score/create');
  if(!winner)
  {
    totalScore = 0;
  }
  clearInterval(stepInterval);
  clearInterval(countdownInterval);
  clearInterval(aiTurnInterval);
  clearInterval(aiFireInterval);
  clearInterval(fireInterval);
  clearInterval(flashInterval);
  currentSteps = 0;
  currentFireFrame = 0;
  flashOpacity = 1.5;
  moveForward = 0;
  y = 0;
  x = (canvasWidth / 2) - 50;
  badX = x - 80;
  currentFrame = 0;
  fireKey = Math.floor(Math.random() * 10) + 48;
  winner = false;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx2.clearRect(0, 0, canvasWidth, canvasHeight);
  initialDraw();
  setState(stateList.STANDING);
}

function walk()
{
  switch (currentSteps)
  {
    case 0:
      //Reset audio source so it will play again
      walkJingle.src = walkJingle.src;
      walkJingle.play();
      currentSteps++;
      stepInterval = setInterval(function()
      {
        rightWalkDraw(step1, step1Red);
      }, walkSpeed);
      break;
    case 1:
      //Reset audio source so it will play again
      walkJingle.src = walkJingle.src;
      walkJingle.play();
      currentSteps++;
      setState(stateList.WALKING);
      stepInterval = setInterval(function()
      {
        rightWalkDraw(step2, step2Red);
      }, walkSpeed);
      break;
    case 2:
      //Reset audio source so it will play again
      walkJingle.src = walkJingle.src;
      walkJingle.play();
      currentSteps++;
      ctx2.clearRect(0, 0, canvasWidth, canvasHeight);
      setState(stateList.WALKING);
      stepInterval = setInterval(function()
      {
        rightWalkDraw(step1, step1Red);
      }, walkSpeed);
      break;
    default:
      break;
  }
}

function rightWalk()
{
  currentFrame = ++currentFrame % cols;
  srcX = (cols - currentFrame -1) * spriteWidth;
  srcXRed = (currentFrame * spriteWidth);
  srcY = 0;
  moveForward++;
  if (moveForward < cols - 4)
  {
    x = (x + stepWidth) % canvasWidth;
    badX = badX - stepWidth;
  }
  else if (moveForward == cols)
  {
    moveForward = 0;
  }
}
function rightWalkDraw(stepParameter, stepParameter2)
{
  var step = stepParameter;
  var stepFlip = stepParameter2;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  rightWalk();
  ctx.drawImage(step, srcX, srcY, spriteWidth, spriteHeight, x, groundHeight, spriteWidth, spriteHeight);
  ctx.drawImage(stepFlip, srcXRed, srcY, spriteWidth, spriteHeight, badX, groundHeight, spriteWidth, spriteHeight);
  checkFrame();
}
function checkFrame()
{
  if (currentFrame >= cols - 1)
  {
    clearInterval(stepInterval);
    currentFrame = 0;
    setState(stateList.STANDING);
    if(currentSteps == 3)
    {
      countdown();
    }
  }
}
function countdown()
{
  setState(stateList.COUNTDOWN);
  var timeSecond = 3;
  countdownInterval = setInterval(function()
  {
    ctx2.clearRect(0, 0, canvasHeight, canvasWidth);
    ctx2.font = canvasHeight * .1 + "px Edmunds";
    ctx2.fillStyle = "#000000";
    ctx2.fillText("Prepare to turn and fire in:", canvasWidth / 2, canvasHeight * .15);
    ctx2.fillText(timeSecond + "!", canvasWidth/2, canvasHeight * .25);
    --timeSecond;
    if (timeSecond < 0)
    {
      clearInterval(countdownInterval);
      ctx2.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx2.fillStyle = "#FF0000";
      ctx2.fillText("Press *" + String.fromCharCode(fireKey) + "* to fire!", canvasWidth/2, canvasHeight * .2);
      setState(stateList.READY_TO_TURN);
      aiTurn();
    }
  }, 1000)
}
function aiTurn()
{
  //generate random number for ai speed
  randomNumber = Math.random() * (55 - gamesWonInARow);
  aiSpeed = Math.floor((randomNumber + 585) / (1 + gamesWonInARow * .05));
  aiTurnInterval = setInterval(function()
  {
    if(!winner)
    {
      ctx.clearRect(0, 0, canvasHeight / 2, canvasWidth / 2);
      ctx.drawImage(turnStandRed, badX, groundHeight);
      if (winner)
      {
        return;
      }
      clearInterval(aiTurnInterval);
      aiFire();
    }
  }, aiSpeed);
}
function aiFire()
{
  randomNumber = Math.random() * (30 - gamesWonInARow);
  aiFireSpeed = Math.floor((randomNumber + 50) / (1 + gamesWonInARow * .012));
  aiFireInterval = setInterval(function()
  {
    if(winner)
    {
      return;
    }
    aiFireDraw()
  }, aiFireSpeed);
}
function aiFireDraw()
{
  if(!winner)
  {
    currentAIFireFrame = ++currentAIFireFrame;
    srcXRed = (cols - currentAIFireFrame - 1) * spriteWidth;
    ctx.clearRect(0, canvasHeight / 2, canvasHeight / 2, canvasWidth / 2);
    ctx.drawImage(firingRed, srcXRed, srcY, spriteWidth, spriteHeight, badX, groundHeight, spriteWidth, spriteHeight);
    checkFireFrame(currentAIFireFrame);
  }
  return;
}
function turn()
{
  x = x - 40;
  ctx.clearRect(canvasWidth / 2, canvasHeight / 2, canvasWidth / 2, canvasHeight / 2);
  ctx.drawImage(turnStand, x, groundHeight);
  setState(stateList.READY_TO_FIRE);
}

function fire()
{
  fireInterval = setInterval(function()
  {
    fireDraw();
  }, 30);
}
function fireDraw()
{
  currentFireFrame = ++currentFireFrame % cols;
  srcX = currentFireFrame * spriteWidth;
  ctx.clearRect(canvasWidth / 2, canvasHeight / 2, canvasWidth / 2, canvasHeight / 2);
  ctx.drawImage(firing, srcX, srcY, spriteWidth, spriteHeight, x, groundHeight, spriteWidth, spriteHeight);
  checkFireFrame(currentFireFrame);
}

function checkFireFrame(number)
{
  if (number >= cols - 3)
  {
    setState(stateList.GAME_OVER);
    if (number == currentFireFrame)
    {
      winner = true
    }
    else
    {
      x = x * .85;
    }
    currentFireFrame = 0;
    currentAIFireFrame = 0;
    clearInterval(fireInterval);
    clearInterval(aiFireInterval);
    gunshot.play();
    whiteScreen();
  }
}

function whiteScreen()
{
  setState(stateList.GAME_OVER);
  gamesPlayed++;
  if (winner)
  {
    gamesWon++;
    gamesWonInARow++;
    calculateScore();
  }
  else
  {
    resetValues();
    console.log("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  }
  flashInterval = setInterval(function()
  {
    if (flashOpacity <= 0)
    {
      clearInterval(flashInterval);
      ctx2.clearRect(0, 0, canvasWidth, canvasHeight);
      displayResults();
    }
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    if (winner)
    {
      if (flashOpacity <= .9 && flashOpacity >= .7)
      {
        ding.play();
      }
      ctx.drawImage(firing, sheetWidth - spriteWidth, srcY, spriteWidth, spriteHeight, x, groundHeight, spriteWidth,
        spriteHeight);
      ctx.drawImage(deadGuyRed, badX, deadGroundHeight);
    }
    else
    {
      ctx.drawImage(firingRed, srcXRed, srcY, spriteWidth, spriteHeight, badX, groundHeight, spriteWidth, spriteHeight);
      ctx.drawImage(deadGuy, x, deadGroundHeight);
    }
    ctx2.clearRect(0, 0, canvasWidth, canvasHeight);
    if (currentState === stateList.GAME_OVER)
    {
      displayResults();
    }
    if (currentState === stateList.CREDITS)
    {
      displayCredits();
    }
    ctx2.fillStyle = "rgba(255,255,255," + flashOpacity;
    ctx2.fillRect(0, 0, canvasWidth, canvasHeight);
    flashOpacity = flashOpacity - 0.01;

  }, 50)
}
function displayResults()
{
  ctx2.fillStyle = "rgba(20, 20, 20, .7)";
  ctx2.fillRect(canvasWidth * .2, canvasHeight * .25, canvasWidth * .6, canvasHeight * .4);
  ctx2.font = canvasHeight * .045 + "px Edmunds";
  ctx2.fillStyle = "#ffffff";
  ctx2.fillText("Score this Round: " + roundScore, canvasWidth /2, canvasHeight * .35, canvasWidth * .3);
  ctx2.fillText("Games Played: " + gamesPlayed, canvasWidth / 2, canvasHeight * .4, canvasWidth * .3);
  ctx2.fillText("Games Won: " + gamesWon, canvasWidth / 2, canvasHeight * .45, canvasWidth * .3);
  ctx2.fillText("Games Won in a Row: " + gamesWonInARow, canvasWidth / 2, canvasHeight * .5, canvasWidth * .3);
  ctx2.fillText("Press 'D' to continue playing!", canvasWidth / 2, canvasHeight * .55, canvasWidth * .5);
  ctx2.fillText("Press 'C' for credits.", canvasWidth / 2, canvasHeight * .65, canvasWidth * .5);
  if (winner)
  {
    ctx2.fillStyle = "#000000";
    ctx2.font = canvasHeight * .1 + "px Vanilla_Whale";
    ctx2.fillText("YOU WIN!", canvasWidth / 2, canvasHeight * .2);
    ctx2.font = canvasHeight * .05 + "px Edmunds";
    ctx2.fillStyle = "#ffffff";
    ctx2.fillText("Total Score: " + totalScore, canvasWidth /2, canvasHeight * .3, canvasWidth * .3);
    ctx2.fillText("Press 'R' to reset game score and difficulty.", canvasWidth / 2, canvasHeight * .6, canvasWidth * .5);
  }
  else
  {
    ctx2.fillStyle = "#000000";
    ctx2.font = canvasHeight * .1 + "px Vanilla_Whale";
    ctx2.fillText("YOU LOSE!", canvasWidth / 2, canvasHeight * .2);
    ctx2.font = canvasHeight * .05 + "px Edmunds";
    ctx2.fillStyle = "#ffffff";
    ctx2.fillText("Your Total Score Was: " + totalScore, canvasWidth /2, canvasHeight * .3, canvasWidth * .3);
    ctx2.fillText("Game score and difficulty have been reset.", canvasWidth / 2, canvasHeight * .6, canvasWidth * .5);
  }
}

function calculateScore()
{
  roundScore = Math.floor((750 - (aiSpeed + aiFireSpeed)) * 2.5 * gamesInARowMultiplier);
  totalScore = totalScore + roundScore;
  gamesInARowMultiplier = gamesInARowMultiplier * 1.125;
  //This is where I believe the score submission should go.
  $.post('https://htmlhigh5.com/play/$quickdraw-duel/score/store',{timestamp: timeStamp, increment: totalScore, hash: hashScore(totalScore, timeStamp)});

  //Trophy after 2500 total pts
  if (totalScore > 2500)
  {
    $.post('https://htmlhigh5.com/play/$quickdraw-duel/trophy/add',{tag: 'is82jks929'});
  }
  //Trophy after 5000 total pts
  if (totalScore > 5000)
  {
    $.post('https://htmlhigh5.com/play/$quickdraw-duel/trophy/add',{tag: 'm9e2ll8o2n'});
  }
  //Trophy at 5 wins in a row
  if (gamesWonInARow === 5)
  {
    $.post('https://htmlhigh5.com/play/$quickdraw-duel/trophy/add',{tag: 'hs928dmi1b'});
  }
  //Trophy at 10 wins in a row (This is actually pretty difficult)
  if (gamesWonInARow === 10)
  {
    $.post('https://htmlhigh5.com/play/$quickdraw-duel/trophy/add',{tag: '9u2s02kd9f'});
  }
}

function displayCredits()
{
  ctx2.fillStyle = "rgba(20, 20, 20, .7)";
  ctx2.fillRect(canvasWidth * .2, canvasHeight * .05, canvasWidth * .6, canvasHeight * .9);
  ctx2.font = canvasHeight * .04 + "px Edmunds";
  ctx2.fillStyle = "#ffffff";
  ctx2.fillText("Game Design/Development/Programming", canvasWidth / 2, canvasHeight * .15);
  ctx2.fillText("Game Art", canvasWidth / 2, canvasHeight * .25);
  ctx2.fillText("Game Audio", canvasWidth / 2, canvasHeight * .39);

  ctx2.font = canvasHeight * .03 + "px Edmunds";
  ctx2.fillText("Caleb Magee", canvasWidth / 2, canvasHeight * .19);
  ctx2.fillText("Abraham Raygoza", canvasWidth / 2, canvasHeight * .29);
  ctx2.fillText("Vecteezy.com", canvasWidth / 2, canvasHeight * .33);
  ctx2.fillText("Soundbible", canvasWidth / 2, canvasHeight * .43);
  ctx2.fillText("Georgeisound", canvasWidth / 2, canvasHeight * .47);

  ctx2.fillText("Huge thank you to Ian Andersen and Abraham Raygoza", canvasWidth / 2, canvasHeight * .52);
  ctx2.fillText("for their help on this game!", canvasWidth / 2,
    canvasHeight * .55);
  ctx2.fillText("Press 'C' to return to results. Press 'D' to continue playing.", canvasWidth / 2, canvasHeight * .63);
  ctx2.drawImage(logo, canvasWidth * .35, canvasHeight * .71, canvasWidth * .3, canvasHeight * .2);
}

function setState(state)
{
  currentState = state;
}

function resetValues()
{
  roundScore = 0;
  gamesWonInARow = 0;
  gamesInARowMultiplier = 1;
  winner = false;
}

function hashScore(value, salt)
{
  var hashedValue = md5(value + md5(salt + md5(value + md5(salt))));
  for(var i = 0; i < 37; i++)
    hashedValue = md5(salt + hashedValue);
  return hashedValue;
}
