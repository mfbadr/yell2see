(function ( $ ) {
  $.fn.yell2see = function(options) {

    var jqObject = this;
    var settings = $.extend({
        // Values are normalized to be 0-100
        minToShow: 20, // 0% opacity below this value
                       // linear interpolate in between
        maxToShow: 80, // 100% opacity above this value
        permaShow: false // Permanently show nodes once maxToShow is hit
    }, options);

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
            var volume = getAverageVolume(array); 
            volume = volume * 100 / 255; // Normalize to 0-100
            var targetOpacityPct = 100;
            if (volume < settings.minToShow) {
              targetOpacityPct = 0;
            } else if (volume > settings.maxToShow) {
              targetOpacityPct = 100;
            } else {
              var range = settings.maxToShow - settings.minToShow;
              var distance = volume - settings.minToShow;
              targetOpacityPct = 100 * distance / range;
            }
            var opacity = targetOpacityPct / 100; // 0.0-1.0
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

        // Does this make it not get GCed?
        // https://bugzilla.mozilla.org/show_bug.cgi?id=934512
        // Answer: No, but it makes it play an annoying sound :D
        //window.source = mediaStreamSource;
        //source.connect(context.destination);
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
