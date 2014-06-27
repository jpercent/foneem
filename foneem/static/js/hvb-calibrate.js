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

var hvb_calibrate = {};
(function(self) {

    self.calibrateButtonId = 'hvb-calibrate-button';
    self.recordUrl = '/record';
    self.clicked = false;

    self.initCallback = function(hvb_audio) {
        hvb_audio_animation.init(hvb_audio.rafID, hvb_audio.analyserNode);
        document.getElementById(self.calibrateButtonId).onclick = function(event) {
            if(self.clicked) {
                return;
            }

            window.hvb_audio_animation.flipAnimationState();
            window.setInterval(self.recordRedirect, 6000);
        };
    };

    self.recordRedirect = function() {
        window.location = self.recordUrl;
    };

    self.init = function() {
        window.hvb_audio.registerCallback(self.initCallback);
        window.hvb_audio.initAudio(self.initCallback);
    };

}(hvb_calibrate));

window.addEventListener('load', hvb_calibrate.init);


