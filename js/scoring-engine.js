/**
 * Pure Scoring Engine for Survivor Fantasy League
 */

const DEFAULT_SCORING_RULES = {
    immunityWinIndiv: 15,
    immunityWinTribe: 5,
    rewardWinIndiv: 10,
    rewardWinTribe: 3,
    idolFound: 10,
    advantageFound: 5,
    survivedTribal: 2,
    confessional: 1,
    individualImmunityPlayed: 5,
    successfulIdolPlay: 10
};

/**
 * Calculates total points earned by a single contestant across all episodes
 * @param {string} contestantId 
 * @param {Object} episodeScores - Episode score records mapped by episode key (e.g., ep01)
 * @returns {number}
 */
function calculateContestantTotal(contestantId, episodeScores = {}) {
    let total = 0;
    
    Object.values(episodeScores).forEach(episode => {
        if (episode && episode[contestantId]) {
            const stats = episode[contestantId];
            if (typeof stats === 'number') {
                total += stats;
            } else if (typeof stats === 'object') {
                total += (stats.totalPoints || 0);
            }
        }
    });
    
    return total;
}

/**
 * Calculates total points earned by a league user based on their drafted roster
 * @param {Array<string>} draftedContestantIds 
 * @param {Object} episodeScores 
 * @returns {number}
 */
function calculateUserScore(draftedContestantIds = [], episodeScores = {}) {
    return draftedContestantIds.reduce((sum, contestantId) => {
        return sum + calculateContestantTotal(contestantId, episodeScores);
    }, 0);
}

/**
 * Calculates ranked leaderboard for all members of a league
 * @param {Object} members - Map of userId => { displayName, avatar }
 * @param {Object} drafts - Map of userId => [contestantId1, contestantId2]
 * @param {Object} episodeScores - Map of episode scores
 * @returns {Array<Object>} Sorted list of members with scores and rankings
 */
function calculateLeaderboard(members = {}, drafts = {}, episodeScores = {}) {
    const leaderboard = Object.keys(members).map(userId => {
        const member = members[userId] || {};
        const userDraft = drafts[userId] || [];
        const score = calculateUserScore(userDraft, episodeScores);
        
        return {
            userId,
            displayName: member.displayName || member.username || 'Anonymous',
            score,
            draftCount: userDraft.length,
            drafts: userDraft
        };
    });
    
    // Sort descending by score
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Assign rank
    return leaderboard.map((entry, index) => ({
        ...entry,
        rank: index + 1
    }));
}

/**
 * Primary color palette themes for dynamically created and preset tribes
 */
