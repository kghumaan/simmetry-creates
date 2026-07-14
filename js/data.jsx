/* =========================================================================
   Content data — every piece of editable site content lives in SMY_DEFAULTS.
   The live site renders deepMerge(SMY_DEFAULTS, saved overrides) — see
   js/content.jsx. The admin panel (#/admin) edits the same tree, guided by
   SMY_ADMIN_SCHEMA below.
   ========================================================================= */

const SMY_DEFAULTS = {
  images: {
    jewelry: [
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
    ],
    woodwork: [
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
    ],
  },

  gallery: {
    jewelryTitle: 'Jewelry.',
    woodworkTitle: 'Woodwork.',
    countSuffix: 'pieces',
    ctaLabel: 'Begin a commission',
  },

  about: {
    portrait: 'assets/ashish.jpeg',
    eyebrow: '— About',
    title: 'Ashish Savani.',
    titleEm: 'One bench, two crafts.',
    lede:
      'I work alone, in a north-facing room above a tannery in Mill Valley. ' +
      'In the morning I cut metal; in the afternoon I cut wood. I keep both ' +
      'practices small on purpose. A piece is finished when it is right — ' +
      'not when it is due.',
    portraitCaption: 'A portrait, away from the bench',

    bio1Label: '— 01 Beginnings',
    bio1:
      'I learned to set stones from my grandfather, in a back room in Surat, ' +
      'in the summers between school years. He taught me that a stone has a ' +
      "seat it wants, and the maker's job is to find it. I held that idea " +
      'without knowing it for a long time.',
    bio2Label: '— 02 Wood, after metal',
    bio2:
      'I came to wood late, through a chair that needed mending. The chair ' +
      'took six months. The thing I learned in those six months — that a ' +
      'joint should not need glue to hold — has stayed with me through every ' +
      'piece since.',
    bio3Label: '— 03 The studio, today',
    bio3:
      'The studio takes on roughly eighteen pieces a year, split between ' +
      'the two practices. Two are in progress at any time. We open the diary ' +
      'three times — January, May, September — and accept what fits the ' +
      'quarter. The wait is honest because the work is not hurried.',

    processNum: '— 04 Process',
    processTitle: 'How a commission unfolds',
    processIntro: 'Three quiet steps over roughly four months. No deposits before the drawing is right.',
    step1Title: 'Conversation',
    step1Body: 'A long letter, a phone call, sometimes a visit. We talk about the piece you want and the life it will live in. Two to three weeks.',
    step2Title: 'Drawing',
    step2Body: 'A drawing on paper, by hand, with a written specification. Materials are quoted at this point. Two weeks for revisions.',
    step3Title: 'Bench',
    step3BodyJewelry: 'Metal is cut, set, finished. Photographs are taken in north light before the piece is sent.',
    step3BodyWoodwork: 'Lumber is selected, milled, joined, finished. The piece is photographed under linen before delivery.',

    inquiryEyebrow: '— 05 Inquiry',
    inquiryTitle: 'Begin a commission.',
    inquiryLede:
      'Tell us, in your own words, what you have in mind. There is no form ' +
      "for the kind of piece that doesn't fit a form — write a paragraph " +
      'and we will write back within a week.',
    postLabel: 'By post',
    postValue: 'Box 41, Mill Valley\nCalifornia 94941',
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
    location: 'Mill Valley, California',
    hours: 'By appointment',
    baseLeft: '© 2026 Ashish Savani · All work shown is one of one',
    baseRight: 'The studio observes a quiet month each January',
  },
};

/* -------- Admin form schema — one entry per editable text field ----------- */

