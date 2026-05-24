Design TWO pages for "Rich Girl — House of Fashion":
1. Product Detail Page (PDP)
2. Cart Page
Both must be desktop + mobile friendly.

BRAND:
- Colors: #E8F5E4 (mist green bg), #5BBF4E (CTA/active),
  #3D9E32 (hover), #1E4016 (dark text), #FFFFFF (white),
  #F7FDF5 (alt bg), #D0EAC8 (borders)
- Fonts: Cormorant Garamond (headlines), DM Sans (UI/body),
  DM Mono (prices)
- Vibe: Soft, clean, airy — fashionable not cluttered

════════════════════════════════════════════
PAGE 1 — PRODUCT DETAIL PAGE (PDP)
════════════════════════════════════════════

━━━━━━━━━━━━━━━━━━━━
DESKTOP (1440px)
━━━━━━━━━━━━━━━━━━━━

NAVBAR — same sticky navbar as other pages

BREADCRUMB (below navbar):
- Padding: 12px 80px
- "Home / Indian Wear / Kurtis / Floral Printed Kurti"
- DM Sans 11px #6A9B5E, separator " / " #D0EAC8
- Last item: #1E4016 (current page, not a link)

─────────────────────────────────────
MAIN CONTENT — 2 column layout
Left 52% image | Right 48% details
Padding: 32px 80px, gap 48px
─────────────────────────────────────

LEFT — IMAGE GALLERY:
  PRIMARY IMAGE:
  - Full width of left col, aspect ratio 3:4
  - Border-radius: 16px
  - Object-fit: cover, bg #F7FDF5
  - Top-left: "New Arrival" pill — bg #5BBF4E 
    text #fff DM Sans 10px border-radius 20px
  - Top-right: Zoom icon ti-zoom-in 18px #1E4016 
    on hover shows "Click to zoom" tooltip

  THUMBNAIL STRIP (below primary image):
  - 4 thumbnails, horizontal row, gap 10px
  - Each: 72x90px, border-radius 10px, object-fit cover
  - Selected: border 2px #5BBF4E
  - Unselected: border 0.5px #D0EAC8, opacity 0.7
  - Hover: opacity 1, border-color #5BBF4E

