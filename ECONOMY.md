# Career economy assumptions

## Reward rule

Only a successful Career completion awards coins. Normal wins and all losses award zero. The first win on each Career level pays `max(22, floor(score / 4))` coins; every tenth HARD milestone adds a 20-coin bonus. A level can award coins only once, even after restarting or replaying it, and a unique run ID also guards against duplicate completion handling.

## Level-90 affordability target

Assumption: the player wins Career levels 1 through 90 once and earns at least 88 points per win. Ordinary levels yield 22 coins each; the nine HARD milestones add 20 coins apiece, for 2,160 coins total. The current non-free cosmetics across Themes, Boards, Mines, and Flags cost 1,965 coins in total, leaving 195 coins after buying every item. Higher scores increase the base reward. The deterministic `campaignEconomyProjection()` helper and `tests.js` assert this projection and the current total prices.

## Save and large-board storage

Existing `nightshift.v1` saves continue to load without a migration. Progress, cosmetics, scores, preferences, and run sequence remain compact localStorage data. Custom board cell arrays are transient for the active game and are not saved; oversized boards virtualize the visible two-dimensional window of rendered cells, so no IndexedDB migration or full-grid persistence is needed.
