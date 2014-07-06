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
    self.nextClass = '.hvb-next';
    self.sentenceClass = '.hvb-sentence';
    self.cursorKey = 'hvb-cursor';
    self.cursorLengthKey = 'hvb-cursor-length';
    self.count = 2;
    self.next_sentence_message = JSON.stringify({'code': 'next-sentence', 'count': self.count});
    self.current = '';
    self.requestIncomplete = false;
    self.reloadCallback = null;

    self.makeSentenceRequest = function() {
        console.log("requesting more sentences ");
        self.websock.send(self.next_sentence_message);
    };

    self.getSentence = function() {
        var sentence = self.current[0].trim();
        return sentence;
    }

    self.parseSentence = function(sentence) {
        var sentence_phoneme_split = sentence.sentence.trim().split(":");
        var sentence = sentence_phoneme_split[0].trim();
        self.current = sentence_phoneme_split;
        return sentence;
    };

    self.setNextSentence = function(reloadCallback) {
        if(self.iter == self.sentences.length) {
            self.reloadCallback = reloadCallback;
            self.makeSentenceRequest();
            $(self.sentenceClass).html('<p class="hvbsentence-text">....</p>');
            return true;
        }

        var sentence = self.parseSentence(self.sentences[self.iter]);
        $(self.sentenceClass).html('<p class="hvbsentence-text">' + sentence + '</p>');
        //console.log("set next sentence ", self.iter, self.sentences[self.iter], self.sentences.length);
        self.iter++;
        return false;
    };

    self.updateSentencesCompletedAndSetNextSentence = function(reloadCallback) {
        var ret = false;
        var message = {'code': 'sentence-update', 'id': self.sentences[(self.iter-1)]['id']};
        if(self.iter == self.sentences.length) {
            self.reloadCallback = reloadCallback;
            var message = {'code': 'sentence-update-and-get', 'id': self.sentences[(self.iter-1)]['id'], 'count': self.count};
            $(self.sentenceClass).html('<p class="hvbsentence-text">....</p>');
            ret = true;
        }

        for(var i = 1; i < self.current.length; i++) {
            self.opacity.updateOpacityByIncrement(self.current[i].trim());
        }
        self.websock.send(JSON.stringify(message));
        if(ret === false) {
            self.setNextSentence(reloadCallback);
        }
    };

    self.receiveNextSentenceBlock = function(nextSentenceMessage) {
        self.sentences = nextSentenceMessage['sentences'];
        self.iter = 0;
        self.setNextSentence();
        if(self.reloadCallback !== null) {
            self.reloadCallback();
            self.reloadCallback = null;
        }
    };

    self.initCallback = function() {
        try {
            self.websock.registerHandler('next-sentence', self.receiveNextSentenceBlock);
            self.makeSentenceRequest();
        } catch (e ) {
            console.log("Failed to initialize websockets... ");
            alert("Failed to initialize websockets; try upgrading to Chrome version > 35.0.1916.153.");
        }
    };

    self.init = function(websock, opacity) {
        websock.registerCallback(self.initCallback);
        opacity.init(websock);
        self.websock = websock;
        self.opacity = opacity;
    };

}(hvb_sentence_manager));

window.hvb_sentence_manager = hvb_sentence_manager;


