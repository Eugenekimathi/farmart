import { useNavigate } from "react-router-dom"

const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "70vh",
      gap: "1rem",
      textAlign: "center",
      padding: "2rem"
    }}>
      <h1 style={{ fontSize: "4rem", fontWeight: 900, color: "#e0e0e0" }}>404</h1>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Page Not Found</h2>
      <p style={{ color: "#666", fontSize: "0.9rem" }}>
        The page you are looking for does not exist.
      </p>
      <button
        className="btn btn--primary"
        onClick={() => navigate("/")}
      >
        Go Home
      </button>
    </div>
  )
}

export default NotFoundPage
