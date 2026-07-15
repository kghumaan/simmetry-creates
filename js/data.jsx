/* =========================================================================
   Content data — every piece of editable site content lives in SMY_DEFAULTS.
   The live site renders deepMerge(SMY_DEFAULTS, saved overrides) — see
   js/content.jsx. The admin edit mode (unlocked at /admin) edits the same
   tree in place on the live pages — see js/edit.jsx.
   ========================================================================= */

/* One product per gallery photograph. Every field is optional on the live
   site (empty = hidden); `details` is an ordered label/value list rendered
   under the product image; `images` are optional extra angles. */
function smyProduct(image, title, description, details, price) {
  return {
    image,
    title: title || '',
    description: description || '',
    price: price || '',
    details: details || [],
    images: [],
  };
}

const JEWELRY_PRODUCTS = [
  smyProduct('/uploads/jewelry/1770438028429.png', 'Orchard band', 'A wide band cut from a single ingot, the vine chased by hand over two evenings.', [
    { label: 'Metal', value: '18k rose gold' },
    { label: 'Metal weight', value: '9.4 g' },
    { label: 'Diamond weight', value: '0.32 ct' },
    { label: 'Shape', value: 'Round brilliant' },
  ], 'On request'),
  smyProduct('/uploads/jewelry/1770444812567.png', 'Crescent drops', 'Emerald crescents with rose-cut drops; the pair sits just off the jaw.', [
    { label: 'Metal', value: '18k white gold' },
    { label: 'Metal weight', value: '11.2 g' },
    { label: 'Diamond weight', value: '2.10 ct' },
    { label: 'Shape', value: 'Rose cut, pear' },
  ], 'On request'),
  smyProduct('/uploads/jewelry/1770532742242.png', 'Garland bracelet', 'Rubies seated in an openwork garland; the clasp disappears into the pattern.', [
    { label: 'Metal', value: 'Platinum' },
    { label: 'Metal weight', value: '18.6 g' },
    { label: 'Diamond weight', value: '3.40 ct' },
    { label: 'Shape', value: 'Old European' },
  ], 'On request'),
  smyProduct('/uploads/jewelry/1770786241284(1)(1)(1).png', 'Orchid strand', 'A pavé orchid on twin strands of freshwater pearl, knotted by hand.', [
    { label: 'Metal', value: '18k yellow gold' },
    { label: 'Metal weight', value: '7.8 g' },
    { label: 'Diamond weight', value: '1.15 ct' },
    { label: 'Shape', value: 'Round, mixed melee' },
  ], 'On request'),
  smyProduct('/uploads/jewelry/1770788657479.png', 'Evening set', 'Made for a wedding in Alibaug; photographed before it left the studio.', [
    { label: 'Metal', value: '18k white gold' },
    { label: 'Metal weight', value: '14.1 g' },
    { label: 'Diamond weight', value: '2.75 ct' },
    { label: 'Shape', value: 'Pear and round' },
  ], 'On request'),
  smyProduct('/uploads/jewelry/1770890994769.png', 'Heirloom collar', 'A client’s grandmother’s stones, reset into a collar she can wear daily.', [
    { label: 'Metal', value: '22k yellow gold' },
    { label: 'Metal weight', value: '21.0 g' },
    { label: 'Diamond weight', value: '1.90 ct' },
    { label: 'Shape', value: 'Uncut polki' },
  ], 'On request'),
  smyProduct('/uploads/jewelry/1770983581672.png', 'Meadow studs', 'Cluster studs in mixed colours; no two leaves repeat.', [
    { label: 'Metal', value: '18k yellow gold' },
    { label: 'Metal weight', value: '5.2 g' },
    { label: 'Diamond weight', value: '1.48 ct' },
    { label: 'Shape', value: 'Fancy mixed' },
  ], 'On request'),
  smyProduct('/uploads/jewelry/1772117224535.png', 'Lattice cuff', 'A pierced lattice worked over a steel former, then set stone by stone.', [
    { label: 'Metal', value: '18k rose gold' },
    { label: 'Metal weight', value: '16.3 g' },
    { label: 'Diamond weight', value: '2.05 ct' },
    { label: 'Shape', value: 'Round brilliant' },
  ], 'On request'),
  smyProduct('/uploads/jewelry/1772117375815.png', 'Winter halo', 'A halo pendant on a hand-drawn chain; the bail is hidden in the leaves.', [
    { label: 'Metal', value: 'Platinum' },
    { label: 'Metal weight', value: '8.9 g' },
    { label: 'Diamond weight', value: '1.62 ct' },
    { label: 'Shape', value: 'Oval' },
  ], 'On request'),
  smyProduct('/uploads/jewelry/1773296958445.png', 'Court ring', 'A quiet court-shaped ring, comfortable enough to forget.', [
    { label: 'Metal', value: '18k yellow gold' },
    { label: 'Metal weight', value: '6.1 g' },
    { label: 'Diamond weight', value: '0.55 ct' },
    { label: 'Shape', value: 'Round brilliant' },
  ], 'On request'),
  smyProduct('/uploads/jewelry/1773469195917.png', 'Paisley drops', 'Paisley drops with sapphire centres; the outline is Surat, the cut is Antwerp.', [
    { label: 'Metal', value: '18k white gold' },
    { label: 'Metal weight', value: '10.4 g' },
    { label: 'Diamond weight', value: '1.85 ct' },
    { label: 'Shape', value: 'Marquise and pear' },
  ], 'On request'),
  smyProduct('/uploads/jewelry/1773636672403.png', 'Trellis necklace', 'A trellis of emerald and ruby over the collarbone; sits flat under a sari pallu.', [
    { label: 'Metal', value: '22k yellow gold' },
    { label: 'Metal weight', value: '24.7 g' },
    { label: 'Diamond weight', value: '3.10 ct' },
    { label: 'Shape', value: 'Mixed, old cuts' },
  ], 'On request'),
  smyProduct('/uploads/jewelry/file_00000000d09c71fab3061951c044c8bb.png', 'Pendant No. 13', 'A single pendant on a plain loop — the piece that started the register.', [
    { label: 'Metal', value: '18k yellow gold' },
    { label: 'Metal weight', value: '4.6 g' },
    { label: 'Diamond weight', value: '0.20 ct' },
    { label: 'Shape', value: 'Round brilliant' },
  ], 'On request'),
];

