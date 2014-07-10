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

var hvb_recorder = {};
(function(self) {
    self.leftchannel = [];
    self.rightchannel = [];
    self.audio_node = null;
    self.recording = false;
    self.recordingLength = 0;
    self.sampleRate = null;
    self.currentBlob = null;

    self.startRecording = function() {
	    self.recording = true;
        // reset the buffers for the new recording
        self.leftchannel.length = self.rightchannel.length = 0;
        self.recordingLength = 0;
    };
    
    self.stopRecording = function(upload) {
		self.recording = false;
        if(upload === false) {
            self.currentBlob = null;
            return;
        }

        // we flat the left and right channels down
        var leftBuffer = self.mergeBuffers(self.leftchannel, self.recordingLength);
        var rightBuffer = self.mergeBuffers(self.rightchannel, self.recordingLength);
        // we interleave both channels together
        var interleaved = self.interleave(leftBuffer, rightBuffer);
        var rms = self.getRms(interleaved);
        // we create our wav file
        var buffer = new ArrayBuffer(44 + interleaved.length * 2);
        var view = new DataView(buffer);
        // RIFF chunk descriptor
        self.writeUTFBytes(view, 0, 'RIFF');
        view.setUint32(4, 44 + interleaved.length * 2, true);
        self.writeUTFBytes(view, 8, 'WAVE');
        // FMT sub-chunk
        self.writeUTFBytes(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        // stereo (2 channels)
        view.setUint16(22, 2, true);
        view.setUint32(24, self.sampleRate, true);
        view.setUint32(28, self.sampleRate * 4, true);
        view.setUint16(32, 4, true);
        view.setUint16(34, 16, true);
        // data sub-chunk
        self.writeUTFBytes(view, 36, 'data');
        view.setUint32(40, interleaved.length * 2, true);
        // write the PCM samples
        var lng = interleaved.length;
        var index = 44;
        var volume = 1;
        for (var i = 0; i < lng; i++){
            view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
            index += 2;
        }
        console.log("blob length = ",view.byteLength, " sampleRate = ", self.sampleRate);
		self.currentBlob = new Blob([ view ], { type : 'audio/wav' });
        self.soundFileUrl = (window.URL || window.webkitURL).createObjectURL(self.currentBlob);
        return [rms, interleaved];
    };

    self.computeAverageNoise = function() {
		self.recording = false;

        var leftBuffer = self.mergeBuffers(self.leftchannel, self.recordingLength);
        var rightBuffer = self.mergeBuffers(self.rightchannel, self.recordingLength);
        var interleaved = self.interleave(leftBuffer, rightBuffer);
        console.log("sample values = ", interleaved.length);
        return self.getRms(interleaved);
    };

    self.getRms = function(interleaved) {
        var total = 0;
        for(var i = 0; i < interleaved.length; i++) {
            total += (interleaved[i] * interleaved[i]);
        }
        var average = total/interleaved.length;

        var rms = Math.sqrt((total/interleaved.length));
        var decibel = Math.abs((Math.log(rms) / Math.log(10)));

        console.log("average = ", average, " total = ", total, "rms = ", rms, "db = ", decibel);
        return rms;
    };

	self.upload = function(filename) {
		if(self.currentBlob == null) {
			return 0;
		}
		var blob = self.currentBlob;
		self.currentBlob = null;
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
			xhr.open("POST","upload/"+filename,true);
			xhr.send(fd);
            var headers = xhr.getAllResponseHeaders();
            console.log("headers = ", headers, " blob length = ", blob.size);
            return blob.size;
		}
		return upload(blob);
	};

    self.interleave = function(leftChannel, rightChannel) {
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

    self.mergeBuffers = function(channelBuffer, recordingLength) {
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

    self.writeUTFBytes = function(view, offset, string) {
        var lng = string.length;
        for (var i = 0; i < lng; i++){
        	view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

	self.init = function(hvb_audio) {
        /* From the spec: This value controls how frequently the audioprocess event is
        dispatched and how many sample-frames need to be processed each call.
        Lower values for buffer size will result in a lower (better) latency.
        Higher values will be necessary to avoid audio breakup and glitches */
        var bufferSize = 2048;
        if(!hvb_audio.audioContext.createScriptProcessor){
            self.audioProcessingNode = hvb_audio.audioContext.createJavaScriptNode(bufferSize, 2, 2);
        } else {
            self.audioProcessingNode = hvb_audio.audioContext.createScriptProcessor(bufferSize, 2, 2);
        }
        self.sampleRate = hvb_audio.audioContext.sampleRate;

        self.audioProcessingNode.onaudioprocess = function(e){
	        if (!self.recording) {
                return;
            }

            var left = e.inputBuffer.getChannelData(0);
            var right = e.inputBuffer.getChannelData(1);
            // clone samples
            self.leftchannel.push (new Float32Array (left));
            self.rightchannel.push (new Float32Array (right));
            self.recordingLength += bufferSize;
        };
        hvb_audio.inputPoint.connect(self.audioProcessingNode);
        self.audioProcessingNode.connect(hvb_audio.audioContext.destination);
    };
}(hvb_recorder));
window.hvb_recorder = hvb_recorder;


