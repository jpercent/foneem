var hvb_websock = {};
(function(self) {
    self.handlers = {};
    self.callbacks = [];

    self.registerHandler = function(code, handler) {
        self.handlers[code] = handler;
    };

    self.registerCallback = function(callback) {
        self.callbacks.push(callback);
    };

    self.send = function(message) {
        try {
            self.ws.send(message);
        } catch(e) {
            console.log("hvb_websock.send: ERROR: Exception ", e);
            throw e;
        }
    };

    self.onopen = function(event) {
        for (var i = 0; i < self.callbacks.length; i++) {
            self.callbacks[i]();
        }
    };

    self.onerror = function(event) {
        console.log("hvb_websock.onerror ERROR: websocket error event = ", e);
    };

    self.onmessage = function(msg) {
        var message = JSON.parse(msg.data);
        if (message) {
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
    };

    self.onclose = function() {
        try {
            self.ws.onclose = function () {
            };
            self.ws.close();
        } catch(e) {
            console.log("hvb_websock.onclose: ERROR exception raised while tyring to close the websock ", e);
        }
    };

    self.init = function() {
        if (!window.WebSocket) {
            alert("Websockets are not supported; this website will not work for you. Try upgrading to Chrome version > 35.0.1916.153");
            throw Exception("Websockets are not supported ");
        }

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
