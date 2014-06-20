var hvbSentenceManager = {};

(function(exports) {
	var keyValueArray = [];
	var kVACursor = 0;
	
    exports.createSentenceCursor = function() {
        var count = 0;
        $(".hvb_next").each(function(i) {
            var key_value = $(this).text().split(",");
            var key = parseInt(key_value[0].trim(), 10);
            var value = key_value[1].trim();
			keyValueArray.push([key, value]);
            sessionStorage.setItem(key, value);
            count += 1;
        });
        sessionStorage.setItem('hvb_cursor', 0);
        sessionStorage.setItem('hvb_cursor_length', count);
        console.log("hvb-sentences.createSentenceCursor: cursor length = ", count);
    };
    
    exports.setNextSentence = function() {
        var cursor = sessionStorage.getItem('hvb_cursor');
        var end = sessionStorage.getItem('hvb_cursor_length');
        console.log("Cursor, end = ", cursor, end);
        if(!(kVACursor < keyValueArray.length)) {
            throw "42";
        }
		var nextKeyValue = keyValueArray[kVACursor];
		kVACursor += 1;
		console.log("nextKeyValue, kvacursor = ", nextKeyValue, kVACursor);
        var next_key = sessionStorage.key(cursor);
        var next_sentence = sessionStorage.getItem(next_key);
        sessionStorage.setItem('hvb_cursor', parseInt(next_key, 10) + 1);
		$('.hvb_sentence').html(nextKeyValue[1]);
    };
	
    exports.getSentence = function() {
        return $('.hvb_sentence').html();
    };
}(hvbSentenceManager));

$(document).ready(function() {
    hvbSentenceManager.createSentenceCursor();
    hvbSentenceManager.setNextSentence();
});

