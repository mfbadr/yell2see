if (!navigator.getUserMedia) {
    navigator.getUserMedia = navigator.getUserMedia 
                           || navigator.webkitGetUserMedia 
                           || navigator.mozGetUserMedia 
                           || navigator.msGetUserMedia;    
}
if (! window.AudioContext) {
    if (! window.webkitAudioContext) {
        alert('no audiocontext found');
    }
    window.AudioContext = window.webkitAudioContext;
}

navigator.getUserMedia({audio:true}, function(stream) {
    var context = new AudioContext();
    var mediaStreamSource = context.createMediaStreamSource( stream );

    // setup a analyzer
    analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 1024;
    //var sourceNode = context.createBufferSource();
    //sourceNode.connect(analyser);
    var ctx = $("#canvas").get()[0].getContext("2d");
    var gradient = ctx.createLinearGradient(0,0,0,130);
    gradient.addColorStop(1,'#000000');
    gradient.addColorStop(0.75,'#ff0000');
    gradient.addColorStop(0.25,'#ffff00');
    gradient.addColorStop(0,'#ffffff');
    console.log("yoo");

    var javascriptNode = context.createScriptProcessor(2048, 1, 1);
    javascriptNode.onaudioprocess = function() {
        console.log("onaudioprocess");
 
        // get the average, bincount is fftsize / 2
        var array =  new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        var average = getAverageVolume(array);
 
        // clear the current state
        ctx.clearRect(0, 0, 60, 130);
 
        // set the fill style
        ctx.fillStyle=gradient;
 
        // create the meters
        ctx.fillRect(0,130-average,25,130);
    };
    function getAverageVolume(array) {
        console.log("getAverageVolume");
        var values = 0;
        var average;
 
        var length = array.length;
 
        // get all the frequency amplitudes
        for (var i = 0; i < length; i++) {
            values += array[i];
        }
 
        average = values / length;
        return average;
    }
    
    mediaStreamSource.connect(analyser);
    analyser.connect(javascriptNode);
    javascriptNode.connect(context.destination);

}, function(e) { console.log("error", e);})