const WOODWORK_PRODUCTS = [
  smyProduct('/uploads/woodwork/1774266702078.png', 'Almirah, revived', 'A family almirah stripped, repaired, and refitted with hand-cut brass inlay.', [
    { label: 'Wood', value: 'Teak, reclaimed' },
    { label: 'Finish', value: 'Hand-rubbed oil' },
    { label: 'Dimensions', value: '72 × 36 × 18 in' },
  ], 'On request'),
  smyProduct('/uploads/woodwork/20230408_141429.jpg', 'Console No. 2', 'A long console with a single drawer; the pulls are turned from offcuts.', [
    { label: 'Wood', value: 'Sheesham' },
    { label: 'Finish', value: 'Oil and wax' },
    { label: 'Dimensions', value: '54 × 30 × 14 in' },
  ], 'On request'),
  smyProduct('/uploads/woodwork/20230503_224742.jpg', 'Ottoman bench', 'A kilim-topped ottoman on turned legs; the upholstery lifts for storage.', [
    { label: 'Wood', value: 'Mango' },
    { label: 'Finish', value: 'Shellac' },
    { label: 'Dimensions', value: '40 × 18 × 16 in' },
  ], 'On request'),
  smyProduct('/uploads/woodwork/20230703_205012.jpg', 'Hall table', 'A hall table with pierced iron brackets rescued from the original piece.', [
    { label: 'Wood', value: 'Teak' },
    { label: 'Finish', value: 'Hand-rubbed oil' },
    { label: 'Dimensions', value: '48 × 32 × 15 in' },
  ], 'On request'),
  smyProduct('/uploads/woodwork/20230708_101814.jpg', 'Reading chair', 'Mended, re-caned, and returned to the window it has faced for forty years.', [
    { label: 'Wood', value: 'Burma teak' },
    { label: 'Finish', value: 'Oil, no lacquer' },
    { label: 'Dimensions', value: 'Standard seat' },
  ], 'On request'),
  smyProduct('/uploads/woodwork/20230826_203208.jpg', 'Spice cabinet', 'A small cabinet of drawers, each front cut from the same board in sequence.', [
    { label: 'Wood', value: 'Walnut' },
    { label: 'Finish', value: 'Hand-rubbed oil' },
    { label: 'Dimensions', value: '24 × 30 × 10 in' },
  ], 'On request'),
  smyProduct('/uploads/woodwork/20231101_121228.jpg', 'Writing desk', 'A writing desk with a leather top; the drawer runs on wooden slides.', [
    { label: 'Wood', value: 'Teak and rosewood' },
    { label: 'Finish', value: 'Shellac' },
    { label: 'Dimensions', value: '48 × 30 × 24 in' },
  ], 'On request'),
  smyProduct('/uploads/woodwork/20240805_084736.jpg', 'Balcony rail', 'A restored balcony rail; every third baluster is new, and none announce it.', [
    { label: 'Wood', value: 'Teak, weathered' },
    { label: 'Finish', value: 'Exterior oil' },
    { label: 'Dimensions', value: 'To site' },
  ], 'On request'),
  smyProduct('/uploads/woodwork/20250505_165628.jpg', 'Side table pair', 'A pair of side tables, mirrored grain, from one plank rested two seasons.', [
    { label: 'Wood', value: 'Mango, quartersawn' },
    { label: 'Finish', value: 'Oil and wax' },
    { label: 'Dimensions', value: '18 × 22 × 18 in' },
  ], 'On request'),
  smyProduct('/uploads/woodwork/20250505_165634.jpg', 'Console No. 5', 'The fifth console in the register; the stretcher is a single sweep.', [
    { label: 'Wood', value: 'Sheesham' },
    { label: 'Finish', value: 'Hand-rubbed oil' },
    { label: 'Dimensions', value: '52 × 30 × 14 in' },
  ], 'On request'),
];

