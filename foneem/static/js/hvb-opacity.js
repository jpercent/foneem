var hvb_opacity = {};
(function(self) {

    self.defaultIncrement = .25;
    self.requestOpacityMessage = JSON.stringify({'code': 'get-opacity'});

    self.getIncrement = function(instances, increments) {
        if (increments == 0) {
            return self.defaultIncrement;
        } else if(increments < 10) {
            return self.defaultIncrement /(increments * 2);
        } else {
            return 1 / instances;
        }
    };

    self.updateOpacityByIncrement = function(id) {
        var not_found = true;
        console.log("update opacity by id = ", id);
        for(var i = 0; i < self.table.length; i++) {
            if(self.table[i]['id'] === id) {
                var increments = self.table[i]['increments'];
                var instances = self.table[i]['instances'];
                var opacity = self.table[i]['opacity'] + self.getIncrement(instances, increments);

                if (opacity > 1.0) {
                    opacity = 1.0;
                }

                if(opacity < 0){
                    opacity = 0;
                }

                self.setOpacity(id, opacity);
                var updateMessage = JSON.stringify({'code': 'opacity-update', 'css_id': id, 'opacity': opacity});
                self.websock.send(updateMessage);
                self.table[i]['increments']++;
                self.table[i]['opacity'] = opacity;
            }
        }
    };


    self.setOpacity = function(id, opacity) {
        console.log('set opacity id = ', id, " opacity = ", opacity);
        var element = document.getElementById(id);
        if(!element) {
            console.log("Opacity element undefined id,opacity = "+id.toString() +","+ opacity.toString());
            return
        }

        element.style.filter = "alpha(opacity="+opacity.toString()+");";
        element.style.MozOpacity = opacity;
        element.style.opacity = opacity;
        element.style.KhtmlOpacity = opacity;
        return opacity;
    };

    self.receiveOpacity = function(opacityMessage) {
        self.table = opacityMessage['opacity-array']

        for(var i = 0; i < self.table.length; i++) {

            var opacity = parseFloat(self.table[i]['opacity']);
            self.table[i]['opacity'] = opacity;

            var increments = parseInt(self.table[i]['increments']);
            self.table[i]['increments'] = increments;

            var instances = parseInt(self.table[i]['instances']);
            self.table[i]['instances'] = instances;

            var id = self.table[i]['id']

            self.setOpacity(id, opacity);
        }
    };

    self.requestOpacity = function() {
        self.websock.send(self.requestOpacityMessage);
    };

    self.initCallback = function() {
        console.log("hvb_opacity init callback");
        try {
            self.websock.registerHandler('set-opacity', self.receiveOpacity);
            self.requestOpacity();
        } catch (e ) {
            console.log("Failed to initialize websockets... ");
            alert("Failed to initialize websockets; try upgrading to Chrome version > 35.0.1916.153.");
        }
    };

    self.init = function(websock) {
        websock.registerCallback(self.initCallback);
        self.websock = websock;
    };

}(hvb_opacity));
window.hvb_opacity = hvb_opacity;