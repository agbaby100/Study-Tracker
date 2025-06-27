// src/components/Login.jsx
import { useState } from "react"
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"
import { auth } from "./firebase"
import { Link, useNavigate } from "react-router-dom"

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError("")
    if (resetEmailSent) setResetEmailSent(false)
  }

  const validateForm = () => {
    const { email, password } = formData

    if (!email.trim()) {
      setError("Email is required")
      return false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address")
      return false
    }

    if (!password) {
      setError("Password is required")
      return false
    }

    return true
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError("")

    try {
      await signInWithEmailAndPassword(auth, formData.email.trim(), formData.password)
      navigate("/")
    } catch (error) {
      console.error("Login error:", error)
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/user-not-found':
          setError("No account found with this email address")
          break
        case 'auth/wrong-password':
          setError("Incorrect password. Please try again")
          break
        case 'auth/invalid-email':
          setError("Invalid email address")
          break
        case 'auth/user-disabled':
          setError("This account has been disabled")
          break
        case 'auth/too-many-requests':
          setError("Too many failed attempts. Please try again later")
          break
        case 'auth/network-request-failed':
          setError("Network error. Please check your connection")
          break
        default:
          setError("Failed to sign in. Please try again")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      setError("Please enter your email address first")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsResettingPassword(true)
    setError("")

    try {
      await sendPasswordResetEmail(auth, formData.email.trim())
      setResetEmailSent(true)
    } catch (error) {
      console.error("Password reset error:", error)
      
      switch (error.code) {
        case 'auth/user-not-found':
          setError("No account found with this email address")
          break
        case 'auth/invalid-email':
          setError("Invalid email address")
          break
        case 'auth/too-many-requests':
          setError("Too many requests. Please try again later")
          break
        default:
          setError("Failed to send reset email. Please try again")
      }
    } finally {
      setIsResettingPassword(false)
    }
  }

  const { email, password } = formData

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">📚</div>
          <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to continue your learning journey</p>
        </div>

        {/* Success Message for Password Reset */}
        {resetEmailSent && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <span className="text-green-500">✅</span>
            <div className="text-sm">
              <p className="font-medium">Password reset email sent!</p>
              <p>Check your inbox and follow the instructions to reset your password.</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={handleInputChange}
              placeholder="Enter your email address"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
              disabled={loading || isResettingPassword}
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                disabled={loading || isResettingPassword}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={loading || isResettingPassword}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading || isResettingPassword}
              className="text-sm text-indigo-600 hover:text-indigo-700 disabled:text-gray-400 transition-colors duration-200"
            >
              {isResettingPassword ? (
                <span className="flex items-center gap-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-indigo-600"></div>
                  Sending...
                </span>
              ) : (
                "Forgot your password?"
              )}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || isResettingPassword}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Signing In...
              </>
            ) : (
              <>
                <span>🔐</span>
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link 
              to="/register" 
              className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors duration-200"
            >
              Create one here
            </Link>
          </p>
        </div>

        

        {/* Features Preview */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-indigo-500">📊</span>
              <span>Track Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-indigo-500">☁️</span>
              <span>Cloud Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-indigo-500">📱</span>
              <span>Mobile Friendly</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-indigo-500">🔒</span>
              <span>Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