const SMY_DEFAULTS = {
  products: {
    jewelry: JEWELRY_PRODUCTS,
    woodwork: WOODWORK_PRODUCTS,
  },

  gallery: {
    jewelryTitle: 'Jewelry.',
    woodworkTitle: 'Woodwork.',
    countSuffix: 'pieces',
    ctaLabel: 'Begin a commission',
  },

  about: {
    portrait: '/assets/ashish.jpeg',
    eyebrow: '— About',
    title: 'Ashish Savani.',
    titleEm: 'One bench, two crafts.',
    lede:
      'I work alone, in a small studio in Mumbai. My hands were trained in ' +
      'Bangkok — metal first, then wood — and the practice followed me home. ' +
      'In the morning I cut metal; in the afternoon I cut wood. This work is ' +
      'my passion, kept small on purpose. A piece is finished when it is ' +
      'right — not when it is due.',
    portraitCaption: 'A portrait, away from the bench',

    bios: [
      {
        label: '— 01 Bangkok, beginnings',
        body:
          'I learned to set stones in Bangkok, in the workshops off Charoen ' +
          "Krung Road, where the city's finest setters work three to a bench. " +
          'They taught me that a stone has a seat it wants, and the maker’s ' +
          'job is to find it. I held that idea without knowing it for a long time.',
      },
      {
        label: '— 02 Wood, after metal',
        body:
          'Wood came later, through an old teak chair that needed mending. The ' +
          'chair took six months. The thing I learned in those six months — that ' +
          'a joint should not need glue to hold — has stayed with me through ' +
          'every piece since.',
      },
      {
        label: '— 03 Mumbai, today',
        body:
          'The studio is in Mumbai now — one room, good morning light. It takes ' +
          'on roughly eighteen pieces a year, split between the two practices. ' +
          'This has never been a trade to me; it is the thing I love doing most. ' +
          'We open the diary three times — January, May, September — and the ' +
          'wait is honest because the work is not hurried.',
      },
    ],

    processNum: '— 04 Process',
    processTitle: 'How a commission unfolds',
    processIntro: 'Three quiet steps over roughly four months. No deposits before the drawing is right.',
    steps: [
      { title: 'Conversation', body: 'A long letter, a phone call, sometimes a visit. We talk about the piece you want and the life it will live in. Two to three weeks.' },
      { title: 'Drawing', body: 'A drawing on paper, by hand, with a written specification. Materials are quoted at this point. Two weeks for revisions.' },
      { title: 'Bench', body: 'Metal is cut and set, or lumber is milled and joined. The piece is finished and photographed in north light before it is sent.' },
    ],

    inquiryEyebrow: '— 05 Inquiry',
    inquiryTitle: 'Begin a commission.',
    inquiryLede:
      'Tell us, in your own words, what you have in mind. There is no form ' +
      "for the kind of piece that doesn't fit a form — write a paragraph " +
      'and we will write back within a week.',
    postLabel: 'By post',
    postValue: 'The studio, Bandra West\nMumbai 400050',
    emailLabel: 'By letter',
    emailValue: 'studio@simmetry.creates',
    diaryLabel: 'Diary opens',
    diaryValue: 'January · May · September',
    replyNote: 'We reply on Fridays · Within a week',
    submitLabel: 'Send the letter',
    sentBody: 'Your note is in the studio inbox. We read inquiries on Friday mornings; you will hear back within a week.',
  },

  footer: {
    tagline: 'Quiet objects, made slowly. A studio practice in fine jewelry and bespoke woodwork.',
    workHeading: 'Work',
    workJewelry: 'Jewelry',
    workWoodwork: 'Woodwork',
    workStudio: 'Studio',
    practiceHeading: 'Practice',
    practiceAbout: 'About Ashish',
    practiceProcess: 'Process',
    practiceCommission: 'Begin a commission',
    studioHeading: 'Studio',
    email: 'studio@simmetry.creates',
    location: 'Mumbai, India',
    hours: 'By appointment',
    baseLeft: '© 2026 Ashish Savani · All work shown is one of one',
    baseRight: 'The studio observes a quiet month each January',
  },
};

