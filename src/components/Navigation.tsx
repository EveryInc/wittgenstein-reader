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
    return propositions.filter((prop, index) => {
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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleClose}
          />
          
          {/* Navigation panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 max-h-[85vh] flex flex-col shadow-2xl"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">
                  Go to Proposition
                </h3>
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
              
              {showSearch && (
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search propositions..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {filteredIndices.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No propositions found matching "{searchTerm}"
                </p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {filteredIndices.map((originalIndex) => {
                    const prop = propositions[originalIndex]
                    return (
                      <button
                        key={originalIndex}
                        onClick={() => {
                          onSelect(originalIndex)
                          handleClose()
                        }}
                        className={`
                          p-3 rounded-lg text-sm font-medium transition-colors
                          ${originalIndex === currentIndex 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }
                        `}
                      >
                        {prop.number}
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