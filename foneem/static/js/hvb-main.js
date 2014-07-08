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

var hvb_main = {};

(function(self) {
    self.recordButtonId = 'hvb-record-sentence';
    self.nextButtonId = 'hvb-next-sentence';
    self.playButtonId = 'hvb-play-sentence';
    self.sentenceConsoleId = 'hvb-sentence-console';
    self.sentenceReload = false;
//    self.time = new Date();
    self.upload = true;

   self.handleSentenceConsoleClick = function(e) {
       var sentence = window.hvb_sentence_manager.getSentence();
       var msg = new SpeechSynthesisUtterance(sentence.trim());
       window.speechSynthesis.speak(msg);
   };

   self.handleRecordClick = function(e) {
       window.hvb_audio_animation.flipAnimationState();
       if(window.hvb_recorder.recording) {
           self.stopRecording(e);
       } else {
           self.startRecording(e);
       }
   };

   self.stopRecording = function(e) {
       self.data = window.hvb_recorder.stopRecording(self.upload);
       document.getElementById(self.recordButtonId).innerHTML = "<i class=\"fa fa-circle\"></i><br>Record</button>";
       self.wirePlaybackButton();
       window.clearTimeout(self.currentTimeoutId);
   };

   self.startRecording = function(e) {
//       self.recordingTime = self.time.getTime();
       self.unwirePlaybackButton();
       document.getElementById(self.recordButtonId).innerHTML = "<i class=\"fa fa-square\"></i><br>Stop</button>";
       window.hvb_recorder.startRecording();
       self.currentTimeoutId = window.setTimeout(self.forceStop, 15000);
   };

    self.forceStop = function() {
        self.upload = false;
        self.stopRecording(self.upload);
        alert("This recording took longer than 15 seconds. The recording was stopped and the data was discarded. Please re-record.")
        self.upload = true;
    };

   self.handleNextClick = function(e) {
       if(self.sentenceReload === true) {
           console.log("next disabled while next sentences are loading.. ");
           return;
       }

       self.unwirePlaybackButton();
       filename = $('.hvbsentence-text').html()+'-'+new Date().toISOString() + '.wav'
       //var upload_size = window.hvb_recorder.upload(filename);
       if(self.data[1].length > 1024) {
           // xxx - this should be refactored
           var message = JSON.stringify({'code': 'upload-audio', 'filename': filename, 'rms': self.data[0], 'data': self.data[1], 'sample_rate': window.hvb_recorder.sampleRate, 'length': self.data[1].length});
           window.hvb_websock.send(message);
           // https://s3.amazonaws.com/human-voice-bank/j1@empty-set.net-Good_morning.-2014-07-03T04_24_12.055Z.wav
           self.sentenceReload = window.hvb_sentence_manager.updateSentencesCompletedAndSetNextSentence(self.clearReload, self.sessionId, self.rms, 'https://s3.amazonaws.com/human-voice-bank/'+filename);
       } else {
           self.sentenceReload = window.hvb_sentence_manager.setNextSentence(self.clearReload);
       }
   };

   self.clearReload = function() {
       self.sentenceReload = false;
   };

   self.wirePlaybackButton = function() {
        var soundFileUrl = window.hvb_recorder.soundFileUrl;
        var playbackButton = document.getElementById(self.playButtonId);
        playbackButton.innerHTML = "<i class='fa fa-play'></i><br>Playback";
        playbackButton.onclick = function(e) {
            playbackButton.innerHTML = "<i class='fa fa-play'></i><br>Playback <audio src='"+soundFileUrl+"' autoplay></audio>";
        }
   };

    self.unwirePlaybackButton = function() {
        var playbackButton = document.getElementById(self.playButtonId);
        playbackButton.innerHTML = '';
        playbackButton.onclick = null;
    };

   self.afterCalibration = function(sessionId) {
       console.log("after calibration");
       window.hvb_sentence_manager.sessionId = sessionId;
       self.sessionId = sessionId;

       document.getElementById(self.recordButtonId).onclick = self.handleRecordClick;
       document.getElementById(self.nextButtonId).onclick = self.handleNextClick;
       document.getElementById(self.sentenceConsoleId).onclick = self.handleSentenceConsoleClick;
   };

   self.initCallback = function(hvb_audio) {
       window.hvb_audio_animation.init(hvb_audio.rafID, hvb_audio.analyserNode);
       window.hvb_recorder.init(hvb_audio);
       window.hvb_calibrate.init(self.afterCalibration, window.hvb_recorder, window.hvb_audio_animation, window.hvb_websock);
    };

   self.init = function() {
       window.hvb_sentence_manager.init(window.hvb_websock, window.hvb_opacity);
       window.hvb_websock.init();
       window.hvb_audio.registerCallback(self.initCallback);
       window.hvb_audio.initAudio();
   };

}(hvb_main));

window.addEventListener('load', hvb_main.init);

