(function ( $ ) {
  $.fn.yell2see = function(options) {

    var jqObject = this;

    //
    // Browser compatibility shims
    //
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!(AudioContext && navigator.getUserMedia)) {
      console.log("Error: audio APIs not supported");
    }

    //
    // Helper functions
    //
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

    function makeAnalyserNode(context) {
        analyser = context.createAnalyser();
        analyser.smoothingTimeConstant = 0.3;
        analyser.fftSize = 1024;
        return analyser;
    }

    function makeScriptNode(context, analyser, jqObject) {
        var node = context.createScriptProcessor(2048, 1, 1);
        node.onaudioprocess = function() {
            var array =  new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            var average = getAverageVolume(array);
            var opacity = average / 255;
            jqObject.css({'opacity': opacity});
        };
        return node;
    }

    function processStream(stream) {
        var context = new AudioContext();
        var mediaStreamSource = context.createMediaStreamSource( stream );
        var analyser = makeAnalyserNode(context);
        var javascriptNode = makeScriptNode(context, analyser, jqObject);
        mediaStreamSource.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(context.destination);
    }

    function didntGetStream(error) {
      alert(error);
    }

    //
    // Run
    //
    navigator.getUserMedia({audio:true}, processStream, didntGetStream);
    return this;
  };
}( jQuery ));

jQuery(function() { jQuery('.yell2see').yell2see();});
