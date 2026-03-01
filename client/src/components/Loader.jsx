import React, { useState, useEffect, useCallback } from 'react'
import { ServerCrash, Gamepad2 } from 'lucide-react'

const WINNING_COMBOS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
]

const MAX_PIECES = 3

const checkWinner = (board) => {
  for (const [a,b,c] of WINNING_COMBOS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a]
  }
  return null
}

const simulateMove = (board, xMoves, oMoves, cell, player) => {
  const next = [...board]
  const moves = player === 'X' ? [...xMoves] : [...oMoves]
  next[cell] = player
  moves.push(cell)
  if (moves.length > MAX_PIECES) {
    const removed = moves.shift()
    if (next[removed] === player) next[removed] = null
  }
  return { board: next, moves }
}

const getBotMove = (board, xMoves, oMoves) => {
  const empty = []
  for (let i = 0; i < 9; i++) {
    if (!board[i]) empty.push(i)
  }

  // Try to win
  for (const i of empty) {
    const { board: test } = simulateMove(board, xMoves, oMoves, i, 'O')
    if (checkWinner(test) === 'O') return i
  }
  // Try to block
  for (const i of empty) {
    const { board: test } = simulateMove(board, xMoves, oMoves, i, 'X')
    if (checkWinner(test) === 'X') return i
  }
  // Prefer center, corners, edges
  const preferred = [4, 0, 2, 6, 8, 1, 3, 5, 7]
  return preferred.find(i => !board[i])
}

export const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [xMoves, setXMoves] = useState([])
  const [oMoves, setOMoves] = useState([])
  const [score, setScore] = useState({ you: 0, bot: 0 })
  const result = checkWinner(board)

  const handleClick = useCallback((i) => {
    if (board[i] || result) return

    // Player move
    const { board: afterX, moves: newXMoves } = simulateMove(board, xMoves, oMoves, i, 'X')
    const winAfterX = checkWinner(afterX)

    if (winAfterX) {
      setBoard(afterX)
      setXMoves(newXMoves)
      return
    }

    // Bot move
    const botIdx = getBotMove(afterX, newXMoves, oMoves)
    if (botIdx === undefined) {
      setBoard(afterX)
      setXMoves(newXMoves)
      return
    }

    const { board: afterO, moves: newOMoves } = simulateMove(afterX, newXMoves, oMoves, botIdx, 'O')
    setBoard(afterO)
    setXMoves(newXMoves)
    setOMoves(newOMoves)
  }, [board, xMoves, oMoves, result])

  useEffect(() => {
    if (!result) return
    if (result === 'X') setScore(s => ({ ...s, you: s.you + 1 }))
    else if (result === 'O') setScore(s => ({ ...s, bot: s.bot + 1 }))
  }, [result])

  const reset = () => {
    setBoard(Array(9).fill(null))
    setXMoves([])
    setOMoves([])
  }

  // The oldest piece that will vanish on next move
  const xFading = xMoves.length >= MAX_PIECES ? xMoves[0] : null
  const oFading = oMoves.length >= MAX_PIECES ? oMoves[0] : null

  return (
    <div className='flex flex-col items-center gap-3'>
      <div className='flex items-center gap-2 text-gray-600 text-sm font-medium'>
        <Gamepad2 className='size-4' />
        <span>Play while you wait!</span>
      </div>
      <div className='flex gap-4 text-xs text-gray-500'>
        <span>You (X): {score.you}</span>
        <span>Bot (O): {score.bot}</span>
      </div>
      <p className='text-[11px] text-gray-400 max-w-[200px] text-center'>
        Each player can only have 3 pieces — oldest one vanishes!
      </p>
      <div className='grid grid-cols-3 gap-1.5'>
        {board.map((cell, i) => {
          const isFading = (cell === 'X' && i === xFading) || (cell === 'O' && i === oFading)
          return (
            <button
              key={i}
              onClick={() => handleClick(i)}
              className={`size-14 rounded-lg text-xl font-bold transition-all duration-150
                ${cell ? 'cursor-default' : 'cursor-pointer hover:bg-gray-100 active:scale-95'}
                ${cell === 'X' && !isFading ? 'text-blue-600 bg-blue-50 border-2 border-blue-200' : ''}
                ${cell === 'X' && isFading ? 'text-blue-300 bg-blue-50/50 border-2 border-blue-100 border-dashed' : ''}
                ${cell === 'O' && !isFading ? 'text-red-500 bg-red-50 border-2 border-red-200' : ''}
                ${cell === 'O' && isFading ? 'text-red-300 bg-red-50/50 border-2 border-red-100 border-dashed' : ''}
                ${!cell ? 'bg-white border-2 border-gray-200' : ''}`}
            >
              {cell}
            </button>
          )
        })}
      </div>
      {result && (
        <div className='flex flex-col items-center gap-2'>
          <span className='text-sm font-medium text-gray-700'>
            {result === 'X' ? 'You win!' : 'Bot wins!'}
          </span>
          <button
            onClick={reset}
            className='text-sm px-4 py-1.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 active:scale-95 transition-all cursor-pointer'
          >
            Play again
          </button>
        </div>
      )}
    </div>
  )
}

const Loader = () => {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 3000)
    const t2 = setTimeout(() => setPhase(2), 60000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className='flex flex-col items-center justify-center h-screen gap-5 px-4'>
      <div className='size-12 border-3 border-gray-400 border-t-transparent rounded-full animate-spin'></div>

      {phase >= 1 && (
        <div className='flex items-center gap-2 text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 animate-pulse'>
          <ServerCrash className='size-4 shrink-0' />
          <span className='text-sm'>Server is waking up — free server takes a moment to start, please wait...</span>
        </div>
      )}

      {phase >= 2 && (
        <div className='text-center space-y-1'>
          <p className='text-sm text-gray-600'>
            This app runs on a <span className='font-semibold'>free server</span> that goes to sleep after inactivity.
            Cold starts can take up to 2 minutes.
          </p>
          <p className='text-xs text-gray-400'>
            The app is not frozen — it's still waiting for the server to respond.
          </p>
        </div>
      )}

      <TicTacToe />
    </div>
  )
}

export default Loader
