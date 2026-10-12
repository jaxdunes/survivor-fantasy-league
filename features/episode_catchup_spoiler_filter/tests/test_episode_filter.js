// Comprehensive test suite for js/episode-filter.js state management, stale detection, and cookie logic
function runTests() {
    var passed = 0;
    var failed = 0;
    var results = [];

    function assert(desc, condition) {
        if (condition) {
            passed++;
            results.push("  ✅ PASS: " + desc);
        } else {
            failed++;
            results.push("  ❌ FAIL: " + desc);
        }
    }

    // Mock Browser Globals
    var mockLocalStorage = {};
    var mockCookies = "";
    var dispatchedEvents = [];

    var window = {
        addEventListener: function() {},
        removeEventListener: function() {},
        dispatchEvent: function(e) {
            dispatchedEvents.push(e);
        }
    };

    var document = {
        get cookie() {
            return mockCookies;
        },
        set cookie(val) {
            var parts = val.split(';');
            var pair = parts[0].trim();
            var eqIdx = pair.indexOf('=');
            var k = pair.substring(0, eqIdx);
            var v = pair.substring(eqIdx + 1);
            
            // Handle deletion
            if (val.indexOf('Max-Age=0') !== -1 || val.indexOf('expires=Thu, 01 Jan 1970') !== -1) {
                var cookieList = mockCookies ? mockCookies.split('; ') : [];
                mockCookies = cookieList.filter(function(c) {
                    return c.indexOf(k + '=') !== 0;
                }).join('; ');
            } else {
                var cookieList = mockCookies ? mockCookies.split('; ') : [];
                var filtered = cookieList.filter(function(c) {
                    return c.indexOf(k + '=') !== 0;
                });
                filtered.push(k + '=' + v);
                mockCookies = filtered.join('; ');
            }
        }
    };

    var localStorage = {
        getItem: function(k) { return mockLocalStorage[k] || null; },
        setItem: function(k, v) { mockLocalStorage[k] = String(v); },
        removeItem: function(k) { delete mockLocalStorage[k]; }
    };

    // Load and evaluate js/episode-filter.js in this mock sandbox
    // Read episode-filter.js using JXA
    var app = Application.currentApplication();
    app.includeStandardAdditions = true;
    var currentPath = app.pathTo(this).toString();
    // Path to repo
    var repoPath = "/Users/ryantaylor/Desktop/survivor-fantasy-league";
    var filterCode = app.read(repoPath + "/js/episode-filter.js");
    
    // Evaluate in function scope with our mocks
    var evalFn = new Function("window", "document", "localStorage", "React", filterCode + "; return window.SurvivorEpisodeFilter;");
    var filter = evalFn(window, document, localStorage, null);

    assert("SurvivorEpisodeFilter module exported", filter !== undefined && typeof filter.getCatchUpState === 'function');

    // TEST SUITE 1: Fresh user (no cookie, no localStorage)
    var initial = filter.getCatchUpState("season-51");
    assert("Initial getCatchUpState returns null when no state saved", initial === null);

    var evalStatusFresh = filter.evaluateCatchUpStatus("season-51", 3, null, [1, 2, 3]);
    assert("Fresh user needsModal is true", evalStatusFresh.needsModal === true);
    assert("Fresh user isStale is false", evalStatusFresh.isStale === false);
    assert("Fresh user default viewingEpisode is latest (3)", evalStatusFresh.viewingEpisode === 3);

    // TEST SUITE 2: User sets catch-up state
    var userChoice = {
        maxWatchedEpisode: 2,
        viewingEpisode: 2,
        latestScoredEpisodeAtChoice: 3,
        isLiveStreaming: false
    };
    filter.setCatchUpState("season-51", userChoice);

    var savedState = filter.getCatchUpState("season-51");
    assert("getCatchUpState accurately reads back user choice", savedState && savedState.maxWatchedEpisode === 2 && savedState.viewingEpisode === 2);
    assert("Cookie contains state", document.cookie.indexOf("survivor_catchup_season-51=") !== -1);
    assert("localStorage contains state", mockLocalStorage["survivor_catchup_season-51"] !== undefined);
    assert("Dispatched episodeFilterChanged custom event", dispatchedEvents.length > 0 && dispatchedEvents[0].type === "episodeFilterChanged");

    // TEST SUITE 3: Returning user - No new episode aired
    // Latest episode is still 3. Saved choice was made at Ep 3.
    var evalReturningSame = filter.evaluateCatchUpStatus("season-51", 3, null, [1, 2, 3]);
    assert("Returning user at same latest episode does NOT need modal", evalReturningSame.needsModal === false);
    assert("Returning user view remains at Ep 2", evalReturningSame.viewingEpisode === 2);
    assert("Returning user is NOT marked stale", evalReturningSame.isStale === false);

    // TEST SUITE 4: New episode airs (Ep 4 scored) -> Stale Invalidation & Safe Hold
    // User last watched Ep 2, made choice when Ep 3 was latest. Now Ep 4 is latest!
    var evalReturningNewEp = filter.evaluateCatchUpStatus("season-51", 4, null, [1, 2, 3, 4]);
    assert("Returning user after new episode needsModal is true", evalReturningNewEp.needsModal === true);
    assert("Returning user after new episode isStale is true", evalReturningNewEp.isStale === true);
    // CRITICAL REQUIREMENT: User view MUST be held safe at Ep 2 (their last watched episode), NOT leaked to Ep 4!
    assert("Returning user view is safely held at last watched episode (2)", evalReturningNewEp.viewingEpisode === 2);

    // TEST SUITE 5: In-progress episode live scoring mode
    // Episode 5 is currently in progress (white pulse)
    var evalInProgress = filter.evaluateCatchUpStatus("season-51", 4, 5, [1, 2, 3, 4]);
    assert("In-progress episode detected in evaluateCatchUpStatus", evalInProgress.needsModal === true && evalInProgress.isStale === true);
    assert("Safe view holds at Ep 2 during live scoring of Ep 5", evalInProgress.viewingEpisode === 2);

    // If user opts into Live Streaming:
    var liveChoice = {
        maxWatchedEpisode: 5,
        viewingEpisode: 5,
        latestScoredEpisodeAtChoice: 5,
        isLiveStreaming: true
    };
    filter.setCatchUpState("season-51", liveChoice);
    var savedLive = filter.getCatchUpState("season-51");
    assert("Live streaming state saved correctly", savedLive && savedLive.isLiveStreaming === true && savedLive.viewingEpisode === 5);

    // TEST SUITE 6: Backward vs Forward scrubbing logic
    // User maxWatchedEpisode is 5.
    // Scrubbing backward to Ep 1, 2, 3, 4: requires NO confirmation prompt (immediate)
    var backChoice = {
        maxWatchedEpisode: 5,
        viewingEpisode: 2,
        latestScoredEpisodeAtChoice: 5,
        isLiveStreaming: false
    };
    filter.setCatchUpState("season-51", backChoice);
    var savedBack = filter.getCatchUpState("season-51");
    assert("Scrubbing back to Ep 2 preserves maxWatchedEpisode as 5", savedBack.maxWatchedEpisode === 5 && savedBack.viewingEpisode === 2);

    // TEST SUITE 7: Clear state
    filter.clearCatchUpState("season-51");
    var cleared = filter.getCatchUpState("season-51");
    assert("clearCatchUpState removes cookie and localStorage", cleared === null && mockLocalStorage["survivor_catchup_season-51"] === undefined);

    return {
        passed: passed,
        failed: failed,
        results: results
    };
}

var res = runTests();
JSON.stringify(res, null, 2);
