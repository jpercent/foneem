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
window.AudioContext=window.AudioContext||window.webkitAudioContext;var hvb_audio={};(function(e){e.audioContext=null;e.realAudioInput=null;e.inputPoint=null;e.audioInput=null;e.analyserNode=null;e.rafID=null;e.callbacks=[];e.registerCallback=function(t){e.callbacks.push(t)};e.initStream=function(t){e.audioContext=new AudioContext;e.inputPoint=e.audioContext.createGain();e.realAudioInput=e.audioContext.createMediaStreamSource(t);e.audioInput=e.realAudioInput;e.audioInput.connect(e.inputPoint);e.analyserNode=e.audioContext.createAnalyser();e.analyserNode.fftSize=2048;e.inputPoint.connect(e.analyserNode);e.zeroGain=e.audioContext.createGain();e.zeroGain.gain.value=0;e.inputPoint.connect(e.zeroGain);e.zeroGain.connect(e.audioContext.destination);for(var n=0;n<e.callbacks.length;n++)e.callbacks[n](e)};e.initAudio=function(){navigator.getUserMedia||(navigator.getUserMedia=navigator.webkitGetUserMedia||navigator.mozGetUserMedia);navigator.getUserMedia({audio:!0},e.initStream,function(e){alert("Error getting audio");console.log(e)})}})(hvb_audio);window.hvb_audio=hvb_audio;