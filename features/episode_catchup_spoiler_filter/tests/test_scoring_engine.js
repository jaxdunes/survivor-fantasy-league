// Automated Unit Tests for Episode Catch-Up Pure Scoring Engine Utilities
// Run with: osascript -l JavaScript features/episode_catchup_spoiler_filter/tests/test_scoring_engine.js

var app = Application.currentApplication();
app.includeStandardAdditions = true;

function readFile(path) {
    return app.read(Path(path));
}

var code = readFile('./js/scoring-engine.js');
eval(code);

var passed = 0;
var failed = 0;

function assert(condition, testName) {
    if (condition) {
        console.log('  ✅ PASS: ' + testName);
        passed++;
    } else {
        console.log('  ❌ FAIL: ' + testName);
        failed++;
    }
}

console.log('🧪 RUNNING SCORING ENGINE UNIT TESTS...');

// Mock data setup
var mockScores = {
    'player-1': {
        1: { s1: { points: 15, event: 'Immunity Win' } },
        2: { s2: { points: 5, event: 'Reward' } },
        3: { s3: { points: 10, event: 'Idol Found' } }
    },
    'player-2': {
        1: { s4: { points: 2, event: 'Survived Tribal' } },
        2: { s5: { points: 1, event: 'Confessional' } }
    },
    'player-3': {
        3: { s6: { points: 20, event: 'Immunity Win' } }
    }
};

var mockEliminations = {
    'player-2': 2,
    'player-3': 3
};

// Test 1: filterScoresByEpisode at Episode 1
var filteredEp1 = filterScoresByEpisode(mockScores, 1);
assert(filteredEp1['player-1'] && filteredEp1['player-1']['1'] && !filteredEp1['player-1']['2'] && !filteredEp1['player-1']['3'], 'Ep 1 scores for player-1 only include Ep 1');
assert(filteredEp1['player-2'] && filteredEp1['player-2']['1'] && !filteredEp1['player-2']['2'], 'Ep 1 scores for player-2 only include Ep 1');
assert(filteredEp1['player-3'] === undefined, 'Player-3 has no scores in Ep 1 so should be omitted');

// Test 2: filterScoresByEpisode at Episode 2
var filteredEp2 = filterScoresByEpisode(mockScores, 2);
assert(filteredEp2['player-1']['2'] && !filteredEp2['player-1']['3'], 'Ep 2 scores for player-1 include Ep 1 & 2 but not 3');
assert(filteredEp2['player-3'] === undefined, 'Player-3 scores excluded in Ep 2');

// Test 3: filterScoresByEpisode at Episode 3
var filteredEp3 = filterScoresByEpisode(mockScores, 3);
assert(filteredEp3['player-3'] && filteredEp3['player-3']['3'], 'Ep 3 scores include player-3');

// Test 4: filterEliminationsByEpisode at Episode 1
var elimsEp1 = filterEliminationsByEpisode(mockEliminations, 1);
assert(Object.keys(elimsEp1).length === 0, 'No players eliminated in Ep 1');

// Test 5: filterEliminationsByEpisode at Episode 2
var elimsEp2 = filterEliminationsByEpisode(mockEliminations, 2);
assert(elimsEp2['player-2'] === 2 && elimsEp2['player-3'] === undefined, 'Player-2 is eliminated in Ep 2, but player-3 is not');

// Test 6: isContestantAliveAsOfEpisode
assert(isContestantAliveAsOfEpisode('player-2', mockEliminations, 1) === true, 'Player-2 is alive as of Ep 1');
assert(isContestantAliveAsOfEpisode('player-2', mockEliminations, 2) === false, 'Player-2 is eliminated as of Ep 2');
assert(isContestantAliveAsOfEpisode('player-3', mockEliminations, 2) === true, 'Player-3 is alive as of Ep 2');
assert(isContestantAliveAsOfEpisode('player-3', mockEliminations, 3) === false, 'Player-3 is eliminated as of Ep 3');

// Test 7: filterWinnerByEpisode
assert(filterWinnerByEpisode('player-1', 2, 14) === null, 'Winner bonus masked before finale');
assert(filterWinnerByEpisode('player-1', 14, 14) === 'player-1', 'Winner bonus granted at finale');

// Test 8: computeEpisodeStatuses with in-progress scoring
var scoredEpisodesMap = { 1: { status: 'completed' }, 2: { status: 'completed' } };
// Mock Ep 3 has points in mockScores, but no elimination recorded yet and not in scoredEpisodesMap -> Should be in-progress!
var mockEliminationsWithoutEp3 = { 'player-2': 2 };
var statuses = computeEpisodeStatuses(mockScores, mockEliminationsWithoutEp3, scoredEpisodesMap, 5);
assert(statuses.statuses[0].status === 'completed' && statuses.statuses[0].isSelectable === true, 'Ep 1 is completed and selectable');
assert(statuses.statuses[1].status === 'completed' && statuses.statuses[1].isSelectable === true, 'Ep 2 is completed and selectable');
assert(statuses.statuses[2].status === 'in-progress' && statuses.statuses[2].isSelectable === true, 'Ep 3 is in-progress and selectable');
assert(statuses.statuses[3].status === 'unscored' && statuses.statuses[3].isSelectable === false, 'Ep 4 is unscored and not selectable');
assert(statuses.inProgressEpisode === 3, 'Identified in-progress episode is 3');
assert(statuses.latestScoredEpisode === 3, 'Latest scored episode is 3');

// TEST SET 5: Episode 0 / Pre-Season State (No episodes seen)
var ep0Scores = filterScoresByEpisode(mockScores, 0);
assert(Object.keys(ep0Scores).length === 0, 'Ep 0 scores are completely empty (0 points for all)');

var ep0Elims = filterEliminationsByEpisode(mockEliminations, 0);
assert(Object.keys(ep0Elims).length === 0, 'Ep 0 eliminations are completely empty (all contestants alive)');

assert(isContestantAliveAsOfEpisode('player-1', mockEliminations, 0) === true, 'Player-1 alive in Pre-Season');
assert(isContestantAliveAsOfEpisode('player-2', mockEliminations, 0) === true, 'Player-2 alive in Pre-Season (even though eliminated Ep 2)');
assert(filterWinnerByEpisode('player-1', 0, 14) === null, 'Winner bonus masked in Pre-Season');

var playerWithSwap = {
    startingTribe: 'Cila',
    tribe: 'Merge Tribe',
    tribeHistory: [
        { episode: 1, tribe: 'Cila' },
        { episode: 3, tribe: 'Merge Tribe' }
    ]
};
assert(getTribeForEpisode(playerWithSwap, 0) === 'Cila', 'Ep 0 resolves to starting tribe');

console.log('\n📊 RESULTS: ' + passed + ' passed, ' + failed + ' failed.');
if (failed > 0) {
    throw new Error('Some tests failed!');
}

