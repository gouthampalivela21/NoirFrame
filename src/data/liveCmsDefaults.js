// Public homepage content used when the live CMS is unavailable or has not yet
// been configured in a production environment.
import { EDITORIAL_STORIES } from "./editorialStories.js";
import { CATEGORIES_CONFIG } from "./bookingQuestions.js";

export const defaultLiveCmsCategories = [
  {
    id: "portraits",
    title: "Portraits.",
    tagline: "Timeless, Personal, You.",
    primaryLabel: "Explore",
    primaryTo: "/explore/portraits",
    secondaryLabel: "Book Now",
    secondaryTo: "/book?category=portraits",
    theme: "light",
    layout: "stacked",
    image: "/images/tiles/tile-portraits.jpg",
    alt: "Fine-art editorial studio portrait",
  },
  {
    id: "couples",
    title: "Couples.",
    tagline: "Stories of Two.",
    primaryLabel: "Explore",
    primaryTo: "/explore/couples",
    secondaryLabel: "Book Now",
    secondaryTo: "/book?category=couples",
    theme: "light",
    layout: "stacked",
    image: "/images/tiles/tile-couples.jpg",
    alt: "Intimate golden-hour couple portrait",
  },
  {
    id: "events",
    title: "Events.",
    tagline: "Moments. People. Celebrations.",
    primaryLabel: "Explore",
    primaryTo: "/explore/events",
    secondaryLabel: "Book Now",
    secondaryTo: "/book?category=events",
    theme: "dark",
    layout: "stacked",
    image: "/images/tiles/tile-events.jpg",
    alt: "Warmly lit celebration pavilion",
  },
  {
    id: "brands",
    title: "Brands.",
    tagline: "Visuals for Modern Brands.",
    primaryLabel: "Explore",
    primaryTo: "/explore/brands",
    secondaryLabel: "Book Now",
    secondaryTo: "/book?category=brands",
    theme: "dark",
    layout: "stacked",
    image: "/images/tiles/tile-brands.jpg",
    alt: "Luxury fragrance product photographed in studio light",
  },
  {
    id: "commercial",
    title: "Commercial.",
    tagline: "Spaces, Form & Architecture.",
    primaryLabel: "Explore",
    primaryTo: "/explore/commercial",
    secondaryLabel: "Book Now",
    secondaryTo: "/book?category=commercial",
    theme: "light",
    layout: "split",
    image: "/images/tiles/tile-commercial.jpg",
    alt: "Modern glass-and-concrete architecture",
  },
  {
    id: "editorial",
    title: "Editorial.",
    tagline: "Fashion, Monographs & Narrative.",
    primaryLabel: "Explore",
    primaryTo: "/explore/editorial",
    secondaryLabel: "Book Now",
    secondaryTo: "/book?category=editorial",
    theme: "light",
    layout: "split",
    image: "/images/tiles/tile-editorial.jpg",
    alt: "High-fashion editorial portrait",
  },
];

export const defaultLiveCmsStories = Object.values(EDITORIAL_STORIES);

