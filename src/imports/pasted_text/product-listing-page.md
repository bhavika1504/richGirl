Design a Product Listing / Category Page for "Rich Girl — 
House of Fashion" ecommerce website.

BRAND (same as homepage):
- Colors: #E8F5E4 (mist green bg), #5BBF4E (active/CTA), 
  #1E4016 (dark text), #FFFFFF (white), #F7FDF5 (alt bg),
  #D0EAC8 (borders/dividers)
- Fonts: Cormorant Garamond (headings), DM Sans (UI/body), 
  DM Mono (prices)
- Vibe: Clean, airy, soft — NOT cluttered. Breathing room 
  between every element.

════════════════════════════════════
DESKTOP FRAME (1440px wide)
════════════════════════════════════

1. NAVBAR
Same as homepage — logo center, nav links, cart + profile 
icons. Sticky on scroll. White bg, 0.5px bottom border #D0EAC8.

─────────────────────────────────
2. PAGE HEADER STRIP (height 80px)
─────────────────────────────────
- Background: #F7FDF5
- Left: Breadcrumb — "Home / Indian Wear / Kurtis" 
  DM Sans 12px #4A7C3A, separator " / " in #D0EAC8
- Center: Page title "Kurtis" — Cormorant Garamond 32px #1E4016
- Right: "24 Products" — DM Sans 12px #6A9B5E
- No heavy borders — just clean padding 0 80px

─────────────────────────────────
3. MAIN LAYOUT — 2 column
Left sidebar 240px | Right content flex-1
─────────────────────────────────

LEFT SIDEBAR — FILTERS (240px wide, sticky top 68px)
- Sidebar bg: #FFFFFF, right border 0.5px #D0EAC8
- Top: "Filters" label — DM Sans 13px #1E4016 font-weight 500 
  + "Clear All" text link right-aligned DM Sans 11px #5BBF4E
- Padding: 24px 20px
- Each filter group separated by 0.5px #D0EAC8 divider

FILTER GROUP 1 — Category
Label: "Category" DM Sans 11px #6A9B5E uppercase letter-spacing
Options as clean checkbox list:
  ☐ 3-Piece Suit (12)
  ☐ Kurtis (8)  ← selected state: checkbox filled #5BBF4E
  ☐ Short Kurta (6)
  ☐ 2-Piece Kurti Set (5)
  ☐ Co-ord Sets (4)
Each row: DM Sans 13px #1E4016, count in #6A9B5E, 
height 32px, hover bg #F7FDF5

FILTER GROUP 2 — Size
Label: "Size" same style
Options as pill buttons in a wrap grid:
  XS  S  M  L  XL  XXL
Pill: border 0.5px #D0EAC8, border-radius 6px, 
DM Sans 11px, padding 5px 12px
Selected: bg #5BBF4E, border none, text #FFFFFF
Unselected: bg #FFFFFF, text #1E4016
Hover: bg #E8F5E4

FILTER GROUP 3 — Color
Label: "Color"
Color dot swatches in a row, gap 8px:
  Circle 24px each — colors: Black, White, Pink, 
  Yellow, Green, Beige, Red, Blue
Selected state: circle has 2px outer ring #5BBF4E 
with 2px gap between ring and dot

FILTER GROUP 4 — Price Range
Label: "Price Range"
Dual handle range slider:
  Min ₹ [____] — Max ₹ [____]
  Slider track: #D0EAC8, filled portion #5BBF4E
  Handles: 14px circle, bg #5BBF4E, border 2px #fff
  Below: "₹499 — ₹4,999" DM Mono 12px #1E4016

FILTER GROUP 5 — Rating
Label: "Rating"
4 rows:
  ★★★★★ & above
  ★★★★☆ & above
  ★★★☆☆ & above
  ★★☆☆☆ & above
Stars: 14px, filled #5BBF4E, empty #D0EAC8
Row height 32px, hover bg #F7FDF5

