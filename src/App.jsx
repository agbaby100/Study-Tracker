// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./components/Login"
import Register from "./components/Register"
import Dashboard from "./components/Dashboard"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "./components/firebase"

function App() {
  const [user, loading] = useAuthState(auth)

  if (loading) return <p className="text-center mt-10">Loading...</p>

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App
