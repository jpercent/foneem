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

hvb_audio_animation = {};
(function(self) {
    self.rafID = null;
    self.analyserNode = null;
    self.animate = false;

    self.drawAnimation = function(canvasWidth, canvasHeight, analyserContext) {
        if(self.animate) {
            var distribution = 3;
            var barWidth = 1;
            var bars = Math.round(canvasWidth);
            var freqByteData = new Uint8Array(self.analyserNode.frequencyBinCount);

            self.analyserNode.getByteFrequencyData(freqByteData);

            analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
            analyserContext.fillStyle = '#F6D565';
            analyserContext.lineCap = 'round';
            var multiplier = self.analyserNode.frequencyBinCount / bars;

            // Draw rectangle for each frequency bin.
            for (var i = 0; i < bars; ++i) {
                var magnitude = 20;
                var offset = Math.floor(i * multiplier);

                // sum/average the block, or we miss narrow-bandwidth spikes
                for (var j = 0; j< multiplier; j++) {
                    magnitude += freqByteData[offset + j];
                }
                magnitude = magnitude / multiplier;
                var magnitude2 = freqByteData[i * multiplier];
                analyserContext.fillStyle = "hsl( " + Math.round((i*360)/bars) + ", 100%, 50%)";
                //console.log("I = ", i, "distribution = ", distribution, " barwidth = ", barWidth, " -magnitude= ", -magnitude);
                analyserContext.fillRect(i * distribution, canvasHeight, barWidth, -magnitude);
            }
        } else {
            analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
        }
        self.rafID = window.requestAnimationFrame(self.updateAnimation);
    };

    self.updateAnimation = function(time) {
        try {
            var canvas = document.getElementById(self.nodeId);
            var canvasWidth = canvas.width;
            var canvasHeight = canvas.height;
            var analyserContext = canvas.getContext('2d');
            self.drawAnimation(canvasWidth, canvasHeight, analyserContext);
        } catch (e) {
            console.log("node id = ", self.nodeId);
            console.log("updateAnalysers Exception: ", e);
        }
    };

    self.flipAnimationState = function() {
        if(self.animate) {
            self.animate = false;
        } else {
            console.log("animate.. ");
            self.animate = true;
        }
    };

    self.cancelAnimationFrame = function() {
        window.cancelRequestAnimationFrame(self.rafID);
        self.rafID = null;
    };


    self.init = function(rafID, analyserNode, nodeId) {
        self.rafID = rafID;
        self.analyserNode = analyserNode;

        if(!nodeId){
            self.nodeId = 'hvb-analyser';
        } else {
            self.nodeId = nodeId;
        }

        if (!navigator.cancelAnimationFrame) {
            navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
        }
        if (!navigator.requestAnimationFrame) {
            navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;
        }
        self.updateAnimation();
    };

}(hvb_audio_animation));

window.hvb_audio_animation = hvb_audio_animation;
