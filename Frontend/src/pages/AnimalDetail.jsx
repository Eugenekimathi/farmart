import { useParams } from 'react-router-dom'

export default function AnimalDetail() {
  const { id } = useParams()
  return (
    <main>
      <h1>Animal Detail</h1>
      <p>Details for animal ID: {id}</p>
    </main>
  )
}
