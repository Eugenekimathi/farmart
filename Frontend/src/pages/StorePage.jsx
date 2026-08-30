import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAnimals } from '../features/animals/animalsSlice'
import FilterSidebar from '../components/FilterSidebar'
import AnimalCard from '../components/AnimalCard'
import Footer from '../components/Footer'

const StorePage = () => {
  const dispatch = useDispatch()
  const { animals, searchQuery, filters, isLoading } = useSelector((state) => state.animals)

  useEffect(() => {
    dispatch(getAnimals({ page: 1, search: searchQuery, filters }))
  }, [dispatch, searchQuery, filters])

  return (
    <div className="store-page">
      <div className="store-page__header">
        <div className="store-page__header-inner">
          <h1 className="store-page__title">
            All Livestock
          </h1>
          <p className="store-page__subtitle">
            Browse verified livestock from Kenyan farmers
          </p>
        </div>
      </div>

      <div className="store-page__body">
        <FilterSidebar />
        <main>
          <div className="store-page__results-bar">
            <span className="store-page__count">
              {animals.length} results
            </span>
          </div>

          {isLoading ? (
            <div className="store-page__loading">
              <div className="spinner" />
              <p>Loading matching livestock...</p>
            </div>
          ) : animals.length === 0 ? (
            <div className="store-page__empty">
              <p>No livestock found matching your filters.</p>
            </div>
          ) : (
            <div className="animal-grid">
              {animals.map((animal) => (
                <AnimalCard key={animal.id} animal={animal} />
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default StorePage
