/**
 * Direct High-Speed CDN Image Registry for Noir Frame.
 * Bypasses redirect latency, delivers WebP/AVIF compressed assets instantly,
 * and maintains an in-memory cache to prevent re-rendering.
 */

export const imageRegistry = {
  // Hero
  "noir-hero-main": "1492691527719-9d1e07e534b4",

  // Portfolio 01 - Quiet Vows
  "noir-wedding-01": "1519741497674-611481863552",
  "noir-wedding-01a": "1511285560929-80b456fea0bc",
  "noir-wedding-01b": "1469371670807-013ccf25f16a",
  "noir-wedding-01c": "1522673607200-164d1b6ce486",
  "noir-wedding-01d": "1465495976277-4387d4b0b4c6",
  "noir-wedding-01e": "1583939003579-730e3918a45a",
  "noir-wedding-01f": "1519225421980-715cb0215aed",

  // Portfolio 02 - Study in Grey
  "noir-portrait-02": "1534528741775-53994a69daeb",
  "noir-portrait-02a": "1507003211169-0a1dd7228f2d",
  "noir-portrait-02b": "1500648767791-00dcc994a43e",
  "noir-portrait-02c": "1531746020798-e6953c6e8e04",
  "noir-portrait-02d": "1544005313-94ddf0286df2",
  "noir-portrait-02e": "1506794778202-cad84cf45f1d",

  // Portfolio 03 - Paper Season
  "noir-editorial-03": "1490481651871-ab68de25d43d",
  "noir-editorial-03a": "1469334031218-e382a71b716b",
  "noir-editorial-03b": "1445205170230-053b83016050",
  "noir-editorial-03c": "1483985988355-763728e1935b",
  "noir-editorial-03d": "1496747611176-843222e1e57c",
  "noir-editorial-03e": "1509631179647-0177331693ae",

  // Portfolio 04 - Low Light
  "noir-fashion-04": "1515886657613-9f3515b0c78f",
  "noir-fashion-04a": "1529139574466-a303027c1d8b",
  "noir-fashion-04b": "1485230895905-ec40ba36b9bc",
  "noir-fashion-04c": "1539109136881-3be0616acf4b",
  "noir-fashion-04d": "1508427953056-b00b8d78ebf5",

  // Portfolio 05 - After Hours
  "noir-events-05": "1511795409834-ef04bbd61622",
  "noir-events-05a": "1492684223066-81342ee5ff30",
  "noir-events-05b": "1519671482749-fd09be7ccebf",
  "noir-events-05c": "1470225620780-dba8ba36b745",
  "noir-events-05d": "1501386761578-eac5c94b800a",

  // Portfolio 06 - Two Chairs
  "noir-wedding-06": "1537633552985-df8429e8048b",
  "noir-wedding-06a": "1519741497674-611481863552",
  "noir-wedding-06b": "1465495976277-4387d4b0b4c6",
  "noir-wedding-06c": "1522673607200-164d1b6ce486",
  "noir-wedding-06d": "1519225421980-715cb0215aed",

  // Portfolio 07 - The Long Table
  "noir-editorial-07": "1555396273-367ea4eb4db5",
  "noir-editorial-07a": "1550966871-3ed3cdb5ed0c",
  "noir-editorial-07b": "1544025162-d76694265947",
  "noir-editorial-07c": "1517248135467-4c7edcad34c4",
  "noir-editorial-07d": "1559339352-11d035aa65de",

  // Portfolio 08 - Grain & Shadow
  "noir-portrait-08": "1506794778202-cad84cf45f1d",
  "noir-portrait-08a": "1534528741775-53994a69daeb",
  "noir-portrait-08b": "1507003211169-0a1dd7228f2d",
  "noir-portrait-08c": "1500648767791-00dcc994a43e",
  "noir-portrait-08d": "1531746020798-e6953c6e8e04",

  // Portfolio 09 - Second Skin
  "noir-fashion-09": "1488161628813-04466f872be2",
  "noir-fashion-09a": "1515886657613-9f3515b0c78f",
  "noir-fashion-09b": "1490481651871-ab68de25d43d",
  "noir-fashion-09c": "1485230895905-ec40ba36b9bc",
  "noir-fashion-09d": "1508427953056-b00b8d78ebf5",

  // Portfolio 10 - Last Toast
  "noir-events-10": "1464366400600-7168b8af9bc3",
  "noir-events-10a": "1511795409834-ef04bbd61622",
  "noir-events-10b": "1492684223066-81342ee5ff30",
  "noir-events-10c": "1519671482749-fd09be7ccebf",
  "noir-events-10d": "1470225620780-dba8ba36b745",

  // Moments in Motion Strip
  "noir-strip-01": "1502082553048-f009c37129b9",
  "noir-strip-02": "1513584684374-8bab748fbf90",
  "noir-strip-03": "1533105079780-92b9be482077",
  "noir-strip-04": "1513635269975-59663e0ac1ad",
  "noir-strip-05": "1493976040374-85c8e12f0c0e",
  "noir-strip-06": "1508672019048-805b876b67e2",

  // Services
  "noir-service-weddings": "1519741497674-611481863552",
  "noir-service-portraits": "1534528741775-53994a69daeb",
  "noir-service-editorial": "1490481651871-ab68de25d43d",
  "noir-service-events": "1511795409834-ef04bbd61622",
};

// Global in-memory cache of loaded image URLs
export const loadedImageUrls = new Set();

/**
 * Generate a direct, optimized Unsplash or custom image URL.
 */
export function getOptimizedImageUrl(seed, width, height) {
  if (!seed) {
    return "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1200";
  }

  // If seed is already a complete URL or data URL, return it directly
  if (seed.startsWith("http://") || seed.startsWith("https://") || seed.startsWith("data:") || seed.startsWith("/")) {
    return seed;
  }

  // If seed is an entry in imageRegistry, use that ID, otherwise treat seed itself as an Unsplash ID if length > 8
  const photoId = imageRegistry[seed] || (seed.length > 6 ? seed : "1492691527719-9d1e07e534b4");
  const w = Math.min(width || 1200, 1600);
  const h = height ? Math.min(height, 1600) : Math.round(w / (3 / 2));
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&q=80&w=${w}&h=${h}`;
}

/**
 * Preload high-priority images into browser memory.
 */
export function preloadImage(seed, width = 1200, height) {
  if (typeof window === "undefined" || !seed) return;
  const url = getOptimizedImageUrl(seed, width, height);
  if (loadedImageUrls.has(url)) return;

  const img = new Image();
  img.src = url;
  img.onload = () => loadedImageUrls.add(url);
}

export const getImageUrl = getOptimizedImageUrl;

