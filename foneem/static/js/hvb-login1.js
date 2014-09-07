
hvb_form_fields1 = {};
(function(self) {
    self.hvbSubmitButtonId = 'hvb-register1-submit';

    self.keys = ['hvb-language', 'hvb-language1', 'hvb-height-inches', 'hvb-height-feet', 'hvb-sounding', 'hvb-accent',
        'hvb-state', 'hvb-state1', 'hvb-country','hvb-country1'];

    self.keyMap = {
        'hvb-language':  {'name': 'first_language'},
        'hvb-language1': {'name': 'second_language'},
        'hvb-height-inches': {'name': 'height_inches'},
        'hvb-height-feet': {'name': 'height_feet'},
        'hvb-sounding': {'name': 'voice_sound'},
        'hvb-accent': {'name': 'accent'},
        'hvb-state': {'name': 'stateprovince'},
        'hvb-state1': {'name': 'stateprovince1'},
        'hvb-country': {'name': 'country'},
        'hvb-country1': {'name': 'country1'}
    };

    self.init = function() {
        document.getElementById(self.hvbSubmitButtonId).onclick = self.makeRegistrationRequest;
    };

    self.makeFormFieldsPost = function (previous, id, index, keysArray) {
        var field = self.keyMap[id];
        if(typeof field !== 'undefined') {
            if(typeof field.name !== 'undefined') {
                var currentValue = document.getElementById(id).value;
                previous[field.name] = currentValue;
            }
        }
        return previous;
    };

    self.validateField = function(id, index, array) {
        if(!self.valid) {
            return;
        }
        var element = document.getElementById(id);
        self.validateId(element);
    };

    self.validateId = function(element) {
        currentVal = element.value;
        if (!currentVal) {
            var background = element.style.background;
            element.style.background = 'red'
            self.valid = false;
            return;
        }
        element.style.background = null;
    };

    self.makeRegistrationRequest = function() {
        self.valid = true;
        self.keys.forEach(self.validateField);
        if(!self.valid){
            console.log("validation failed..");
            return;
        }

        var registration = self.keys.reduceRight(self.makeFormFieldsPost, {});
        console.log('registration = ', registration);
        $.ajax({
            url: 'registration1_post',
            type: 'POST',
            async: false,
            dataType: 'text',
            data: registration,
            //PlainObject data, String textStatus, jqXHR jqXHR
            success: function(data, textStatus, jqXHR){
//                alert('SUCCESS');
                window.location = '/record?calibrate=false';
            },
            //jqXHR jqXHR, String textStatus, String errorThrown
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("ERROR Jxhrd = ", jqXHR);
                alert('Registration failed: '+jqXHR.responseText);
            }
        });
    };
}(hvb_form_fields1));

$(document).ready(function() {
    hvb_form_fields1.init();
});

