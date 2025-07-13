import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import propositionsData from './data/propositions.json'
import explanationsData from './data/comprehensive_explanations_full.json'
import Navigation from './components/Navigation'

interface Proposition {
  number: string
  text: string
  explanation: string
  section: string
}


function App() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showNavigation, setShowNavigation] = useState(false)
  const forceTouchTriggered = useRef(false)
  
  const propositions = propositionsData as Proposition[]
  const explanations = explanationsData as Record<string, {brief: string, comprehensive: string}>
  
  // Merge explanations into propositions
  const propositionsWithExplanations = propositions.map(prop => {
    const explanation = explanations[prop.number]
    return {
      ...prop,
      brief: explanation?.brief || '',
      comprehensive: explanation?.comprehensive || ''
    }
  })
  
  const currentProposition = propositionsWithExplanations[currentIndex]

  // Handle force touch for navigation
  const handleTouchStart = () => {
    forceTouchTriggered.current = false
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (forceTouchTriggered.current) return
    
    const touch = e.touches[0] as any // Force touch is not in TypeScript Touch interface yet
    // Force touch detection - force value is between 0 and 1
    // Values > 0.5 typically indicate a force touch
    if (touch.force && touch.force > 0.5) {
      forceTouchTriggered.current = true
      setShowNavigation(true)
      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }
  }

  const handleTouchEnd = () => {
    forceTouchTriggered.current = false
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
      } else if (e.key === 'ArrowRight' && currentIndex < propositions.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else if (e.key === ' ') {
        e.preventDefault()
        setShowNavigation(true)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentIndex, propositions.length])

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'white' }}>
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 z-10 flex-shrink-0" style={{ backgroundColor: 'white' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-lg font-medium text-gray-900">
              Philosophical Investigations
            </h1>
            <button
              onClick={() => setShowNavigation(true)}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {currentIndex + 1} / {propositions.length}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main 
        className="flex-1 flex flex-col overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-full">
          {/* Proposition Number and Navigation */}
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <h2 className="text-4xl font-bold text-gray-900">
              §{currentProposition.number}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentIndex(Math.min(propositions.length - 1, currentIndex + 1))}
                disabled={currentIndex === propositions.length - 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>

          {/* Side by Side Content */}
          <div className="grid grid-cols-2 gap-4 md:gap-8 flex-1 overflow-hidden">
            {/* Left: Original Text */}
            <div className="flex flex-col h-full">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Original Text
              </h3>
              <div className="prose prose-sm md:prose-lg max-w-none overflow-y-auto flex-1 pr-2 md:pr-4">
                <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {currentProposition.text}
                </p>
              </div>
            </div>

            {/* Right: Explanation */}
            <div className="flex flex-col h-full">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Explanation
              </h3>
              <div className="overflow-y-auto flex-1 pr-2 md:pr-4">
                {currentProposition.brief && (
                  <div className="mb-4 md:mb-6 p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm md:text-base text-gray-800 leading-relaxed">
                      {currentProposition.brief}
                    </p>
                  </div>
                )}
                {currentProposition.comprehensive && (
                  <div className="prose prose-sm md:prose-lg max-w-none">
                    <ReactMarkdown
                      components={{
                        strong: ({children}) => (
                          <strong className="font-semibold text-gray-900 block mt-6 mb-2">
                            {children}
                          </strong>
                        ),
                        p: ({children}) => (
                          <p className="text-gray-700 leading-relaxed mb-4">
                            {children}
                          </p>
                        ),
                      }}
                    >
                      {currentProposition.comprehensive}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Help text */}
          <div className="mt-6 text-center text-sm text-gray-500 flex-shrink-0">
            <p className="hidden sm:block">Use arrow keys to navigate • Press space for proposition list</p>
            <p className="sm:hidden">Force touch for proposition list or tap counter above</p>
          </div>
        </div>
      </main>

      {/* Navigation Overlay */}
      <Navigation
        isOpen={showNavigation}
        onClose={() => setShowNavigation(false)}
        propositions={propositions}
        currentIndex={currentIndex}
        onSelect={setCurrentIndex}
      />
    </div>
  )
}

export default App