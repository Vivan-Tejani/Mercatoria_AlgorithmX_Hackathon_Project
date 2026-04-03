import { useState } from 'react'
import CrisisGrid from './CrisisGrid'
import TrackPage from './TrackPage'

export default function App() {
  const [currentPage, setCurrentPage] = useState('grid')

  if (currentPage === 'track') {
    return <TrackPage onBack={() => setCurrentPage('grid')} />
  }

  return <CrisisGrid onTrackClick={() => setCurrentPage('track')} />
}