/** Match all search words without depending on case or accents. */
export function matchesSearch(query: string, ...values: Array<string | number | null | undefined>) {
  const normalize = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  const content = normalize(values.filter(value => value != null).join(" "));
  return words.every(word => content.includes(word));
}
