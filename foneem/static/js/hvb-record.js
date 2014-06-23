// Copyright (c) James Percent 2014.
// All rights reserved.
// Redistribution and use in source and binary forms, with or without modification,
// are permitted provided that the following conditions are met:
//
//    1. Redistributions of source code must retain the above copyright notice,
//       this list of conditions and the following disclaimer.
//
//    2. Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//
//    3. Neither the name of Unlock nor the names of its contributors may be used
//       to endorse or promote products derived from this software without
//       specific prior written permission.

// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
// ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

var recorder = {};
(function(exports) {

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

	exports.init = function(media_stream) {
        audioContext = window.AudioContext || window.webkitAudioContext;
        context = new audioContext();
        zeroGain = context.createGain();
		zeroGain.gain.value = 0.0;
        audioInput = context.createMediaStreamSource(media_stream);
        audioInput.connect(zeroGain);
		
        /* From the spec: This value controls how frequently the audioprocess event is 
        dispatched and how many sample-frames need to be processed each call. 
        Lower values for buffer size will result in a lower (better) latency. 
        Higher values will be necessary to avoid audio breakup and glitches */
        var bufferSize = 2048;
        recorder = context.createScriptProcessor(bufferSize, 2, 2);
		
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
        zeroGain.connect(recorder);
        recorder.connect(context.destination); 
    };   

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
    };
	
	exports.upload = function(e) {
		if(currentBlob == null) {
//			console.log("Blob does not exist");
			return;
		}
		var blob = currentBlob;
		currentBlob = null;
//		console.log("Blob size = ", blob.size, "Blob type  ", blob.type);
		
		function upload(blob) {
			var xhr=new XMLHttpRequest();
			xhr.onload=function(e) {
				if(this.readyState === 4) {
				    console.log("Server returned: ",e.target.responseText);
				}
			};
			var fd=new FormData();
			fd.append("test.wav",blob);
			filename = $('.hvb_sentence').html()+'-'+new Date().toISOString() + '.wav'
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
        var length = channelBuffer.length;
        for (var i = 0; i < length; i++){
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

    self.init = function(hvb_audio) {

    };

}(recorder));


