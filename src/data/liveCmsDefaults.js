// Public homepage content used when the live CMS is unavailable or has not yet
// been configured in a production environment.
import { EDITORIAL_STORIES } from "./editorialStories.js";

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
    },
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
