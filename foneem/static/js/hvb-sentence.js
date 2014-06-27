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

var hvb_sentence_manager = {};
(function(self) {
	self.keyValueArray = [];
	self.kVACursor = 0;
    self.nextClass = '.hvb-next';
    self.sentenceClass = '.hvb-sentence';
    self.cursorKey = 'hvb-cursor';
    self.cursorLengthKey = 'hvb-cursor-length'
	
    self.createSentenceCursor = function() {
        var count = 0;
        $(self.nextClass).each(function(i) {
            var key_value = $(this).text().split(",");
            var key = parseInt(key_value[0].trim(), 10);
            var value = key_value[1].trim();
			self.keyValueArray.push([key, value]);
            sessionStorage.setItem(key, value);
            count += 1;
        });
        sessionStorage.setItem(self.cursorKey, 0);
        sessionStorage.setItem(self.cursorLengthKey, count);
        console.log("hvb-sentences.createSentenceCursor: cursor length = ", count);
    };
    
    self.setNextSentence = function() {
        var cursor = sessionStorage.getItem(self.cursorKey);
        var end = sessionStorage.getItem(self.cursorLengthKey);
        if(!(self.kVACursor < self.keyValueArray.length)) {
            throw "hvb-sentence.setNextSentence: FATAL: cursor out of bounds";
        }
		var nextKeyValue = self.keyValueArray[self.kVACursor];
		self.kVACursor += 1;
        var next_key = sessionStorage.key(cursor);
        var next_sentence = sessionStorage.getItem(next_key);
        sessionStorage.setItem(self.cursorKey, parseInt(next_key, 10) + 1);
		$(self.sentenceClass).html(nextKeyValue[1]);
    };
	
    self.getSentence = function() {
        return $(self.sentenceClass).html();
    };

    self.init = function() {
        self.createSentenceCursor();
        self.setNextSentence();
    };
}(hvb_sentence_manager));

window.hvb_sentence_manager = hvb_sentence_manager;


