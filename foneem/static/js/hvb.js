var hvbSentenceManager = {};

(function(exports) {
	var keyValueArray = [];
	var kVACursor = 0;
	
    exports.disableSentenceTextArea = function() {
        $('#sentence').attr("disabled", true);        
    }
    
    exports.createSentenceCursor = function() {
//        var count = 0;
		
        $(".hvb_next").each(function(i) {
            var key_value = $(this).text().split(",");
            var key = parseInt(key_value[0].trim(), 10);
            var value = key_value[1].trim();
			keyValueArray.push([key, value]);
    //        sessionStorage.setItem(key, value);
    //        count += 1;
        });
  //      sessionStorage.setItem('hvb_cursor', 0);
//        sessionStorage.setItem('hvb_cursor_length', count);
//		console.log("cursor lenght = ", count);
    };
    
    exports.setNextSentence = function() {
  //      var cursor = sessionStorage.getItem('hvb_cursor');
   //     var end = sessionStorage.getItem('hvb_cursor_length');
//		console.log("Cursor, end = ", cursor, end);
        if(!(kVACursor < keyValueArray.length)) {
            throw "42";
        }
		var nextKeyValue = keyValueArray[kVACursor];
		kVACursor += 1;
		console.log("nextKeyValue, kvacursor = ", nextKeyValue, kVACursor);
  ///      var next_key = sessionStorage.key(cursor);
     //   var next_sentence = sessionStorage.getItem(next_key);
//        sessionStorage.setItem('hvb_cursor', parseInt(next_key, 10) + 1);
        $('#sentence').text(nextKeyValue[1]);
    };
	
    exports.getSentence = function() {
        return $('#sentence').text();
    };
	
}(hvbSentenceManager));


