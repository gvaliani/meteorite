import './AppMeteoriteItem.css'
import { Meteorite } from '../../types'

interface AppMeteoriteProps {
  item: Meteorite;
}

const MeteoriteItem = ({ item }: AppMeteoriteProps) => {
  const year = item?.year ? item?.year.substring(0, 4) : 'Unknown'
  const mass = item?.mass || 'Unknown'

  return (
    <div className='meteorite-item'>
      <span className='text-muted'>Name: </span>
      <span>{item?.name}</span>
      
      <span className='text-muted'>Mass: </span>
      <span>{mass}</span>
      
      <span className='text-muted'>Year: </span>
      <span>{year}</span>
    </div>
  )
}

export default MeteoriteItem