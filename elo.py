from __future__ import division

def pow_rate(rating):
    return 10**(rating/400.0)

def exp_score(r1,r2):
    q1 = pow_rate(r1)
    q2 = pow_rate(r2)
    return q1 / (q1 + q2)

def delta(r1,r2,result):
    K = 32
    return round(K * (result - exp_score(r1,r2)))

