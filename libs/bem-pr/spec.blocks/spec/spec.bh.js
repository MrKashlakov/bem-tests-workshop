module.exports = function(bh) {

bh.match('spec', function() {
    return { block : 'mocha' };
});

};
