define(["require", "exports"], function (require, exports) {
    function d2r(d) {
        var n = d * (Math.PI / 180);
        return Math.round(n * 1000) / 1000;
    }
    return d2r;
});
