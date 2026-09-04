import { useDispatch, useSelector } from 'react-redux'
import { setFilters, clearFilters } from '../features/animals/animalsSlice'

// SVG Icons
const SlidersIcon = () => (
  <svg className="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <line x1="4" x2="4" y1="21" y2="14" />
    <line x1="4" x2="4" y1="10" y2="3" />
    <line x1="12" x2="12" y1="21" y2="12" />
    <line x1="12" x2="12" y1="8" y2="3" />
    <line x1="20" x2="20" y1="21" y2="16" />
    <line x1="20" x2="20" y1="12" y2="3" />
    <line x1="1" x2="4" y1="14" y2="14" />
    <line x1="3" x2="21" y1="3" y2="3" />
    <line x1="8" x2="8" y1="21" y2="21" />
    <line x1="16" x2="16" y1="21" y2="21" />
  </svg>
)

const FilterIcon = () => (
  <svg className="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <polygon points="22 3 2 3 7 21.5 13 21.5 17 12 22 3" />
    <line x1="2" x2="22" y1="3" y2="3" />
  </svg>
)

const CheckIcon = () => (
  <svg className="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const FilterSidebar = () => {
  const dispatch = useDispatch()
  const { filters, breeds, animalTypes } = useSelector((state) => state.animals)

  const handlePriceChange = (e) => {
    dispatch(setFilters({ max_price: Number(e.target.value) }))
  }

  const handleBreedChange = (e) => {
    dispatch(setFilters({ breed: e.target.value }))
  }

  const handleAgeChange = (e) => {
    dispatch(setFilters({ max_age: e.target.value }))
  }

  const handleTypeChange = (e) => {
    dispatch(setFilters({ animal_type: e.target.value }))
  }

  const handleVerifiedChange = (e) => {
    dispatch(setFilters({ verified_only: e.target.checked }))
  }

  const handleClear = () => {
    dispatch(clearFilters())
  }

  const formattedMaxPrice = `KSh ${Number(filters.max_price || 300000).toLocaleString()}`

  const counties = [
    'Nairobi', 'Nakuru', 'Kiambu', 'Machakos', 'Kisumu', 'Mombasa',
    'Kajiado', 'Meru', 'Eldoret', 'Nyeri', 'Kakamega', 'Bungoma'
  ]

  return (
    <aside className="filter-sidebar">
      <div className="filter-sidebar__header">
        <div className="filter-sidebar__header-left">
          <FilterIcon />
          <h3 className="filter-sidebar__title">Filters</h3>
        </div>
        <button className="filter-sidebar__clear" onClick={handleClear}>Clear all</button>
      </div>

      {/* Animal Type */}
      <div className="filter-group">
        <label htmlFor="typeSelect" className="filter-group__label">Animal Type</label>
        <select
          id="typeSelect"
          name="animal_type"
          value={filters.animal_type || ''}
          onChange={handleTypeChange}
          className="filter-group__select"
        >
          <option value="">All types</option>
          {animalTypes?.map((type) => (
            <option key={type.id} value={type.name}>
              {type.name}
            </option>
          ))}
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
          <option value="">All breeds</option>
          {breeds.map((b) => (
            <option key={b.id} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* County/Location */}
      <div className="filter-group">
        <label htmlFor="countySelect" className="filter-group__label">County</label>
        <select
          id="countySelect"
          name="county"
          value={filters.county || ''}
          onChange={(e) => dispatch(setFilters({ county: e.target.value }))}
          className="filter-group__select"
        >
          <option value="">All counties</option>
          {counties.map((county) => (
            <option key={county} value={county}>
              {county}
            </option>
          ))}
        </select>
      </div>

      {/* Bei (KSh) Range Slider */}
      <div className="filter-group">
        <div className="filter-group__label-row">
          <label htmlFor="priceRange">Price Range</label>
          <span className="filter-group__price-val">{formattedMaxPrice}</span>
        </div>
        <div className="filter-group__slider-container">
          <SlidersIcon />
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
        <label htmlFor="ageSelect" className="filter-group__label">Maximum Age</label>
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

      {/* Verified Farmer Checkbox */}
      <div className="filter-group">
        <label className="filter-group__checkbox-label">
          <input
            type="checkbox"
            checked={filters.verified_only || false}
            onChange={handleVerifiedChange}
          />
          <span className="filter-group__checkbox-text">
            <CheckIcon />
            Verified farmers only
          </span>
        </label>
      </div>
    </aside>
  )
}

export default FilterSidebar