FILTER GROUP 6 — Availability
Label: "Availability"
  ● In Stock only  (toggle pill — active: #5BBF4E bg)
  ● Include Out of Stock

─────────────────────────────────
RIGHT CONTENT AREA
─────────────────────────────────

TOP BAR (above grid):
- Left: Active filter chips row
  Chip style: bg #E8F5E4, border 0.5px #C8E8C0, 
  border-radius 20px, DM Sans 11px #1E4016, 
  padding 4px 12px, × icon right to remove
  Example chips: "Kurtis ×"  "Size: M ×"  "₹499–₹2999 ×"
- Right: Sort dropdown
  "Sort by: Newest First ▾" — DM Sans 12px #1E4016,
  border 0.5px #D0EAC8, border-radius 8px, padding 8px 14px
  Dropdown options: Newest First / Price: Low to High / 
  Price: High to Low / Most Popular / Top Rated

PRODUCT GRID — 3 columns (right side)
Gap: 20px between cards

PRODUCT CARD (each card):
- Size: ~300x400px
- Border-radius: 14px
- Border: 0.5px #E8F5E4
- Background: #FFFFFF

  IMAGE AREA (top, 3:4 ratio):
  - Object-fit: cover, border-radius 14px 14px 0 0
  - Background placeholder: #F7FDF5
  - Top-left badge: "New" or "Sale 20% off" 
    New → bg #5BBF4E text #fff
    Sale → bg #1E4016 text #E8F5E4
    Both pills: DM Sans 10px, padding 3px 10px, 
    border-radius 20px, margin 10px
  - Top-right: Wishlist ti-heart icon 18px #1E4016 
    opacity 0 → shows on hover
  - Out of stock overlay: semi-transparent #fff 60% 
    + "Out of Stock" pill center — bg #F0F0F0, 
    text #888, DM Sans 11px

  CARD BODY (padding 12px 14px):
  - Product name: DM Sans 13px #1E4016 weight 500, 
    single line ellipsis
  - Fabric/detail tag: DM Sans 11px #6A9B5E 
    (eg. "Cotton · Embroidered")
  - Price row: 
    ₹1,999 DM Mono 14px #1E4016 weight 500
    ₹2,499 DM Mono 12px #888 line-through (if on sale)
  - Size row: XS S M (available sizes as tiny pills)
    pill: border 0.5px #D0EAC8 border-radius 4px 
    DM Sans 10px padding 2px 6px #1E4016

  HOVER STATE (entire card):
  - Border color → #5BBF4E
  - "Add to Cart" bar slides up from bottom:
    height 38px, bg #5BBF4E, text "Add to Cart" 
    DM Sans 12px #fff letter-spacing 0.08em,
    border-radius 0 0 14px 14px
    Animation: translateY(100%) → translateY(0), 
    220ms ease-out
  - Wishlist icon fades in

─────────────────────────────────
4. PAGINATION (bottom of grid)
─────────────────────────────────
- Centered, margin-top 48px
- Style: page number pills
  Current: bg #5BBF4E text #fff, border-radius 8px, 
  size 36x36px, DM Sans 13px
  Others: bg #fff, border 0.5px #D0EAC8, text #1E4016
  Prev / Next: text links with ti-arrow-left / ti-arrow-right
- Gap between numbers: 8px

════════════════════════════════════
MOBILE FRAME (390px wide)
════════════════════════════════════

1. STICKY NAVBAR — same as homepage mobile

2. PAGE HEADER
- "Kurtis" — Cormorant Garamond 26px #1E4016, centered
- "24 Products" — DM Sans 11px #6A9B5E below, centered
- Padding: 16px

3. FILTER + SORT BAR (sticky below navbar)
- Height: 44px, bg #FFFFFF, border-bottom 0.5px #D0EAC8
- Two pill buttons side by side, full width split:
  Left: "⊞ Filter" — ti-adjustments-horizontal icon 
  + "Filter" DM Sans 12px #1E4016
  Right: "↕ Sort" — ti-arrows-sort icon 
  + "Sort" DM Sans 12px #1E4016
  Both: border 0.5px #D0EAC8, border-radius 8px, 
  bg #FFFFFF, height 34px, margin 5px 8px

4. ACTIVE FILTER CHIPS (horizontal scroll row)
- Below the bar, overflow-x scroll, no scrollbar
- Same chip style as desktop
- Padding: 8px 16px

5. PRODUCT GRID — 2 columns
- Gap: 12px, padding: 0 16px
- Card size: ~168x280px, border-radius 12px

  MOBILE CARD:
  - Image area: 3:4 ratio, border-radius 12px 12px 0 0
  - Badge top-left: same pill style, slightly smaller 9px
  - Body padding: 8px 10px
  - Product name: DM Sans 12px #1E4016 weight 500
  - Detail tag: DM Sans 10px #6A9B5E
  - Price: DM Mono 13px #1E4016
  - Size pills: 2-3 pills max, DM Sans 9px
  - No hover Add to Cart — instead tap opens product page
  - Wishlist icon always visible top-right, 16px

6. FILTER BOTTOM SHEET (appears on "Filter" tap)
- Full screen bottom sheet, slides up
- Handle bar: 4px pill centered, #D0EAC8, top 8px
- Title: "Filters" DM Sans 14px #1E4016 weight 500 
  + "Clear All" right #5BBF4E
- Same filter groups as desktop, vertically stacked
- Each group collapsible with ti-chevron-down icon
- Bottom: "Apply Filters" full-width button 
  bg #5BBF4E text #fff border-radius 28px height 50px
- Sheet bg: #FFFFFF, border-radius 20px 20px 0 0

7. SORT BOTTOM SHEET (appears on "Sort" tap)
- Smaller bottom sheet, list of sort options
- Each option: DM Sans 14px #1E4016, height 48px, 
  border-bottom 0.5px #F7FDF5
- Selected: text #5BBF4E + ti-check icon right
- Sheet bg: #FFFFFF

8. BOTTOM NAVIGATION BAR
- Same as homepage — fixed, 5 tabs
- Categories tab active (highlighted #5BBF4E)

════════════════════════════════════
ANIMATIONS & INTERACTIONS
════════════════════════════════════

- Page load: product cards fade in + translateY(16px→0),  
  stagger 50ms per card, ease-out 400ms
- Filter apply: grid re-renders with fade transition 250ms
- Filter chip remove (×): chip shrinks + fades out 150ms, 
  grid refreshes
- Sort dropdown: opens with scale(0.95→1) + opacity 200ms
- Add to Cart hover bar: translateY(100%→0) 220ms ease-out
- Wishlist: scale(1→1.3→1) spring 250ms, fill green
- Pagination: page change — grid fades out 150ms → new 
  items fade in 300ms
- Mobile filter sheet: slides up from bottom 300ms 
  cubic-bezier(0.32, 0.72, 0, 1)
- Mobile sort sheet: same slide up, shorter height
- Active filter chip: pops in scale(0→1) 180ms spring
- Price slider handle: smooth drag, values update live
- Scroll: product cards lazy load with skeleton placeholder 
  (bg #F7FDF5, shimmer animation left→right)

════════════════════════════════════
SPACING RULES
════════════════════════════════════

Desktop:
- Page padding: 0 80px
- Filter sidebar: 24px internal padding
- Grid gap: 20px
- Section gap: 32px

Mobile:
- Page padding: 0 16px  
- Card gap: 12px
- Filter sheet padding: 20px 16px