const SMY_ADMIN_SCHEMA = [
  {
    group: 'Gallery pages',
    fields: [
      { path: 'gallery.jewelryTitle', label: 'Jewelry page title' },
      { path: 'gallery.woodworkTitle', label: 'Woodwork page title' },
      { path: 'gallery.countSuffix', label: 'Piece-count word (e.g. “pieces”)' },
      { path: 'gallery.ctaLabel', label: 'Gallery button label' },
    ],
  },
  {
    group: 'About — header',
    fields: [
      { path: 'about.eyebrow', label: 'Small heading above the title' },
      { path: 'about.title', label: 'Title, first line' },
      { path: 'about.titleEm', label: 'Title, second line (italic)' },
      { path: 'about.lede', label: 'Intro paragraph', type: 'textarea' },
      { path: 'about.portraitCaption', label: 'Caption under the portrait' },
    ],
  },
  {
    group: 'About — story',
    fields: [
      { path: 'about.bio1Label', label: 'Part 1 label' },
      { path: 'about.bio1', label: 'Part 1 paragraph', type: 'textarea' },
      { path: 'about.bio2Label', label: 'Part 2 label' },
      { path: 'about.bio2', label: 'Part 2 paragraph', type: 'textarea' },
      { path: 'about.bio3Label', label: 'Part 3 label' },
      { path: 'about.bio3', label: 'Part 3 paragraph', type: 'textarea' },
    ],
  },
  {
    group: 'About — process',
    fields: [
      { path: 'about.processNum', label: 'Small heading (e.g. “— 04 Process”)' },
      { path: 'about.processTitle', label: 'Section title' },
      { path: 'about.processIntro', label: 'Section intro', type: 'textarea' },
      { path: 'about.step1Title', label: 'Step 1 title' },
      { path: 'about.step1Body', label: 'Step 1 text', type: 'textarea' },
      { path: 'about.step2Title', label: 'Step 2 title' },
      { path: 'about.step2Body', label: 'Step 2 text', type: 'textarea' },
      { path: 'about.step3Title', label: 'Step 3 title' },
      { path: 'about.step3BodyJewelry', label: 'Step 3 text (shown on jewelry side)', type: 'textarea' },
      { path: 'about.step3BodyWoodwork', label: 'Step 3 text (shown on woodwork side)', type: 'textarea' },
    ],
  },
  {
    group: 'About — inquiry & contact',
    fields: [
      { path: 'about.inquiryEyebrow', label: 'Small heading' },
      { path: 'about.inquiryTitle', label: 'Section title' },
      { path: 'about.inquiryLede', label: 'Section intro', type: 'textarea' },
      { path: 'about.postLabel', label: 'Postal label' },
      { path: 'about.postValue', label: 'Postal address', type: 'textarea' },
      { path: 'about.emailLabel', label: 'Email label' },
      { path: 'about.emailValue', label: 'Email address' },
      { path: 'about.diaryLabel', label: 'Diary label' },
      { path: 'about.diaryValue', label: 'Diary months' },
      { path: 'about.replyNote', label: 'Note next to the send button' },
      { path: 'about.submitLabel', label: 'Send button label' },
      { path: 'about.sentBody', label: 'Thank-you message after sending', type: 'textarea' },
    ],
  },
  {
    group: 'Footer',
    fields: [
      { path: 'footer.tagline', label: 'Tagline', type: 'textarea' },
      { path: 'footer.workHeading', label: 'Column 1 heading' },
      { path: 'footer.workJewelry', label: 'Column 1 · link 1' },
      { path: 'footer.workWoodwork', label: 'Column 1 · link 2' },
      { path: 'footer.workStudio', label: 'Column 1 · link 3' },
      { path: 'footer.practiceHeading', label: 'Column 2 heading' },
      { path: 'footer.practiceAbout', label: 'Column 2 · link 1' },
      { path: 'footer.practiceProcess', label: 'Column 2 · link 2' },
      { path: 'footer.practiceCommission', label: 'Column 2 · link 3' },
      { path: 'footer.studioHeading', label: 'Column 3 heading' },
      { path: 'footer.email', label: 'Contact email' },
      { path: 'footer.location', label: 'Location line' },
      { path: 'footer.hours', label: 'Hours line' },
      { path: 'footer.baseLeft', label: 'Bottom line, left' },
      { path: 'footer.baseRight', label: 'Bottom line, right' },
    ],
  },
];

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
window.SMY_ADMIN_SCHEMA = SMY_ADMIN_SCHEMA;
window.SMY_DATA = {
  JEWELRY_IMAGES: SMY_DEFAULTS.images.jewelry,
  WOODWORK_IMAGES: SMY_DEFAULTS.images.woodwork,
  ABOUT_IMAGE: SMY_DEFAULTS.about.portrait,
  HERO_COPY,
  SECTION_INTROS,
};
