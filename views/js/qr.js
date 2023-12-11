var video = document.createElement("video");
var canvasElement = document.getElementById("canvas");
var canvas = canvasElement.getContext("2d");
var loadingMessage = document.getElementById("loadingMessage");
var outputContainer = document.getElementById("outputs");
var outputMessage = document.getElementById("outputMessage");
var outputData = document.getElementById("outputData");
var result = document.getElementById("result");
var resultMessage = document.getElementById("resultMessage");

var choiceMessage = document.getElementById("choiceMessage");
var choiseButton = document.getElementById("choiceButton");
var requestID;

var dev_ids = ['0174928', '2536132', '9324812', '4524342']

var dids = resultMessage;

console.log("resultMessage")
console.log(dids[2])
console.log(results)
console.log("--resultMessage--")

function drawLine(begin, end, color) {
  canvas.beginPath();
  canvas.moveTo(begin.x, begin.y);
  canvas.lineTo(end.x, end.y);
  canvas.lineWidth = 4;
  canvas.strokeStyle = color;
  canvas.stroke();
}

// Use facingMode: environment to attemt to get the front camera on phones
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
  video.srcObject = stream;
  video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
  video.play();
  requestAnimationFrame(tick);
});

function tick() {
  loadingMessage.innerText = "Loading video..."
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    loadingMessage.hidden = true;
    canvasElement.hidden = false;
    outputContainer.hidden = false;

    canvasElement.height = video.videoHeight;
    canvasElement.width = video.videoWidth;
    canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
    var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
    var code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
    if (code) {
      drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
      drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
      drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
      drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
      outputMessage.hidden = true;
      outputData.parentElement.hidden = false;
      outputData.innerText = code.data;

      if (dev_ids.includes(code.data)) {
        result.innerText = "一致"
        result.parentElement.hidden = false;
        choiceMessage.parentElement.hidden = false;
        choiseButton.parentElement.hidden = false; 
        //location.href = '/result?data=' +  encodeURIComponent(code.data);
        //document.location.assign(location.href, '_blank');
      } else {
        result.innerText = dev_ids[0];
        result.parentElement.hidden = false;
      }

    } else {
      //outputMessage.hidden = false;
      //outputData.parentElement.hidden = true;
      //result.parentElement.hidden = true;
    }
  }
  requstID = requestAnimationFrame(tick);
}

function yes() {
  console.log("yes")
}

function no() {
  console.log("no")
  outputMessage.hidden = false;
  outputData.parentElement.hidden = true;
  result.parentElement.hidden = true;
  choiceMessage.parentElement.hidden = true;
  choiseButton.parentElement.hidden = true; 
  code.data = 0;
}
