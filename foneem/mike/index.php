<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js"> <!--<![endif]-->

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <title>The Human Voicebank</title>
    <meta name="description" content="The Human Voicebank is an initiative dedicated to exploring the frontiers of human voice.">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta property="og:image" content="http://www.northeastern.edu/humanvoicebank/images/rupal-ted.png"/>

    <!-- Bootstrap CSS -->
    <link href="stylesheets/application.css" rel="stylesheet" type="text/css">
    
    <!-- Mailchimp CSS -->
    <link href="//cdn-images.mailchimp.com/embedcode/slim-081711.css" rel="stylesheet" type="text/css">

    <!-- Fonts -->
    <link href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css" rel="stylesheet" type="text/css">
    <link href='http://fonts.googleapis.com/css?family=Josefin+Sans:400,700,400italic,700italic' rel='stylesheet' type='text/css'>
    <link href='http://fonts.googleapis.com/css?family=Raleway:700,900' rel='stylesheet' type='text/css'>
    
    <!-- IE -->
    <!--[if lt IE 9]> <script> document.createElement('video'); </script> <![endif]-->
</head>

<body id="page-top" data-spy="scroll" data-target=".navbar-custom">
<!-- Facebook -->
<div id="fb-root"></div>
<script>(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=763373647030403";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));</script>

    <nav class="navbar navbar-custom navbar-fixed-top" role="navigation">
        <div class="container">
            <div class="navbar-header page-scroll">
                <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-main-collapse">
                    <i class="fa fa-bars"></i>
                </button>
                <a class="navbar-brand" href="./">
                <img src="./images/hvb-icon.svg" width="40px" height="40px">
                </a>
            </div>

            <!-- Collect the nav links, forms, and other content for toggling -->
            <div class="collapse navbar-collapse navbar-right navbar-main-collapse">
                <ul class="nav navbar-nav">
                    <!-- Hidden li included to remove active class from about link when scrolled up past about section -->
                    <li class="hidden">
                        <a href="#page-top"></a>
                    </li>
                    <li class="page-scroll">
                        <a href="#" data-toggle="modal" data-target="#record-modal">Record</a>
                    </li>
                    <li class="page-scroll">
                        <a href="#" data-toggle="modal" data-target="#donate-modal">Donate</a>
                    </li>
                    <li class="page-scroll">
                        <a href="#" data-toggle="modal" data-target="#story-modal">Our Story</a>
                    </li>
                    <li class="page-scroll">
                        <a href="#contact">Stay Informed</a>
                    </li>
                </ul>
            </div>
            <!-- /.navbar-collapse -->
        </div>
        <!-- /.container -->
    </nav>

    <section class="intro">
        <div class="intro-body">
        	<video autoplay loop poster="videos/hvb-intro.jpg" id="bgvid" class="visible-md visible-lg">
				<source src="videos/hvb-intro.webm" type="video/webm">
				<source src="videos/hvb-intro.mp4" type="video/mp4">
			</video>
            <div class="container">
                <div class="row">
                    <div class="col-md-8 col-md-offset-2">
                    	<h1>
							<img src="images/hvb-logo.svg" alt="The Human Voicebank Initiative" id="logo-splash">
						</h1>
                        <a href="#about" class="btn btn-default btn-learn">Learn More</a>
                        <a href="#" data-toggle="modal" data-target="#record-modal" class="btn btn-default btn-record"><i class="fa fa-microphone fa-fw"></i> <span>Record</span></a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="about" class="container content-section text-center">
        <div class="row">
            <div class="col-lg-8 col-lg-offset-2">
                <h2 class="intro-text">The Human Voicebank Initiative is dedicated to exploring the frontiers of voice.</h2>
                <hr>
                <h2><strong>Changing lives one voice at a time.</strong></h2>
			</div>
        </div>
                <div class="ways-to-help">
	                <div class="col-inside">
	                	<a href="#" data-toggle="modal" data-target="#story-modal" class="learn-color"><img src="images/learn.svg" alt="Learn" id="learn-image">
	                	<h3>Learn</h3></a>
	                	<p>Learn more about our platform for voice technologies and scientific discovery.</p>
	                </div>
                </div>
                <div class="ways-to-help">
	                <div class="col-inside">
	                	<a href="#" data-toggle="modal" data-target="#record-modal" class="record-color"><img src="images/record.svg" alt="Record" id="record-image">
	                	<h3>Record</h3></a>
	                	<p>Give the gift of voice today. All you need is a microphone and a quiet room.</p>
	                </div>
                </div>
                <div class="ways-to-help">
	                <div class="col-inside">
	                	<a href="#" data-toggle="modal" data-target="#donate-modal" class="donate-color"><img src="images/donate.svg" alt="Donate" id="donate-image">
	                	<h3>Donate</h3></a>
	                	<p>Support The Human Voicebank, an initiative at Northeastern University.</p>
	                </div>
                </div>
                <div class="ways-to-help">
	                <div class="col-inside">
	                	<a href="#contact" class="share-color"><img src="images/share.svg" alt="Share" id="share-image">
	                	<h3>Share</h3></a>
	                	<p>The community begins with you. Share our site with friends and family.</p>
	                </div>
                </div>
    </section>

    <section id="press" class="content-section text-center">
        <div class="press-section">
            <div class="container">
                <div class="col-lg-8 col-lg-offset-2">
                	<center>
                	<h2 class="header">In the News</h2>
                    <h3 class="quote hidden-xs">"...a life-changing development..."</h2>
                    <span class="attributed hidden-xs">— Fast Company</span>
                    </center>
                </div>
            </div>
            <span class="caption container-fluid"><div class="col-sm-2 col-sm-offset-1"><a href="http://www.ted.com/talks/rupal_patel_synthetic_voices_as_unique_as_fingerprints"><img src="images/press-ted.png" class="center-block"></a></div><div class="col-sm-2"><a href="http://www.npr.org/blogs/health/2013/03/11/173816690/new-voices-for-the-voiceless-synthetic-speech-gets-an-upgrade"><img src="images/press-npr.png" class="center-block"></a></div><div class="col-sm-3"><a href="http://www.fastcoexist.com/3023239/a-new-kind-of-voice-prosthetic-will-eliminate-generic-robo-voices"><img src="images/press-fastco.png" class="center-block"></a></div><div class="col-sm-3"><a href="http://www.huffingtonpost.com/2013/09/13/vocalid_n_3915829.html"><img src="images/press-huffington.png" class="center-block"></a></div></span>
        </div>
    </section>

    <footer id="contact" class="content-section text-center">
        <div class="contact-section">
            <div class="container">
                <div class="col-lg-8 col-lg-offset-2">
                    <h2>15,000+ pledges and counting. <a href="./record/"><br class="visible-xs"><em>Add your voice.</em></a></h2><br>
                    <ul class="list-inline banner-social-buttons">
	                    <li><a href="http://twitter.com/intent/tweet?url=http://www.humanvoicebank.org&amp;text=I'm pledging to donate my voice to @HumanVoicebank. Join me and add your voice today:" class="btn btn-twitter btn-lg" data-lang="en" title="Write A Tweet"><span class="network-name hidden-xs"><i class="fa fa-twitter fa-fw"></i> @HumanVoicebank</span><span class="network-name visible-xs"><i class="fa fa-twitter fa-fw"></i> Twitter</span></a>
	                    </li>
	                    <li><a href="https://www.facebook.com/sharer/sharer.php?u=http://www.northeastern.edu/humanvoicebank/" class="btn btn-facebook btn-lg" title="Post to Facebook"><span class="network-name hidden-xs"><i class="fa fa-facebook fa-fw"></i> /HumanVoicebank</span><span class="network-name visible-xs"><i class="fa fa-facebook fa-fw"></i> Facebook</span></a>
	                    </li>
					</ul>
					<br>
						<!-- Begin MailChimp Signup Form -->
						<div id="mc_embed_signup">
						<form action="http://humanvoicebank.us6.list-manage.com/subscribe/post?u=0ea30692c32f083061eac72ab&amp;id=7280f59bb6" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
							<input type="email" value="" name="EMAIL" class="email" id="mce-EMAIL" placeholder="Enter your e-mail address" required>
						    <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
						    <div style="position: absolute; left: -5000px;"><input type="text" name="b_0ea30692c32f083061eac72ab_7280f59bb6" value=""></div>
						    <input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="btn btn-default btn-submit">
						</form>
						</div>
						<!--End mc_embed_signup-->
                </div>
            </div>
        </div>
    </footer>
    
    <div class="modal fade" id="donate-modal" tabindex="-1" role="dialog" aria-labelledby="Donate to The Human Voicebank" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">x</button>
            </div>
            <div class="modal-body">
            <center>
                <h2><strong>Thank you for your support.</strong></h2> <p>Every dollar you give makes a difference in the lives of those without voices, and pushes us forward in the field of voice research and technology.</p>
                <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
					<input type="hidden" name="cmd" value="_s-xclick">
					<input type="hidden" name="hosted_button_id" value="UYSLUPBG5YSZN">
					<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
					<img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
					</form>
            </center>
            </div>
    </div>
  </div>
  </div>
  
      <div class="modal fade" id="story-modal" tabindex="-1" role="dialog" aria-labelledby="Our Story" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">x</button>
            </div>
            <div class="modal-body">
            <center>
            <iframe src="http://embed.ted.com/talks/lang/en/rupal_patel_synthetic_voices_as_unique_as_fingerprints.html" width="854" height="480" frameborder="0" scrolling="no" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>
            </center>
            </div>
    </div>
  </div>
  </div>
  
  <div class="modal fade" id="record-modal" tabindex="-1" role="dialog" aria-labelledby="Record" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">x</button>
            </div>
            <div class="modal-body row">
	            <div class="login account col-md-6"><center>
	            	<h3><strong>Login to Your Account</strong></h3>
	            	<i class="fa fa-facebook-square fa-4x"></i> <i class="fa fa-twitter-square fa-4x"></i> <i class="fa fa-google-plus-square fa-4x"></i> <i class="fa fa-linkedin-square fa-4x fa-last"></i>
	            	<div class="loginform-container">
						<form action="process_form.php" class="loginform" method="post" novalidate="">
							<div id="login-email-container" class="login-field">
								<input type="email" name="email" placeholder="Your email address" id="login-email" required="required">
							</div>
							<div id="login-password-container" class="login-field">
								<input type="password" name="password" placeholder="Your password" id="login-password" required="required">
							</div>
							<div id="form-submit" class="login-field clearfix submit">
								<input type="submit" value="Login">
							</div>
						</form>
					</div>
	            </center></div>
	            <div class="create account col-md-6"><center>
	            	<h3><strong>Create An Account</strong></h3>
	            	<p>Donate your voice today.</p>
	            	<a href="./register.php" class="btn btn-signup">Sign Up</a>
	            </center></div>
            </div>
    </div>
  </div>
  </div>

    <!-- Core JavaScript Files -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
    <script src="//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script>
    <script src="//code.jquery.com/ui/1.10.4/jquery-ui.js"></script>
    <script src="http://cdnjs.cloudflare.com/ajax/libs/jquery-easing/1.3/jquery.easing.min.js"></script>
    <script type="text/javascript" src="//platform.twitter.com/widgets.js"></script>
    
    <!-- Custom JavaScript Files -->
    <script src="js/easing-scrolling.js"></script>
    <script src="js/jquery.responsiveVideo.js"></script>
    
    <script>
    $( 'body' ).responsiveVideo();
    </script>
    <script>
  $(function() {
    $( ".modal" ).draggable();
  });
  </script>

</body>

</html>