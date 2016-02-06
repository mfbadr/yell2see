//browser compatibility shims
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

//
navigator.getUserMedia({audio:true}, function(stream) {
    var context = new AudioContext();
    //source node from mic stream
    var mediaStreamSource = context.createMediaStreamSource( stream );

    // setup a analyzer
    analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 1024;
    //var sourceNode = context.createBufferSource();
    //sourceNode.connect(analyser);

    var nodes = $('.yell2see');

    var javascriptNode = context.createScriptProcessor(2048, 1, 1);
    javascriptNode.onaudioprocess = function() {
        //console.log("onaudioprocess");

        // get the average, bincount is fftsize / 2
        var array =  new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        var average = getAverageVolume(array);


        var opacity = average / 255;
        nodes.css({'opacity': opacity});


    };
    function getAverageVolume(array) {
        // console.log("getAverageVolume");
        var values = 0;
        var average;

        var length = array.length;

        // get all the frequency amplitudes
        for (var i = 0; i < length; i++) {
            values += array[i];
        }

        average = values / length;
        //console.log(average);
        return average;
    }

    mediaStreamSource.connect(analyser);
    analyser.connect(javascriptNode);
    javascriptNode.connect(context.destination);


}, function(e) { console.log("error", e);})

