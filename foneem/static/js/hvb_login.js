
var loginChecker = {};
(function(exports) {
    exports.bindLogin = function(e) {
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

    exports.intitiatePasswordReset = function(email) {
	var url = '/initiate-reset/'+email;
	$.ajax({ 
	    url: url,
	});			        				
    };

    exports.bindClickEvents = function() {
        $('#hvb-record-link').click(exports.bindLogin);
	$('#hvb-record-button').click(exports.bindLogin);
	$('#hvb-record-ways-to-help').click(exports.bindLogin);
        $('#hvb-password-reset').click(function(e) {
            e.preventDefault();
	    var email = $("#hvb_login_modal_email").val();
	    sessionStorage.setItem('hvb_password_reset', 'true');
	    exports.intitiatePasswordReset(email);
            $('#hvb-login-modal-index').hide();
            $('#hvb-reset-background').show();
        });

	$("#hvb-login-close").click(function(e) {
	  var password_reset_value = sessionStorage.getItem('hvb_password_reset');
	  if(password_reset_value === 'true') {
	      sessionStorage.setItem('hvb_password_reset', 'false');
	      $('#hvb-login-modal-index').delay(500).fadeToggle(true);
	  }
          $('#hvb-reset-background').hide();
	});
    };

}(loginChecker));

$( document ).ready(function() {
    // W3C spec says sessionStorage should accept booleans, but it is
    // not supported at this time. The value true gets coersed into
    // 'true', so, because true/false is readable, we use
    // 'true'/'false' string literals explicitly. Avoids type
    // coerision today and bugs tomorrow.
    sessionStorage.setItem('hvb_password_reset', 'false');
    loginChecker.bindClickEvents();
});

