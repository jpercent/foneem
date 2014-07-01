var hvb_websock = {};
(function(self) {

    self.handlers = {};

    self.registerHandler = function(code, handler) {
        self.handlers[code] = handler;
    };

    self.send = function(message) {
        self.ws.send(message);
    };

    self.onopen = function(event) {
        self.callback();
        console.log("Opened.. ");
    };

    self.onerror = function(event) {
        alert("Error websocket setup");
    };

    self.onmessage = function(msg) {
        //console.log("receive: msg = ", msg);
        // XXX - this shit needs to be rewritten already
        var message = JSON.parse(msg.data);
        if (message) {
            console.log("Code");
            if (typeof(message.code) !== 'undefined') {
                var code = message['code'];
                if (typeof(self.handlers[code]) !== 'undefined') {
                    self.handlers[code](message);
                } else {
                    console.log("hvb_websock: No handler in table");
                }
            }
        } else {
            console.log("hvb_websock: no code in message ");
        }
        //console.log("hvb_receive: message = ", message);
    };
//                setTimeout(self.tryInitComplete, 500);

    self.onclose = function() {
        self.ws.onclose = function () {};
        self.ws.close();
    };

    self.init = function(callback) {
        if (!window.WebSocket) {
            alert("Websockets are not supported; this website will not work for you. Try upgrading to Chrome version > 35.0.1916.153");
            throw Exception("Websockets are not supported ");
        }

        self.callback = callback;

        try {
            self.ws = new WebSocket("ws://" + document.domain + ":5000/websocket");
            self.ws.onopen = self.onopen;
            self.ws.onmessage = self.onmessage;
            var onbeforeunload = window.onbeforeunload;
            window.onbeforeunload = function () {
                self.onclose();
                if(onbeforeunload) {
                    onbeforeunload();
                }
            };
        } catch (e) {
            console.log("hvb-sentence.init: FATAL exception websockets not supported; make sure your browser is uptodate ", e);
            throw e;
        }
    };

}(hvb_websock));
window.hvb_websock = hvb_websock;