export const defaultLiveCmsJourneys = {
  headline: "Journeys & Commissions.",
  subtitle:
    "Bespoke photography and motion experiences designed around unhurried presence.",
  pageTitle: "Journeys.",
  pageIntro: "Portraits, celebrations, places and ideas — photographed with care.",
  heroImage: "/images/hero-villa-wide.webp",
  heroImageMobile: "/images/hero-villa-mobile.webp",
  heroAlt: "A sunlit architectural space waiting for a story",
  closingTitle: "Let’s make something meaningful.",
  closingBody: "Tell us what you have in mind. We’ll take it from there.",
  closingCtaLabel: "Start a conversation",
  closingCtaLink: "/book",
  chapters: [
    { id: "portraits", category: "Portraits", title: "Portraits, at your pace.", copy: "A considered portrait session, shaped around who you are and how you want to be seen.", image: "/images/editorial/mira-studio-lead.jpg", alt: "A portrait subject resting in warm afternoon window light", imagePosition: "center 42%", bookingCategory: "Portraits" },
    { id: "couples", category: "Couples", title: "A story made together.", copy: "Honest photographs of the small gestures, shared rituals and moments that feel like you.", image: "/images/tiles/tile-couples.jpg", alt: "A couple together in the last light of the day", imagePosition: "center 48%", bookingCategory: "Couples" },
    { id: "destinations", category: "Destination Stories", title: "Somewhere worth remembering.", copy: "A thoughtful record of the people, place and feeling that bring a gathering to life.", image: "/images/hero-villa-wide.jpg", alt: "A quiet architectural space in warm evening light", imagePosition: "center 55%", bookingCategory: "Events" },
    { id: "creative-projects", category: "Creative Projects", title: "Ideas, made visible.", copy: "Photography and motion for brands, editorials and projects with a clear point of view.", image: "/images/tiles/tile-editorial.jpg", alt: "An editorial portrait shaped by shadow and soft natural light", imagePosition: "center 40%", bookingCategory: "Editorial" },
  ],
  packages: [
    {
      id: "j01",
      title: "The Monograph Portrait",
      category: "Portraits",
      price: "₹75,000",
      timeline: "2–3 Weeks",
      deliverables:
        "Full afternoon daylight session, 20 hand-retouched master plates, 3 archival cotton rag prints, private digital gallery.",
      image: "/images/editorial/mira-studio-lead.jpg",
    },
    {
      id: "j02",
      title: "Intimate Unions & Couples",
      category: "Couples",
      price: "₹1,85,000",
      timeline: "4–6 Weeks",
      deliverables:
        "Pre-wedding monograph, 2-day discreet observation, custom hand-bound linen heirloom book, master digital archives.",
      image: "/images/tiles/tile-couples.jpg",
    },
    {
      id: "j03",
      title: "Editorial & Fashion Campaigns",
      category: "Editorial",
      price: "₹2,50,000",
      timeline: "3–4 Weeks",
      deliverables:
        "Creative direction, full production team, 35mm & 120mm film archives, 4K motion vignettes, commercial licensing.",
      image: "/images/tiles/tile-editorial.jpg",
    },
    {
      id: "j04",
      title: "Brand Atmospheres & Still-Life",
      category: "Brands",
      price: "₹1,50,000",
      timeline: "2–3 Weeks",
      deliverables:
        "Artisan lighting, material tactile studies, full digital license suite, colour-graded social reels.",
      image: "/images/tiles/tile-brands.jpg",
    },
  ],
};

export const defaultLiveCmsPages = {
  stories: {
    eyebrow: "Visual Monographs & Field Notes",
    headline: "Stories Framed in Light.",
    intro: "A continuous journal of editorial portraiture, natural light observations, and unhurried human encounters.",
    seoTitle: "Stories & Field Notes — Phantom Labs",
    seoDescription: "Visual monographs, field notes and photographic stories from Phantom Labs.",
  },
  booking: {
    confirmationTitle: "Project Brief Received.",
    confirmationIntro: "Thank you for sharing your idea. We’ll review your brief and be in touch soon.",
    seoTitle: "Book a Session",
    seoDescription: "Share your project brief with Phantom Labs and start planning a photography commission.",
    steps: [
      { id: 1, label: "Project Brief", eyebrow: "Step 01 / Creative Vision", title: "The Project Brief", description: "Tell us what matters most to your" },
      { id: 2, label: "Schedule", eyebrow: "Step 02 / Schedule & Logistics", title: "Timeline, Setting & Production", description: "Let us know when and where you would like this production to take place." },
      { id: 3, label: "References", eyebrow: "Step 03 / Visual Direction", title: "Inspiration & References", description: "Share any moodboards or files that capture the atmosphere you envision." },
      { id: 4, label: "Contact", eyebrow: "Step 04 / Communication", title: "How Should We Reach You?", description: "Share your preferred contact method and consultation availability." },
      { id: 5, label: "Review", eyebrow: "Step 05 / Final Review", title: "Review Project Brief", description: "Confirm your creative brief before sending. You can edit any section by clicking the Edit link." },
    ],
    confirmationTimeline: [
      { step: "Step 01 / Studio Review", title: "Artistic Evaluation", desc: "We review your brief, aesthetic direction, and scheduling within 24–48 hours." },
      { step: "Step 02 / Consultation", title: "Tailored Proposal", desc: "We connect via {channel} with creative notes, date windows, and pricing scope." },
      { step: "Step 03 / Alignment", title: "No Upfront Commitment", desc: "Final shot lists, locations, and fees are agreed upon together before any deposit is made." },
    ],
  },
  studio: { seoTitle: "The Studio & Philosophy — Phantom Labs", seoDescription: "Meet the people, approach and spaces behind Phantom Labs." },
  journeys: { seoTitle: "Journeys — Phantom Labs", seoDescription: "Explore portrait, couple, destination and creative photography journeys." },
  seo: {
    title: "Phantom Labs — Creative Production Studio",
    description: "Fine art portraits, editorial campaigns, and bespoke creative production.",
  },
};

