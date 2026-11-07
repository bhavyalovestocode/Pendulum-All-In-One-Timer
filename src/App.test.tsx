import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('Pendulum foundation', () => {
  beforeEach(() => localStorage.clear())

  it('opens the workspace from the landing page', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /enter your workspace/i }))
    expect(screen.getByText('A clear place to begin.')).toBeInTheDocument()
    expect(screen.getByText('Begin session')).toBeInTheDocument()
  })

  it('starts and pauses the focus timer', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /enter your workspace/i }))
    fireEvent.click(screen.getByRole('button', { name: /begin session/i }))
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /pause/i }))
    expect(screen.getByRole('button', { name: /begin session/i })).toBeInTheDocument()
  })

  it('adds and completes a task', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /enter your workspace/i }))
    const input = screen.getByPlaceholderText(/add a task to your day/i)
    fireEvent.change(input, { target: { value: 'Plan the launch' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getByText('Plan the launch')).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: /complete task/i }).at(-1)!)
    expect(screen.getByText('Plan the launch')).toHaveClass('task-title')
  })

  it('resets persisted data from settings', async () => {
    localStorage.setItem('pendulum-state-v2', JSON.stringify({ tasks: [] }))
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /enter your workspace/i }))
    fireEvent.click(screen.getByRole('button', { name: /settings/i }))
    fireEvent.click(screen.getByRole('button', { name: /reset local data/i }))
    expect(await screen.findByText('Local data reset')).toBeInTheDocument()
  })
})
