
var loginChecker = {};
(function(exports) {
	exports.bindLogin = function(e) {
		$.ajax({ url: '/is_teh_user_logged_in', 
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

    exports.bindClickEvents = function() {
        alert("binding login click events")
        $('#hvb-record-link').click(exports.bindLogin);
		$('#hvb-record-button').click(exports.bindLogin);
		$('#hvb-record-ways-to-help').click(exports.bindLogin);
        $('#hvb-password-reset').click(function(e) {
            alert("TRAPPED IT!");
            e.preventDefault();
            $('#hvb-login-modal-index').toggle();
            $('#hvb-reset-background').toggle();
            alert("Background reset");
        });
    };
}(loginChecker));

$( document ).ready(function() {
    loginChecker.bindClickEvents();
});