export const defaultLiveCmsNavigation = [
  { label: "Home", to: "/" },
  { label: "Stories", to: "/stories" },
  { label: "Journeys", to: "/journeys" },
  { label: "The Studio", to: "/studio" },
  { label: "Contact", to: "/contact" },
];

export const defaultLiveCmsWebsiteExperience = {
  seoTitle: "Website Experience — PHANTOM LABS",
  seoDescription: "An interactive look inside a bespoke digital experience by Phantom Labs.",
  heroLabel: "WEBSITE EXPERIENCE",
  heroHeadlineFirst: "Websites that",
  heroHeadlineSecond: "feel different.",
  heroSubtitle: "We design and develop digital experiences that turn ideas into something extraordinary.",
  storyKicker: "03 / DESIGN STORY",
  storyTitle: "Designed with restraint. Built to hold attention.",
  storyBody: "Every proportion, margin, and light cue is calibrated so the product commands the room — never visual noise.",
  filmKicker: "04 / THE PROCESS",
  filmStages: [
    { num: "1.", title: "Discovery", caption: "Brand research & visual goals" },
    { num: "2.", title: "Strategy", caption: "Narrative structure & conversion path" },
    { num: "3.", title: "UI/UX Architecture", caption: "Grid systems & user flow clarity" },
    { num: "4.", title: "Visual Design", caption: "Typography, lighting & restraint" },
    { num: "5.", title: "Development", caption: "Motion, performance & clean code" },
    { num: "6.", title: "Testing & Launch", caption: "Cross-browser QA & live release" },
  ],
  mobileStoryTitle: "Designed with restraint. Built to hold attention.",
  mobileStoryBody: "Tap any stage below to inspect how the architecture inside the MacBook screen evolves from discovery to production release.",
  finalKicker: "05 / FINAL REVEAL",
  finalCaption: "Precision crafted from concept to live viewport.",
  scrollLabel: "SCROLL TO EXPLORE",
  visionKicker: "THE VISION",
  visionTitle: "More than a website.",
  visionBody: "We don’t just build websites. We create digital experiences that communicate identity, evoke emotion, and make brands unforgettable.",
  visionImage: "/images/hero-villa-wide.jpg",
  visionImageWebp: "/images/hero-villa-wide.webp",
  visionImageAlt: "Architectural glass villa glowing at twilight overlooking misty mountains",
  processKicker: "METHODOLOGY",
  processTitle: "Our Creative Process",
  processTimeline: [
    { step: "01", name: "DISCOVER", desc: "Understanding the brand, audience, goals and vision." },
    { step: "02", name: "DEFINE", desc: "Creating the creative direction and digital strategy." },
    { step: "03", name: "DESIGN", desc: "Crafting intuitive interfaces and distinctive visual identities." },
    { step: "04", name: "DEVELOP", desc: "Transforming designs into responsive, high-performance experiences." },
    { step: "05", name: "DELIVER", desc: "Testing, refining and launching the final experience." },
  ],
  insideKicker: "ANATOMY OF THE EXPERIENCE",
  insideTitle: "Inside the Website",
  insideIntro: "Select any layer below to open its enlarged interactive inspection view.",
  modules: [
    { id: "homepage", index: "01", title: "Homepage", tag: "FULL-BLEED ENTRY", summary: "A full-viewport architectural composition with typography placed in natural negative space.", specs: ["100dvh Stage", "Cover Focal Positioning", "Subtle Gradient Scrim"], image: "/images/hero-villa-wide.webp" },
    { id: "navigation", index: "02", title: "Navigation", tag: "RESTRAINED CHROME", summary: "A calm navigation bar with clear destinations and adaptive contrast.", specs: ["Single-row Navigation", "Adaptive Contrast", "Keyboard Accessible"] },
    { id: "typography", index: "03", title: "Typography", tag: "EDITORIAL HIERARCHY", summary: "A clear type system with fluid sizing across desktop and mobile.", specs: ["Fluid Type Scale", "Editorial Hierarchy", "Accessible Contrast"] },
    { id: "ui-components", index: "04", title: "UI Components", tag: "MODULAR SYSTEM", summary: "Simple controls and native dialogs designed for pointer and touch.", specs: ["Native Dialogs", "Quiet Borders", "Touch-safe Targets"] },
    { id: "mobile-experience", index: "05", title: "Mobile Experience", tag: "ADAPTIVE VIEWPORT", summary: "Purpose-cropped imagery and responsive layouts for smaller screens.", specs: ["Portrait Art Direction", "No Horizontal Overflow", "Native Scrolling"], image: "/images/hero-villa-mobile.webp" },
    { id: "animations", index: "06", title: "Animations & Interactions", tag: "COMPOSITOR PHYSICS", summary: "Subtle transitions that respect reduced-motion preferences.", specs: ["Opacity and Transform", "Smooth Transitions", "Reduced Motion Support"] },
  ],
  technologyKicker: "TECHNOLOGY",
  technologyTitle: "Engineered for quiet speed.",
  technology: [
    { name: "React", role: "Component Architecture", detail: "A modular interface built for clarity and future growth." },
    { name: "Vite", role: "Build Engine", detail: "A fast development and production build workflow." },
    { name: "GSAP & ScrollTrigger", role: "Scroll Choreography", detail: "Carefully paced scroll interactions." },
    { name: "Lenis", role: "Smooth Inertia", detail: "Consistent, natural-feeling page movement." },
    { name: "Framer Motion", role: "Surface Transitions", detail: "Coordinated page and interface transitions." },
    { name: "Modern CSS", role: "Optical Rendering", detail: "Responsive layouts and fluid type." },
    { name: "Supabase", role: "Studio Backend", detail: "A managed data layer for studio operations." },
  ],
  ctaTitle: "Let’s create something unforgettable.",
  ctaSubtitle: "Your next digital experience starts with an idea.",
  ctaLabel: "Start a Conversation",
  ctaLink: "/contact",
  backLabel: "Return to PHANTOM LABS",
};

