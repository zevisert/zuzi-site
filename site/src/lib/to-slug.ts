export function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z-AZ0-9-]+/g, ' ')
    .replace(/-/g, ' ')
    .trim()
    .replace(/\s+/g, '-');
}
