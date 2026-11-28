const FEATURE_CARDS = [
  { title: "A natural rhythm.", text: "An unhurried session leaves room for real expression and the moments in between." },
  { title: "A considered frame.", text: "Thoughtful composition brings out the subtle details that make your story yours." },
  { title: "Light, honestly seen.", text: "We work with the light around you to keep every image grounded and timeless." },
  { title: "Made to keep.", text: "A carefully edited collection gives you photographs you will want to return to." },
];

const EDITORIAL_FEATURE_CARDS = [
  { title: "Editorial portraits.", text: "A little direction, a lot of room to be yourself." },
  { title: "The in-between.", text: "We keep the unplanned gestures and fleeting expressions that make a story feel real." },
  { title: "A point of view.", text: "Artful light and considered composition give every frame its own character." },
  { title: "Made to revisit.", text: "A thoughtful edit turns the session into a collection worth returning to." },
];

const APPROACH_CARDS = [
  { title: "Natural direction", text: "Gentle prompts and an easy pace leave room for you to settle into the moment." },
  { title: "Considered craft", text: "Light, composition, and careful editing work together to keep every frame timeless." },
  { title: "Your story, your way", text: "Every session adapts to the people, energy, and feeling at its heart." },
];

const WHY_CARDS = [
  { title: "Personalise your session.", text: "Shape the shoot around your story, style and pace.", icon: 0 },
  { title: "Flexible booking options.", text: "Find a time and setting that fit easily into your plans.", icon: 1 },
  { title: "Thoughtful direction.", text: "Get guidance on outfits, locations and timing before the shoot.", icon: 3 },
  { title: "Beautifully finished photographs.", text: "Every frame is selected and refined with care.", icon: 2 },
  { title: "A real photographer, from the start.", text: "Talk through your ideas with the person behind the camera.", icon: 3 },
  { title: "A gallery made to revisit.", text: "Keep and share the moments that matter to you.", icon: 2 },
];

const VALUE_CARDS = [
  { title: "A thoughtful approach.", text: "Every session is shaped around who you are and what you want to remember.", linkLabel: "Learn about our approach", linkTo: "#approach" },
  { title: "Care in every detail.", text: "From the first conversation to your finished gallery, we work with care and intention.", linkLabel: "See how we work", linkTo: "#features" },
  { title: "Inclusive by design.", text: "We create welcoming sessions that honour every person, connection and story.", linkLabel: "Explore our stories", linkTo: "/stories" },
];

const getDerivedGallery = (story) => [
  story?.subject?.image,
  ...(Array.isArray(story?.moments?.diptych) ? story.moments.diptych : []),
  story?.moments?.envFigure,
  story?.final?.image,
  story?.leadImage,
].filter(Boolean).map((image) => ({
  src: image.src || image,
  alt: image.alt || story?.category || "Editorial photograph",
  caption: image.caption || "",
  objectPosition: image.objectPosition || "",
  cropZoom: image.cropZoom || 1,
})).filter((image, index, list) => list.findIndex((candidate) => candidate.src === image.src) === index).slice(0, 6);

const asCMSImage = (image) => image ? {
  src: image.src || image,
  alt: image.alt || "",
  objectPosition: image.objectPosition || "",
  cropZoom: image.cropZoom || 1,
} : null;

const cloneCards = (cards) => cards.map((card) => ({ ...card }));