/* -------- Legacy copy kept for the unused landing variants (A/B/C) -------- */

const HERO_COPY = {
  jewelry: {
    eyebrow: 'No. 04 — Selected work, spring',
    headline: <>Quiet objects,<br /><em>made slowly.</em></>,
    lede:
      'Each piece begins with a conversation. We work in small numbers because care does not scale. ' +
      'The studio is a single bench in a north-facing room — gold, stone, and the patience to set them properly.',
  },
  woodwork: {
    eyebrow: 'No. 04 — Selected work, spring',
    headline: <>Quiet objects,<br /><em>made slowly.</em></>,
    lede:
      'Joinery cut by hand, finished by hand, stamped only with the year. ' +
      'Pieces leave the studio when they are right, not when they are due. ' +
      'Solid wood, oil finish, and time enough to choose the right grain.',
  },
};

const SECTION_INTROS = {
  jewelry: {
    selected:  { num: '01', title: 'Selected jewelry',          body: 'A small register of recent pieces. Most are one of one; a few quiet repeats are noted on request.' },
    process:   { num: '02', title: 'A practice of small numbers', body: 'No collections, no seasons. We open the diary three times a year and accept what fits. The wait is currently around fourteen weeks.' },
    materials: { num: '03', title: 'Materials, sourced patiently', body: 'Gold is fairmined or recycled; stones are bought in person at long-standing dealers in Jaipur, Tucson, and Antwerp.' },
  },
  woodwork: {
    selected:  { num: '01', title: 'Selected woodwork',         body: 'Pieces in the order they left the shop. Each is signed and dated; a record stays with the maker.' },
    process:   { num: '02', title: 'A practice of small numbers', body: 'Two pieces in progress at any time. Lumber is rested for a season before it is touched. The wait is currently around six months.' },
    materials: { num: '03', title: 'Wood, milled close to home',  body: 'Almost everything comes from within four hundred miles — windfall walnut, urban oak, mill-end cherry. Origin is recorded on the underside.' },
  },
};

window.SMY_DEFAULTS = SMY_DEFAULTS;
window.SMY_DATA = {
  JEWELRY_IMAGES: SMY_DEFAULTS.products.jewelry.map(p => p.image),
  WOODWORK_IMAGES: SMY_DEFAULTS.products.woodwork.map(p => p.image),
  ABOUT_IMAGE: SMY_DEFAULTS.about.portrait,
  HERO_COPY,
  SECTION_INTROS,
};