RIGHT — PRODUCT DETAILS:
  TOP:
  - Category link: "Kurtis" DM Sans 11px #5BBF4E 
    uppercase letter-spacing 0.1em
  - Product name: "Floral Printed Cotton Kurti"
    Cormorant Garamond 36px #1E4016 line-height 1.2
  - Rating row: 
    ★★★★☆ (stars 16px #5BBF4E filled/empty #D0EAC8)
    "4.2" DM Sans 13px #1E4016 weight 500
    "(128 reviews)" DM Sans 12px #6A9B5E, 
    underline on hover, links to reviews section

  PRICE ROW (margin-top 16px):
  - ₹1,999 DM Mono 22px #1E4016 weight 500
  - ₹2,499 DM Mono 15px #888 line-through margin-left 10px
  - "20% off" pill — bg #E8F5E4 text #3D9E32 
    DM Sans 11px border-radius 20px padding 3px 10px

  DIVIDER: 0.5px #D0EAC8, margin 20px 0

  PRODUCT META (2 rows, label + value):
  - "Fabric" : "Pure Cotton" 
  - "Length" : "47 inches"
  - "Occasion" : "Casual / Festive"
  Each row: DM Sans 13px, label #6A9B5E, 
  value #1E4016, padding 6px 0

  DIVIDER: 0.5px #D0EAC8, margin 20px 0

  COLOR SELECTOR:
  - Label: "Color" DM Sans 12px #6A9B5E + 
    selected color name right "Sage Green" #1E4016
  - Color dots row, gap 10px:
    Circle 28px, colors: Sage Green, Blush Pink, 
    Ivory, Black, Yellow
    Selected: 2.5px outer ring #5BBF4E, 2px gap
    Hover: ring appears in #D0EAC8

  SIZE SELECTOR (margin-top 16px):
  - Label: "Size" DM Sans 12px #6A9B5E + 
    "Size Guide ↗" link right DM Sans 11px #5BBF4E
  - Size pills row, gap 8px:
    XS  S  M  L  XL  XXL
    Each pill: 44x36px, border-radius 8px
    Available: border 0.5px #D0EAC8 text #1E4016 
      hover bg #E8F5E4
    Selected: bg #1E4016 text #fff border none
    Out of stock: text #D0EAC8 border 0.5px #E8E8E8
      strikethrough line diagonal across pill

  QUANTITY + CTA (margin-top 24px):
  - Row 1 — Quantity stepper:
    [ − ]  [ 1 ]  [ + ]
    Each box: 36x36px, border 0.5px #D0EAC8, 
    border-radius 8px, DM Sans 14px #1E4016
    − and + : bg #F7FDF5 on hover
    
  - Row 2 — Two buttons side by side, gap 12px:
    "ADD TO CART" — bg #5BBF4E text #fff 
      DM Sans 13px letter-spacing 0.1em
      border-radius 28px height 50px flex-1
      hover: bg #3D9E32, scale 1.01 180ms ease
    "WISHLIST ♡" — border 1.5px #5BBF4E text #3D9E32
      bg #fff border-radius 28px height 50px flex-1
      hover: bg #E8F5E4

  DELIVERY INFO (margin-top 20px):
  - bg #F7FDF5, border-radius 12px, padding 14px 16px
  - Row 1: ti-truck icon 16px #5BBF4E + 
    "Free delivery on orders above ₹999" 
    DM Sans 12px #1E4016
  - Row 2: ti-calendar icon 16px #5BBF4E + 
    "Estimated delivery: 3–5 business days"
    DM Sans 12px #1E4016
  - Row 3: ti-refresh icon 16px #5BBF4E + 
    "Easy 7-day returns"
    DM Sans 12px #1E4016
  - Row dividers: 0.5px #D0EAC8 between each row

  SHARE ROW (margin-top 16px):
  - "Share:" DM Sans 11px #6A9B5E + 
    icons: ti-brand-whatsapp ti-brand-instagram 
    ti-link — each 18px #1E4016, gap 12px
    hover: color #5BBF4E, scale 1.1 150ms

─────────────────────────────────────
BELOW FOLD — FULL WIDTH SECTIONS
─────────────────────────────────────

PRODUCT DESCRIPTION (padding 0 80px, margin-top 48px):
- Tab bar: "Description" | "Size Chart" | "Reviews (128)"
  Active tab: border-bottom 2px #5BBF4E text #1E4016
  Inactive: text #6A9B5E
  Tab height: 44px, DM Sans 13px

  DESCRIPTION TAB content:
  - DM Sans 14px #1E4016 line-height 1.8
  - Bullet points with ti-circle-dot #5BBF4E as markers
  - Max 5 bullet points, no wall of text

  SIZE CHART TAB:
  - Simple table: Size | Chest | Waist | Hip | Length
  - Header row: bg #E8F5E4 DM Sans 12px #1E4016
  - Data rows: alternating #fff / #F7FDF5
  - Cell padding: 10px 16px

  REVIEWS TAB:
  - Summary bar: big "4.2" Cormorant Garamond 48px #1E4016
    + 5 star visual + "128 reviews" DM Sans 13px #6A9B5E
  - Rating breakdown bars (5★ to 1★):
    Bar track: #D0EAC8, filled: #5BBF4E, 
    height 6px, border-radius 3px
  - Individual review cards below:
    Avatar circle 36px bg #E8F5E4 initials DM Sans 13px
    Name + date DM Sans 12px | Stars row | Review text 13px

RELATED PRODUCTS (margin-top 64px):
- Heading: "You May Also Like" 
  Cormorant Garamond 28px #1E4016
- 4 product cards, same style as listing page
- Horizontal scroll on mobile

━━━━━━━━━━━━━━━━━━━━
MOBILE (390px) — PRODUCT DETAIL
━━━━━━━━━━━━━━━━━━━━

STICKY NAVBAR — same

IMAGE CAROUSEL (full width, no side padding):
- Full bleed image, aspect ratio 3:4
- Swipeable gallery — dot indicators bottom center
  Active dot: #5BBF4E 8px, inactive #D0EAC8 6px
- Badge top-left: "New Arrival" pill
- Wishlist icon top-right: ti-heart 20px bg #fff 
  circle 36px shadow-light

PRODUCT INFO (padding 16px 16px 0):
- Category: DM Sans 10px #5BBF4E uppercase
- Name: Cormorant Garamond 26px #1E4016 line-height 1.2
- Rating: stars 14px + "4.2 (128 reviews)" DM Sans 12px
- Price: ₹1,999 DM Mono 18px + ₹2,499 line-through 
  + "20% off" pill — all in one row

COLOR + SIZE (padding 16px):
- Same as desktop, slightly smaller sizes
- Color dots 24px, size pills 40x32px

QUANTITY + BUTTONS:
- Quantity stepper row
- "ADD TO CART" full width green pill button 50px height
- "WISHLIST" full width outlined button below, 44px

DELIVERY INFO — same card, full width

DESCRIPTION TABS — same, scroll within tab

RELATED PRODUCTS — horizontal scroll, 2.2 cards visible

STICKY BOTTOM BAR (mobile only):
- Fixed bottom, height 64px, bg #FFFFFF
- Top border 0.5px #D0EAC8
- Left: Price "₹1,999" DM Mono 18px #1E4016
- Right: "ADD TO CART" pill button 
  bg #5BBF4E text #fff DM Sans 13px 
  border-radius 28px padding 12px 28px

════════════════════════════════════════════
PAGE 2 — CART PAGE
════════════════════════════════════════════

━━━━━━━━━━━━━━━━━━━━
DESKTOP (1440px)
━━━━━━━━━━━━━━━━━━━━

NAVBAR — same sticky

PAGE HEADER:
- "My Cart" Cormorant Garamond 32px #1E4016
- "(3 Items)" DM Sans 14px #6A9B5E inline
- Padding: 24px 80px, border-bottom 0.5px #D0EAC8

─────────────────────────────────────
MAIN LAYOUT — 2 column
Left 62% cart items | Right 36% order summary
Padding: 32px 80px, gap 32px
─────────────────────────────────────

LEFT — CART ITEMS LIST:

CART ITEM CARD (each item, 3 shown):
- bg #FFFFFF, border 0.5px #D0EAC8, border-radius 14px
- Padding: 16px, margin-bottom 12px
- Layout: horizontal flex, gap 16px

  IMAGE: 80x100px, border-radius 10px, 
  object-fit cover, bg #F7FDF5

  ITEM DETAILS (flex-1):
  - Product name: DM Sans 14px #1E4016 weight 500
  - Detail: "Cotton · Sage Green · Size: M"
    DM Sans 12px #6A9B5E margin-top 4px
  - Price: DM Mono 15px #1E4016 weight 500 margin-top 8px
  - Original price: DM Mono 12px #888 line-through 
    (if discounted)

  RIGHT SIDE (flex-col align-end):
  - Remove: ti-trash icon 16px #D0EAC8 
    hover → #E24B4A, transition 150ms
  - Quantity stepper (bottom):
    [ − ] [ 1 ] [ + ] same style as PDP
    smaller: 30x30px

- Divider: 0.5px #F7FDF5 between cards (inside list)
- SAVE FOR LATER link below each item:
  DM Sans 11px #5BBF4E, hover underline

EMPTY CART STATE:
- Center of left col, padding 80px 0
- ti-shopping-cart icon 48px #D0EAC8
- "Your cart is empty" Cormorant Garamond 24px #1E4016
- "Looks like you haven't added anything yet."
  DM Sans 13px #6A9B5E
- "START SHOPPING" button — #5BBF4E pill button

PROMO CODE (below cart items):
- bg #F7FDF5, border-radius 12px, padding 14px 16px
- "Have a promo code?" DM Sans 13px #1E4016
- Input row: text field + "APPLY" button side by side
  Input: border 0.5px #D0EAC8, border-radius 8px, 
  DM Sans 13px, padding 10px 14px, flex-1
  Button: bg #1E4016 text #E8F5E4 DM Sans 12px 
  border-radius 8px padding 10px 20px
- Applied state: green check ti-circle-check #5BBF4E 
  + "SAVE20 applied! You save ₹400" DM Sans 12px #3D9E32

RIGHT — ORDER SUMMARY (sticky top 80px):
- bg #F7FDF5, border-radius 16px, 
  border 0.5px #D0EAC8, padding 24px

- Heading: "Order Summary" DM Sans 14px #1E4016 weight 500

- Summary rows (each row: label left, value right):
  "Subtotal (3 items)" — "₹5,997"
  "Discount (SAVE20)" — "−₹400" text #3D9E32
  "Delivery" — "FREE" text #3D9E32 / or "₹99"
  "Taxes" — "₹180"
  All: DM Sans 13px #1E4016, padding 10px 0, 
  border-bottom 0.5px #D0EAC8

- TOTAL ROW:
  "Total" DM Sans 15px #1E4016 weight 500
  "₹5,777" DM Mono 18px #1E4016 weight 500
  border-top 1px #1E4016, padding-top 14px margin-top 4px

- Savings pill (below total):
  "You're saving ₹400 on this order 🎉"
  bg #E8F5E4 text #1E4016 DM Sans 11px 
  border-radius 8px padding 8px 12px width 100%

- CHECKOUT BUTTON:
  "PROCEED TO CHECKOUT"
  bg #5BBF4E text #fff DM Sans 13px letter-spacing 0.1em
  border-radius 28px height 52px width 100%
  margin-top 20px
  hover: bg #3D9E32, scale 1.01

- Trust badges row (below button):
  3 icons + labels, centered, gap 20px:
  ti-lock "Secure Payment"
  ti-shield-check "100% Safe"
  ti-refresh "Easy Returns"
  Icon 16px #5BBF4E, text DM Sans 10px #6A9B5E

- "Continue Shopping" text link centered below
  DM Sans 12px #6A9B5E, hover #1E4016

YOU MAY ALSO LIKE (below main layout):
- "Complete Your Look" Cormorant Garamond 26px #1E4016
- 4 product cards, same style

━━━━━━━━━━━━━━━━━━━━
MOBILE (390px) — CART
━━━━━━━━━━━━━━━━━━━━

STICKY NAVBAR — same + back arrow ti-arrow-left left

PAGE HEADER:
- "My Cart (3)" Cormorant Garamond 24px #1E4016 centered

CART ITEMS (padding 0 16px):
- Same card style, slightly compact
- Image: 70x88px
- Name: DM Sans 13px, detail 11px
- Qty stepper: 28x28px buttons

PROMO CODE — full width, same style

ORDER SUMMARY — full width card below items:
- bg #F7FDF5, border-radius 16px, padding 16px
- Same rows as desktop
- Collapsed by default on mobile — 
  "Order Summary ▾" tap to expand accordion
  Expanded shows all rows

STICKY CHECKOUT BAR (fixed bottom):
- Height: 72px, bg #FFFFFF
- Top border 0.5px #D0EAC8
- Left: "Total ₹5,777" 
  label DM Sans 11px #6A9B5E
  amount DM Mono 16px #1E4016 weight 500
- Right: "CHECKOUT →" 
  bg #5BBF4E text #fff DM Sans 13px
  border-radius 28px padding 12px 24px

BOTTOM NAV — Cart tab active #5BBF4E

════════════════════════════════════════════
ANIMATIONS & INTERACTIONS — BOTH PAGES
════════════════════════════════════════════

PRODUCT DETAIL PAGE:
- Image gallery: swipe/click changes primary image 
  with crossfade 200ms ease
- Thumbnail click: selected border draws in 180ms
- Color dot select: outer ring expands from center 200ms
- Size pill select: bg fills from center scale 180ms ease
- Add to Cart tap: 
  Button does quick scale(1→0.96→1) 150ms 
  + cart icon in navbar bounces + badge increments
- Wishlist: heart fills with scale(1→1.35→1) 250ms spring
- Sticky bottom bar (mobile): 
  slides up from bottom on scroll past CTA button
  slides down when CTA is back in view
- Tab switch (Description/Size/Reviews): 
  underline slides horizontally 200ms ease
- Review stars: fill left to right on page load 600ms
- Zoom on image hover: scale(1.03) 300ms ease

CART PAGE:
- Page entrance: items stagger in translateY(12px→0) 
  fade, 60ms apart, ease-out 350ms
- Qty change: price in summary updates with 
  number flip animation 200ms
- Remove item: card slides left + fades out 250ms ease,
  remaining items shift up smoothly
- Promo apply: 
  Loading state: button shows spinner 800ms
  Success: input border turns #5BBF4E, 
  savings text fades in translateY(4px→0)
  Error: input shakes horizontally 300ms
- Order summary total: number counts up smoothly 
  when quantities change 400ms
- Checkout button hover: subtle scale 1.01 + 
  bg darkens 180ms ease
- Empty cart: icon bounces in scale(0→1.1→1) 400ms spring
- Savings pill: pulses once on load scale(1→1.02→1) 500ms
- Mobile order summary accordion: 
  height animates open/close 250ms ease
- Mobile sticky bar: 
  slides up from bottom 300ms when scrolling down
  hides when at very top of page