import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAnimals, setSearchQuery } from '../features/animals/animalsSlice'
import FilterSidebar from '../components/FilterSidebar'
import AnimalCard from '../components/AnimalCard'
import Footer from '../components/Footer'

const StorePage = () => {
  const dispatch = useDispatch()
  const [localSearch, setLocalSearch] = useState('')
  const { animals, searchQuery, filters, isLoading } = useSelector((state) => state.animals)

  useEffect(() => {
    dispatch(getAnimals({ page: 1, search: searchQuery, filters }))
  }, [dispatch, searchQuery, filters])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    dispatch(setSearchQuery(localSearch))
  }

  const handleInputChange = (e) => {
    setLocalSearch(e.target.value)
    dispatch(setSearchQuery(e.target.value))
  }

  return (
    <div className="wireframe-page">
      <section className="wireframe-hero">
        <div className="wireframe-hero__container">
          <span className="wireframe-tag-badge">// HERO AREA</span>
          <h1 className="wireframe-hero__title">
            Nunua Mifugo Moja Kwa Moja Kutoka Kwa Wakulima
          </h1>
          <p className="wireframe-hero__subtitle">
            Where buyers meet sellers without the need for brokers
          </p>
          <form className="wireframe-hero__search-form" onSubmit={handleSearchSubmit}>
            <div className="wireframe-hero__search-input-wrap">
              <span className="wireframe-hero__search-icon">🔍</span>
              <input
                type="text"
                placeholder="Tafuta ng'ombe, mbuzi, kondoo..."
                value={localSearch || searchQuery}
                onChange={handleInputChange}
                className="wireframe-hero__search-input"
              />
            </div>
            <button type="submit" className="wireframe-hero__search-btn">
              Tafuta
            </button>
          </form>
        </div>
      </section>

      <div className="wireframe-main-layout">
        <FilterSidebar />
        <main className="wireframe-products-area">
          <div className="wireframe-products-header">
            <span className="wireframe-products-count">
              Showing {animals.length} matching livestock list(s)
            </span>
            <span className="wireframe-tag-badge">// PRODUCT GRID</span>
          </div>

          {isLoading ? (
            <div className="wireframe-loading">
              <div className="wireframe-spinner" />
              <p>Loading matching livestock...</p>
            </div>
          ) : animals.length === 0 ? (
            <div className="wireframe-empty">
              <p>🐄 No livestock found matching your filters.</p>
            </div>
          ) : (
            <div className="wireframe-grid">
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
