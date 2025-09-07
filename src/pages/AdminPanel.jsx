import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'

const AdminPanel = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState(null)
  const [title, setTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentImageId, setCurrentImageId] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  const navigate = useNavigate()

  useEffect(() => {
    // Check admin token
    const adminToken = localStorage.getItem('adminToken')
    if (!adminToken) {
      navigate('/admin')
      return
    }

    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/images`)
      setImages(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching images:', error)
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0])
  }

  const handleTitleChange = (e) => {
    setTitle(e.target.value)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    
    if (!selectedFile) {
      setMessage({ text: 'Please select a file', type: 'error' })
      return
    }

    if (!title.trim()) {
      setMessage({ text: 'Please enter a title', type: 'error' })
      return
    }

    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('title', title)
      
      const token = localStorage.getItem('adminToken')
      const response = await axios.post(`${API_BASE_URL}/api/images/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      
      const newImage = response.data
        
      setImages([...images, newImage])
      setSelectedFile(null)
      setTitle('')
      setUploading(false)
      setMessage({ text: 'Image uploaded successfully', type: 'success' })
      
      // Remove message after 3 seconds
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (error) {
      console.error('Error uploading image:', error)
      setUploading(false)
      setMessage({ text: 'Error uploading image', type: 'error' })
    }
  }

  const handleEdit = (image) => {
    setEditMode(true)
    setCurrentImageId(image._id)
    setTitle(image.title)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setMessage({ text: 'Please enter a title', type: 'error' })
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      await axios.put(`${API_BASE_URL}/api/images/${currentImageId}`, { title }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const updatedImages = images.map(img => 
        img._id === currentImageId ? { ...img, title: title } : img
      )
      
      setImages(updatedImages)
      setEditMode(false)
      setCurrentImageId(null)
      setTitle('')
      setMessage({ text: 'Image updated successfully', type: 'success' })
      
      // Remove message after 3 seconds
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (error) {
      console.error('Error updating image:', error)
      setMessage({ text: 'Error updating image', type: 'error' })
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return
    }
    
    try {
      const token = localStorage.getItem('adminToken')
      await axios.delete(`${API_BASE_URL}/api/images/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const filteredImages = images.filter(img => img._id !== id)
      setImages(filteredImages)
      setMessage({ text: 'Image deleted successfully', type: 'success' })
      
      // Remove message after 3 seconds
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (error) {
      console.error('Error deleting image:', error)
      setMessage({ text: 'Error deleting image', type: 'error' })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-56' : 'w-14'} bg-white/90 backdrop-blur-lg shadow-2xl border-r border-white/30 transition-all duration-300 flex flex-col h-screen overflow-hidden`}>
        {/* Sidebar Header */}
        <div className="p-3 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 ${!sidebarOpen && 'justify-center'}`}>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              {sidebarOpen && (
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                   Admin Panel
                 </h1>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className={`p-2 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 ${!sidebarOpen && 'justify-center'} flex items-center space-x-2`}>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            {sidebarOpen && (
              <div>
                <p className="text-sm font-semibold text-blue-700">Upload Images</p>
                 <p className="text-xs text-blue-600">Add new content</p>
              </div>
            )}
          </div>

          <div className={`p-2 rounded-xl hover:bg-gray-50 transition-colors duration-200 ${!sidebarOpen && 'justify-center'} flex items-center space-x-2 cursor-pointer`}>
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            {sidebarOpen && (
              <div>
                <p className="text-sm font-semibold text-gray-700">Manage Images</p>
                 <p className="text-xs text-gray-500">Edit & delete content</p>
              </div>
            )}
          </div>

          <div className={`p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 ${!sidebarOpen && 'justify-center'} flex items-center space-x-3 cursor-pointer`}>
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            {sidebarOpen && (
              <div>
                <p className="text-sm font-semibold text-gray-700">Analytics</p>
                 <p className="text-xs text-gray-500">View statistics</p>
              </div>
            )}
          </div>

          <div className={`p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 ${!sidebarOpen && 'justify-center'} flex items-center space-x-3 cursor-pointer`}>
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            {sidebarOpen && (
              <div>
                <p className="text-sm font-semibold text-gray-700">Settings</p>
                 <p className="text-xs text-gray-500">Configure panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-200/50 mt-auto">
          <button
            onClick={handleLogout}
            className={`w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl ${!sidebarOpen ? 'px-3' : 'px-6'} flex items-center ${sidebarOpen ? 'space-x-2' : 'justify-center'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Top Navigation */}
        <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 flex-shrink-0">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                  <span>Total Images:</span>
                  <span className="font-semibold text-blue-600">{images.length}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden md:block text-sm text-gray-500">
                  Welcome, Admin
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center shadow-lg backdrop-blur-sm ${
            message.type === 'success'
              ? 'bg-green-50/80 border border-green-200 text-green-700'
              : 'bg-red-50/80 border border-red-200 text-red-700'
          }`}>
            <svg className={`w-5 h-5 mr-3 ${
              message.type === 'success'
                ? 'text-green-500'
                : 'text-red-500'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {message.type === 'success' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl border border-white/20 mb-8">
          <div className="px-6 py-8 sm:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{editMode ? 'Edit Image' : 'Upload New Image'}</h2>
            </div>
            
            <form onSubmit={editMode ? handleUpdate : handleUpload} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="title">
                  Image Title
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={handleTitleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    placeholder="Enter image title"
                    required
                  />
                </div>
              </div>
              
              {!editMode && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="image">
                    Select Image
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="image"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-50 file:to-purple-50 file:text-blue-700 hover:file:from-blue-100 hover:file:to-purple-100 file:transition-all file:duration-300 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                      accept="image/*"
                      required
                    />
                  </div>
                </div>
              )}
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className={`flex-1 inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-lg text-sm font-semibold rounded-xl text-white ${editMode ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-300 hover:scale-105`}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editMode ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"} />
                      </svg>
                      {editMode ? 'Update Image' : 'Upload Image'}
                    </>
                  )}
                </button>
                
                {editMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false)
                      setCurrentImageId(null)
                      setTitle('')
                    }}
                    className="inline-flex justify-center items-center py-3 px-6 border border-gray-300 shadow-sm text-sm font-semibold rounded-xl text-gray-700 bg-white/70 backdrop-blur-sm hover:bg-white/90 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300 hover:scale-105"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl border border-white/20">
          <div className="px-6 py-8 sm:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Manage Images</h2>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                <p className="mt-4 text-lg font-medium text-gray-600">Loading images...</p>
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xl font-medium text-gray-600 mb-2">No images found</p>
                <p className="text-gray-500">Upload your first image to get started!</p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Image</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {images.map((image, index) => (
                        <tr key={image._id} className="hover:bg-gray-50/50 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <div className="relative group">
                              <img 
                                src={image.url} 
                                alt={image.title} 
                                className="h-20 w-20 object-cover rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 border-2 border-white"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-all duration-300"></div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-gray-900">{image.title}</div>
                            <div className="text-xs text-gray-500 mt-1">Image #{index + 1}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleEdit(image)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 hover:scale-105"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(image._id)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 hover:scale-105"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel