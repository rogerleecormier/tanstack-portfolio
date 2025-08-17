export type WeightRow = {
  date: string
  kg: number
}

export async function fetchWeights(): Promise<WeightRow[]> {
  const res = await fetch('https://health-bridge-api.rcormier.workers.dev/api/health/weight')
  if (!res.ok) throw new Error('Failed to fetch weights')
  return await res.json()
}