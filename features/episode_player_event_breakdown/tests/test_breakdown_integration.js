// Automated Integration Test Suite for Episode & Player Event Breakdown Re-Engineering
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

    var app = Application.currentApplication();
    app.includeStandardAdditions = true;
    var repoPath = "/Users/ryantaylor/Desktop/survivor-fantasy-league";

    var indexHtml = app.read(repoPath + "/index.html");
    var configJs = app.read(repoPath + "/js/config.js");

    // TEST SUITE 1: Component Declaration & State Separation
    assert("index.html defines TeamEventStackedBarChart component", indexHtml.indexOf('function TeamEventStackedBarChart') !== -1);
    assert("TeamEventStackedBarChart manages selectedPlayerId state", indexHtml.indexOf('const [selectedPlayerId, setSelectedPlayerId] = useState(null);') !== -1);
    assert("TeamEventStackedBarChart manages hoveredPlayerId state", indexHtml.indexOf('const [hoveredPlayerId, setHoveredPlayerId] = useState(null);') !== -1);
    assert("TeamEventStackedBarChart computes activePlayerId hierarchy", indexHtml.indexOf('const activePlayerId = selectedPlayerId !== null ? selectedPlayerId : hoveredPlayerId;') !== -1);

    // TEST SUITE 2: Mobile Touch Debouncing & Gesture Safety
    assert("TeamEventStackedBarChart tracks lastPlayerTouchTimeRef", indexHtml.indexOf('lastPlayerTouchTimeRef') !== -1);
    assert("TeamEventStackedBarChart tracks isTouchScrollRef for scroll safety", indexHtml.indexOf('isTouchScrollRef') !== -1);
    assert("TeamEventStackedBarChart includes handlePlayerToggle helper", indexHtml.indexOf('handlePlayerToggle = (playerId, e) =>') !== -1);

    // TEST SUITE 3: Interactive Column Hit Targets
    assert("Contestant columns have role='button' and tabIndex={0}", indexHtml.indexOf("role: 'button'") !== -1);
    assert("Contestant columns have aria-pressed attribute", indexHtml.indexOf("'aria-pressed': isSelected") !== -1);
    assert("Contestant columns apply active glow and ring styling", indexHtml.indexOf('ring-2 ring-amber-400/90') !== -1);
    assert("Unselected contestant columns apply dimmed opacity", indexHtml.indexOf('opacity-35 hover:opacity-75') !== -1);

    // TEST SUITE 4: All Events Display (Single Contestant & Full Team)
    assert("Renders all events for selected contestant in selected episode", indexHtml.indexOf('All Events for ${activePlayer.name} in Episode ${selectedEp}') !== -1);
    assert("Includes Show All Team reset button", indexHtml.indexOf('Show All Team') !== -1);
    assert("Renders all-team events overview when no contestant is selected", indexHtml.indexOf('Episode ${selectedEp} Team Events') !== -1);
    assert("Renders event points badge with positive and negative formatting", indexHtml.indexOf('text-emerald-400 bg-emerald-950/80') !== -1);
    assert("Compiles allTeamEvents across drafted roster for current episode", indexHtml.indexOf('const allTeamEvents = useMemo(') !== -1);

    // TEST SUITE 5: Production Safety & Isolated Test Data Directive
    assert("js/config.js strictly guards dev environment under dev_testing/", configJs.indexOf('dev_testing/') !== -1);
    assert("js/config.js IS_DEV_ENV check active for localhost and 127.0.0.1", configJs.indexOf("window.location.hostname === 'localhost'") !== -1);

    return JSON.stringify({ passed: passed, failed: failed, results: results }, null, 2);
}

runTests();
