'use strict'

//filter
var filtersSelect = document.querySelector('select#filter');

//picture
var snapshot = document.querySelector('button#snapshot');
var picture = document.querySelector('canvas#picture');
picture.width = 640;
picture.height = 480;

var videoplay = document.querySelector('video#player');

function gotMediaStream(stream){
    var videoTrack = stream.getVideoTracks()[0];

    window.stream = stream;
    videoplay.srcObject = stream;
}

function handleError(err){
    console.log('getUserMedia error:', err);
}

function start() {

    if(!navigator.mediaDevices ||
       !navigator.mediaDevices.getUserMedia){

        console.log('getUserMedia is not supported!');
        return;

    }else{

        //var deviceId = videoSource.value; 
        var constraints = {
            video : {
                width: 640,	
                height: 480,
                frameRate:15,
                facingMode: 'enviroment'
		//,
                //deviceId : deviceId ? {exact:deviceId} : undefined 
            }, 
            audio : false 
        }

        navigator.mediaDevices.getUserMedia(constraints)
            .then(gotMediaStream)
            .catch(handleError);
    }
}

filtersSelect.onchange = function(){
    videoplay.className = filtersSelect.value;
}

snapshot.onclick = function() {
    let value = filtersSelect.value;
    var ctx = picture.getContext('2d');
    switch (value) {
        case "blur":
        ctx.filter = "blur(3px)";
        break;
        case "sepia":
        case "grayscale":
        case "invert":
        ctx.filter = value + "(1)";
        break;
        default:
        ctx.filter = "none";
        break;
    }
    // picture.className = filtersSelect.value;
    ctx.drawImage(videoplay, 0, 0, picture.width, picture.height);
}


function downLoad(url){
    var oA = document.createElement("a");
    oA.download = 'photo';// 设置下载的文件名，默认是'下载'
    oA.href = url;
    document.body.appendChild(oA);
    oA.click();
    oA.remove(); // 下载之后把创建的元素删除
}

document.querySelector("button#save").onclick = function (){
    downLoad(picture.toDataURL("image/jpeg"));
}

start();