export function getCategoryPageContent(story = {}) {
  const isEditorial = story.id === "editorial";
  const defaults = {
    closerLookHeading: "Take a closer look.",
    galleryCards: getDerivedGallery(story),
    featureHeading: isEditorial ? "Smile. Snap. Share. Repeat." : "",
    featureCards: cloneCards(isEditorial ? EDITORIAL_FEATURE_CARDS : FEATURE_CARDS).map((card, index) => ({ ...card, imageIndex: index + 1 })),
    experienceEyebrow: isEditorial ? "Editorial Photography." : `${story.category || "Photography"} Photography`,
    experienceHeading: isEditorial ? "Even more expressive.\nEven more intentional." : `Exceptional ${(story.category || "photography").toLowerCase()} for every story.`,
    experienceDescription: isEditorial
      ? "Thoughtful direction, considered light and a distinctive point of view come together to make images that feel beautifully individual and made to last."
      : "A thoughtful, unhurried approach brings out the details that make your story feel like yours.",
    experienceLead: isEditorial ? "Stories shaped with an artist’s eye." : "",
    perspectiveEyebrow: "A considered perspective",
    perspectiveHeading: `A new perspective on ${(story.category || "photography").toLowerCase()}.`,
    approachHeading: "Presence first. Beautifully seen.",
    approachDescription: "A thoughtful, unhurried approach brings out the details that make your story feel like yours.",
    approachCards: cloneCards(APPROACH_CARDS),
    sectionImages: {
      experience: asCMSImage(story?.final?.image || story?.moments?.envFigure || story?.subject?.image || story?.leadImage),
      approach: asCMSImage(story?.moments?.envFigure || story?.subject?.image || story?.leadImage || story?.final?.image),
      perspective: asCMSImage(story?.moments?.envFigure || story?.subject?.image || story?.leadImage || story?.final?.image),
    },
    sectionColors: {},
    displaySettings: {
      desktop: {
        opening: { textX: 7, textY: 78, textAlign: "left" },
        experience: { textX: 50, textY: 16, textAlign: "center" },
        perspective: { textX: 50, textY: 12, textAlign: "center" },
      },
      mobile: {
        opening: { textX: 6, textY: 80, textAlign: "left" },
        experience: { textX: 50, textY: 16, textAlign: "center" },
        perspective: { textX: 50, textY: 12, textAlign: "center" },
      },
    },
    mobileOverrides: { copy: {}, images: {}, galleryCards: [], displaySettings: {}, cards: {} },
    cameraLabel: "Editorial Portraits.",
    cameraHeading: "A considered point of view.\nA whole new frame.",
    cameraDescription: "Thoughtful direction and considered light bring every detail into focus. Explore portraits with a distinctive point of view — made to feel personal, expressive, and entirely your own.",
    collectionEyebrow: "A complete collection.",
    collectionHeading: "All the moments.\nAll together.",
    collectionDescription: "From the quiet in-between to the portraits that define a story, each image belongs to the same considered collection.",
    whyHeading: "Why Phantom Labs is the best place to have your moments captured.",
    whyExploreLabel: "Explore our work",
    whyExploreLink: "/stories",
    whyLead: "A few ways we make your experience feel considered.",
    whyCards: cloneCards(WHY_CARDS),
    whyFooterHeading: "Let’s make something worth keeping.",
    whyFooterText: "Tell us what you have in mind and we’ll help you plan the session.",
    whyCtaLabel: "Start a conversation",
    whyCtaLink: "/contact",
    valuesHeading: "Our values lead the way.",
    valueCards: cloneCards(VALUE_CARDS),
  };
  const saved = story.pageContent || {};
  return {
    ...defaults,
    ...saved,
    sectionImages: { ...defaults.sectionImages, ...(saved.sectionImages || {}) },
    sectionColors: saved.sectionColors || {},
    displaySettings: {
      desktop: { ...defaults.displaySettings.desktop, ...(saved.displaySettings?.desktop || {}) },
      mobile: { ...defaults.displaySettings.mobile, ...(saved.displaySettings?.mobile || {}) },
    },
    mobileOverrides: {
      ...defaults.mobileOverrides,
      ...(saved.mobileOverrides || {}),
      copy: saved.mobileOverrides?.copy || {},
      images: saved.mobileOverrides?.images || {},
      galleryCards: Array.isArray(saved.mobileOverrides?.galleryCards) ? saved.mobileOverrides.galleryCards : [],
      displaySettings: { ...(saved.mobileOverrides?.displaySettings || {}) },
      cards: saved.mobileOverrides?.cards || {},
    },
    galleryCards: Array.isArray(saved.galleryCards) ? saved.galleryCards : defaults.galleryCards,
    featureCards: Array.isArray(saved.featureCards) ? saved.featureCards : defaults.featureCards,
    approachCards: Array.isArray(saved.approachCards) ? saved.approachCards : defaults.approachCards,
    whyCards: Array.isArray(saved.whyCards) ? saved.whyCards : defaults.whyCards,
    valueCards: Array.isArray(saved.valueCards) ? saved.valueCards : defaults.valueCards,
  };
}

