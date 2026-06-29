export function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5)
}
