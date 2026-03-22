/**
 * Stable palette used for root-folder color dots throughout the brain UI
 * (file tree, graph view, brain cards, share cards).
 *
 * The first 11 slots map to the numbered BrainTree departments (00-10).
 * Extra colors cover ad-hoc folders so every root always gets a colour.
 */
export const ROOT_FOLDER_COLORS: string[] = [
  '#5B9A65', // 00_Company  (leaf green)
  '#4A9FD9', // 01_RnD      (sky blue)
  '#E8A830', // 02_Product   (gold)
  '#D95B5B', // 03_Marketing (berry)
  '#9B6BB5', // 04_Finance   (bloom purple)
  '#4ABDA8', // 05_Business  (teal)
  '#8B6B4A', // 06_Operations(bark brown)
  '#E07D5A', // 07_Sales     (coral)
  '#6B8E5A', // 08_Customer  (olive)
  '#7A8BA8', // 09_Legal     (slate)
  '#C49A3C', // 10_Analytics (amber)
  '#6A9FB5', // extra 1
  '#B5736A', // extra 2
  '#8E8B5A', // extra 3
  '#9A6B8E', // extra 4
  '#5A8B8E', // extra 5
]

/**
 * Given an array of files (with a `path` field), return a Map from
 * root-folder name to a stable colour.
 *
 * Root folders are sorted alphabetically and assigned colours in order
 * from ROOT_FOLDER_COLORS so that the same folder always gets the same
 * colour across renders.
 */
export function buildDepartmentColorMap(
  files: Array<{ path: string }>
): Map<string, string> {
  const rootFolders = new Set<string>()
  for (const f of files) {
    const root = f.path.split('/')[0]
    if (f.path.includes('/')) rootFolders.add(root)
  }

  const sorted = Array.from(rootFolders).sort((a, b) => a.localeCompare(b))
  const map = new Map<string, string>()
  sorted.forEach((folder, i) => {
    map.set(folder, ROOT_FOLDER_COLORS[i % ROOT_FOLDER_COLORS.length])
  })
  return map
}
