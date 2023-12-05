// Alert message if filter has changed from server
import './AppMeteoriteFilterAlert.css'

interface AppMeteoriteFilterAlertProps {
  filter: { year?: string, mass?: string }
}

export default ({ filter }: AppMeteoriteFilterAlertProps) => {
  const nf = Object.entries(filter)
    .reduce((acc: string[], [field, value]) => {
      acc.push(`${field}: ${value}`)

      return acc
    }, [])

  return (
    <div className='meteorite-filter-alert'>
      <div>Since there were no results for the selected filters, the search was changed to return the closest meteorite.</div>
      <div>New filter applied: {nf.join(', ')}</div>
    </div>
  )
}