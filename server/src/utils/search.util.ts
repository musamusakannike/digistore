export const buildSearchQuery = (searchTerm: string, fields: string[]): any => {
  if (!searchTerm || !fields.length) return {}

  return {
    $or: fields.map((field) => ({
      [field]: { $regex: searchTerm, $options: "i" },
    })),
  }
}

export const buildFilterQuery = (filters: Record<string, any>): any => {
  const query: any = {}

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        query[key] = { $in: value }
      } else if (typeof value === "object" && value.min !== undefined && value.max !== undefined) {
        query[key] = { $gte: value.min, $lte: value.max }
      } else {
        query[key] = value
      }
    }
  })

  return query
}