export const defaultLiveCmsFooter = {
  tagline: "Visual stories, framed differently.",
  address: "Bangalore, India · Worldwide Inquiries",
  email: "studio@phantomlabs.in",
  phone: "+91 (0) 80 4920 1800",
  instagram: "https://instagram.com/phantomlabs.in",
  linkedin: "https://linkedin.com",
  copyright: "© 2026 Phantom Labs Studio. All rights reserved.",
  links: defaultLiveCmsNavigation,
};

export const defaultLiveCmsBranding = {
  logoLight: "/images/phantom-labs-logo.png",
  logoDark: "/images/phantom-labs-logo-white.png",
  logoAlt: "PHANTOM LABS",
  headerCtaLabel: "Start a Conversation",
  headerCtaLink: "/contact",
};

export const defaultLiveCmsStudio = {
  headline: "The Studio.",
  subtitle:
    "A sanctuary for deliberate photography, medium format discipline, and unhurried observation.",
  leadImage: "/images/editorial/mira-studio-lead.jpg",
  philosophy:
    "We believe photography is not the act of taking, but of receiving. In an era dominated by hyper-acceleration and instant gratification, Phantom Labs was founded on the radical premise of slowing down. We eliminate rigid shot lists, manufactured poses, and synthetic studio lighting in pursuit of natural illumination and emotional truth.",
  principles: [
    {
      number: "01",
      title: "Available Light",
      desc: "We work exclusively with sunlight, atmospheric falloff, and natural shadows. Light dictates our pacing.",
    },
    {
      number: "02",
      title: "Medium Format Rigor",
      desc: "Every exposure is treated as an archival artifact with mechanical precision, tactile depth, and tonal gradation.",
    },
    {
      number: "03",
      title: "The Unscripted Frame",
      desc: "The most arresting image is almost always the one that arrives in the margins — between the poses, when performance ceases.",
    },
  ],
  spaces: [
    {
      title: "Daylight Loft Studio",
      image: "/images/hero-villa-wide.jpg",
      caption: "North-facing daylight loft with concrete sills and 14-foot steel frames.",
    },
    {
      title: "Archival Print Room",
      image: "/images/dashboard-mountains.png",
      caption: "Archival 100% cotton rag pigment printing and negative vault.",
    },
  ],
  founder: {
    name: "Goutham Palivela",
    role: "Founder & Principal Photographer",
    portrait: "/images/admin-avatar.png",
    bio: "Goutham founded Phantom Labs as a creative counterweight to commercial noise. Working across natural light, large studio windows, and architectural minimalism, his commissions honor silence, presence, and editorial restraint.",
    quote:
      "If you wait long enough with someone in a quiet room, their real face will always show up.",
  },
  ctaTitle: "Start a Conversation.",
  ctaBody: "We take a limited number of commissions each quarter.",
  ctaLabel: "Inquire for Commissions",
  ctaLink: "/book",
};

