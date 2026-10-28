# Selected cosmetic artwork

Created with the built-in image-generation tool from the user's selected sheets.
The PNG masters and optimized WebP assets are 256 × 256 with transparency.
The browser uses WebP; PNG masters remain available for future exports.

`selection.json` maps each item to its source sheet, number, name, rarity, price
and game asset. Each filename represents one cosmetic, without number labels or
sheet backgrounds. Classic is the existing SVG artwork and was not regenerated.

## Selection / prompt set

- Fantasy mines: 1, 2, 3, 6, 8, 9, 12, 21, 22, 25, 34 from the original fantasy
  sheet. Prompt direction: faithfully recreate the selected icons, preserving
  silhouette, colors and materials; use a transparent production sprite atlas,
  no numbers/text/backdrop, crisp alpha edges, separated objects and subtle glow.
- Workshop mines: 4, 6, 21, 8, 20, 22 from the attached workshop sheet. Prompt
  direction: stylized digital Minesweeper cosmetic tokens, preserving reference
  shapes and palette; gray faceted stone, red cylinder, wooden barrel, bronze
  pressure disk, dark acorn and cracked red-striped ceramic sphere; transparent
  sprite atlas, no labels/background/shadows or photorealistic equipment.
- Flags: fantasy 3, 7, 17, 25, 43, 22 and attached cloth-sheet 18, 19, 23, 43.
  Prompt direction: faithfully recreate the selected complete banners including
  poles/bases, preserving reference shapes/colors; transparent production atlas,
  no numbers/text/background, full silhouettes and crisp antialiased alpha edges.

The export script in `checks/export-cosmetics.cjs` separates the generated atlases,
trims transparent margins and exports consistently padded PNG/WebP assets. It
accepts the directory containing the original generated atlas files as an argument.

All rarities share the same resolution. Rarity colors and coin prices distinguish
the collectible designs; they do not represent real market demand or paid products.
