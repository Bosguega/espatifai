/**
 * Converte um slug (ex: "el-doble-turno") em titulo legivel.
 */
export function slugToTitle(slug: string): string {
  return slug
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
