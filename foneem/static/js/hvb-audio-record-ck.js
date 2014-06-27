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
var hvb_recorder={};(function(e){e.leftchannel=[];e.rightchannel=[];e.audio_node=null;e.recording=!1;e.recordingLength=0;e.sampleRate=null;e.currentBlob=null;e.startRecording=function(){e.recording=!0;e.leftchannel.length=e.rightchannel.length=0;e.recordingLength=0};e.stopRecording=function(){e.recording=!1;var t=e.mergeBuffers(e.leftchannel,e.recordingLength),n=e.mergeBuffers(e.rightchannel,e.recordingLength),r=e.interleave(t,n),i=new ArrayBuffer(44+r.length*2),s=new DataView(i);e.writeUTFBytes(s,0,"RIFF");s.setUint32(4,44+r.length*2,!0);e.writeUTFBytes(s,8,"WAVE");e.writeUTFBytes(s,12,"fmt ");s.setUint32(16,16,!0);s.setUint16(20,1,!0);s.setUint16(22,2,!0);s.setUint32(24,e.sampleRate,!0);s.setUint32(28,e.sampleRate*4,!0);s.setUint16(32,4,!0);s.setUint16(34,16,!0);e.writeUTFBytes(s,36,"data");s.setUint32(40,r.length*2,!0);var o=r.length,u=44,a=1;for(var f=0;f<o;f++){s.setInt16(u,r[f]*32767*a,!0);u+=2}console.log("blob length = ",s.byteLength," sampleRate = ",e.sampleRate);var l=new Blob([s],{type:"audio/wav"});e.soundFileUrl=(window.URL||window.webkitURL).createObjectURL(l);console.log("sound file url = ",e.soundFileUrl);e.currentBlob=l};e.upload=function(t){function r(e){var t=new XMLHttpRequest;t.onload=function(e){this.readyState===4&&console.log("Server returned: ",e.target.responseText)};var n=new FormData;n.append("test.wav",e);filename=$(".hvb-sentence").html()+"-"+(new Date).toISOString()+".wav";t.open("POST","upload/"+filename,!0);t.send(n)}if(e.currentBlob==null)return;var n=e.currentBlob;e.currentBlob=null;console.log("Blob size = ",n.size,"Blob type  ",n.type);r(n)};e.interleave=function(e,t){var n=e.length+t.length,r=new Float32Array(n),i=0;for(var s=0;s<n;){r[s++]=e[i];r[s++]=t[i];i++}return r};e.mergeBuffers=function(e,t){var n=new Float32Array(t),r=0,i=e.length;for(var s=0;s<i;s++){var o=e[s];n.set(o,r);r+=o.length}return n};e.writeUTFBytes=function(e,t,n){var r=n.length;for(var i=0;i<r;i++)e.setUint8(t+i,n.charCodeAt(i))};e.init=function(t){var n=2048;t.audioContext.createScriptProcessor?e.audioProcessingNode=t.audioContext.createScriptProcessor(n,2,2):e.audioProcessingNode=t.audioContext.createJavaScriptNode(n,2,2);e.sampleRate=t.audioContext.sampleRate;e.audioProcessingNode.onaudioprocess=function(t){if(!e.recording)return;var r=t.inputBuffer.getChannelData(0),i=t.inputBuffer.getChannelData(1);e.leftchannel.push(new Float32Array(r));e.rightchannel.push(new Float32Array(i));e.recordingLength+=n};t.inputPoint.connect(e.audioProcessingNode);e.audioProcessingNode.connect(t.audioContext.destination)}})(hvb_recorder);window.hvb_recorder=hvb_recorder;