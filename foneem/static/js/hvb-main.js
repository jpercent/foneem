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

var hvb_button_manager = {};
(function(self) {
    self.recording = false;

    self.init = function() {
        window.hvb_sentence_manager.init();

        document.getElementById('hvb-play-sentence').onclick(function(e) {
            var sentence = hvbSentenceManager.getSentence();
            var msg = new SpeechSynthesisUtterance(sentence.trim());
            window.speechSynthesis.speak(msg);
        });

        document.getElementById('hvb-record-sentence').onclick(function(e) {
            if(self.recording) {
				recorder.stopRecording();
				toggleRecording(e);
                self.recording = false;
            } else {
				$(this).attr('class', 'hvb_stop');
				$(this).html('Stop');
				recorder.startRecording();
				toggleRecording(e);
                self.recording = true;
            }
//			var class_value = $(this).attr('class');
//			if (class_value == 'hvb_record') {

//			} else {
//				$(this).attr('class', 'hvb_record');
//				$(this).html('Record');
//
//			}
        });
        
        document.getElementById('hvb-next-sentence').onclick(function(e) {
			recorder.upload();
			window.hvb_sentence_manager.setNextSentence();
        });
    };

}(hvb_button_manager));

window.addEventListener('load', window.hvb_button_manager.init);

