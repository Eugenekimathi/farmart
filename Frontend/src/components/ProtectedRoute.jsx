import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, role }) => {
  const { user, token } = useSelector((state) => state.auth)

  if (!user || !token) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role !== role) {
    return <Navigate to="/store" replace />
  }

  return children
}

export default ProtectedRoute
