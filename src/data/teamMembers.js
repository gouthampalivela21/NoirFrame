/**
 * Phantom Labs — The Collective (Centralized Team Data Architecture)
 * 
 * Two-level grouped team structure:
 * Level 1: Main Our Team page (/team) displays department headings and team portraits only.
 * Level 2: Grouped Department Profile Pages (/team/:slug) display the complete profiles of all
 *          members in that department arranged vertically.
 * 
 * Five Dedicated Studio Departments in exact order:
 * 01: THE FOUNDERS — "Two perspectives. One vision." (Goutham & Harshith)
 * 02: CLIENT MANAGEMENT — "Every story begins with understanding." (Ravi Teja & Harsha JD)
 * 03: UX & DESIGN — "Designed with intention. Built around the experience." (Harshith & Dhanush)
 * 04: PHOTOGRAPHY & CINEMATOGRAPHY — "Stories told through light, movement, and perspective." (Ganesh & Darshan DJ)
 * 05: EDITING & POST-PRODUCTION — "Every frame finds its final form." (Goutham)
 */

export const teamDepartments = [
  {
    id: "founders",
    slug: "founders",
    index: "01",
    counter: "01 / 05",
    navLabel: "01 Founders",
    label: "01 — THE FOUNDERS",
    heading: ["FOUNDERS"],
    watermark: "FOUNDERS",
    title: "The Founders",
    supportingLine: "Two perspectives. One vision.",
    category: "Leadership",
    description: "Driving the creative direction and vision behind Phantom Labs, with a shared passion for visual storytelling.",
    members: [
      {
        id: "goutham-founder",
        slug: "goutham",
        name: "Goutham",
        role: "Founder",
        departmentRole: "Founder",
        portrait:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85",
        portraitAlt: "Phantom Labs Founder — Goutham",
        quote:
          "One vision. A commitment to creating images that stay with you long after the moment has passed.",
        shortIntro:
          "Establishing the artistic foundation and aesthetic ethos of Phantom Labs. Leading the studio with unhurried observation, architectural restraint, and an uncompromising dedication to visual permanence.",
        introduction:
          "Founder of Phantom Labs, establishing the artistic foundation and aesthetic ethos of the studio. Leading with unhurried observation, architectural restraint, and an uncompromising dedication to visual permanence. Goutham directs the overarching creative philosophy, ensuring every still image and motion release honors our commitment to timeless storytelling.",
        responsibilities: [
          {
            title: "STUDIO VISION & DIRECTION",
            description: "Directing the creative philosophy, aesthetic foundation, and visual identity of Phantom Labs.",
          },
          {
            title: "ARTISTIC INTEGRITY",
            description: "Guiding high-stakes commissions with uncompromising aesthetic standards and quiet elegance.",
          },
          {
            title: "CURATION & MENTORSHIP",
            description: "Fostering a culture of unhurried observation and craft excellence across all studio disciplines.",
          },
        ],
        socialLinks: {
          instagram: "https://instagram.com/phantomlabs.in",
          instagramHandle: "@phantomlabs.in",
        },
      },
      {
        id: "harshith-founder",
        slug: "harshith",
        name: "Harshith",
        role: "Co-Founder",
        departmentRole: "Co-Founder",
        portrait:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85",
        portraitAlt: "Phantom Labs Co-Founder — Harshith",
        quote:
          "Design is the quiet vessel that gives imagery space to speak.",
        shortIntro:
          "Guiding the creative direction and digital craft of Phantom Labs, harmonizing visual narrative with intentional user experience across every studio touchpoint.",
        introduction:
          "Co-Founder of Phantom Labs, shaping the studio’s design direction and digital architecture. Working in close partnership with Goutham, Harshith co-directs strategic studio operations while ensuring every digital and physical touchpoint reflects the tactile permanence and aesthetic restraint of a fine-art monograph.",
        responsibilities: [
          {
            title: "STUDIO CO-LEADERSHIP",
            description: "Co-directing studio operations, strategic creative concepts, and long-term brand evolution.",
          },
          {
            title: "DIGITAL ARCHITECTURE",
            description: "Shaping the studio's digital gallery presence and interactive storytelling frameworks.",
          },
          {
            title: "VISUAL CONSISTENCY",
            description: "Enforcing typographic rigor, balanced grid systems, and cohesive aesthetic execution across all touchpoints.",
          },
        ],
        socialLinks: {
          instagram: "https://instagram.com/phantomlabs.in",
          instagramHandle: "@phantomlabs.in",
        },
      },
    ],
  },
  {
    id: "client-management",
    slug: "client-management",
    index: "02",
    counter: "02 / 05",
    navLabel: "02 Client Management",
    label: "02 — CLIENT MANAGEMENT",
    heading: ["CLIENT MANAGEMENT"],
    watermark: "CLIENT MANAGEMENT",
    title: "Client Management",
    supportingLine: "Every story begins with understanding.",
    category: "Client Management & Handling",
    description: "Building connections, understanding visions, and ensuring a seamless client experience.",
    members: [
      {
        id: "ravi-teja-client",
        slug: "ravi-teja",
        name: "Ravi Teja",
        role: "Client Communication & Coordination",
        departmentRole: "Client Communication & Coordination",
        portrait:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=85",
        portraitAlt: "Phantom Labs Client Management — Ravi Teja",
        quote:
          "True service is invisible, creating effortless space for artistry to happen.",
        shortIntro:
          "Managing client communication and coordination, understanding unique requirements, and maintaining clear, respectful dialogue with patrons.",
        introduction:
          "Leading client relations and project coordination at Phantom Labs. Ravi ensures that every patron feels heard, understood, and supported through clear, transparent, and discreet communication from initial inquiry to final delivery.",
        responsibilities: [
          {
            title: "CLIENT COMMUNICATION & COORDINATION",
            description: "Maintaining clear, respectful, and transparent communication throughout each commission.",
          },
          {
            title: "UNDERSTANDING REQUIREMENTS",
            description: "Listening deeply to patron desires, creative briefs, and project scope.",
          },
          {
            title: "CREATIVE TEAM LIAISON",
            description: "Coordinating with photographers and editors to ensure flawless production timelines.",
          },
        ],
        socialLinks: {
          instagram: "https://instagram.com/phantomlabs.in",
          instagramHandle: "@phantomlabs.in",
        },
      },
      {
        id: "harsha-jd-client",
        slug: "harsha-jd",
        name: "Harsha JD",
        role: "Client Operations & Project Management",
        departmentRole: "Client Operations & Project Management",
        portrait:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=85",
        portraitAlt: "Phantom Labs Client Management — Harsha JD",
        quote:
          "Every seamless experience is built on unyielding attention to detail.",
        shortIntro:
          "Managing inquiries, production milestones, and client expectations to maintain an unhurried, luxury experience from start to finish.",
        introduction:
          "Specializing in production logistics and client experience at Phantom Labs. Harsha bridges patron visions with studio capabilities, managing inquiries, timelines, and delivery milestones to guarantee a calm, dependable creative journey.",
        responsibilities: [
          {
            title: "INQUIRY & BRIEF MANAGEMENT",
            description: "Managing patron inquiries, project expectations, and synthesizing detailed creative briefs.",
          },
          {
            title: "PRODUCTION COORDINATION",
            description: "Managing commission schedules, location permits, and team coordination.",
          },
          {
            title: "DELIVERY & EXPERIENCE",
            description: "Maintaining a smooth, attentive client experience from initial consultation to archival delivery.",
          },
        ],
        socialLinks: {
          instagram: "https://instagram.com/phantomlabs.in",
          instagramHandle: "@phantomlabs.in",
        },
      },
    ],
  },
  {
    id: "ux-design",
    slug: "ux-design",
    index: "03",
    counter: "03 / 05",
    navLabel: "03 UX & Design",
    label: "03 — UX & DESIGN",
    heading: ["UX & DESIGN"],
    watermark: "UX & DESIGN",
    title: "UX & Design",
    supportingLine: "Designed with intention. Built around the experience.",
    category: "UX & Design",
    description: "Creating intuitive and visually compelling experiences across every project.",
    members: [
      {
        id: "harshith-design",
        slug: "harshith",
        name: "Harshith",
        role: "UX & Design",
        departmentRole: "UX & Design",
        portrait:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85",
        portraitAlt: "Phantom Labs UX & Design Direction — Harshith",
        quote:
          "Design is the quiet vessel that gives imagery space to speak.",
        shortIntro:
          "Guiding user experience and creative concepts, shaping layouts, visual composition, and aesthetic consistency across all digital platforms.",
        introduction:
          "Directing UX and visual design systems at Phantom Labs. Passionate about minimalist interfaces, thoughtful visual hierarchies, and calm contemplation, Harshith ensures every digital touchpoint reflects the tactile permanence and aesthetic restraint of a fine-art monograph.",
        responsibilities: [
          {
            title: "UX & DESIGN DIRECTION",
            description: "Directing intuitive, distraction-free digital gallery experiences and interactive narratives.",
          },
          {
            title: "LAYOUT & COMPOSITION",
            description: "Developing responsive grid systems, editorial layouts, and typographic hierarchies.",
          },
          {
            title: "AESTHETIC INTEGRITY",
            description: "Ensuring brand consistency, calm interaction models, and seamless responsive design across all devices.",
          },
        ],
        socialLinks: {
          instagram: "https://instagram.com/phantomlabs.in",
          instagramHandle: "@phantomlabs.in",
        },
      },
      {
        id: "dhanush-design",
        slug: "dhanush",
        name: "Dhanush",
        role: "UI/UX & Visual Designer",
        departmentRole: "UI/UX & Visual Designer",
        portrait:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=85",
        portraitAlt: "Phantom Labs UX & Design — Dhanush",
        quote:
          "Structure and whitespace are what turn a collection of images into a story.",
        shortIntro:
          "Developing user experience layouts, visual composition, and responsive design systems built entirely around intentional storytelling.",
        introduction:
          "Dedicated to visual composition, digital craft, and user experience at Phantom Labs. Dhanush translates creative concepts into fluid layouts, ensuring digital presentations honor the depth, stillness, and architectural balance of our imagery.",
        responsibilities: [
          {
            title: "USER EXPERIENCE & VISUAL DESIGN",
            description: "Designing intuitive, distraction-free digital gallery experiences and interactive layouts.",
          },
          {
            title: "LAYOUT & VISUAL COMPOSITION",
            description: "Developing responsive grid systems, editorial compositions, and presentation decks.",
          },
          {
            title: "VISUAL CONSISTENCY",
            description: "Maintaining cohesive typographic hierarchy, aesthetic restraint, and brand consistency.",
          },
        ],
        socialLinks: {
          instagram: "https://instagram.com/phantomlabs.in",
          instagramHandle: "@phantomlabs.in",
        },
      },
    ],
  },
  {
    id: "photography-cinematography",
    slug: "photography-cinematography",
    index: "04",
    counter: "04 / 05",
    navLabel: "04 Photography & Cinematography",
    label: "04 — PHOTOGRAPHY & CINEMATOGRAPHY",
    heading: ["PHOTOGRAPHY & CINEMATOGRAPHY"],
    watermark: "PHOTOGRAPHY & CINEMATOGRAPHY",
    title: "Photography & Cinematography",
    supportingLine: "Stories told through light, movement, and perspective.",
    category: "Photography & Cinematography",
    description: "Capturing emotion, atmosphere, and detail through photography and cinematography.",
    members: [
      {
        id: "ganesh-photo",
        slug: "ganesh",
        name: "Ganesh",
        role: "Photography & Visual Storytelling",
        departmentRole: "Photography & Visual Storytelling",
        portrait:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=85",
        portraitAlt: "Phantom Labs Photography — Ganesh",
        quote:
          "The most powerful photographs are found in the seconds between poses.",
        shortIntro:
          "Capturing unscripted human emotion, natural light, and architectural geometry through still photography and cinematic visual storytelling.",
        introduction:
          "Principal photographer and visual storyteller at Phantom Labs. Ganesh specializes in capturing honest, unforced moments shaped by natural directional light and deep shadow, immortalizing the atmosphere, emotion, and intimate nuances of each commission.",
        responsibilities: [
          {
            title: "PHOTOGRAPHY & STILLS",
            description: "Documenting commissions with medium-format precision, natural raking light, and candid truth.",
          },
          {
            title: "VISUAL STORYTELLING",
            description: "Pacing image collections that evoke lasting emotion and authentic narrative resonance.",
          },
          {
            title: "ATMOSPHERE & DETAILS",
            description: "Capturing the environment, emotional cadence, and delicate architectural details of every setting.",
          },
        ],
        socialLinks: {
          instagram: "https://instagram.com/phantomlabs.in",
          instagramHandle: "@phantomlabs.in",
        },
      },
      {
        id: "darshan-dj-cinema",
        slug: "darshan-dj",
        name: "Darshan DJ",
        role: "Cinematography & Camera Direction",
        departmentRole: "Cinematography & Camera Direction",
        portrait:
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=85",
        portraitAlt: "Phantom Labs Cinematography — Darshan DJ",
        quote:
          "Movement in film should feel like breathing — unhurried, natural, and profound.",
        shortIntro:
          "Directing camera operation, shot composition, and visual movement to capture the atmospheric poetry, emotion, and rhythm of every project.",
        introduction:
          "Leading cinematography and camera direction at Phantom Labs. Darshan translates emotion into movement, crafting short-form cinematic films that accompany still monographs with analog warmth, geometric framing, and deliberate pacing.",
        responsibilities: [
          {
            title: "CINEMATOGRAPHY & MOTION",
            description: "Directing cinematic motion, camera movement, and visual storytelling for moving image collections.",
          },
          {
            title: "CAMERA OPERATION & COMPOSITION",
            description: "Mastering camera operation, lens choices, and shot composition with deliberate precision.",
          },
          {
            title: "LIGHTING & PERSPECTIVE",
            description: "Sculpting directional light and shadow to capture the true atmosphere and emotional weight of each scene.",
          },
        ],
        socialLinks: {
          instagram: "https://instagram.com/phantomlabs.in",
          instagramHandle: "@phantomlabs.in",
        },
      },
    ],
  },
  {
    id: "editing-post-production",
    slug: "editing-post-production",
    index: "05",
    counter: "05 / 05",
    navLabel: "05 Editing & Post-Production",
    label: "05 — EDITING & POST-PRODUCTION",
    heading: ["EDITING"],
    watermark: "EDITING",
    title: "Editing & Post-Production",
    supportingLine: "Every frame finds its final form.",
    category: "Editing & Post-Production",
    description: "Bringing stories to life through editing, colour grading, and visual refinement.",
    members: [
      {
        id: "goutham-editing",
        slug: "goutham",
        name: "Goutham",
        role: "Editing & Post-Production",
        departmentRole: "Editing & Post-Production",
        portrait:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85",
        portraitAlt: "Phantom Labs Post-Production — Goutham",
        quote:
          "Every frame finds its final form in the space between the cuts.",
        shortIntro:
          "Directing video editing, visual storytelling, colour grading, and final image and video refinement to ensure consistent excellence in the final visual output.",
        introduction:
          "Directing editing and post-production at Phantom Labs. Personally mastering video pacing, color timing, and visual continuity across commissions. Goutham treats post-production not merely as technical assembly, but as an essential finishing craft where every cut, tonal curve, and grain structure is tuned to evoke lasting emotional permanence.",
        responsibilities: [
          {
            title: "VIDEO EDITING & STORYTELLING",
            description: "Pacing cinematic sequences with intentional rhythm to evoke raw emotional resonance.",
          },
          {
            title: "BESPOKE COLOUR GRADING",
            description: "Bespoke analog film color timing and meticulous refinement across every release.",
          },
          {
            title: "ARCHIVAL FINISHING",
            description: "Final image and video mastering, ensuring enduring museum-grade quality across deliverables.",
          },
        ],
        socialLinks: {
          instagram: "https://instagram.com/phantomlabs.in",
          instagramHandle: "@phantomlabs.in",
        },
      },
    ],
  },
];

