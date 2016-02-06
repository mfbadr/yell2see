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
    var sourceNode = context.createBufferSource();
    var javascriptNode = context.createScriptProcessor(2048, 1, 1);
    // setup a analyzer
    analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 1024;
    sourceNode.connect(analyser);
    analyser.connect(javascriptNode);
    

    // create a buffer source node
    sourceNode = context.createBufferSource();
    javascriptNode.connect(context.destination);
    javascriptNode.onaudioprocess = function() {
 
        // get the average, bincount is fftsize / 2
        var array =  new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        var average = getAverageVolume(array)
 
        // clear the current state
        ctx.clearRect(0, 0, 60, 130);
 
        // set the fill style
        ctx.fillStyle=gradient;
 
        // create the meters
        ctx.fillRect(0,130-average,25,130);
    }
 
    function getAverageVolume(array) {
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
    

}, function(e) { console.log("error", e);})

