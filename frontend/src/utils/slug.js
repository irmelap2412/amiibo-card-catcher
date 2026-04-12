import slugify from 'slugify';

/**
 * Convert a string to a URL-friendly slug.
 * e.g. "Link (Ocarina of Time)" → "link-ocarina-of-time"
 */
export function toSlug(str = '') {
  return slugify(str, { lower: true, strict: true });
}

/**
 * Build a unique, pretty slug for an amiibo.
 * Uses the name + tail so slugs are always stable and unique.
 * e.g. "Mario" tail "00000000" → "mario-00000000"
 */
export function amiiboSlug(amiibo) {
  return `${toSlug(amiibo.name)}-${amiibo.tail}`;
}