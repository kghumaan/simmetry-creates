/* =========================================================================
   Content data — gallery image lists per mode and editorial copy.
   ========================================================================= */

const JEWELRY_IMAGES = [
  'uploads/jewelry/1770438028429.png',
  'uploads/jewelry/1770444812567.png',
  'uploads/jewelry/1770532742242.png',
  'uploads/jewelry/1770786241284(1)(1)(1).png',
  'uploads/jewelry/1770788657479.png',
  'uploads/jewelry/1770890994769.png',
  'uploads/jewelry/1770983581672.png',
  'uploads/jewelry/1772117224535.png',
  'uploads/jewelry/1772117375815.png',
  'uploads/jewelry/1773296958445.png',
  'uploads/jewelry/1773469195917.png',
  'uploads/jewelry/1773636672403.png',
  'uploads/jewelry/file_00000000d09c71fab3061951c044c8bb.png',
];

const WOODWORK_IMAGES = [
  'uploads/woodwork/1774266702078.png',
  'uploads/woodwork/20230408_141429.jpg',
  'uploads/woodwork/20230503_224742.jpg',
  'uploads/woodwork/20230703_205012.jpg',
  'uploads/woodwork/20230708_101814.jpg',
  'uploads/woodwork/20230826_203208.jpg',
  'uploads/woodwork/20231101_121228.jpg',
  'uploads/woodwork/20240805_084736.jpg',
  'uploads/woodwork/20250505_165628.jpg',
  'uploads/woodwork/20250505_165634.jpg',
];

const ABOUT_IMAGE = 'assets/about.jpeg';

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

window.SMY_DATA = { JEWELRY_IMAGES, WOODWORK_IMAGES, ABOUT_IMAGE, HERO_COPY, SECTION_INTROS };