const PRIMARY_COLOR_PALETTES = {
    yellow: {
        id: 'yellow',
        name: 'Yellow (Sun)',
        emoji: '☀️',
        gradient: 'from-amber-500 to-yellow-600',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-900',
        badgeBorder: 'border-amber-300',
        cardBg: 'bg-amber-50',
        borderColor: 'border-amber-400',
        dotBg: 'bg-amber-400 border border-amber-200'
    },
    purple: {
        id: 'purple',
        name: 'Purple (Lightning)',
        emoji: '⚡',
        gradient: 'from-purple-600 to-indigo-700',
        badgeBg: 'bg-purple-100',
        badgeText: 'text-purple-900',
        badgeBorder: 'border-purple-300',
        cardBg: 'bg-purple-50',
        borderColor: 'border-purple-400',
        dotBg: 'bg-purple-500 border border-purple-300'
    },
    blue: {
        id: 'blue',
        name: 'Blue (Ocean)',
        emoji: '🌊',
        gradient: 'from-blue-600 to-sky-700',
        badgeBg: 'bg-blue-100',
        badgeText: 'text-blue-900',
        badgeBorder: 'border-blue-300',
        cardBg: 'bg-blue-50',
        borderColor: 'border-blue-400',
        dotBg: 'bg-blue-500 border border-blue-300'
    },
    green: {
        id: 'green',
        name: 'Green (Jungle)',
        emoji: '🌿',
        gradient: 'from-emerald-600 to-teal-700',
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-900',
        badgeBorder: 'border-emerald-300',
        cardBg: 'bg-emerald-50',
        borderColor: 'border-emerald-400',
        dotBg: 'bg-emerald-500 border border-emerald-300'
    },
    red: {
        id: 'red',
        name: 'Red (Fire)',
        emoji: '🔥',
        gradient: 'from-red-600 to-rose-700',
        badgeBg: 'bg-red-100',
        badgeText: 'text-red-900',
        badgeBorder: 'border-red-300',
        cardBg: 'bg-red-50',
        borderColor: 'border-red-400',
        dotBg: 'bg-red-500 border border-red-300'
    },
    orange: {
        id: 'orange',
        name: 'Orange (Sunset)',
        emoji: '🌋',
        gradient: 'from-orange-500 to-amber-600',
        badgeBg: 'bg-orange-100',
        badgeText: 'text-orange-900',
        badgeBorder: 'border-orange-300',
        cardBg: 'bg-orange-50',
        borderColor: 'border-orange-400',
        dotBg: 'bg-orange-500 border border-orange-300'
    },
    pink: {
        id: 'pink',
        name: 'Pink (Blossom)',
        emoji: '🌸',
        gradient: 'from-pink-500 to-fuchsia-600',
        badgeBg: 'bg-pink-100',
        badgeText: 'text-pink-900',
        badgeBorder: 'border-pink-300',
        cardBg: 'bg-pink-50',
        borderColor: 'border-pink-400',
        dotBg: 'bg-pink-500 border border-pink-300'
    },
    black: {
        id: 'black',
        name: 'Black (Merge / Exile)',
        emoji: '🖤',
        gradient: 'from-slate-800 to-zinc-900',
        badgeBg: 'bg-slate-900',
        badgeText: 'text-slate-100',
        badgeBorder: 'border-slate-700',
        cardBg: 'bg-slate-900/60',
        borderColor: 'border-slate-700',
        dotBg: 'bg-slate-800 border border-slate-600'
    },
    unassigned: {
        id: 'unassigned',
        name: 'Unassigned',
        emoji: '⚪',
        gradient: 'from-slate-700/80 to-slate-800/80',
        badgeBg: 'bg-slate-800',
        badgeText: 'text-slate-300',
        badgeBorder: 'border-slate-600',
        cardBg: 'bg-slate-950/40',
        borderColor: 'border-slate-800/80',
        dotBg: 'bg-slate-400 border border-slate-300'
    }
};

/**
 * Returns the contestant's assigned tribe for a specific episode number based on tribeHistory
 * @param {Object} player 
 * @param {number} episodeNumber 
 * @returns {string}
 */
function getTribeForEpisode(player, episodeNumber = 1) {
    if (!player) return 'Unassigned';
    const targetEp = parseInt(episodeNumber) || 1;

    if (player.tribeHistory && Array.isArray(player.tribeHistory) && player.tribeHistory.length > 0) {
        const sortedHistory = [...player.tribeHistory].sort((a, b) => (parseInt(a.episode) || 1) - (parseInt(b.episode) || 1));
        let activeTribe = player.startingTribe || player.tribe || 'Unassigned';
        for (const entry of sortedHistory) {
            if (parseInt(entry.episode) <= targetEp) {
                if (entry.tribe) activeTribe = entry.tribe;
            } else {
                break;
            }
        }
        return activeTribe;
    }

    return player.tribe || player.startingTribe || 'Unassigned';
}

/**
 * Returns episode-by-episode tribe progression array for player card drawer
 * @param {Object} player 
 * @returns {Array<Object>}
 */
