import { useDispatch, useSelector } from 'react-redux'
import { setFilters, clearFilters } from '../features/animals/animalsSlice'

const FilterSidebar = () => {
  const dispatch = useDispatch()
  const { filters, breeds } = useSelector((state) => state.animals)

  const handlePriceChange = (e) => {
    dispatch(setFilters({ max_price: Number(e.target.value) }))
  }

  const handleBreedChange = (e) => {
    dispatch(setFilters({ breed: e.target.value }))
  }

  const handleAgeChange = (e) => {
    dispatch(setFilters({ max_age: e.target.value }))
  }

  const handleClear = () => {
    dispatch(clearFilters())
  }

  const formattedMaxPrice = `KSh ${Number(filters.max_price || 300000).toLocaleString()}`

  return (
    <aside className="wireframe-filters">
      <div className="wireframe-filters__header">
        <h3 className="wireframe-filters__title">Filters</h3>
        <span className="wireframe-filters__badge">// WIREFRAME</span>
      </div>

      {/* Bei (KSh) Range Slider */}
      <div className="wireframe-filter-group">
        <div className="wireframe-filter-group__label-row">
          <label htmlFor="priceRange">Bei (KSh)</label>
          <span className="wireframe-filters__price-val">{formattedMaxPrice}</span>
        </div>
        <div className="wireframe-slider-container">
          <span className="wireframe-slider-min">0</span>
          <input
            id="priceRange"
            type="range"
            min="0"
            max="300000"
            step="5000"
            value={filters.max_price || 300000}
            onChange={handlePriceChange}
            className="wireframe-range-slider"
          />
        </div>
      </div>

      {/* Age Dropdown */}
      <div className="wireframe-filter-group" style={{ marginTop: '1.2rem' }}>
        <label htmlFor="ageSelect" className="wireframe-filter-group__label">Maximum age</label>
        <select
          id="ageSelect"
          name="max_age"
          value={filters.max_age || ''}
          onChange={handleAgeChange}
          className="wireframe-select"
        >
          <option value="">Any age</option>
          <option value="12">Up to 12 months</option>
          <option value="24">Up to 24 months</option>
          <option value="36">Up to 36 months</option>
          <option value="48">Up to 48 months</option>
        </select>
      </div>

      {/* Breed Dropdown */}
      <div className="wireframe-filter-group" style={{ marginTop: '1.2rem' }}>
        <label htmlFor="breedSelect" className="wireframe-filter-group__label">Breed</label>
        <select
          id="breedSelect"
          name="breed"
          value={filters.breed || ''}
          onChange={handleBreedChange}
          className="wireframe-select"
        >
          <option value="">Select breed...</option>
          {breeds.map((b) => (
            <option key={b.id} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {(filters.breed || filters.max_age || filters.max_price < 300000) && (
        <button className="wireframe-clear-btn" onClick={handleClear}>
          Clear all filters
        </button>
      )}
    </aside>
  )
}

export default FilterSidebar
