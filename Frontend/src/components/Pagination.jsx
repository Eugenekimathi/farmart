import { useDispatch, useSelector } from 'react-redux'
import { setPage } from '../features/animals/animalsSlice'

const Pagination = () => {
  const dispatch = useDispatch()
  const { currentPage, totalPages } = useSelector((state) => state.animals.pagination)

  if (totalPages <= 1) return null

  const handlePrev = () => {
    if (currentPage > 1) dispatch(setPage(currentPage - 1))
  }

  const handleNext = () => {
    if (currentPage < totalPages) dispatch(setPage(currentPage + 1))
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="pagination">
      <button className="pagination__btn" onClick={handlePrev} disabled={currentPage === 1}>← Prev</button>

      {pages.map((page) => (
        <button key={page} className={`pagination__btn ${page === currentPage ? 'pagination__btn--active' : ''}`} onClick={() => dispatch(setPage(page))}>
          {page}
        </button>
      ))}

      <button className="pagination__btn" onClick={handleNext} disabled={currentPage === totalPages}>Next →</button>
    </div>
  )
}

export default Pagination
