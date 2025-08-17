import { useQuery } from '@tanstack/react-query'
import { fetchWeights } from '../api/healthBridge'

export default function HealthBridgePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['weights'],
    queryFn: fetchWeights,
  })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Body Weight History</h1>
      {isLoading && <div>Loading...</div>}
      {error && <div className="text-red-500">Error loading data</div>}
      {data && (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th>Date</th>
              <th>Weight (lbs)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.date}>
                <td>{new Date(row.date).toLocaleDateString()}</td>
                <td>{(row.kg * 2.20462).toFixed(2)}</td> {/* Convert kg to lbs */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}