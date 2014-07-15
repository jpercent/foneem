// Copyright (c) 2014 James Percent.
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
    self.sessionId = null;

    self.calibrated = function() {
        self.animator.nodeId = "hvb-analyser";
        self.animator.animate = false;
        $('#hvb-calibrate-modal').modal('hide');
        self.sessionNoiseFloor = self.recorder.computeAverageNoise();
        var message = JSON.stringify({'code': 'session', 'loudness': self.sessionNoiseFloor});
        console.log("noise = ", message);
        self.websock.send(message);
    };

    self.newSession = function(message) {
        console.log("message = ", message);
        self.sessionId = message['session_id'];
        self.completed = parseInt(message['completed']);
        self.sentencesPerSession = parseInt(message['sentences_per_session']);

        console.log("New session id = ", self.sessionId, " sentences per session ", self.sentencesPerSession);
        self.callback(self.sessionId, self.completed, self.sentencesPerSession, self.sessionNoiseFloor);
    };

    self.init = function(callback, recorder, animator, websock) {
        websock.registerHandler('session', self.newSession);

        animator.nodeId = "hvb-calibrate-analyser";
        animator.animate = true;
        $('#hvb-calibrate-modal').modal('show');
        recorder.startRecording();
        setTimeout(self.calibrated, 6000);

        self.callback = callback;
        self.recorder = recorder;
        self.animator = animator;
        self.websock = websock;
    };

}(hvb_calibrate));
window.hvb_calibrate = hvb_calibrate;



