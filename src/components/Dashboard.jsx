// src/components/Dashboard.jsx
import { useState, useEffect } from "react"
import { auth, db } from "./firebase"
import { collection, addDoc, doc, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore"
import { signOut } from "firebase/auth"

export default function Dashboard() {
  const [subjects, setSubjects] = useState([])
  const [newSubject, setNewSubject] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const user = auth.currentUser

  useEffect(() => {
    if (!user) return

    const unsub = onSnapshot(
      collection(db, "users", user.uid, "subjects"),
      (snap) => {
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setSubjects(data)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching subjects:", error)
        setError("Failed to load subjects")
        setLoading(false)
      }
    )
    return () => unsub()
  }, [user])

  const addSubject = async () => {
    if (!newSubject.trim()) return
    
    try {
      await addDoc(collection(db, "users", user.uid, "subjects"), {
        name: newSubject.trim(),
        topics: [],
        createdAt: new Date()
      })
      setNewSubject("")
    } catch (error) {
      console.error("Error adding subject:", error)
      setError("Failed to add subject")
    }
  }

  const addTopic = async (subjectId, topic) => {
    if (!topic.trim()) return

    try {
      const subRef = doc(db, "users", user.uid, "subjects", subjectId)
      const subject = subjects.find((s) => s.id === subjectId)
      const updatedTopics = [...subject.topics, { 
        name: topic.trim(), 
        done: false, 
        createdAt: new Date() 
      }]
      await updateDoc(subRef, { topics: updatedTopics })
    } catch (error) {
      console.error("Error adding topic:", error)
      setError("Failed to add topic")
    }
  }

  const toggleTopic = async (subjectId, tIndex) => {
    try {
      const subRef = doc(db, "users", user.uid, "subjects", subjectId)
      const subject = subjects.find((s) => s.id === subjectId)
      const updated = [...subject.topics]
      updated[tIndex].done = !updated[tIndex].done
      await updateDoc(subRef, { topics: updated })
    } catch (error) {
      console.error("Error updating topic:", error)
      setError("Failed to update topic")
    }
  }

  const deleteTopic = async (subjectId, tIndex) => {
    try {
      const subRef = doc(db, "users", user.uid, "subjects", subjectId)
      const subject = subjects.find((s) => s.id === subjectId)
      const updated = [...subject.topics]
      updated.splice(tIndex, 1)
      await updateDoc(subRef, { topics: updated })
    } catch (error) {
      console.error("Error deleting topic:", error)
      setError("Failed to delete topic")
    }
  }

  const deleteSubject = async (subjectId) => {
    if (!window.confirm("Are you sure you want to delete this subject and all its topics?")) {
      return
    }

    try {
      await deleteDoc(doc(db, "users", user.uid, "subjects", subjectId))
    } catch (error) {
      console.error("Error deleting subject:", error)
      setError("Failed to delete subject")
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
      setError("Failed to sign out")
    }
  }

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your study tracker...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                📚 Study Tracker
              </h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <span>🚪</span>
              Logout
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button 
                onClick={() => setError("")}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Add Subject Section */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Subject</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter subject name (e.g., Mathematics, Physics)"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, addSubject)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={addSubject}
              disabled={!newSubject.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
            >
              Add Subject
            </button>
          </div>
        </div>

        {/* Subjects List */}
        {subjects.length === 0 ? (
          <div className="bg-white shadow-lg rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No subjects yet</h3>
            <p className="text-gray-600">Add your first subject to start tracking your study progress!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onAddTopic={addTopic}
                onToggleTopic={toggleTopic}
                onDeleteTopic={deleteTopic}
                onDeleteSubject={deleteSubject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SubjectCard({ subject, onAddTopic, onToggleTopic, onDeleteTopic, onDeleteSubject }) {
  const completedTopics = subject.topics.filter(topic => topic.done).length
  const totalTopics = subject.topics.length
  const progressPercentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0

  return (
    <div className="bg-white shadow-lg rounded-xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{subject.name}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>📊 Progress: {completedTopics}/{totalTopics} topics</span>
            {totalTopics > 0 && (
              <span className="text-indigo-600 font-medium">
                {Math.round(progressPercentage)}% complete
              </span>
            )}
          </div>
          {totalTopics > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          )}
        </div>
        <button
          onClick={() => onDeleteSubject(subject.id)}
          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
          title="Delete Subject"
        >
          🗑️
        </button>
      </div>

      {/* Topics List */}
      {subject.topics.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-3">Topics:</h4>
          <div className="space-y-2">
            {subject.topics.map((topic, i) => (
              <div
                key={i}
                className={`flex justify-between items-center p-3 rounded-lg border transition-colors duration-200 ${
                  topic.done 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={topic.done}
                    onChange={() => onToggleTopic(subject.id, i)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className={`${
                    topic.done 
                      ? "line-through text-gray-500" 
                      : "text-gray-800"
                  } transition-colors duration-200`}>
                    {topic.name}
                  </span>
                  {topic.done && <span className="text-green-600">✓</span>}
                </label>
                <button
                  onClick={() => onDeleteTopic(subject.id, i)}
                  className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors duration-200"
                  title="Delete Topic"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Topic Input */}
      <AddTopicInput onAdd={(topic) => onAddTopic(subject.id, topic)} />
    </div>
  )
}

function AddTopicInput({ onAdd }) {
  const [text, setText] = useState("")

  const handleAdd = () => {
    if (text.trim()) {
      onAdd(text)
      setText("")
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAdd()
    }
  }

  return (
    <div className="border-t pt-4">
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Add a new topic..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          onClick={handleAdd}
          disabled={!text.trim()}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
        >
          Add Topic
        </button>
      </div>
    </div>
  )
}
