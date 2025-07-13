import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Proposition {
  number: string
  text: string
}

interface NavigationProps {
  isOpen: boolean
  onClose: () => void
  propositions: Proposition[]
  currentIndex: number
  onSelect: (index: number) => void
}

export default function Navigation({ 
  isOpen, 
  onClose, 
  propositions, 
  currentIndex, 
  onSelect 
}: NavigationProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  // Filter propositions based on search term
  const filteredPropositions = useMemo(() => {
    if (!searchTerm) return propositions

    const term = searchTerm.toLowerCase()
    return propositions.filter((prop) => {
      // Search in proposition number
      if (prop.number.includes(searchTerm)) return true
      
      // Search in proposition text
      if (prop.text.toLowerCase().includes(term)) return true
      
      return false
    })
  }, [propositions, searchTerm])

  // Get indices of filtered propositions in the original array
  const filteredIndices = useMemo(() => {
    if (!searchTerm) return propositions.map((_, i) => i)
    
    return filteredPropositions.map(prop => 
      propositions.findIndex(p => p.number === prop.number && p.text === prop.text)
    )
  }, [propositions, filteredPropositions, searchTerm])

  const handleClose = () => {
    setSearchTerm('')
    setShowSearch(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleClose}
          />
          
          {/* Navigation panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 500 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[70vh] sm:max-h-[80vh] flex flex-col shadow-xl safe-bottom border-t border-gray-100"
            style={{ backgroundColor: 'white' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-1" />
            
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Jump to Proposition
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowSearch(!showSearch)}
                    className={`p-2.5 rounded-full transition-all ${
                      showSearch 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-label="Search"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleClose}
                    className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-all"
                    aria-label="Close"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {showSearch && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search propositions..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    autoFocus
                  />
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 pb-6">
              {filteredIndices.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.006-5.7-2.536M15 17.5v.01M9 17.5v.01M12 17.5v.01" />
                  </svg>
                  <p className="text-gray-500 text-sm">
                    No propositions found matching "{searchTerm}"
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {filteredIndices.map((originalIndex) => {
                    const prop = propositions[originalIndex]
                    const isSelected = originalIndex === currentIndex
                    return (
                      <button
                        key={originalIndex}
                        onClick={() => {
                          onSelect(originalIndex)
                          handleClose()
                        }}
                        className={`
                          relative py-3 px-2 rounded-xl text-sm font-medium transition-all active:scale-95
                          ${isSelected
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/50'
                          }
                        `}
                      >
                        {prop.number}
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
              
              {searchTerm && filteredIndices.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    Text matches:
                  </h4>
                  {filteredIndices.slice(0, 5).map((originalIndex) => {
                    const prop = propositions[originalIndex]
                    const excerpt = getExcerpt(prop.text, searchTerm)
                    return (
                      <button
                        key={originalIndex}
                        onClick={() => {
                          onSelect(originalIndex)
                          handleClose()
                        }}
                        className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="font-medium text-sm">
                          Proposition {prop.number}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {excerpt}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function getExcerpt(text: string, searchTerm: string): string {
  const index = text.toLowerCase().indexOf(searchTerm.toLowerCase())
  if (index === -1) return text.substring(0, 100) + '...'
  
  const start = Math.max(0, index - 40)
  const end = Math.min(text.length, index + searchTerm.length + 40)
  
  let excerpt = text.substring(start, end)
  if (start > 0) excerpt = '...' + excerpt
  if (end < text.length) excerpt = excerpt + '...'
  
  return excerpt
}