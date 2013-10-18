// This is a very simplistic algorithm that pairs players based on two things:
// 1) Infrequency of previous games
// 2) Similarity of rating
//
// If you have a better idea, I'll be happy to merge your pull request. --EW
module.exports.buildPairs = function buildPairs(players, matches, opts) {
    if (!opts) {
        // Called without opts first time, pass these in each recursive call.
        // This is my way to mimic function overloading.
        var opts = {matchCount: countMatches(matches),
                   ratingRange: findRange(players)};
    } 
    var pairs = [];
    if (players.length == 2) {
        // Base case of recursive function ... if only two players, pair them.
        pairs[0] = { red: players[0], blue: players[1] };
    } else if (players.length == 1) {
        // If one player ... the cheese stands alone.
    } else {
        // Otherwise, take the first of the list (highest rated) and find 
        // his best pairing
        var red = players.shift();
        playerMatchCount = countPlayerMatches(red, matches);

        var minCompScore = Number.MAX_VALUE;
        var idx = 0;
        players.forEach(function(player,i) {
            var pid = player._id;
            var minTotalGames = Math.min(opts.matchCount[red._id],opts.matchCount[pid]);
            var count = playerMatchCount[pid] ? playerMatchCount[pid] : 0;
            // This ratio represents the percentage of matches that have
            // been between these two players. 
            var ratio = count/minTotalGames;
            var diff = Math.abs(player.rating - red.rating)/opts.ratingRange;
            var compScore = diff + (3*ratio); // emphasizing low ratio of games first;
            if (compScore < minCompScore) {
                minCompScore = compScore;
                var leastFrequent = pid;
                idx = i;
            }
        });
        blue = players.splice(idx,1)[0];
        pairs = [ {red: red, blue: blue} ].concat(buildPairs(players,matches,opts));
    }
    return pairs;
};

var countMatches = function(matches) {
    var matchCount = {};
    matches.forEach(function(match) {
        if (match.winner in matchCount) {
            matchCount[match.winner]++;
        } else {
            matchCount[match.winner] = 1;
        }
        if (match.loser in matchCount) {
            matchCount[match.loser]++;
        } else {
            matchCount[match.loser] = 1;
        }
    });
    return matchCount;
};

var countPlayerMatches = function(plr, matches) {
    var matchCount = {};
    var id = plr._id;
    matches.forEach(function(match) {
        if (id == match.winner) {
            if (match.loser in matchCount) {
                matchCount[match.loser]++;
            } else {
                matchCount[match.loser] = 1;
            }
        } else if (id == match.loser) {
            if (match.winner in matchCount) {
                matchCount[match.winner]++;
            } else {
                matchCount[match.winner] = 1;
            }
        }
    });
    return matchCount;
};

var findRange = function(players) {
    var high = 0;
    var low = 2400;
    players.forEach(function(player) {
        var r = player.rating;
        if (r > high) {
            high = r;
        }
        if (r < low) {
            low = r;
        }
    });
    return high - low;
};
