export type WeightRow = {
  date: string
  kg: number
}

export async function fetchWeights() {
  const res = await fetch("https://health-bridge-api.rcormier.workers.dev/api/health/weight?limit=100000");
  if (!res.ok) throw new Error("Failed to fetch weights");
  return res.json();
}