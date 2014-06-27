var hvb_opacity = {};
(function(self) {
    self.id = '';
    self.name = '';
    self.opacity = 0.0;
    self.increment = .25;


    self.updateOpacityByIncrement = function() {
        self.updateOpacity(self.increment);
    };

    self.updateOpacity = function(increase) {
        self.opacity = self.opacity + increase;
        if (self.opacity > 1.0) {
            self.opacity = 1.0;
        }
        self.setOpacity();
    };

    self.setOpacity = function() {
        var element = document.getElementById(self.id);
        element.style.filter = "alpha(opacity="+self.opacity.toString()+");";
        element.style.MozOpacity = self.opacity;
        element.style.opacity = self.opacity;
        element.style.KhtmlOpacity = self.opacity;
    };

    self.init = function(id, name, increment) {
        self.id = id;
        self.name = name;
        self.increment = increment;
    };

}(hvb_opacity));
window.hvb_opacity = hvb_opacity;