// Copyright (c) James Percent.
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
//
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

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var hvb_audio = {};
(function(self) {

    self.audioContext = null;
    self.realAudioInput = null;
    self.inputPoint = null;
    self.audioInput = null;
    self.analyserNode = null;
    self.rafID = null;
    self.callbacks = [];

    self.registerCallback = function(callback) {
        self.callbacks.push(callback);
    };

    self.initStream = function(stream) {
        self.audioContext = new AudioContext();
        self.inputPoint = self.audioContext.createGain();
        self.realAudioInput = self.audioContext.createMediaStreamSource(stream);
        self.audioInput = self.realAudioInput;
        self.audioInput.connect(self.inputPoint);
        self.analyserNode = self.audioContext.createAnalyser();
        self.analyserNode.fftSize = 2048;
        self.inputPoint.connect(self.analyserNode);
        self.zeroGain = self.audioContext.createGain();
        self.zeroGain.gain.value = 0.0;
        self.inputPoint.connect(self.zeroGain);
        self.zeroGain.connect(self.audioContext.destination);
        for(var i = 0; i < self.callbacks.length; i++) {
            self.callbacks[i](self);
        }
    };

    self.initAudio = function() {
        if (!navigator.getUserMedia) {
            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        }

        navigator.getUserMedia({audio:true}, self.initStream, function(e) {
            alert('Error getting audio');
            console.log(e);
        });
    };

}(hvb_audio));

window.hvb_audio = hvb_audio;
