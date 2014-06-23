var hvb_sentence_manager = {};
(function(self) {
	self.keyValueArray = [];
	self.kVACursor = 0;
	
    self.createSentenceCursor = function() {
        var count = 0;
        $(".hvb_next").each(function(i) {
            var key_value = $(this).text().split(",");
            var key = parseInt(key_value[0].trim(), 10);
            var value = key_value[1].trim();
			self.keyValueArray.push([key, value]);
            sessionStorage.setItem(key, value);
            count += 1;
        });
        sessionStorage.setItem('hvb_cursor', 0);
        sessionStorage.setItem('hvb_cursor_length', count);
        //console.log("hvb-sentences.createSentenceCursor: cursor length = ", count);
    };
    
    self.setNextSentence = function() {
        var cursor = sessionStorage.getItem('hvb_cursor');
        var end = sessionStorage.getItem('hvb_cursor_length');
        console.log("Cursor, end = ", cursor, end);
        if(!(self.kVACursor < self.keyValueArray.length)) {
            throw "42";
        }
		var nextKeyValue = self.keyValueArray[self.kVACursor];
		self.kVACursor += 1;
		console.log("nextKeyValue, self.kVACursor = ", nextKeyValue, self.kVACursor);
        var next_key = sessionStorage.key(cursor);
        var next_sentence = sessionStorage.getItem(next_key);
        sessionStorage.setItem('hvb_cursor', parseInt(next_key, 10) + 1);
		$('.hvb_sentence').html(nextKeyValue[1]);
    };
	
    self.getSentence = function() {
        return $('.hvb_sentence').html();
    };

    self.init = function() {
        self.createSentenceCursor();
        self.setNextSentence();
    };
}(hvb_sentence_manager));

window.hvb_sentence_manager = hvb_sentence_manager;


