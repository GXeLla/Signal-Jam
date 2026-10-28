# Career economy assumptions

## Reward rule

Only a successful Career completion awards coins. Normal wins and all losses award zero. The first win on each Career level pays `max(22, floor(score / 4))` coins; every tenth HARD milestone adds a 20-coin bonus. A level can award coins only once, even after restarting or replaying it, and a unique run ID also guards against duplicate completion handling.

## Premium collection

The selected collection has 17 premium mines and 10 premium flags, plus the free
Classic defaults. Prices range from 300 to 2,400 coins. Green Uncommon, blue Rare,
purple Epic and gold Legendary cards distinguish the tiers. All assets have the
same 256px source resolution; rarity reflects the design, not a lower-quality
version of the image. Themes and board prices are unchanged.

The full shop now costs 31,550 coins. The earlier assumption that all cosmetics
could be bought by level 90 at an 88-point baseline no longer applies: that
baseline earns 2,160 coins. Players choose which items to buy; higher scores earn
larger first-clear rewards. Rewards, the one-reward-per-level rule and saved
balances are unchanged. `campaignEconomyProjection()` reports affordability
without promising that every player can buy the complete collection.

Existing TNT, Ember, Orbit, Alloy and Signal ownership carries into their updated
designs. The retired Prism mine refunds its old 140-coin price when loading a
save and falls back to Classic if it was equipped. Removed Prism ownership is
not saved again, preventing repeat refunds after the next save.

## Save and large-board storage

Existing `nightshift.v1` saves continue to load without a migration. Progress, cosmetics, scores, preferences, and run sequence remain compact localStorage data. Custom board cell arrays are transient for the active game and are not saved; oversized boards virtualize the visible two-dimensional window of rendered cells, so no IndexedDB migration or full-grid persistence is needed.
