var hvbSentenceManager={};(function(e){var t=[],n=0;e.createSentenceCursor=function(){$(".hvb_next").each(function(e){var n=$(this).text().split(","),r=parseInt(n[0].trim(),10),i=n[1].trim();t.push([r,i])})};e.setNextSentence=function(){if(!(n<t.length))throw"42";var e=t[n];n+=1;console.log("nextKeyValue, kvacursor = ",e,n);$(".hvb_sentence").html(e[1])};e.getSentence=function(){return $(".hvb_sentence").html()}})(hvbSentenceManager);var recorder={};(function(e){e.init=function(e){f=window.AudioContext||window.webkitAudioContext;l=new f;o=l.createGain();u=l.createMediaStreamSource(e);u.connect(o);var a=2048;r=l.createJavaScriptNode(a,2,2);r.onaudioprocess=function(e){if(!i)return;var r=e.inputBuffer.getChannelData(0),o=e.inputBuffer.getChannelData(1);t.push(new Float32Array(r));n.push(new Float32Array(o));s+=a};o.connect(r);r.connect(l.destination)};var t=[],n=[],r=null,i=!1,s=0,o=null,u=null,a=44100,f=null,l=null,c=null;navigator.getUserMedia||(navigator.getUserMedia=navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia||navigator.msGetUserMedia);navigator.getUserMedia?navigator.getUserMedia({audio:!0},e.init,function(e){alert("Error capturing audio.")}):alert("getUserMedia not supported in this browser.");e.startRecording=function(){i=!0;t.length=n.length=0;s=0};e.stopRecording=function(){i=!1;var r=e.mergeBuffers(t,s),o=e.mergeBuffers(n,s),u=e.interleave(r,o),f=new ArrayBuffer(44+u.length*2),l=new DataView(f);e.writeUTFBytes(l,0,"RIFF");l.setUint32(4,44+u.length*2,!0);e.writeUTFBytes(l,8,"WAVE");e.writeUTFBytes(l,12,"fmt ");l.setUint32(16,16,!0);l.setUint16(20,1,!0);l.setUint16(22,2,!0);l.setUint32(24,a,!0);l.setUint32(28,a*4,!0);l.setUint16(32,4,!0);l.setUint16(34,16,!0);e.writeUTFBytes(l,36,"data");l.setUint32(40,u.length*2,!0);var h=u.length,p=44,d=1;for(var v=0;v<h;v++){l.setInt16(p,u[v]*32767*d,!0);p+=2}console.log("view stuff byteLenght = ",l.byteLength);var m=new Blob([l],{type:"audio/wav"});c=m};e.upload=function(e){function n(e){var t=new XMLHttpRequest;t.onload=function(e){this.readyState===4&&console.log("Server returned: ",e.target.responseText)};var n=new FormData;n.append("test.wav",e);filename=$(".hvb_sentence").html()+"-"+(new Date).toISOString()+".wav";t.open("POST","upload/"+filename,!0);t.send(n)}if(c==null){console.log("Blob does not exist");return}var t=c;c=null;console.log("Blob size = ",t.size,"Blob type  ",t.type);n(t)};e.interleave=function(e,t){var n=e.length+t.length,r=new Float32Array(n),i=0;for(var s=0;s<n;){r[s++]=e[i];r[s++]=t[i];i++}return r};e.mergeBuffers=function(e,t){var n=new Float32Array(t),r=0,i=e.length;for(var s=0;s<i;s++){var o=e[s];n.set(o,r);r+=o.length}return n};e.writeUTFBytes=function(e,t,n){var r=n.length;for(var i=0;i<r;i++)e.setUint8(t+i,n.charCodeAt(i))}})(recorder);var hvbButtonManager={};(function(e){e.bindClickEvents=function(){$("#hvb_playsentence").click(function(e){var t=hvbSentenceManager.getSentence(),n=new SpeechSynthesisUtterance(t.trim());window.speechSynthesis.speak(n)});$("#hvb_recordsentence").click(function(e){var t=$(this).attr("class");if(t=="hvb_record"){$(this).attr("class","hvb_stop");$(this).html("Stop");recorder.startRecording()}else{$(this).attr("class","hvb_record");$(this).html("Record");recorder.stopRecording()}});$("#hvb_nextsentence").click(function(e){recorder.upload();hvbSentenceManager.setNextSentence()})}})(hvbButtonManager);$(document).ready(function(){hvbSentenceManager.createSentenceCursor();hvbSentenceManager.setNextSentence();hvbButtonManager.bindClickEvents()});