/**
 * Editorial Stories Data — Phantom Labs Field Notes
 * Comprehensive, long-form editorial magazine features for all 6 categories:
 * Portraits, Couples, Events, Brands, Editorial, Commercial.
 */

export const EDITORIAL_STORIES = {
  portraits: {
    id: "portraits",
    category: "Portraits",
    issueKicker: "FIELD NOTES / PORTRAITURE / NO. 04",
    backLabel: "← Portraits",
    backTo: "/#services",
    headline: "The quiet art of being seen",
    deck: "Inside a slower kind of portrait session, where the best frame arrives after the posing stops.",
    byline: "WORDS BY MAYA RAO · 12 MIN READ · OCTOBER 24, 2026",
    leadImage: {
      src: "/images/editorial/mira-studio-lead.jpg",
      alt: "Mira resting chin on hand looking thoughtfully out a warehouse window in warm studio light",
      caption: "Mira in the studio, late afternoon light.",
    },
    essaySubheadings: [
      "The Space Between Poses",
      "Unlearning the Impulse to Audition"
    ],
    openingEssay: [
      "Portraiture, for me, has never been about perfection. It’s about the moments that happen in the margins — the small shifts, the dropped guard, the look that wasn’t planned. In a world that moves fast and performs constantly, a slower session can feel like a kind of relief: space to be, rather than to present.",
      "I recently spent an afternoon with Mira, a writer and longtime friend, in a sunlit studio on the edge of the city. We kept things simple: no rigid shot list, no quick turnarounds, just time. At first, there was the usual self-consciousness — the question of what to do with your hands, where to look, how to sit.",
      "Camera culture has conditioned all of us to tense up the moment glass points our way. We tilt our chins to rehearsed angles, tighten the corners of our mouths, and summon an identity we think the viewer expects. The hardest part of any session isn’t setting the exposure or finding the focal plane; it is unlearning that collective impulse to audition.",
      "We decided before she even walked through the heavy studio door that nothing from the first hour would matter. We made coffee in ceramic mugs, watched the dust drift through the steel-frame windows, and allowed the light to dictate our pacing. When you remove the pressure of producing, looking transforms into listening.",
    ],
    subject: {
      tag: "01 / The Subject",
      name: "Mira Chenoy",
      role: "Essayist & Literary Translator",
      quote: "Most of the time when someone aims a lens at you, they want an answer. Maya wasn’t asking for an answer. She was just waiting to see what was already there.",
      bioTitle: "A Sanctuary for Quiet Rooms",
      bio: "Mira spends her days in quiet rooms, translating regional Indian poetry between Marathi and English. Her work is an exercise in restraint — weighing the resonance of a single syllable, noticing what remains unsaid in the white space of a printed page.",
      detailTitle: "On Stillness & Observation",
      detailText: "Her posture is naturally introspective — shoulders resting easily, eyes accustomed to tracking light across wooden desks. Capturing someone whose entire craft is rooted in interiority requires an approach that honors silence rather than demanding performance.",
      image: {
        src: "/images/editorial/mira-between-frames.jpg",
        alt: "Mira, turning towards the camera with soft natural window reflection",
        caption: "Mira, between frames.",
      },
    },
    moments: {
      tag: "02 / The Archive",
      title: "The Session, in Moments",
      intro: "A chronological study of an afternoon unspooling across thirty-eight deliberate exposures.",
      diptych: [
        {
          src: "/images/editorial/mira-contemplative-closeup.jpg",
          alt: "Close-up study of Mira looking thoughtfully off-camera in soft diffused golden window light",
          caption: "Frame 14: The quiet gaze, unprompted.",
        },
        {
          src: "/images/editorial/mira-window-sill.jpg",
          alt: "Three-quarters portrait of Mira seated by the concrete studio sill wrapped in a camel knit scarf",
          caption: "Frame 19: Wrapped in afternoon light by the concrete sill.",
        },
      ],
      passage1Subheading: "The Drift of Midday Light",
      passage1: "By mid-afternoon, the direct sun had moved across the south wall of the mill, casting long rectangular geometric shadows across the whitewashed floorboards. The rhythm settled. The shutter clicks became fewer, punctuated by long stretches of silence. The camera ceased being an instrument of capture and became simply an observer at the edge of the table.",
      envFigure: {
        src: "/images/editorial/studio-afternoon-light.jpg",
        alt: "Tranquil daylight photography studio with tall industrial steel casement windows and sunlight beams",
        caption: "The setting: South casement windows at 3:40 PM, where shadows turned into geometric studies across the lime-washed boards.",
      },
      passage2Subheading: "The Intersection of Fatigue & Truth",
      passage2: "There is a threshold in every portrait shoot where physical fatigue gives way to emotional clarity. The body tires of maintaining an artificial posture. The spine curves naturally into the chair. The breathing slows. It is right at this intersection that the truest portraits are born.",
    },
    behind: {
      tag: "03 / Behind the Craft",
      title: "Setting, Light & Optics",
      intro: "The creative constraints and mechanical decisions that shaped the texture of the afternoon.",
      craftCards: [
        {
          num: "Craft Note — 01",
          kicker: "THE ARCHITECTURE OF SPACE",
          title: "The Architecture of the Space",
          text: "We worked in a former textile warehouse in the eastern docklands. High timber-beamed ceilings, weathered concrete pillars, and a continuous band of industrial multi-pane sash windows facing southwest. The room breathes with natural warmth.",
        },
        {
          num: "Craft Note — 02",
          kicker: "CHASING UNMODIFIED LIGHT",
          title: "Chasing Natural, Unmodified Light",
          text: "Not a single strobe, reflector, or bounce board was unholstered. When you introduce electronic flash into an intimate session, you disrupt the circadian naturalness of the room. We treated daylight as our sole collaborator.",
        },
        {
          num: "Craft Note — 03",
          kicker: "DELIBERATE OPTICAL GEOMETRY",
          title: "Deliberate Optical Geometry",
          text: "Shot primarily on a classic 85mm prime lens wide open at f/1.8, paired with a medium format 55mm normal lens. The intention was zero perspective distortion — rendering facial planes with honesty and paper-thin depth.",
        },
        {
          num: "Craft Note — 04",
          kicker: "THE RHYTHM OF SILENCE",
          title: "Pacing & The Rhythm of Stillness",
          text: "Over four full hours, we recorded fewer than forty individual exposures. By rationing the shutter, each photograph carried intention. There was no 'burst mode' spray. Every click was preceded by an exhale.",
        },
      ],
    },
    pause: {
      quote: "When the room gets quiet, people begin to look like themselves.",
      subheadings: [
        "The Face as Autobiography",
        "The Dignity of Stillness"
      ],
      reflections: [
        "In our culture of hyper-curated identity, we are bombarded by images designed to convince. Corporate headshots project aggressive authority; social selfies radiate rehearsed joy; commercial portraits smooth away every crease of thought. But the human face is not a sales deck. It is an autobiography.",
        "When Mira looked towards the southern window, her expression was neither happy nor solemn. It was simply present. There was curiosity, fatigue from a morning of translation, and the easy comfort of someone who feels no obligation to entertain her witness.",
        "That is what I have come to value above all technical virtuosity: the dignity of stillness. When the viewer looks at these frames, they aren't looking at a model playing a part. They are meeting a sovereign person in her own quiet weather.",
      ],
    },
    final: {
      tag: "04 / The Epilogue",
      title: "The Final Frames",
      image: {
        src: "/images/editorial/mira-candid-laugh.jpg",
        alt: "Mira laughing genuinely with eyes crinkling in warm studio light",
        caption: "Frame 36: An unscripted moment as the light finally folded into dusk.",
      },
      conclusionSubheading: "What the Light Left Behind",
      conclusion: [
        "As the sun dipped behind the warehouse roofs, the gold faded into cool twilight indigo. Mira leaned against the warm sill, laughing at a memory of an old mispronounced word, completely unguarded. The camera caught the genuine crinkle at the corner of her eyes.",
        "That frame wasn’t planned in any moodboard. It happened because we were there, patient, paying attention to what the light left behind.",
        "Great portraiture doesn't manufacture magic. It simply creates the conditions where reality can safely show up.",
      ],
    },
    moreStories: [
      {
        to: "/explore/couples",
        thumb: "/images/tiles/tile-couples.jpg",
        alt: "Intimate golden-hour couple portrait",
        kicker: "Couples · Field Note 02",
        title: "Two Orbits in the Golden Hour",
        snippet: "On natural chemistry, coastal sunset light, and letting love breathe without rigid choreography.",
        meta: "10 Min Read",
      },
      {
        to: "/explore/editorial",
        thumb: "/images/tiles/tile-editorial.jpg",
        alt: "Monochrome high-fashion editorial portrait",
        kicker: "Editorial · Field Note 06",
        title: "Shadows in Tailored Form",
        snippet: "Architecture, tailored monochrome form, and the modern art of negative space.",
        meta: "11 Min Read",
      },
    ],
    ctaBanner: {
      title: "Experience a Slower Kind of Session",
      text: "Commission an intimate portrait session crafted with space, natural light, and zero performance pressure.",
      btnLabel: "Book a Portrait Session →",
      btnTo: "/book?category=portraits",
    },
    storyNav: {
      prev: {
        to: "/explore/couples",
        kicker: "← Previous Field Note",
        title: "Couples · Stories of Two",
      },
      next: {
        to: "/explore/events",
        kicker: "Next Field Note →",
        title: "Events · Moments. People. Celebrations.",
      },
      colophonMark: "PHANTOM LABS JOURNAL",
      colophonSub: "FIELD NOTES — ISSUE NO. 04",
    },
  },

  couples: {
    id: "couples",
    category: "Couples",
    issueKicker: "FIELD NOTES / COUPLES / NO. 02",
    backLabel: "← Couples",
    backTo: "/#services",
    headline: "Two orbits in the golden hour",
    deck: "On natural chemistry, coastal sunset light, and letting love breathe without rigid choreography.",
    byline: "WORDS BY MAYA RAO · 10 MIN READ · SEPTEMBER 18, 2026",
    leadImage: {
      src: "/images/tiles/tile-couples.jpg",
      alt: "Intimate golden-hour couple portrait with warm backlit sunset rim light",
      caption: "Tara and Dev at dusk, coastal ridge overlooking the western bay.",
    },
    openingEssay: [
      "Most couples arrive at a photography session braced for a performance. They have seen hundreds of choreographed wedding boards, stiff embrace angles, and forced foreheads-touching templates. The first thing we do is dismantle all of it. We take a walk.",
      "Tara and Dev met seven years ago on a ferry crossing outside Kochi. Their language with each other is understated, built from micro-gestures, dry jokes, and an unspoken shorthand. When you place a couple like that on an open ridge with the late-September sun melting into the horizon, choreographing them would be an act of vandalism.",
      "The camera’s role in relationship documentation is not to direct lovers; it is to observe how two distinct lives occupy the same atmospheric gravity. The best frames happen when they turn away from the lens to point at a seabird, or when Dev pulls Tara closer simply because the evening breeze off the water turned chilly.",
      "By removing the demand for romantic theater, we uncover the genuine cadence of two people who know each other deeply. It is quiet, warm, and utterly authentic.",
    ],
    subject: {
      tag: "01 / The Subjects",
      name: "Tara & Dev",
      role: "Architect & Environmental Researcher",
      quote: "We were dreading having photos taken because we aren't 'camera people.' But Maya just asked us about the house we were renovating and let us watch the sun go down. We forgot she was taking pictures.",
      bio: "Partners in life and collaborative design projects, Tara and Dev spend their weekends hiking coastal trails and restoring a century-old stone farmhouse. Their dynamic is rooted in companionship and mutual respect.",
      detailTitle: "On Unrehearsed Proximity",
      detailText: "Their connection reveals itself not in dramatic embraces, but in subtle synchronicity — matching strides across rocky grass, the instinctive tilt of an ear towards a whisper, the unforced ease of resting together.",
      image: {
        src: "/images/tiles/tile-couples-800.jpg",
        alt: "Tara and Dev in warm backlit rim light",
        caption: "Tara & Dev, as the last golden rays met the ridge.",
      },
    },
    moments: {
      tag: "02 / The Archive",
      title: "The Session, in Moments",
      intro: "An unhurried journey through twilight across sixty deliberate coastal exposures.",
      diptych: [
        {
          src: "/images/tiles/tile-couples.jpg",
          alt: "Close profile of gentle forehead kiss in golden sunset",
          caption: "Frame 22: The unforced touch, backlit by fading gold.",
        },
        {
          src: "/images/tiles/tile-couples-800.jpg",
          alt: "Soft smile shared between Tara and Dev in evening haze",
          caption: "Frame 31: Sharing a quiet laugh as the wind picked up.",
        },
      ],
      passage1: "As the sun touched the edge of the Arabian Sea, the light shifted from sharp gold into a diffuse, amber haze. The landscape became an impressionist canvas. We walked slowly along the headland, letting the wind carry their conversation.",
      envFigure: {
        src: "/images/hero-villa-wide.jpg",
        alt: "Golden hour sunset landscape across mountain ridge and water",
        caption: "The setting: Western coastal ridge as the golden sun dipped into the coastal mist at 6:15 PM.",
      },
      passage2: "When two people are genuinely comfortable in their skin, intimacy requires no embellishment. The light does all the heavy lifting, sculpting their profiles and turning simple proximity into timeless visual poetry.",
    },
    behind: {
      tag: "03 / Behind the Craft",
      title: "Setting, Light & Optics",
      intro: "Technical notes on working with extreme backlight and moving subjects in coastal terrain.",
      craftCards: [
        {
          num: "Craft Note — 01",
          title: "The Geography of Coastal Mist",
          text: "We selected a westward-facing limestone cliff where oceanic moisture catches the low-angle sun, creating an ethereal volumetric glow that softens high contrast naturally.",
        },
        {
          num: "Craft Note — 02",
          title: "Embracing Flare & Halation",
          text: "Shot straight into the sunset using vintage-coated prime optics to encourage warm lens flare and amber blooming without digital harshness.",
        },
        {
          num: "Craft Note — 03",
          title: "Observational Distance",
          text: "We utilized a 105mm portrait focal length from 20 paces away, giving Tara and Dev complete privacy to speak and be present without an intrusive camera presence.",
        },
        {
          num: "Craft Note — 04",
          title: "Continuous Motion Pacing",
          text: "Rather than static poses, we kept the session moving — walking, pausing, watching the tide. Movement keeps subjects out of their heads and inside the moment.",
        },
      ],
    },
    pause: {
      quote: "The true intimacy is not when two people pose for a camera, but when they forget anyone is in the room.",
      reflections: [
        "Modern wedding and couple photography is often obsessed with grandeur at the expense of honesty. Photographers fly couples to epic mountaintops only to make them freeze in identical poses.",
        "Yet when people look back at their photographs thirty years later, they do not care about the dramatic pose. They look for the way their partner used to look at them when no one else was in the room.",
        "Capturing that specific, quiet gaze is the entire purpose of our craft. It cannot be coerced or directed; it can only be received with patience and humility.",
      ],
    },
    final: {
      tag: "04 / The Epilogue",
      title: "The Final Frames",
      image: {
        src: "/images/tiles/tile-couples.jpg",
        alt: "The final silhouette of the couple walking into dusk",
        caption: "Frame 58: Walking down the headland path as twilight claimed the sky.",
      },
      conclusion: [
        "By the time the stars emerged over the headland, the camera was back in its canvas bag. Tara and Dev were sharing a thermos of ginger tea, looking out at the distant trawler lights bobbing on the water.",
        "That is how every love story session should end — not with exhaustion, but with the quiet satisfaction of having spent an evening honoring what matters.",
        "Love is not an spectacle; it is a shelter.",
      ],
    },
    moreStories: [
      {
        to: "/explore/portraits",
        thumb: "/images/editorial/mira-studio-lead.jpg",
        alt: "Studio portraiture editorial feature",
        kicker: "Portraits · Field Note 04",
        title: "The Quiet Art of Being Seen",
        snippet: "Inside a slower kind of portrait session, where the best frame arrives after the posing stops.",
        meta: "12 Min Read",
      },
      {
        to: "/explore/events",
        thumb: "/images/tiles/tile-events.jpg",
        alt: "Evening celebration pavilion",
        kicker: "Events · Field Note 03",
        title: "Where Midnight Holds Its Breath",
        snippet: "Documenting grand gatherings through ambient warmth, quiet sidelines, and atmospheric light.",
        meta: "9 Min Read",
      },
    ],
    ctaBanner: {
      title: "Document Your Story Without Clichés",
      text: "Book an unscripted, natural couple session in landscapes that feel true to who you are.",
      btnLabel: "Book a Couples Session →",
      btnTo: "/book?category=couples",
    },
    storyNav: {
      prev: {
        to: "/explore/portraits",
        kicker: "← Previous Field Note",
        title: "Portraits · The Quiet Art of Being Seen",
      },
      next: {
        to: "/explore/events",
        kicker: "Next Field Note →",
        title: "Events · Where Midnight Holds Its Breath",
      },
      colophonMark: "PHANTOM LABS JOURNAL",
      colophonSub: "FIELD NOTES — ISSUE NO. 02",
    },
  },

  events: {
    id: "events",
    category: "Events",
    issueKicker: "FIELD NOTES / EVENTS / NO. 03",
    backLabel: "← Events",
    backTo: "/#services",
    headline: "Where midnight holds its breath",
    deck: "Documenting grand gatherings through ambient warmth, quiet sidelines, and atmospheric light.",
    byline: "WORDS BY MAYA RAO · 9 MIN READ · NOVEMBER 02, 2026",
    leadImage: {
      src: "/images/tiles/tile-events.jpg",
      alt: "Luxury evening outdoor celebration pavilion glowing with floral garlands and crystal chandeliers",
      caption: "Evening pavilion celebration under jasmine garlands and heirloom chandeliers.",
    },
    openingEssay: [
      "A grand gathering is not a checklist of staged rituals; it is a living, breathing emotional organism. When hundreds of people come together under the canopy of night, the true spirit of the occasion lives on the periphery — in the quiet embrace behind the pillar, the grandparent watching from the shadows, the spontaneous burst of laughter at midnight.",
      "Traditional event coverage approaches a celebration like a census: stand here, look at the flash, smile, repeat. The result is hundreds of brightly lit, sterile records that fail to evoke how the evening actually felt. You remember the warmth, the hum of strings, the fragrance of night jasmine, and the dizzying pulse of the dance floor.",
      "At Phantom Labs, our documentary philosophy treats event photography as ambient cinema. We work primarily with available candlelight, festoon glow, and architectural illumination, allowing the natural darkness of the night to frame the joy.",
      "When you respect the darkness, the light becomes sacred.",
    ],
    subject: {
      tag: "01 / The Celebration",
      name: "The Oberoi Heritage Pavilion",
      role: "Private Autumn Celebration",
      quote: "Looking through our event album felt like reliving a dream. You caught glances between our parents that we didn't even see happen on the night.",
      bio: "An intimate yet monumental multi-day gathering celebrating three generations of family reunion, set amidst century-old banyan trees and hand-carved stone courtyards in Rajasthan.",
      detailTitle: "On Atmospheric Restraint",
      detailText: "The key was maintaining discretion. By wearing silent black attire and working with ultra-fast wide primes, our photographers vanished into the party, becoming trusted chroniclers rather than intrusive directors.",
      image: {
        src: "/images/tiles/tile-events-800.jpg",
        alt: "Detail of crystal chandeliers and floral garlands glowing in the evening",
        caption: "The floral mandap glowing in amber tungsten light as dusk settled.",
      },
    },
    moments: {
      tag: "02 / The Archive",
      title: "The Session, in Moments",
      intro: "From golden-hour arrivals to 2:00 AM dance floor abandon.",
      diptych: [
        {
          src: "/images/tiles/tile-events.jpg",
          alt: "The illuminated pavilion seen from across the courtyard lawn",
          caption: "Frame 44: The pavilion architecture rising against the dark starless night.",
        },
        {
          src: "/images/tiles/tile-events-800.jpg",
          alt: "Floral garlands and crystal lighting close detail",
          caption: "Frame 51: Marigold and tuberose garlands draped under hand-cut glass.",
        },
      ],
      passage1: "As the banquet concluded, the formality dissolved. The string quartet gave way to percussion, shoes were kicked under tables, and generational barriers melted away in shared dance.",
      envFigure: {
        src: "/images/tiles/tile-events.jpg",
        alt: "Wide panoramic view of the courtyard pavilion glowing in the night",
        caption: "The setting: The grand courtyard as midnight arrived, bathed in candle warmth and incandescent tungsten.",
      },
      passage2: "Documenting high-energy celebrations requires anticipation rather than reaction. You do not wait for the emotion to erupt; you feel the momentum building and position your frame to receive it.",
    },
    behind: {
      tag: "03 / Behind the Craft",
      title: "Setting, Light & Optics",
      intro: "Technical notes on high-fidelity documentary capture in low-light environments.",
      craftCards: [
        {
          num: "Craft Note — 01",
          title: "Low-Light Dynamic Range",
          text: "We employ dual-native ISO sensor bodies capable of preserving deep obsidian shadow detail and highlight roll-off in tungsten flame without chromatic noise.",
        },
        {
          num: "Craft Note — 02",
          title: "Zero Direct Flash Intrusion",
          text: "By avoiding harsh on-camera flash, we preserve the immersive mood designed by lighting directors and ensure guests remain relaxed and unselfconscious.",
        },
        {
          num: "Craft Note — 03",
          title: "Multi-Angle Coverage",
          text: "Two photographers working synchronized timecodes: one dedicated to wide contextual architecture, the other capturing micro-expressions on the sidelines.",
        },
        {
          num: "Craft Note — 04",
          title: "Color Science for Skin in Tungsten",
          text: "Custom color profiling ensures skin tones in warm amber candlelight remain luminous, healthy, and cinematic without yellow color cast.",
        },
      ],
    },
    pause: {
      quote: "An unforgettable event is not a schedule of proceedings; it is an atmospheric wave that lives forever in memory.",
      reflections: [
        "Years from now, the table settings will fade from recollection, but the feeling of being surrounded by everyone you love will remain vivid.",
        "Photographs are the anchor points of family history. When executed with reverence and artistry, they become heirloom artifacts handed down across generations.",
        "We consider it a profound privilege to be entrusted with the custody of these ephemeral, monumental nights.",
      ],
    },
    final: {
      tag: "04 / The Epilogue",
      title: "The Final Frames",
      image: {
        src: "/images/tiles/tile-events.jpg",
        alt: "The quiet pavilion after the last guests depart",
        caption: "Frame 88: 2:40 AM. The music quieted, candles still flickering in the courtyard breeze.",
      },
      conclusion: [
        "When the music finally faded and the last guests walked arm-in-arm toward the palace gates, the courtyard returned to silence.",
        "The scent of crushed jasmine flowers lingered in the cool air, and the candles burned low in their brass sconces.",
        "The night was over, but its spirit was preserved forever in silver and light.",
      ],
    },
    moreStories: [
      {
        to: "/explore/portraits",
        thumb: "/images/editorial/mira-studio-lead.jpg",
        alt: "Studio portraiture editorial feature",
        kicker: "Portraits · Field Note 04",
        title: "The Quiet Art of Being Seen",
        snippet: "Inside a slower kind of portrait session, where the best frame arrives after the posing stops.",
        meta: "12 Min Read",
      },
      {
        to: "/explore/brands",
        thumb: "/images/tiles/tile-brands.jpg",
        alt: "Luxury perfume still life",
        kicker: "Brands · Field Note 05",
        title: "Material, Weight, and Silhouette",
        snippet: "Crafting sensory still life and tactile product storytelling for modern luxury houses.",
        meta: "8 Min Read",
      },
    ],
    ctaBanner: {
      title: "Commission Cinematic Event Documentation",
      text: "Ensure your milestone gathering is captured with atmospheric restraint and documentary depth.",
      btnLabel: "Inquire for Your Event →",
      btnTo: "/book?category=events",
    },
    storyNav: {
      prev: {
        to: "/explore/couples",
        kicker: "← Previous Field Note",
        title: "Couples · Two Orbits in the Golden Hour",
      },
      next: {
        to: "/explore/brands",
        kicker: "Next Field Note →",
        title: "Brands · Material, Weight, and Silhouette",
      },
      colophonMark: "PHANTOM LABS JOURNAL",
      colophonSub: "FIELD NOTES — ISSUE NO. 03",
    },
  },

  brands: {
    id: "brands",
    category: "Brands",
    issueKicker: "FIELD NOTES / BRANDS / NO. 05",
    backLabel: "← Brands",
    backTo: "/#services",
    headline: "Material, weight, and silhouette",
    deck: "Crafting sensory still life and tactile product storytelling for modern luxury houses.",
    byline: "WORDS BY MAYA RAO · 8 MIN READ · OCTOBER 11, 2026",
    leadImage: {
      src: "/images/tiles/tile-brands.jpg",
      alt: "Luxury amber glass fragrance flacon perched on dark volcanic stone in studio lighting",
      caption: "Noir Parfum flacon on textured basalt stone, directional shadow study.",
    },
    openingEssay: [
      "In commercial still life, an object is never just an object. A perfume flacon is an architecture of desire; a watch is an engine of mortality; a piece of ceramics is fossilized touch. When we collaborate with luxury brands, our goal is not to produce clean catalog renders, but to construct a tactile universe.",
      "The modern consumer is numb to glossy 3D CGI models. They crave texture: the subtle cool density of obsidian, the micro-bubble inside hand-blown glass, the deliberate roughness of linen. Our studio approach treats product photography as sculptural inquiry.",
      "For the Noir fragrance campaign, we spent two full days studying how light traverses heavy smoked glass. Glass does not reflect light; it bends, condenses, and refracts it into miniature sunbursts on dark stone.",
      "When the lighting honors the physical materiality of the product, commercial imagery transcends advertising and becomes art.",
    ],
    subject: {
      tag: "01 / The Brand",
      name: "Maison Noir",
      role: "Artisanal Haute Parfumerie",
      quote: "Phantom Labs doesn't just shoot our bottles. They understand the scent profile — the smoke, the cedar, the oud — and translate invisible olfactory notes into visible shadow.",
      bio: "A boutique fragrance house founded in Grasse and Mumbai, crafting limited batch extraits de parfum inspired by brutalist architecture and ancient botanical alchemy.",
      detailTitle: "On Tactile Materiality",
      detailText: "We sourced raw volcanic basalt from the Deccan Traps to serve as the plinth. The porous, matte charcoal stone provides the perfect textural foil to the polished amber crystal flacon.",
      image: {
        src: "/images/tiles/tile-brands-800.jpg",
        alt: "Detail of perfume bottle resting on dark volcanic stone",
        caption: "Tactile harmony: Polished crystal meets porous basalt.",
      },
    },
    moments: {
      tag: "02 / The Archive",
      title: "The Session, in Moments",
      intro: "Precision lighting studies across seventy-two micro-calibrated studio exposures.",
      diptych: [
        {
          src: "/images/tiles/tile-brands.jpg",
          alt: "Noir perfume bottle front view in directional light",
          caption: "Study 08: Sculpting the edge with a 1mm razor rim light.",
        },
        {
          src: "/images/tiles/tile-brands-800.jpg",
          alt: "Amber refraction across dark stone plinth",
          caption: "Study 14: Amber refraction pooling across the volcanic stone.",
        },
      ],
      passage1: "Still life demands an almost surgical patience. A 2-millimeter adjustment of the flag cutter completely alters the caustic refraction through the shoulder of the bottle. We worked in total darkness, introducing one photonic source at a time.",
      envFigure: {
        src: "/images/tiles/tile-brands.jpg",
        alt: "Wide view of the fragrance campaign visual",
        caption: "The final campaign frame: Hero placement for global print and digital launch.",
      },
      passage2: "When the balance is achieved, the object vibrates with quiet presence. It does not beg for attention; it commands it through absolute composure and tonal authority.",
    },
    behind: {
      tag: "03 / Behind the Craft",
      title: "Setting, Light & Optics",
      intro: "Technical notes on glass refraction, macro-focus stacking, and negative fill.",
      craftCards: [
        {
          num: "Craft Note — 01",
          title: "Subtractive Negative Fill",
          text: "To carve out the flacon’s crisp black silhouette, we surrounded the set with black velvet flags, absorbing stray studio bounce and ensuring pure, deep blacks.",
        },
        {
          num: "Craft Note — 02",
          title: "Laser Collimated Rim Lighting",
          text: "A single narrow-beam snoot illuminated only the gold typography, allowing the brand mark to float against the shadowed liquid without specular blowout.",
        },
        {
          num: "Craft Note — 03",
          title: "Optical Focus Stacking",
          text: "Nine discrete focal planes composited together in camera calibration, providing corner-to-corner tack sharpness from the stone crest to the rear glass facet.",
        },
        {
          num: "Craft Note — 04",
          title: "Color Fidelity Calibration",
          text: "Standardized X-Rite color targets verified under 98+ CRI daylight balanced illumination to ensure true pigment reproduction in luxury packaging.",
        },
      ],
    },
    pause: {
      quote: "Every luxury object possesses an internal gravity. The light only has to honor it.",
      reflections: [
        "In a marketplace saturated with disposable synthetic imagery, authenticity has become the ultimate luxury currency.",
        "When an audience senses the weight, the coolness, and the craftsmanship of a physical artifact through a screen, belief is established instantaneously.",
        "Crafting that visceral conviction is our studio’s signature obsession.",
      ],
    },
    final: {
      tag: "04 / The Epilogue",
      title: "The Final Frames",
      image: {
        src: "/images/tiles/tile-brands.jpg",
        alt: "Completed hero campaign frame for Maison Noir",
        caption: "The campaign master: Delivered for international billboard and editorial release.",
      },
      conclusion: [
        "The completed campaign ran across European luxury journals and flagship boutique vitrines in Paris, Tokyo, and Mumbai.",
        "Beyond commercial metrics, the images exist as timeless still-life studies that celebrate the intersection of chemistry, glasscraft, and light.",
        "When commerce meets devotion to material, the result is lasting prestige.",
      ],
    },
    moreStories: [
      {
        to: "/explore/commercial",
        thumb: "/images/tiles/tile-commercial.jpg",
        alt: "Studio product photography",
        kicker: "Commercial · Field Note 07",
        title: "Sculpting Sound & Space",
        snippet: "Industrial precision meets clean sculptural lighting in high-fidelity industrial design.",
        meta: "8 Min Read",
      },
      {
        to: "/explore/editorial",
        thumb: "/images/tiles/tile-editorial.jpg",
        alt: "Fashion editorial portrait",
        kicker: "Editorial · Field Note 06",
        title: "Shadows in Tailored Form",
        snippet: "Architecture, tailored monochrome form, and the art of negative space.",
        meta: "11 Min Read",
      },
    ],
    ctaBanner: {
      title: "Elevate Your Brand's Visual Identity",
      text: "Commission bespoke product still life and campaign imagery designed for luxury prestige.",
      btnLabel: "Inquire for Brand Campaigns →",
      btnTo: "/book?category=brands",
    },
    storyNav: {
      prev: {
        to: "/explore/events",
        kicker: "← Previous Field Note",
        title: "Events · Where Midnight Holds Its Breath",
      },
      next: {
        to: "/explore/editorial",
        kicker: "Next Field Note →",
        title: "Editorial · Shadows in Tailored Form",
      },
      colophonMark: "PHANTOM LABS JOURNAL",
      colophonSub: "FIELD NOTES — ISSUE NO. 05",
    },
  },

  editorial: {
    id: "editorial",
    category: "Editorial",
    issueKicker: "FIELD NOTES / EDITORIAL / NO. 06",
    backLabel: "← Editorial",
    backTo: "/#services",
    headline: "Shadows in tailored form",
    deck: "A study in monochrome architectural fashion, negative space, and modern tailoring.",
    byline: "WORDS BY MAYA RAO · 11 MIN READ · OCTOBER 29, 2026",
    leadImage: {
      src: "/images/tiles/tile-editorial.jpg",
      alt: "Monochrome high-fashion editorial portrait in a tailored black architectural blazer",
      caption: "Studio study in high-contrast wool tailoring and sculpted natural wind.",
    },
    openingEssay: [
      "Fashion editorial at its highest expression is not about selling clothes. It is an exploration of form, silhouette, and cultural gesture. When you strip away color and work in pure black, white, and silver, garments transform into sculptural architecture worn by the human body.",
      "In this monograph feature, we set out to study the tension between rigid geometric tailoring and organic human movement. An oversized double-breasted wool coat from an independent couture studio provided the anchor: sharp shoulders, immaculate notch lapels, and heavy draping fabric.",
      "Rather than shooting against sterile cycloramas, we embraced harsh directional daylight cutting through concrete pillars. We wanted shadows that felt carved with a knife — stark, unapologetic, and modern.",
      "When negative space is given equal weight to the subject, every gesture carries immense psychological tension.",
    ],
    subject: {
      tag: "01 / The Muse",
      name: "Ananya Varma",
      role: "Architectural Model & Dancer",
      quote: "Maya doesn't ask you to pose like a mannequin. She treats your body like a pendulum moving through space, catching the exact apex of the curve.",
      bio: "Trained in classical contemporary dance and architectural theory, Ananya brings a profound spatial intelligence to high-fashion movement.",
      detailTitle: "On Kinetic Silhouettes",
      detailText: "Her background in choreography allows her to hold extreme angles with effortless poise. The tailored lapels followed the line of her cheekbones, creating a dialogue between textile structure and skeletal form.",
      image: {
        src: "/images/tiles/tile-editorial-mobile.jpg",
        alt: "Ananya in profile with wind-sculpted dark hair",
        caption: "Kinetic stillness: Wind, hair, and wool in perfect equilibrium.",
      },
    },
    moments: {
      tag: "02 / The Archive",
      title: "The Session, in Moments",
      intro: "Monochrome balance across forty-five medium format captures.",
      diptych: [
        {
          src: "/images/tiles/tile-editorial.jpg",
          alt: "Direct gaze with tailored black architectural blazer",
          caption: "Look 01: The architectural lapel against stark ivory sweep.",
        },
        {
          src: "/images/tiles/tile-editorial-mobile.jpg",
          alt: "Profile silhouette with sweeping dark wool collar",
          caption: "Look 04: The profile study in negative space and motion.",
        },
      ],
      passage1: "By stripping away the distraction of color, the viewer's attention is forced onto texture — the tactile weave of matte British wool, the fine sheen of combed hair, and the luminous matte quality of skin in open shade.",
      envFigure: {
        src: "/images/tiles/tile-editorial.jpg",
        alt: "Full editorial spread layout",
        caption: "The cover layout: Featured in the Autumn International Design Biennial publication.",
      },
      passage2: "Great fashion photography does not conform to trends. It creates an iconography that remains potent decades after the season has passed.",
    },
    behind: {
      tag: "03 / Behind the Craft",
      title: "Setting, Light & Optics",
      intro: "Technical notes on chiaroscuro contrast, monochrome tonal response, and shutter timing.",
      craftCards: [
        {
          num: "Craft Note — 01",
          title: "Orthochromatic Tonal Curve",
          text: "We developed a bespoke digital tonal curve emulating classic mid-century orthochromatic silver gelatin emulsions, rendering deep slate blacks with luminous mid-gray transitions.",
        },
        {
          num: "Craft Note — 02",
          title: "Single Hard Solar Source",
          text: "A single unobstructed sun beam entering through a skylight slit created clean razor-sharp shadow lines across the jawline without penumbra.",
        },
        {
          num: "Craft Note — 03",
          title: "Subtle Kinetic Aerodynamics",
          text: "A gentle hand-held aerodynamic fan created slight movement in the hair without disturbing the geometric stillness of the tailored wool shoulders.",
        },
        {
          num: "Craft Note — 04",
          title: "Strict Aspect Framing",
          text: "Framed deliberately in 4:5 vertical proportions to honor the classic editorial spread layout of printed fashion volumes.",
        },
      ],
    },
    pause: {
      quote: "In fashion editorial, clothes are not garments—they are sculptures worn by time.",
      reflections: [
        "Trends expire in six months, but a compelling study of human proportion and silhouette endures indefinitely.",
        "Our studio approaches every fashion commission not as ephemeral content, but as an editorial monograph worthy of preservation in print archives.",
        "Restraint is always more powerful than excess.",
      ],
    },
    final: {
      tag: "04 / The Epilogue",
      title: "The Final Frames",
      image: {
        src: "/images/tiles/tile-editorial.jpg",
        alt: "Final closing editorial portrait frame",
        caption: "Frame 42: The uncompromising direct gaze that anchored the entire issue.",
      },
      conclusion: [
        "When the final look was wrapped and the studio lights dimmed, we knew we had captured something distinct.",
        "The collection was no longer just fabric and seams; it had become an evocative emotional narrative about confidence, stillness, and form.",
        "Fashion is ephemeral; vision is permanent.",
      ],
    },
    moreStories: [
      {
        to: "/explore/portraits",
        thumb: "/images/editorial/mira-studio-lead.jpg",
        alt: "Studio portraiture feature",
        kicker: "Portraits · Field Note 04",
        title: "The Quiet Art of Being Seen",
        snippet: "Inside a slower kind of portrait session, where the best frame arrives after the posing stops.",
        meta: "12 Min Read",
      },
      {
        to: "/explore/commercial",
        thumb: "/images/tiles/tile-commercial.jpg",
        alt: "Commercial product photography",
        kicker: "Commercial · Field Note 07",
        title: "Sculpting Sound & Space",
        snippet: "Industrial precision meets clean sculptural lighting in high-fidelity industrial design.",
        meta: "8 Min Read",
      },
    ],
    ctaBanner: {
      title: "Collaborate on Editorial Features",
      text: "Commission high-concept fashion editorial and monograph publications with Phantom Labs.",
      btnLabel: "Inquire for Editorial Work →",
      btnTo: "/book?category=editorial",
    },
    storyNav: {
      prev: {
        to: "/explore/brands",
        kicker: "← Previous Field Note",
        title: "Brands · Material, Weight, and Silhouette",
      },
      next: {
        to: "/explore/commercial",
        kicker: "Next Field Note →",
        title: "Commercial · Sculpting Sound & Space",
      },
      colophonMark: "PHANTOM LABS JOURNAL",
      colophonSub: "FIELD NOTES — ISSUE NO. 06",
    },
  },

  commercial: {
    id: "commercial",
    category: "Commercial",
    issueKicker: "FIELD NOTES / COMMERCIAL / NO. 07",
    backLabel: "← Commercial",
    backTo: "/#services",
    headline: "Sculpting sound & space",
    deck: "Industrial precision meets clean sculptural lighting in high-fidelity industrial design.",
    byline: "WORDS BY MAYA RAO · 8 MIN READ · NOVEMBER 08, 2026",
    leadImage: {
      src: "/images/tiles/tile-commercial.jpg",
      alt: "Sculptural matte-black studio headphones photographed on a clean off-white sweep",
      caption: "Matte acoustic driver housing, balanced high-key sweep.",
    },
    openingEssay: [
      "Commercial product photography is the art of translating industrial engineering into human emotion. When an engineering team spends three years perfecting the radius of a headphone headband or the acoustic dampening of an ear cup, the camera must reveal that obsessive dedication in every pixel.",
      "The challenge with dark, sculptural hardware is avoiding both flat digital rendering and harsh specularity. Matte polycarbonate, brushed anodized aluminum, and memory foam lambskin each interact with photons in fundamentally different ways.",
      "In this commercial assignment for a flagship acoustic monitoring system, our directive was absolute purity. No artificial lens flares, no distracting floating particles, no synthetic 3D mockups. Just real physical light wrapping around real physical materials on a pristine studio sweep.",
      "When an object is engineered with truth, you do not need gimmicks. You only need the courage to illuminate it cleanly.",
    ],
    subject: {
      tag: "01 / The Hardware",
      name: "Acoustics Studio Series",
      role: "Flagship High-Fidelity Monitoring System",
      quote: "Phantom Labs captured the exact tactile nuance of our matte anodized finish. In an industry of synthetic CAD renders, these real photos conveyed the premium weight our engineers worked years to achieve.",
      bio: "Designed in collaboration with world-renowned acoustic industrial designers, combining precision titanium drivers with ergonomic memory foam cushions.",
      detailTitle: "On Material Fidelity",
      detailText: "The matte black coating absorbs 94% of incident light. Capturing its curved contours required large-format scrim diffusers placed within inches of the chassis to paint continuous highlight gradients without hotspots.",
      image: {
        src: "/images/tiles/tile-commercial-mobile.jpg",
        alt: "Detail of matte-black headphones showing precision headband curve",
        caption: "Ergonomic geometry: Continuous gradient wrap across the driver housing.",
      },
    },
    moments: {
      tag: "02 / The Archive",
      title: "The Session, in Moments",
      intro: "A rigorous catalog of angles, sweeps, and micro-details.",
      diptych: [
        {
          src: "/images/tiles/tile-commercial.jpg",
          alt: "Headphones three-quarter view on white sweep",
          caption: "Plate 01: The primary hero profile, balanced on a micro-fine invisible arm.",
        },
        {
          src: "/images/tiles/tile-commercial-mobile.jpg",
          alt: "Detail of ear cup swivel and acoustic mesh",
          caption: "Plate 05: Micro-study of the gimbal swivel joint and laser-etched insignia.",
        },
      ],
      passage1: "By utilizing custom 2-meter diffusion banks, we sculpted soft continuous highlight rolls that define the circular sweep of the earcups while maintaining deep, velvety blacks in the recesses.",
      envFigure: {
        src: "/images/tiles/tile-commercial.jpg",
        alt: "Wide commercial product hero placement",
        caption: "The hero master: Global billboard and e-commerce launch asset.",
      },
      passage2: "In commercial imagery that converts, clarity is queen. The customer must feel as though they could reach into their display and pick the product up.",
    },
    behind: {
      tag: "03 / Behind the Craft",
      title: "Setting, Light & Optics",
      intro: "Technical notes on high-key commercial sweeps, micro-cleaning, and color balance.",
      craftCards: [
        {
          num: "Craft Note — 01",
          title: "Clean Room Studio Protocol",
          text: "Conducted under ionizer air purification to ensure zero airborne dust particles settle on the dark matte finish during extended macro exposures.",
        },
        {
          num: "Craft Note — 02",
          title: "Bespoke Scrim Architecture",
          text: "Custom 8x8 foot silk diffusion frames positioned to create continuous, unbroken reflection gradients along the curved headband.",
        },
        {
          num: "Craft Note — 03",
          title: "Zero-Distortion Macro Optics",
          text: "Shot on a 120mm apochromatic macro lens with tilt-shift geometry, ensuring parallel lines remain true and perspective distortion is eliminated.",
        },
        {
          num: "Craft Note — 04",
          title: "Sub-Millimeter Focus Stacking",
          text: "Twelve focus slices aligned to create infinite depth of field across the entire chassis from the front cushion to the rear yoke.",
        },
      ],
    },
    pause: {
      quote: "Design is complete when you cannot take another contour away without silencing the object.",
      reflections: [
        "In modern commercial photography, minimalism is not the absence of effort; it is the culmination of discipline.",
        "When an image is stripped of all extraneous props and graphics, the object itself must speak with absolute authority.",
        "That purity of communication is what separates world-class product campaigns from ordinary commercial clutter.",
      ],
    },
    final: {
      tag: "04 / The Epilogue",
      title: "The Final Frames",
      image: {
        src: "/images/tiles/tile-commercial.jpg",
        alt: "Final hero commercial visual",
        caption: "The commercial master: Delivered in ultra-high resolution for global product roll-out.",
      },
      conclusion: [
        "The resulting campaign assets established a new visual standard for the product line, driving record launch engagement and acclaim across design publications worldwide.",
        "Great commercial photography honors the hundreds of people who designed, tested, and assembled the product.",
        "Precision is our homage to craft.",
      ],
    },
    moreStories: [
      {
        to: "/explore/brands",
        thumb: "/images/tiles/tile-brands.jpg",
        alt: "Luxury brand still life",
        kicker: "Brands · Field Note 05",
        title: "Material, Weight, and Silhouette",
        snippet: "Crafting sensory still life and tactile product storytelling for modern luxury houses.",
        meta: "8 Min Read",
      },
      {
        to: "/explore/editorial",
        thumb: "/images/tiles/tile-editorial.jpg",
        alt: "Fashion editorial feature",
        kicker: "Editorial · Field Note 06",
        title: "Shadows in Tailored Form",
        snippet: "Architecture, tailored monochrome form, and the art of negative space.",
        meta: "11 Min Read",
      },
    ],
    ctaBanner: {
      title: "Bring Industrial Precision to Your Products",
      text: "Commission world-class commercial product imagery that showcases materials and converts audiences.",
      btnLabel: "Inquire for Commercial Shoots →",
      btnTo: "/book?category=commercial",
    },
    storyNav: {
      prev: {
        to: "/explore/editorial",
        kicker: "← Previous Field Note",
        title: "Editorial · Shadows in Tailored Form",
      },
      next: {
        to: "/explore/portraits",
        kicker: "Next Field Note →",
        title: "Portraits · The Quiet Art of Being Seen",
      },
      colophonMark: "PHANTOM LABS JOURNAL",
      colophonSub: "FIELD NOTES — ISSUE NO. 07",
    },
  },
};
