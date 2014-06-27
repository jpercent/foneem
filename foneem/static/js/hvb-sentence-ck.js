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
var hvb_sentence_manager={};(function(e){e.keyValueArray=[];e.kVACursor=0;e.nextClass=".hvb-next";e.sentenceClass=".hvb-sentence";e.cursorKey="hvb-cursor";e.cursorLengthKey="hvb-cursor-length";e.createSentenceCursor=function(){var t=0;$(e.nextClass).each(function(n){var r=$(this).text().split(","),i=parseInt(r[0].trim(),10),s=r[1].trim();e.keyValueArray.push([i,s]);sessionStorage.setItem(i,s);t+=1});sessionStorage.setItem(e.cursorKey,0);sessionStorage.setItem(e.cursorLengthKey,t);console.log("hvb-sentences.createSentenceCursor: cursor length = ",t)};e.setNextSentence=function(){var t=sessionStorage.getItem(e.cursorKey),n=sessionStorage.getItem(e.cursorLengthKey);if(!(e.kVACursor<e.keyValueArray.length))throw"hvb-sentence.setNextSentence: FATAL: cursor out of bounds";var r=e.keyValueArray[e.kVACursor];e.kVACursor+=1;var i=sessionStorage.key(t),s=sessionStorage.getItem(i);sessionStorage.setItem(e.cursorKey,parseInt(i,10)+1);$(e.sentenceClass).html(r[1])};e.getSentence=function(){return $(e.sentenceClass).html()};e.init=function(){e.createSentenceCursor();e.setNextSentence()}})(hvb_sentence_manager);window.hvb_sentence_manager=hvb_sentence_manager;