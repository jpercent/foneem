var hvbOpacityManager = {};
(function(exports) {
    exports.updateOpacity = function() {
        var img = document.getElementById('rs5s1');
        img.style.filter       = "alpha(opacity=25);";
        img.style.MozOpacity   = 0.25;
        img.style.opacity      = 0.25;
        img.style.KhtmlOpacity = 0.25;
    };
}(hvbOpacityManager));
