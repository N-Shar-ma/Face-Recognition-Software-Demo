const video = document.getElementById('video')
const ratioEl = document.getElementById('eyes-nose-ratio')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const leftEyeX = resizedDetections.landmarks.getLeftEye()[0].x
    const leftEyeY = resizedDetections.landmarks.getLeftEye()[0].y
    const leftEyeCoords = [leftEyeX, leftEyeY]
    const rightEyeX = resizedDetections.landmarks.getRightEye()[0].x
    const rightEyeY = resizedDetections.landmarks.getRightEye()[0].y
    const rightEyeCoords = [rightEyeX, rightEyeY]
    const eyeDistance = faceapi.euclideanDistance(leftEyeCoords, rightEyeCoords)
    console.log(`The distance b/w the eyes is ${eyeDistance}`)
    const noseTopX = resizedDetections.landmarks.getNose()[0].x
    const noseTopY = resizedDetections.landmarks.getNose()[0].y
    const noseTopCoords = [noseTopX, noseTopY]
    const noseBottomX = resizedDetections.landmarks.getNose()[6].x
    const noseBottomY = resizedDetections.landmarks.getNose()[6].y
    const noseBottomCoords = [noseBottomX, noseBottomY]
    const noseLength = faceapi.euclideanDistance(noseTopCoords, noseBottomCoords)
    console.log(`The nose length is ${noseLength}`)
    const ratio = (eyeDistance/noseLength).toFixed(2)
    if(ratio>1 && ratio<1.5)
    ratioEl.innerText = `The eyes / nose ratio of your face is: ${ratio}`
    console.log(`The eyes / nose ratio is: ${ratio}`)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
  }, 100)
})