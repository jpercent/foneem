hvb_form_fields = {};
(function(self) {
    self.hvbSubmitButtonId = 'hvb-register-submit';

    self.keys = ['hvb-first-name', 'hvb-last-name', 'hvb-gender', 'hvb-state', 'hvb-country', 'hvb-mob',
        'hvb-yob', 'hvb-email', 'hvb-confirm-email', 'hvb-confirm-password', 'hvb-password', 'hvb-consent'];

    self.keyMap = {
        'hvb-first-name': {'name': 'firstname'},
        'hvb-last-name': {'name': 'lastname'},
        'hvb-gender': {'name': 'gender'},
        'hvb-state': {'name': 'stateprovince'},
        'hvb-country': {'name': 'country'},
        'hvb-mob': {'name': 'dob', 'combine': 'hvb-yob', 'monthday': true},

        'hvb-email': {'name': 'email', 'confirmId': 'hvb-confirm-email', 'email': true},
        'hvb-password': {'name': 'password', 'confirmId': 'hvb-confirm-password'},
        'hvb-consent' : {'checkbox': true}
    };

    self.init = function() {
        document.getElementById(self.hvbSubmitButtonId).onclick = self.makeRegistrationRequest;
    };

    self.makeFormFieldsPost = function (previous, id, index, keysArray) {
        var field = self.keyMap[id];
        if(typeof field !== 'undefined') {
            if(typeof field.name !== 'undefined') {
                var currentValue = document.getElementById(id).value;
                if(typeof field.combine !== 'undefined') {
                    var combineValue = document.getElementById(field.combine).value;
                    currentValue = currentValue+'/01/'+combineValue;
                }
                previous[field.name] = currentValue;
            }
        }
        return previous;
    };

    self.validateField = function(id, index, array) {
        if(!self.valid) {
            //alert("validate file short circuited... ");
            return;
        }
        var element = document.getElementById(id);
        self.validateId(element);

        if(typeof self.keyMap[id] !== 'undefined') {
            var confirmId = self.keyMap[id].confirmId;
            if(typeof confirmId !== 'undefined') {
                confirmElement = document.getElementById(confirmId);
                self.validateConfirmation(element, confirmElement);
            }
            var email = self.keyMap[id].email;
            if(typeof email !== 'undefined') {
                self.validateEmail(element);
            }

            var checkbox = self.keyMap[id].checkbox;
            if(typeof checkbox !== 'undefined') {
                element.style.background = null;
                if(!element.checked) {
                    self.valid = false;
                    divElement = document.getElementById('hvb-consent-div');
                    divElement.style.background = 'red';
                    return;
                } else {
                    divElement = document.getElementById('hvb-consent-div');
                    divElement.style.background = null;
                }
            }
        }
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

    self.validateConfirmation = function(element, confirmElement) {
        var currentVal = element.value;
        var confirmVal = confirmElement.value;

        if (confirmVal !== currentVal) {
//            alert("confirm failed, "+element.id);
            element.style.background = 'red';
            confirmElement.style.background = 'red';
            console.log("Confirmation does not match value = ", currentVal, " confirmVal = ", confirmVal);
            self.valid = false;
            return;
        }
        element.style.background = null;
        confirmElement.style.background = null;
    };

    self.validateEmail = function(element) {
        var currentVal = element.value;
        var atSym = currentVal.indexOf('@');
        var dotSym = currentVal.lastIndexOf('.');
        if(atSym < 1 || (dotSym - atSym < 2)) {
            self.valid = false;
            element.style.background = 'red';
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
            url: 'registration_post',
            type: 'POST',
            async: false,
            dataType: 'text',
            data: registration,
            //PlainObject data, String textStatus, jqXHR jqXHR
            success: function(data, textStatus, jqXHR){
                //alert('SUCCESS');
                window.location = 'record';
            },
            //jqXHR jqXHR, String textStatus, String errorThrown
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("ERROR Jxhrd = ", jqXHR);
                alert('Registration failed: '+jqXHR.responseText);
            }
        });
    };
}(hvb_form_fields));

$(document).ready(function() {
    hvb_form_fields.init();
});
