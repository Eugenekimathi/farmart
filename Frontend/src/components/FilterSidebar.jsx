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
    <aside className="filter-sidebar">
      <div className="filter-sidebar__header">
        <h3 className="filter-sidebar__title">Filters</h3>
        <button className="filter-sidebar__clear" onClick={handleClear}>Clear all</button>
      </div>

      {/* Bei (KSh) Range Slider */}
      <div className="filter-group">
        <div className="filter-group__label-row">
          <label htmlFor="priceRange">Bei (KSh)</label>
          <span className="filter-group__price-val">{formattedMaxPrice}</span>
        </div>
        <div className="filter-group__slider-container">
          <span className="filter-group__slider-min">0</span>
          <input
            id="priceRange"
            type="range"
            min="0"
            max="300000"
            step="5000"
            value={filters.max_price || 300000}
            onChange={handlePriceChange}
            className="filter-group__range-slider"
          />
        </div>
      </div>

      {/* Age Dropdown */}
      <div className="filter-group">
        <label htmlFor="ageSelect" className="filter-group__label">Maximum age</label>
        <select
          id="ageSelect"
          name="max_age"
          value={filters.max_age || ''}
          onChange={handleAgeChange}
          className="filter-group__select"
        >
          <option value="">Any age</option>
          <option value="12">Up to 12 months</option>
          <option value="24">Up to 24 months</option>
          <option value="36">Up to 36 months</option>
          <option value="48">Up to 48 months</option>
        </select>
      </div>

      {/* Breed Dropdown */}
      <div className="filter-group">
        <label htmlFor="breedSelect" className="filter-group__label">Breed</label>
        <select
          id="breedSelect"
          name="breed"
          value={filters.breed || ''}
          onChange={handleBreedChange}
          className="filter-group__select"
        >
          <option value="">Select breed...</option>
          {breeds.map((b) => (
            <option key={b.id} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
    </aside>
  )
}

export default FilterSidebar
