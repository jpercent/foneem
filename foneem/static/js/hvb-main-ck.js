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
var hvb_button_manager={};(function(e){e.recordButtonId="hvb-record-sentence";e.nextButtonId="hvb-next-sentence";e.playButtonId="hvb-play-sentence";e.sentenceConsoleId="hvb-sentence-console";e.initCallback=function(t){window.hvb_audio_animation.init(t.rafID,t.analyserNode);window.hvb_recorder.init(t);document.getElementById(e.recordButtonId).onclick=function(t){window.hvb_audio_animation.flipAnimationState();if(window.hvb_recorder.recording){window.hvb_recorder.stopRecording();e.wirePlaybackButton()}else{e.unwirePlaybackButton();window.hvb_recorder.startRecording()}};document.getElementById(e.nextButtonId).onclick=function(t){e.unwirePlaybackButton();window.hvb_recorder.upload();window.hvb_sentence_manager.setNextSentence()};document.getElementById(e.sentenceConsoleId).onclick=function(e){var t=window.hvb_sentence_manager.getSentence(),n=new SpeechSynthesisUtterance(t.trim());window.speechSynthesis.speak(n)}};e.wirePlaybackButton=function(){var t=window.hvb_recorder.soundFileUrl,n=document.getElementById(e.playButtonId);n.innerHTML="Playback";n.onclick=function(e){n.innerHTML="Playback <audio src='"+t+"' autoplay></audio>"}};e.unwirePlaybackButton=function(){var t=document.getElementById(e.playButtonId);t.innerHTML="";t.onclick=null};e.init=function(){window.hvb_sentence_manager.init();window.hvb_audio.registerCallback(e.initCallback);window.hvb_audio.initAudio()}})(hvb_button_manager);window.addEventListener("load",hvb_button_manager.init);