// Alias teamSections for the main page
export const teamSections = teamDepartments;

// Flat array of unique team profiles for reference
export const uniqueTeamProfiles = [
  teamDepartments[0].members[0], // Goutham
  teamDepartments[0].members[1], // Harshith
  teamDepartments[1].members[0], // Ravi Teja
  teamDepartments[1].members[1], // Harsha JD
  teamDepartments[2].members[1], // Dhanush
  teamDepartments[3].members[0], // Ganesh
  teamDepartments[3].members[1], // Darshan DJ
];

export const teamMembers = uniqueTeamProfiles;

/**
 * Resolves a department by slug or ID, including support for legacy member slugs
 */
export function getTeamDepartmentBySlug(slug) {
  if (!slug) return null;
  const normalized = slug.toLowerCase();

  const aliasMap = {
    // Founders aliases
    "the-founders": "founders",
    "founder": "founders",
    "co-founder": "founders",
    "goutham": "founders",
    "harshith": "founders",
    "member-one": "founders",
    // Client Management aliases
    "client-management": "client-management",
    "ravi-teja": "client-management",
    "harsha-jd": "client-management",
    "client-director": "client-management",
    "content-director": "client-management",
    "client-production": "client-management",
    "member-four": "client-management",
    "member-five": "client-management",
    // UX & Design aliases
    "ux-design": "ux-design",
    "design": "ux-design",
    "website-design": "ux-design",
    "dhanush": "ux-design",
    "lead-designer": "ux-design",
    "creative-developer": "ux-design",
    "member-two": "ux-design",
    // Photography & Cinematography aliases
    "photography-cinematography": "photography-cinematography",
    "photo-cinema": "photography-cinematography",
    "ganesh": "photography-cinematography",
    "darshan-dj": "photography-cinematography",
    "cinematographer": "photography-cinematography",
    "creative-strategist": "photography-cinematography",
    "member-three": "photography-cinematography",
    "member-six": "photography-cinematography",
    // Editing & Post-Production aliases
    "editing": "editing-post-production",
    "post-production": "editing-post-production",
    "editing-and-post-production": "editing-post-production",
  };

  const target = aliasMap[normalized] || normalized;
  const directMatch = teamDepartments.find(
    (dept) => dept.slug.toLowerCase() === target || dept.id.toLowerCase() === target
  );
  if (directMatch) return directMatch;

  return (
    teamDepartments.find((dept) =>
      dept.members.some((m) => m.slug.toLowerCase() === normalized)
    ) || null
  );
}

