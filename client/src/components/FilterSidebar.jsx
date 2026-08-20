import { useDispatch, useSelector } from 'react-redux'
import { setFilters, clearFilters } from '../features/animals/animalsSlice'

const FilterSidebar = () => {
  const dispatch = useDispatch()
  const { filters, animalTypes, breeds } = useSelector((state) => state.animals)

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    dispatch(setFilters({ [name]: value }))
  }

  const handleClear = () => {
    dispatch(clearFilters())
  }

  const hasActiveFilters = filters.breed || filters.age || filters.animal_type

  return (
    <aside className="filter-sidebar">

      <div className="filter-sidebar__header">
        <h3 className="filter-sidebar__title">Filters</h3>
        {hasActiveFilters && (
          <button className="filter-sidebar__clear" onClick={handleClear}>Clear all</button>
        )}
      </div>

      <div className="filter-group">
        <label className="filter-group__label" htmlFor="animal-type-filter">Animal Type</label>
        <select id="animal-type-filter" name="animal_type" value={filters.animal_type} onChange={handleFilterChange} className="filter-group__select">
          <option value="">All types</option>
          {animalTypes.map((type) => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-group__label" htmlFor="breed-filter">Breed</label>
        <select id="breed-filter" name="breed" value={filters.breed} onChange={handleFilterChange} className="filter-group__select">
          <option value="">All breeds</option>
          {breeds.map((breed) => (
            <option key={breed.id} value={breed.id}>{breed.name}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-group__label" htmlFor="age-filter">Max Age (months)</label>
        <select id="age-filter" name="age" value={filters.age} onChange={handleFilterChange} className="filter-group__select">
          <option value="">Any age</option>
          <option value="6">Up to 6 months</option>
          <option value="12">Up to 12 months</option>
          <option value="24">Up to 24 months</option>
          <option value="36">Up to 36 months</option>
          <option value="60">Up to 60 months</option>
        </select>
      </div>

    </aside>
  )
}

export default FilterSidebar
