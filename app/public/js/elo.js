function pow_rate(rating) {
    return Math.pow(10,rating/400);
}

function exp_score(r1,r2) {
    var q1 = pow_rate(r1);
    var q2 = pow_rate(r2);
    return q1 / (q1 + q2);
}

module.exports.delta = function delta(r1,r2,result) {
    var K = 64;
    return Math.round(K * (result - exp_score(r1,r2)));
}

