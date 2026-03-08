import React, { useState, useRef, useMemo, useEffect } from 'react'
import TinderCard from 'react-tinder-card'
import JobCard from './JobCard'
import { X, Heart, Briefcase } from 'lucide-react'

const SwipeContainer = ({ jobs, onSwipeLeft, onSwipeRight, loading }) => {
  const [currentIndex, setCurrentIndex] = useState(jobs.length - 1)
  const currentIndexRef = useRef(currentIndex)

  const childRefs = useMemo(
    () => Array(jobs.length).fill(0).map(() => React.createRef()),
    [jobs.length]
  )

  const updateCurrentIndex = (val) => {
    setCurrentIndex(val)
    currentIndexRef.current = val
  }

  const canSwipe = currentIndex >= 0

  const swiped = (direction, job, index) => {
    updateCurrentIndex(index - 1)
    if (direction === 'left') {
      onSwipeLeft(job)
    } else if (direction === 'right') {
      onSwipeRight(job)
    }
  }

  const swipe = async (dir) => {
    if (canSwipe && currentIndex < jobs.length) {
      await childRefs[currentIndex].current.swipe(dir)
    }
  }

  useEffect(() => {
    updateCurrentIndex(jobs.length - 1)
  }, [jobs.length])

  if (loading) {
    return (
      <div className='flex items-center justify-center h-[500px]'>
        <div className='text-center'>
          <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-500 text-lg'>Finding jobs for you...</p>
        </div>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className='flex items-center justify-center h-[500px]'>
        <div className='text-center px-4'>
          <Briefcase className='size-16 text-gray-300 mx-auto mb-4' />
          <p className='text-gray-500 text-xl font-medium'>No more jobs to show</p>
          <p className='text-gray-400 mt-2'>Check back later or update your profile for better matches</p>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col items-center w-2xl'>
      {/* Card stack */}
      <div className='relative w-full max-w-lg h-[520px] sm:h-[600px]'>
        {jobs.map((job, index) => (
          <TinderCard
            ref={childRefs[index]}
            key={job._id}
            onSwipe={(dir) => swiped(dir, job, index)}
            preventSwipe={['up', 'down']}
            className='absolute w-full h-full'
          >
            <JobCard job={job} />
          </TinderCard>
        ))}

        {!canSwipe && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='text-center'>
              <p className='text-gray-400 text-lg'>No more jobs in this batch</p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className='flex items-center gap-6 mt-8'>
        <button
          onClick={() => swipe('left')}
          disabled={!canSwipe}
          className='w-16 h-16 rounded-full bg-white border-2 border-red-300 text-red-500 hover:bg-red-50 hover:border-red-400 flex items-center justify-center shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-90'
        >
          <X className='size-8' />
        </button>

        <button
          onClick={() => swipe('right')}
          disabled={!canSwipe}
          className='w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 flex items-center justify-center shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-90'
        >
          <Heart className='size-9' />
        </button>
      </div>

      {/* Hint text */}
      <p className='text-gray-400 text-xs mt-4'>
        Swipe right to apply, left to skip. Or use the buttons.
      </p>
    </div>
  )
}

export default SwipeContainer
