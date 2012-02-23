//~ Custom Underscore.js mixin functions ============================================================
_.mixin({
    // Number formatting functions
    separateThousands: function (s, n) {
        var sign = '',
            decimals = null;
        if (typeof n != 'string')
            n = '' + n;
        if (parseFloat(n) < 0)
            sign = '-';
        if (~n.indexOf('.')) {
            var arr = n.split('.');
            n = arr[0];
            decimals = arr[1];
        }
        n = parseFloat(n);
        n = '' + Math.abs(n);
        return sign + (function _(s, n, i, j) {
            if (i < 0)
                return n.substring(0, j);
            return _(s, n, i - 3, j - 3) + (i > 0 ? s : '') + n.substring(i, j);
        })( s, n, n.length - 3, n.length ) + ( decimals ? '.' + decimals : '' );
    },
    roundDecimals: function (n, d) {
        var N = parseFloat(n);
        N = Math.round(N * Math.pow(10, d));
        N /= Math.pow(10, d);
        return N.toFixed(d);
    },
    format: function (n, o) {
        if (isNaN(n) || n === 0 || n == '0')
            return '--';
        if (o.zeroIsNull === true && n === 0)
            return '--';
        if (o.decimals !== undefined)
            n = _.roundDecimals(n, o.decimals);
        if (o.separateThousands === true)
            n = _.separateThousands(',', n);
        return ( o.prefix || '' ) + n + ( o.suffix || '' );
    }
});
