var hvb_opacity = {};
(function(self) {
    self.id = '';
    self.name = '';
    self.opacity = 0.0;
    self.increment = .25;

    self.updateOpacity = function(elementId) {
        self.opacity = self.opacity + self.increment;
        if (self.opacity > 1.0) {
            self.opacity = 1.0;
        }
        var element = document.getElementById(elementId);
        element.style.filter = "alpha(opacity="+self.opacity.toString()+");";
        element.style.MozOpacity = self.opacity;
        element.style.opacity = self.opacity;
        element.style.KhtmlOpacity = self.opacity;
    };

    self.init = function(id, name, increment) {
        self.id = id;
        self.name = name;
        self.increment = increment;
    }

}(hvb_opacity));
window.hvb_opacity = hvb_opacity;