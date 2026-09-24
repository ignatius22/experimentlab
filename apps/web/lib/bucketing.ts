export function stableHash(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash >>> 0);
}

export function bucket(userId: string, key: string): number {
  return stableHash(`${userId}:${key}`) % 100;
}
