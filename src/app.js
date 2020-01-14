import 'bulma'
import './style.scss'
import '@babel/polyfill'

import * as faceapi from 'face-api.js'
const webcamElement = document.getElementById('webcam')

console.log(faceapi)

let sad, surprised, happy

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo())

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => webcamElement.srcObject = stream,
    err => console.error(err)
  )
}

webcamElement.addEventListener('play', () => {
  const canvas = document.getElementById('canvas')
  const displaySize = { width: webcamElement.width, height: webcamElement.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(webcamElement, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    //console.log(resizedDetections[0].expressions)
    if(detections[0]){
      happy = detections[0].expressions.happy
      surprised = detections[0].expressions.surprised
    }
    canvas.width = webcamElement.width
    canvas.height= webcamElement.height
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    //console.log(faceapi)
  }, 100)
})

const canvas = document.getElementById('game')
const  ctx  = canvas.getContext('2d')
let boxes
const player = {
  height: 20,
  width: 20,
  posX: 30,
  posY: 0,
  velX: 0,
  velY: 0,
  speed: 3,
  jumping: false,
  grounded: false

}

const world = {
  gravity: 0.2,
  friction: 0.9
}

function setup(){


  boxes = []


  // border walls
  boxes.push({
    posX: 0,
    posY: 290,
    width: 1200,
    height: 10
  })

  boxes.push({
    posX: 0,
    posY: 0,
    width: 1200,
    height: 10
  })

  boxes.push({
    posX: 0,
    posY: 0,
    width: 10,
    height: 300
  })

  boxes.push({
    posX: 1190,
    posY: 0,
    width: 10,
    height: 300
  })



}
setup()


//Collision Detection
function collisionDetection(shapeA, shapeB){
  var vX = (shapeA.posX + (shapeA.width / 2)) - (shapeB.posX + (shapeB.width / 2)),
    vY = (shapeA.posY + (shapeA.height / 2)) - (shapeB.posY + (shapeB.height / 2)),
    // add the half widths and half heights of the objects
    hWidths = (shapeA.width / 2) + (shapeB.width / 2),
    hHeights = (shapeA.height / 2) + (shapeB.height / 2),
    colDir = null

  // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
  if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
    //  figures out on which side we are colliding (top, bottom, left, or right)
    var oX = hWidths - Math.abs(vX),
      oY = hHeights - Math.abs(vY)
    if (oX >= oY) {
      if (vY > 0) {
        colDir = 't'
        shapeA.posY += oY
      } else {
        colDir = 'b'
        shapeA.posY -= oY

      }
    } else {
      if (vX > 0) {
        colDir = 'l'
        shapeA.posX += oX
      } else {
        colDir = 'r'
        shapeA.posX -= oX
      }
    }
  }
  return colDir
}






function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)




    if (happy>0.9 && happy <1.5 ) {

      // up arrow or space
      if (!player.jumping && player.grounded) {
        player.jumping = true
        player.grounded = false
        player.velY = -player.speed * 2

      }
    }if (surprised>0.9 && surprised<1.5) {
    // right arrow
      if (player.velX < player.speed) {
        player.velX++
        // synthA.triggerAttackRelease(player.posX,0.01)
      }
    }
    if (sad>0.9 && sad<1.5) {         // left arrow
      if (player.velX > -player.speed) {
        player.velX--
        // synthA.triggerAttackRelease(player.posX,0.01)
      }
    }








    player.velX *= world.friction
    player.velY += world.gravity

    player.grounded = false
    boxes.map(x => {
        ctx.fillRect(x.posX, x.posY, x.width, x.height)
        var dir  = collisionDetection(player, x)

        if (dir === 'l' || dir === 'r') {
          player.velX = 0
          player.jumping = false
        } else if (dir === 'b') {

          player.grounded = true
          player.jumping = false
        } else if (dir === 't') {
          player.velY = 0

        }
      })







    if(player.grounded){
      player.velY = 0
    }






    player.posX += player.velX
    player.posY += player.velY


     ctx.fillRect(player.posX, player.posY, player.width, player.height)

requestAnimationFrame(gameLoop)
  }






gameLoop()
