import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getAnimals,
  getAnimalTypes,
  getBreeds,
} from '../features/animals/animalsSlice'
import AnimalCard from '../components/AnimalCard'
import FilterSidebar from '../components/FilterSidebar'
import Pagination from '../components/Pagination'
import '../styles/store.css'

const StorePage = () => {
  const dispatch = useDispatch()

  const {
    animals,
    filters,
    searchQuery,
    pagination,
    isLoading,
    error,
  } = useSelector((state) => state.animals)

  useEffect(() => {
    dispatch(getAnimalTypes())
    dispatch(getBreeds())
  }, [dispatch])

  useEffect(() => {
    dispatch(
      getAnimals({
        page: pagination.currentPage,
        search: searchQuery,
        filters,
      })
    )
  }, [dispatch, pagination.currentPage, searchQuery, filters])

  return (
    <div className="store-page">

      <div className="store-page__header">
        <div className="store-page__header-inner">
          <p className="store-page__area-tag">// HERO AREA</p>
          <h1 className="store-page__title">Nunua Mifugo Moja Kwa Moja Kutoka Kwa Wakulima</h1>
          <p className="store-page__subtitle">Where buyers meet sellers without the need for brokers</p>
        </div>
      </div>

      <div className="store-page__body">
        <FilterSidebar />

        <div className="store-page__results">
          <div className="store-page__results-bar">
            {!isLoading && (
              <p className="store-page__count">Showing {animals.length} of {pagination.totalCount} livestock listing(s)</p>
            )}
            <span className="store-page__tag">// PRODUCT GRID</span>
          </div>

          {isLoading && (
            <div className="store-page__loading">
              <div className="spinner" />
              <p>Loading animals...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="store-page__error"><p>⚠️ {error}</p></div>
          )}

          {!isLoading && !error && animals.length === 0 && (
            <div className="store-page__empty">
              <p>🐄 No animals found matching your search.</p>
              <p>Try adjusting your filters.</p>
            </div>
          )}

          {!isLoading && animals.length > 0 && (
            <div className="animal-grid">
              {animals.map((animal) => (
                <AnimalCard key={animal.id} animal={animal} />
              ))}
            </div>
          )}

          <Pagination />

        </div>
      </div>
    </div>
  )
}

export default StorePage
