/**
 * Universal Episode Catch-Up & Spoiler Protection Module
 * Shared across index.html, draft.html, and chat.html
 */

(function(window) {
    'use strict';

    const h = window.React ? window.React.createElement : null;

    /**
     * Storage Helpers (Cookie + LocalStorage dual sync)
     */
    function getCatchUpState(seasonId = 'season-51') {
        const key = `survivor_catchup_${seasonId}`;
        // 1. Try LocalStorage
        try {
            const rawLocal = localStorage.getItem(key);
            if (rawLocal) {
                const parsed = JSON.parse(rawLocal);
                if (parsed && typeof parsed === 'object') return parsed;
            }
        } catch (e) {
            console.warn('LocalStorage read error:', e);
        }

        // 2. Fallback to Cookie
        try {
            const cookies = document.cookie ? document.cookie.split('; ') : [];
            for (const c of cookies) {
                const [cKey, ...cVal] = c.split('=');
                if (cKey === key) {
                    const parsed = JSON.parse(decodeURIComponent(cVal.join('=')));
                    if (parsed && typeof parsed === 'object') return parsed;
                }
            }
        } catch (e) {
            console.warn('Cookie read error:', e);
        }

        return null;
    }

    function setCatchUpState(seasonId = 'season-51', state = {}) {
        const key = `survivor_catchup_${seasonId}`;
        const parsedMax = parseInt(state.maxWatchedEpisode);
        const parsedViewing = parseInt(state.viewingEpisode);
        const parsedLatest = parseInt(state.latestScoredEpisodeAtChoice);

        const payload = {
            maxWatchedEpisode: !isNaN(parsedMax) ? parsedMax : 1,
            viewingEpisode: !isNaN(parsedViewing) ? parsedViewing : 1,
            latestScoredEpisodeAtChoice: !isNaN(parsedLatest) ? parsedLatest : 1,
            isLiveStreaming: Boolean(state.isLiveStreaming),
            updatedAt: Date.now()
        };

        const str = JSON.stringify(payload);

        // 1. Save to LocalStorage
        try {
            localStorage.setItem(key, str);
        } catch (e) {
            console.warn('LocalStorage write error:', e);
        }

        // 2. Save to Cookie (1 year expiry)
        try {
            const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
            document.cookie = `${key}=${encodeURIComponent(str)}; expires=${expires}; path=/; SameSite=Lax`;
        } catch (e) {
            console.warn('Cookie write error:', e);
        }

        // 3. Dispatch custom event for in-memory sync across components
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
            const evt = typeof CustomEvent === 'function'
                ? new CustomEvent('episodeFilterChanged', { detail: { seasonId, state: payload } })
                : { type: 'episodeFilterChanged', detail: { seasonId, state: payload } };
            window.dispatchEvent(evt);
        }

        return payload;
    }

    /**
     * Clears stored catch-up preferences for a season
     */
    function clearCatchUpState(seasonId) {
        if (!seasonId) return;
        const key = `survivor_catchup_${seasonId}`;
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(key);
            }
        } catch (e) {}
        try {
            if (typeof document !== 'undefined') {
                document.cookie = `${key}=; Max-Age=0; path=/; SameSite=Lax`;
            }
        } catch (e) {}
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
            const evt = typeof CustomEvent === 'function'
                ? new CustomEvent('episodeFilterChanged', { detail: { seasonId, state: null } })
                : { type: 'episodeFilterChanged', detail: { seasonId, state: null } };
            window.dispatchEvent(evt);
        }
    }

    /**
     * Evaluates whether entrance modal is needed and determines safe initial viewing episode.
     */
    function evaluateCatchUpStatus(seasonId, latestScoredEp, inProgressEp, completedEpisodes = []) {
        const saved = getCatchUpState(seasonId);
        const maxAvailable = inProgressEp || latestScoredEp || 1;

        if (!saved) {
            // First time visit
            return {
                needsModal: true,
                isStale: false,
                initialEp: maxAvailable,
                viewingEpisode: maxAvailable,
                maxWatchedEp: maxAvailable,
                maxWatchedEpisode: maxAvailable
            };
        }

        // If a new episode has aired/started scoring since the user's choice:
        // Hold them safely at their last confirmed watched episode and trigger modal
        if (maxAvailable > (saved.latestScoredEpisodeAtChoice || 0)) {
            const safeEp = (saved.viewingEpisode !== undefined && saved.viewingEpisode !== null)
                ? saved.viewingEpisode
                : ((saved.maxWatchedEpisode !== undefined && saved.maxWatchedEpisode !== null) ? saved.maxWatchedEpisode : 1);
            const safeMaxWatched = (saved.maxWatchedEpisode !== undefined && saved.maxWatchedEpisode !== null)
                ? saved.maxWatchedEpisode
                : 1;
            return {
                needsModal: true,
                isStale: true,
                initialEp: safeEp,
                viewingEpisode: safeEp,
                maxWatchedEp: safeMaxWatched,
                maxWatchedEpisode: safeMaxWatched
            };
        }

        // Existing up-to-date preference
        const safeView = (saved.viewingEpisode !== undefined && saved.viewingEpisode !== null)
            ? saved.viewingEpisode
            : ((saved.maxWatchedEpisode !== undefined && saved.maxWatchedEpisode !== null) ? saved.maxWatchedEpisode : maxAvailable);
        const safeMax = (saved.maxWatchedEpisode !== undefined && saved.maxWatchedEpisode !== null)
            ? saved.maxWatchedEpisode
            : 1;
        return {
            needsModal: false,
            isStale: false,
            initialEp: Math.min(safeView, maxAvailable),
            viewingEpisode: Math.min(safeView, maxAvailable),
            maxWatchedEp: Math.min(safeMax, maxAvailable),
            maxWatchedEpisode: Math.min(safeMax, maxAvailable)
        };
    }

    /**
     * React Component: UniversalEpisodeTracker
     * Mounts the global "Episodes Scored" interactive filter bar
     */
    function UniversalEpisodeTracker({
        viewingEpisode = 1,
        maxWatchedEpisode = 1,
        latestScoredEpisode = 1,
        inProgressEpisode = null,
        episodeStatuses = [],
        onSelectEpisode,
        onOpenModal,
        theme = 'tribal'
    }) {
        if (!h) return null;
        const isTribal = theme === 'tribal';
        const viewingEpNum = (viewingEpisode !== undefined && viewingEpisode !== null && !isNaN(parseInt(viewingEpisode))) ? parseInt(viewingEpisode) : 1;
        const maxWatchedNum = (maxWatchedEpisode !== undefined && maxWatchedEpisode !== null && !isNaN(parseInt(maxWatchedEpisode))) ? parseInt(maxWatchedEpisode) : 1;

        return h('div', {
            className: 'bg-white/95 backdrop-blur-md rounded-2xl p-4 mb-6 shadow-xl border border-gray-100 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3.5'
        },
            // Left Label & Legend
            h('div', { className: 'flex flex-wrap items-center gap-3' },
                h('div', { className: 'flex items-center gap-2' },
                    h('span', { className: 'text-lg' }, '📺'),
                    h('span', { className: 'text-xs font-black uppercase tracking-wider text-gray-800 font-mono' }, 'Episodes Scored:'),
                    h('button', {
                        type: 'button',
                        id: 'tracker-viewing-badge-btn',
                        onClick: onOpenModal,
                        title: onOpenModal ? 'Click to open Episode Selector / Catch-Up modal' : '',
                        className: `text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-300 font-mono flex items-center gap-1 transition ${onOpenModal ? 'hover:bg-orange-200 cursor-pointer shadow-xs' : ''}`
                    },
                        h('span', {}, viewingEpNum === 0 ? 'Viewing: Pre-Season' : `Viewing: Ep ${viewingEpNum}`),
                        onOpenModal ? h('span', { className: 'text-[9px] text-orange-600 font-normal opacity-70' }, '✎') : null
                    )
                ),
                h('div', { className: 'hidden sm:flex items-center gap-2 text-[10px] font-bold text-gray-500 border-l border-gray-200 pl-3' },
                    h('span', { className: 'flex items-center gap-1' },
                        h('span', { className: 'w-1.5 h-1.5 rounded-full bg-emerald-500' }), 'Scored (✓)'
                    ),
                    h('span', { className: 'flex items-center gap-1' },
                        h('span', { className: 'w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse' }), 'Live Scoring (⚪)'
                    ),
                    h('span', { className: 'flex items-center gap-1' },
                        h('span', { className: 'w-1.5 h-1.5 rounded-full bg-gray-400' }), 'Unwatched'
                    ),
                    h('span', { className: 'flex items-center gap-1' },
                        h('span', { className: 'w-1.5 h-1.5 rounded-full bg-amber-700/40' }), 'Unscored (✗)'
                    )
                )
            ),

            // Episode Badges
            h('div', { className: 'flex flex-wrap items-center gap-1.5 w-full xl:w-auto py-1' },
                episodeStatuses.map(item => {
                    const ep = item.ep;
                    const isViewing = ep === viewingEpNum;
                    const isLit = ep <= viewingEpNum && viewingEpNum > 0;
                    const isInProgress = item.status === 'in-progress' || ep === inProgressEpisode;
                    const isSelectable = item.isSelectable || isViewing || (ep === 1 && latestScoredEpisode <= 1);

                    let badgeStyle = '';
                    let titleText = `Episode ${ep}: ${item.label}`;

                    if (isViewing && isInProgress) {
                        badgeStyle = isTribal
                            ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-extrabold ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#1a120d] shadow-lg animate-pulse cursor-pointer'
                            : 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-extrabold ring-2 ring-cyan-400 ring-offset-2 ring-offset-white shadow-lg animate-pulse cursor-pointer';
                        titleText = `Episode ${ep}: Viewing LIVE Scoring Stream! (${item.count || 0} events logged)`;
                    } else if (isViewing) {
                        badgeStyle = isTribal
                            ? 'bg-emerald-600 border-emerald-500 text-white font-black ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#1a120d] shadow-md cursor-pointer'
                            : 'bg-emerald-600 border-emerald-700 text-white font-black ring-2 ring-emerald-400 ring-offset-2 ring-offset-white shadow-md cursor-pointer';
                        titleText = ep === 1
                            ? 'Episode 1: Currently Viewing (Click to deselect back to Pre-Season)'
                            : `Episode ${ep}: Currently Viewing (Click to re-select)`;
                    } else if (isLit) {
                        badgeStyle = isTribal
                            ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-300 hover:bg-emerald-900 cursor-pointer shadow-xs'
                            : 'bg-emerald-100 border-emerald-400 text-emerald-900 hover:bg-emerald-200 cursor-pointer shadow-xs';
                        titleText = `Episode ${ep}: Scored & Viewed (Click to switch view)`;
                    } else if (isInProgress) {
                        badgeStyle = 'bg-cyan-50 border-cyan-400 text-cyan-800 hover:bg-cyan-100 cursor-pointer shadow-xs animate-pulse';
                        titleText = `Episode ${ep}: Currently Being Scored Live! (Click to watch live stream)`;
                    } else if (ep <= latestScoredEpisode || (ep === 1 && isSelectable)) {
                        // Available but unwatched
                        badgeStyle = isTribal
                            ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer shadow-xs'
                            : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 cursor-pointer shadow-xs';
                        titleText = `Episode ${ep}: Available (Click to view)`;
                    } else {
                        badgeStyle = 'bg-gray-100/70 border-gray-200 text-gray-400 cursor-not-allowed opacity-50';
                        titleText += ' (Not yet aired or scored)';
                    }

                    return h('button', {
                        key: ep,
                        type: 'button',
                        id: `tracker-ep-${ep}-btn`,
                        disabled: !isSelectable,
                        onClick: () => {
                            if (isSelectable && typeof onSelectEpisode === 'function') {
                                if (ep === 1 && isViewing) {
                                    onSelectEpisode(0, false);
                                } else {
                                    onSelectEpisode(ep, isInProgress);
                                }
                            }
                        },
                        title: titleText,
                        className: `px-2 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-1 transition-all duration-150 ${badgeStyle}`
                    },
                        h('span', {}, `E${ep}`),
                        h('span', { className: 'text-[10px] font-black' },
                            isInProgress ? '⚪' : item.icon
                        )
                    );
                })
            )
        );
    }

    /**
     * React Component: CatchUpEntranceModal
     * First-time or new-episode entrance blocker modal
     */
    function CatchUpEntranceModal({
        isOpen = false,
        seasonName = 'Season 51',
        latestScoredEpisode = 1,
        inProgressEpisode = null,
        completedEpisodes = [],
        onConfirmLive,
        onSelectPastEpisode
    }) {
        if (!isOpen || !h) return null;

        const liveTargetEp = inProgressEpisode || latestScoredEpisode || 1;
        const isLiveInProgress = Boolean(inProgressEpisode);
        const pastEpisodes = completedEpisodes.filter(ep => ep < liveTargetEp);

        return h('div', {
            className: 'fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in'
        },
            h('div', {
                className: 'bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border-4 border-amber-500/30 text-gray-900 relative overflow-hidden'
            },
                // Ambient Survivor Glow Header
                h('div', { className: 'text-center mb-6' },
                    h('div', { className: 'inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-3 text-3xl shadow-inner' },
                        '🛡️'
                    ),
                    h('h2', {
                        className: 'text-2xl md:text-3xl font-black uppercase tracking-wider text-gray-900',
                        style: { fontFamily: '"Bebas Neue", cursive' }
                    }, `${seasonName} • Spoiler Protection`),
                    h('p', { className: 'text-sm text-gray-600 mt-2 leading-relaxed' },
                        'This season is actively in progress! To avoid spoiling tribal council eliminations and point shifts, select the latest episode you have watched.'
                    )
                ),

                // Option 1: Live Button
                h('div', { className: 'mb-6' },
                    h('button', {
                        type: 'button',
                        onClick: () => {
                            if (typeof onConfirmLive === 'function') {
                                onConfirmLive(liveTargetEp, isLiveInProgress);
                            }
                        },
                        className: 'w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white font-black text-base shadow-xl hover:shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-3 cursor-pointer'
                    },
                        h('span', { className: 'text-xl' }, '⚡'),
                        h('div', { className: 'text-left' },
                            h('div', { className: 'font-black leading-tight' },
                                isLiveInProgress
                                    ? `I'm Live! Stream Episode ${liveTargetEp} Scoring`
                                    : `I'm Live! Take me to Episode ${liveTargetEp}`
                            ),
                            h('div', { className: 'text-xs font-normal text-amber-100' },
                                isLiveInProgress ? 'Episode is currently being scored in real-time' : 'Show full latest standings'
                            )
                        )
                    )
                ),

                // Option 2: Earlier Episodes
                h('div', { className: 'border-t border-gray-200 pt-5' },
                    h('div', { className: 'text-xs font-black uppercase tracking-wider text-gray-500 mb-3 text-center' },
                        'Or pick the last episode you have seen:'
                    ),
                    pastEpisodes.length > 0
                        ? h('div', { className: 'grid grid-cols-3 sm:grid-cols-4 gap-2' },
                            pastEpisodes.map(ep => h('button', {
                                key: ep,
                                type: 'button',
                                onClick: () => {
                                    if (typeof onSelectPastEpisode === 'function') {
                                        onSelectPastEpisode(ep);
                                    }
                                },
                                className: 'py-2.5 px-3 rounded-xl border border-gray-300 bg-gray-50 hover:bg-orange-50 hover:border-orange-400 hover:text-orange-600 font-bold text-sm text-gray-800 transition flex items-center justify-center gap-1 cursor-pointer'
                            },
                                h('span', {}, `Ep ${ep}`)
                            ))
                        )
                        : h('div', { className: 'text-xs text-gray-400 italic text-center py-2' },
                            'No earlier episodes scored yet.'
                        ),

                    // Option 3: "I have not seen any episodes!" (Pre-Season state)
                    h('div', { className: 'mt-5 pt-3 text-center border-t border-gray-100' },
                        h('button', {
                            type: 'button',
                            id: 'catchup-no-episodes-btn',
                            onClick: () => {
                                if (typeof onSelectPastEpisode === 'function') {
                                    onSelectPastEpisode(0);
                                }
                            },
                            className: 'text-xs text-gray-500 hover:text-orange-600 underline font-semibold transition cursor-pointer hover:font-bold'
                        }, "I have not seen any episodes!")
                    )
                )
            )
        );
    }

    /**
     * React Component: SpoilerConfirmModal
     * Confirmation prompt when advancing forward
     */
    function SpoilerConfirmModal({
        isOpen = false,
        targetEpisode = null,
        isTargetInProgress = false,
        onConfirm,
        onCancel
    }) {
        if (!isOpen || !targetEpisode || !h) return null;

        return h('div', {
            className: 'fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in'
        },
            h('div', {
                className: 'bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 text-gray-900'
            },
                h('div', { className: 'flex items-center gap-3 mb-4' },
                    h('div', { className: 'w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl flex-shrink-0' },
                        '⚠️'
                    ),
                    h('div', {},
                        h('h3', { className: 'font-black text-lg text-gray-900' }, `Reveal Episode ${targetEpisode}?`),
                        h('p', { className: 'text-xs text-amber-700 font-bold' }, 'Potential Spoiler Ahead')
                    )
                ),
                h('p', { className: 'text-sm text-gray-600 mb-6 leading-relaxed' },
                    isTargetInProgress
                        ? `Episode ${targetEpisode} is currently being scored live! Advancing will reveal live points, immunity wins, and elimination events as they happen.`
                        : `Advancing to Episode ${targetEpisode} will reveal scores, tribe swaps, and tribal council eliminations through the end of Episode ${targetEpisode}. Have you watched this episode?`
                ),
                h('div', { className: 'flex items-center justify-end gap-3' },
                    h('button', {
                        type: 'button',
                        onClick: onCancel,
                        className: 'px-4 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-100 transition cursor-pointer text-sm'
                    }, 'Cancel (Stay Safe)'),
                    h('button', {
                        type: 'button',
                        onClick: onConfirm,
                        className: 'px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black transition cursor-pointer text-sm shadow-md'
                    }, isTargetInProgress ? `Yes, Stream Live (Ep ${targetEpisode})` : `Yes, I've Watched It`)
                )
            )
        );
    }

    /**
     * React Component: HistoricalStatusBanner
     * Displays a clean indicator when viewing an earlier episode with a 1-click jump to live
     */
    function HistoricalStatusBanner({
        viewingEpisode = 1,
        latestScoredEpisode = 1,
        inProgressEpisode = null,
        onJumpToLive
    }) {
        if (!h) return null;
        const liveEp = inProgressEpisode || latestScoredEpisode || 1;
        const isLiveInProgress = Boolean(inProgressEpisode);

        if (viewingEpisode >= liveEp) return null;
        const isPreSeason = viewingEpisode === 0;

        return h('div', {
            className: 'bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5 mb-6 flex flex-wrap items-center justify-between gap-3 text-amber-900 shadow-xs'
        },
            h('div', { className: 'flex items-center gap-2 text-xs md:text-sm font-bold' },
                h('span', { className: 'text-base' }, isPreSeason ? '🏝️' : '⏳'),
                h('span', {}, isPreSeason
                    ? 'Historical View: Displaying Pre-Season state (Before Episode 1). No scores or eliminations have occurred yet.'
                    : `Historical View: Displaying state as of Episode ${viewingEpisode}. Future episodes and eliminations are masked.`
                )
            ),
            h('button', {
                type: 'button',
                onClick: onJumpToLive,
                className: 'px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5'
            },
                h('span', {}, '⚡'),
                h('span', {}, isLiveInProgress ? `Stream Live (Ep ${liveEp})` : `Jump to Live (Ep ${liveEp})`)
            )
        );
    }

    /**
     * React Component: ChatSpoilerAdvisoryBanner
     * Displayed in chat.html when viewing an earlier episode or live scoring
     */
    function ChatSpoilerAdvisoryBanner({
        viewingEpisode = 1,
        latestScoredEpisode = 1,
        inProgressEpisode = null
    }) {
        if (!h) return null;
        const liveEp = inProgressEpisode || latestScoredEpisode || 1;

        if (inProgressEpisode && viewingEpisode === inProgressEpisode) {
            return h('div', {
                className: 'bg-cyan-50 border border-cyan-400 text-cyan-900 rounded-xl px-4 py-3 mb-4 flex items-center gap-3 shadow-xs'
            },
                h('span', { className: 'text-xl animate-pulse' }, '⚪'),
                h('div', { className: 'text-xs md:text-sm font-bold' },
                    `Live Scoring Active: Episode ${viewingEpisode} is currently being scored! Chat discussions may reference ongoing live events.`
                )
            );
        }

        if (viewingEpisode < liveEp) {
            return h('div', {
                className: 'bg-amber-50 border border-amber-400 text-amber-900 rounded-xl px-4 py-3 mb-4 flex items-center gap-3 shadow-xs'
            },
                h('span', { className: 'text-xl' }, '⚠️'),
                h('div', { className: 'text-xs md:text-sm font-bold' },
                    viewingEpisode === 0
                        ? 'Spoiler Advisory: You are viewing Survivor as of Pre-Season (Before Episode 1). Live chat messages discuss aired episodes!'
                        : `Spoiler Advisory: You are viewing Episode ${viewingEpisode}. Live chat messages may discuss events from later episodes.`
                )
            );
        }

        return null;
    }

    // Export to global window
    window.SurvivorEpisodeFilter = {
        getCatchUpState,
        setCatchUpState,
        clearCatchUpState,
        evaluateCatchUpStatus,
        UniversalEpisodeTracker,
        CatchUpEntranceModal,
        SpoilerConfirmModal,
        HistoricalStatusBanner,
        ChatSpoilerAdvisoryBanner
    };

})(typeof window !== 'undefined' ? window : this);