export function withLiveCmsDefaults(cms = {}) {
  const journeys = cms.journeys || {};
  const studio = cms.studio || {};

  return {
    ...cms,
    categories:
      Array.isArray(cms.categories) && cms.categories.length
        ? cms.categories
        : defaultLiveCmsCategories,
    stories:
      Array.isArray(cms.stories) && cms.stories.length
        ? cms.stories
        : defaultLiveCmsStories,
    journeys: {
      ...defaultLiveCmsJourneys,
      ...journeys,
      packages:
        Array.isArray(journeys.packages) && journeys.packages.length
          ? journeys.packages
          : defaultLiveCmsJourneys.packages,
      chapters:
        Array.isArray(journeys.chapters) && journeys.chapters.length
          ? journeys.chapters
          : defaultLiveCmsJourneys.chapters,
    },
    booking: {
      categories: { ...CATEGORIES_CONFIG, ...(cms.booking?.categories || {}) },
    },
    pages: {
      ...defaultLiveCmsPages,
      ...(cms.pages || {}),
      stories: { ...defaultLiveCmsPages.stories, ...(cms.pages?.stories || {}) },
      booking: { ...defaultLiveCmsPages.booking, ...(cms.pages?.booking || {}) },
      studio: { ...defaultLiveCmsPages.studio, ...(cms.pages?.studio || {}) },
      journeys: { ...defaultLiveCmsPages.journeys, ...(cms.pages?.journeys || {}) },
      seo: { ...defaultLiveCmsPages.seo, ...(cms.pages?.seo || {}) },
    },
    websiteExperience: { ...defaultLiveCmsWebsiteExperience, ...(cms.websiteExperience || {}) },
    navigation: Array.isArray(cms.navigation) && cms.navigation.length ? cms.navigation : defaultLiveCmsNavigation,
    branding: { ...defaultLiveCmsBranding, ...(cms.branding || {}) },
    footer: { ...defaultLiveCmsFooter, ...(cms.footer || {}), links: cms.footer?.links || defaultLiveCmsFooter.links },
    studio: {
      ...defaultLiveCmsStudio,
      ...studio,
      principles:
        Array.isArray(studio.principles) && studio.principles.length
          ? studio.principles
          : defaultLiveCmsStudio.principles,
      spaces:
        Array.isArray(studio.spaces) && studio.spaces.length
          ? studio.spaces
          : defaultLiveCmsStudio.spaces,
      founder: { ...defaultLiveCmsStudio.founder, ...studio.founder },
    },
  };
}