var recorder = {};
(function(exports) {
    
	exports.init = function(e) {
        // creates the audio context
        audioContext = window.AudioContext || window.webkitAudioContext;
        context = new audioContext();

        // creates a gain node
        volume = context.createGain();

        // creates an audio node from the microphone incoming stream
        audioInput = context.createMediaStreamSource(e);

        // connect the stream to the gain node
        audioInput.connect(volume);

        /* From the spec: This value controls how frequently the audioprocess event is 
        dispatched and how many sample-frames need to be processed each call. 
        Lower values for buffer size will result in a lower (better) latency. 
        Higher values will be necessary to avoid audio breakup and glitches */
        var bufferSize = 2048;
        recorder = context.createJavaScriptNode(bufferSize, 2, 2);

        recorder.onaudioprocess = function(e){
	        if (!recording) return;
            var left = e.inputBuffer.getChannelData (0);
            var right = e.inputBuffer.getChannelData (1);
            // we clone the samples
            leftchannel.push (new Float32Array (left));
            rightchannel.push (new Float32Array (right));
            recordingLength += bufferSize;
        };

        // we connect the recorder
        volume.connect(recorder);
        recorder.connect(context.destination); 
    };   

    var leftchannel = [];
    var rightchannel = [];
    var recorder = null;
    var recording = false;
    var recordingLength = 0;
    var volume = null;
    var audioInput = null;
    var sampleRate = 44100;
    var audioContext = null;
    var context = null;
    var currentBlob = null;
	
    if (!navigator.getUserMedia)
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia;

    if (navigator.getUserMedia){
        navigator.getUserMedia({audio:true}, exports.init, function(e) {
        	alert('Error capturing audio.');
        });
    } else {
        alert('getUserMedia not supported in this browser.');
    }
		
    exports.startRecording = function() {      
	    recording = true;
        // reset the buffers for the new recording
        leftchannel.length = rightchannel.length = 0;
        recordingLength = 0;	
    };
    
    exports.stopRecording = function() {
		recording = false;
        // we flat the left and right channels down
        var leftBuffer = exports.mergeBuffers(leftchannel, recordingLength);
        var rightBuffer = exports.mergeBuffers(rightchannel, recordingLength);
        // we interleave both channels together
        var interleaved = exports.interleave(leftBuffer, rightBuffer);
        
        // we create our wav file
        var buffer = new ArrayBuffer(44 + interleaved.length * 2);
        var view = new DataView(buffer);
        
        // RIFF chunk descriptor
        exports.writeUTFBytes(view, 0, 'RIFF');
        view.setUint32(4, 44 + interleaved.length * 2, true);
        exports.writeUTFBytes(view, 8, 'WAVE');
        // FMT sub-chunk
        exports.writeUTFBytes(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        // stereo (2 channels)
        view.setUint16(22, 2, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 4, true);
        view.setUint16(32, 4, true);
        view.setUint16(34, 16, true);
        // data sub-chunk
        exports.writeUTFBytes(view, 36, 'data');
        view.setUint32(40, interleaved.length * 2, true);
        
        // write the PCM samples
        var lng = interleaved.length;
        var index = 44;
        var volume = 1;
        for (var i = 0; i < lng; i++){
            view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
            index += 2;
        }
        console.log("view stuff byteLenght = ",view.byteLength);
		
        // our final binary blob
        var blob = new Blob ( [ view ], { type : 'audio/wav' } );
		currentBlob = blob;
        // let's save it locally
        var url = (window.URL || window.webkitURL).createObjectURL(blob);
	    var li = window.document.createElement('li');
		var au = window.document.createElement('audio');
		var hf = window.document.createElement('a');
	    au.controls = true;
	    au.src = url;
        hf.href = url;
        hf.download = $('#sentence').text()+'-'+new Date().toISOString() + '.wav';
        hf.innerHTML = hf.download;
        li.appendChild(au);
        li.appendChild(hf);
        recordingslist.appendChild(li);
        /*var link = window.document.createElement('a');
        link.href = url;
        link.download = 'jpercent-output.wav';
        var click = document.createEvent("Event");
        click.initEvent("click", true, true);
        link.dispatchEvent(click);
        */
    };
	
	exports.upload = function(e) {
		if(currentBlob == null) {
			console.log("Blob does not exist");
			return
		}
		var blob = currentBlob;
		currentBlob = null;
		console.log("Blob size = ", blob.size, "Blob type  ", blob.type);
		
		function upload(blob) {
			var xhr=new XMLHttpRequest();
			xhr.onload=function(e) {
				if(this.readyState === 4) {
				    console.log("Server returned: ",e.target.responseText);
				}
			};
			var fd=new FormData();
			fd.append("test.wav",blob);
			filename = $('#sentence').text()+'-'+new Date().toISOString() + '.wav'
			xhr.open("POST","upload/"+filename,true);
			xhr.send(fd);
		}
		upload(blob);		 
	};
    
    exports.interleave = function(leftChannel, rightChannel) {
    	var length = leftChannel.length + rightChannel.length;
    	var result = new Float32Array(length);

    	var inputIndex = 0;

    	for (var index = 0; index < length; ){
    	    result[index++] = leftChannel[inputIndex];
    	    result[index++] = rightChannel[inputIndex];
    	    inputIndex++;
    	}
    	return result;
    };

    exports.mergeBuffers = function(channelBuffer, recordingLength) {
        var result = new Float32Array(recordingLength);
        var offset = 0;
        var lng = channelBuffer.length;
        for (var i = 0; i < lng; i++){
        	var buffer = channelBuffer[i];
        	result.set(buffer, offset);
        	offset += buffer.length;
        }
        return result;
    };

    exports.writeUTFBytes = function(view, offset, string) { 
        var lng = string.length;
        for (var i = 0; i < lng; i++){
        	view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    
}(recorder));


var hvbButtonManager = {};
(function(exports) {
    exports.bindClickEvents = function() {     
        $('#hvb_play').click(function(e) {
            var sentence = hvbSentenceManager.getSentence();
            console.log("the sentence = ", sentence)
            var msg = new SpeechSynthesisUtterance(sentence.trim());
            window.speechSynthesis.speak(msg);
        });
        
        $('#hvb_record').click(function(e) {
            console.log("record called ");
			recorder.startRecording();
        });
        
        $('#hvb_stop').click(function(e) {
            console.log("stop called");
			recorder.stopRecording();
			console.log("after stop recording called");
        });
        
        $('#hvb_submit').click(function(e) {
            console.log("submit called ");
			recorder.upload();
			hvbSentenceManager.setNextSentence();
        });
        
        
    };
}(hvbButtonManager));

$( document ).ready(function() {
	alert("Binding functions");
    hvbSentenceManager.disableSentenceTextArea();
    hvbSentenceManager.createSentenceCursor();
    hvbSentenceManager.setNextSentence();
    hvbButtonManager.bindClickEvents();
    console.log("initialization completed");
});

