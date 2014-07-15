
var hvb_login_checker = {};
(function(self) {
    self.bindLogin = function(e) {
	$.ajax({ 
	    url: '/is_teh_user_logged_in', 
	    async: false,
	    dataType: 'json',
	    success: function(data) {
		if (data.status == true) {
		    if (e.stopPropagation) {							
			e.stopPropagation();
		    } else {
			e.cancelBubble = true;
		    }
		    window.location = "record";							
		    return false;
		} else {
		    return true;					
		}
	    }
	});			        			
    };

    self.intitiatePasswordReset = function(email) {
        var url = '/initiate-reset/'+email;
        $.ajax({
            url: url
        });
    };

    self.init = function() {
        sessionStorage.setItem('hvb_password_reset', 'false');
        $('#hvb-record-link').click(self.bindLogin);
        $('#hvb-record-button').click(self.bindLogin);
        $('#hvb-record-ways-to-help').click(self.bindLogin);
        $('#hvb-password-reset').click(function(e) {
            e.preventDefault();
            var email = $("#hvb_login_modal_email").val();
            sessionStorage.setItem('hvb-password-reset', 'true');
            self.intitiatePasswordReset(email);
            $('#hvb-login-modal-index').hide();
            $('#hvb-reset-background').show();
        });

        $("#hvb-login-close").click(function(e) {
            if(sessionStorage.getItem('hvb-password-reset') === 'true') {
                sessionStorage.setItem('hvb-password-reset', 'false');
                $('#hvb-login-modal-index').delay(500).fadeToggle(true);
            }
            $('#hvb-reset-background').hide();
        });
    };

}(hvb_login_checker));

$(document).ready(function() {
    hvb_login_checker.init();
});