/**
 * Returns previous and next departments for circular pagination on grouped pages
 */
export function getAdjacentTeamDepartments(currentSlug) {
  const dept = getTeamDepartmentBySlug(currentSlug);
  if (!dept) return { prev: null, next: null };

  const index = teamDepartments.findIndex((d) => d.id === dept.id);
  if (index === -1) return { prev: null, next: null };

  const prevIndex = (index - 1 + teamDepartments.length) % teamDepartments.length;
  const nextIndex = (index + 1) % teamDepartments.length;

  return {
    prev: teamDepartments[prevIndex],
    next: teamDepartments[nextIndex],
  };
}

/**
 * Legacy compatibility helper for individual member lookup
 */
export function getTeamMemberBySlug(slug) {
  if (!slug) return null;
  const normalized = slug.toLowerCase();
  
  const legacyMap = {
    "founder": "goutham",
    "member-one": "goutham",
    "co-founder": "harshith",
    "lead-designer": "harshith",
    "member-two": "harshith",
    "client-director": "ravi-teja",
    "member-five": "ravi-teja",
    "creative-developer": "dhanush",
    "creative-strategist": "ganesh",
    "cinematographer": "darshan-dj",
    "member-three": "darshan-dj",
    "member-six": "darshan-dj",
    "content-director": "harsha-jd",
    "member-four": "harsha-jd",
  };
  
  const target = legacyMap[normalized] || normalized;
  return uniqueTeamProfiles.find((m) => m.slug.toLowerCase() === target) || null;
}

export function getAdjacentTeamMembers(currentSlug) {
  const member = getTeamMemberBySlug(currentSlug);
  if (!member) return { prev: null, next: null };

  const index = uniqueTeamProfiles.findIndex((m) => m.slug === member.slug);
  if (index === -1) return { prev: null, next: null };

  const prevIndex = (index - 1 + uniqueTeamProfiles.length) % uniqueTeamProfiles.length;
  const nextIndex = (index + 1) % uniqueTeamProfiles.length;

  return {
    prev: uniqueTeamProfiles[prevIndex],
    next: uniqueTeamProfiles[nextIndex],
  };
}
