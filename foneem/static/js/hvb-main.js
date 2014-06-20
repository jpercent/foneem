


// requires hvb-record.js and hvb-sentence.js
var hvbButtonManager = {};
(function(exports) {
    exports.bindClickEvents = function() {     
        $('#hvb_playsentence').click(function(e) {
            var sentence = hvbSentenceManager.getSentence();
            var msg = new SpeechSynthesisUtterance(sentence.trim());
            window.speechSynthesis.speak(msg);
        });
        
        $('#hvb_recordsentence').click(function(e) {
			var class_value = $(this).attr('class');
			if (class_value == 'hvb_record') {
				$(this).attr('class', 'hvb_stop');
				$(this).html('Stop');
				recorder.startRecording();
				toggleRecording(e);				
			} else {
				$(this).attr('class', 'hvb_record');
				$(this).html('Record');
				recorder.stopRecording();
				toggleRecording(e);
			}
        });
        
        $('#hvb_nextsentence').click(function(e) {
			recorder.upload();
			hvbSentenceManager.setNextSentence();
        });
    };
}(hvbButtonManager));

$(document).ready(function() {
    hvbSentenceManager.createSentenceCursor();
    hvbSentenceManager.setNextSentence();
    hvbButtonManager.bindClickEvents();
});