function getPlayerTribeProgression(player) {
    if (!player) return [];
    if (player.tribeHistory && Array.isArray(player.tribeHistory) && player.tribeHistory.length > 0) {
        return [...player.tribeHistory].sort((a, b) => (parseInt(a.episode) || 1) - (parseInt(b.episode) || 1));
    }
    const start = player.startingTribe || player.tribe || 'Unassigned';
    const curr = player.tribe || player.startingTribe || 'Unassigned';
    if (start !== curr && curr !== 'Unassigned') {
        return [
            { episode: 1, tribe: start, type: 'starting', label: `Starting Tribe: ${start}` },
            { episode: 2, tribe: curr, type: 'Tribe Swap', label: `Tribe Swap to ${curr}` }
        ];
    }
    return [{ episode: 1, tribe: start, type: 'starting', label: `Starting Tribe: ${start}` }];
}

/**
 * Calculates smart default episode number for tribe edit forms
 * Defaults to current active scoring episode, or if complete, lastScoredEpisode + 1
 * @param {Object} scoredEpisodes 
 * @param {number} currentEpisode 
 * @returns {number}
 */
function getSmartDefaultEpisode(scoredEpisodes = {}, currentEpisode = 1) {
    const scoredKeys = Object.keys(scoredEpisodes || {})
        .map(k => parseInt(k))
        .filter(n => !isNaN(n))
        .sort((a, b) => b - a);

    if (scoredKeys.length > 0) {
        const highestScored = scoredKeys[0];
        const highestStatus = scoredEpisodes[highestScored];
        if (highestStatus && highestStatus.status === 'in_progress') {
            return highestScored;
        }
        return Math.min(14, highestScored + 1);
    }

    return parseInt(currentEpisode) || 1;
}

/**
 * Returns styling config for a given tribe name
 * @param {string} tribeName 
 * @param {Array<Object>} customTribes 
 * @returns {Object}
 */
function getTribeStyle(tribeName = '', customTribes = []) {
    if (!tribeName) return PRIMARY_COLOR_PALETTES.black;

    const lower = tribeName.toLowerCase().trim();

    // Check custom tribes list first
    if (Array.isArray(customTribes)) {
        const found = customTribes.find(t => t && t.name && t.name.toLowerCase().trim() === lower);
        if (found && found.color && PRIMARY_COLOR_PALETTES[found.color]) {
            return {
                ...PRIMARY_COLOR_PALETTES[found.color],
                emoji: found.icon || PRIMARY_COLOR_PALETTES[found.color].emoji
            };
        }
    }

    // Standard preset mappings
    if (lower.includes('toka')) return PRIMARY_COLOR_PALETTES.yellow;
    if (lower.includes('savu')) return PRIMARY_COLOR_PALETTES.purple;
    if (lower.includes('cila')) return PRIMARY_COLOR_PALETTES.red;
    if (lower.includes('kalo')) return PRIMARY_COLOR_PALETTES.blue;
    if (lower.includes('vatu')) return PRIMARY_COLOR_PALETTES.green;
    if (lower.includes('exile')) return PRIMARY_COLOR_PALETTES.black;
    if (lower.includes('merge') || lower.includes('merged')) return PRIMARY_COLOR_PALETTES.black;
    if (lower.includes('unassigned')) return PRIMARY_COLOR_PALETTES.unassigned;

    return PRIMARY_COLOR_PALETTES.orange;
}

function getTribeDotColor(tribeName = '', customTribes = []) {
    const style = getTribeStyle(tribeName, customTribes);
    return style ? style.dotBg : 'bg-amber-400 border border-amber-200';
}

if (typeof window !== 'undefined') {
    window.PRIMARY_COLOR_PALETTES = PRIMARY_COLOR_PALETTES;
    window.getTribeForEpisode = getTribeForEpisode;
    window.getPlayerTribeProgression = getPlayerTribeProgression;
    window.getSmartDefaultEpisode = getSmartDefaultEpisode;
    window.getTribeStyle = getTribeStyle;
    window.getTribeDotColor = getTribeDotColor;
}

