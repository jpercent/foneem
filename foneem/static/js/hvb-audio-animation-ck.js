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
hvb_audio_animation={};(function(e){e.rafID=null;e.analyserNode=null;e.animate=!1;e.drawAnimation=function(t,n,r){if(e.animate){var i=3,s=1,o=Math.round(t/i),u=new Uint8Array(e.analyserNode.frequencyBinCount);e.analyserNode.getByteFrequencyData(u);r.clearRect(0,0,t,n);r.fillStyle="#F6D565";r.lineCap="round";var a=e.analyserNode.frequencyBinCount/o;for(var f=0;f<o;++f){var l=0,c=Math.floor(f*a);for(var h=0;h<a;h++)l+=u[c+h];l/=a;var p=u[f*a];r.fillStyle="hsl( "+Math.round(f*360/o)+", 100%, 50%)";r.fillRect(f*i,n,s,-l)}}e.rafID=window.requestAnimationFrame(e.updateAnimation)};e.updateAnimation=function(t){try{var n=document.getElementById("hvb-analyser"),r=n.width,i=n.height,s=n.getContext("2d");e.drawAnimation(r,i,s)}catch(o){console.log("updateAnalysers Exception: ",o)}};e.flipAnimationState=function(){e.animate?e.animate=!1:e.animate=!0};e.cancelAnimationFrame=function(){window.cancelRequestAnimationFrame(e.rafID);e.rafID=null};e.init=function(t,n){e.rafID=t;e.analyserNode=n;navigator.cancelAnimationFrame||(navigator.cancelAnimationFrame=navigator.webkitCancelAnimationFrame||navigator.mozCancelAnimationFrame);navigator.requestAnimationFrame||(navigator.requestAnimationFrame=navigator.webkitRequestAnimationFrame||navigator.mozRequestAnimationFrame);e.updateAnimation()}})(hvb_audio_animation);window.hvb_audio_animation=hvb_audio_animation;