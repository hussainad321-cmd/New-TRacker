export function filterBySearchQuery<T extends Record<string, any>>(
  items: T[],
  query: string,
  searchableFields: (keyof T)[]
): T[] {
  if (!query.trim()) return items;

  const lowerQuery = query.toLowerCase();

  return items.filter((item) =>
    searchableFields.some((field) => {
      const value = item[field];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(lowerQuery);
    })
  );
}
