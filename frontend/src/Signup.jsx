import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { registerUser } from './utils/api'

export default function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const onSubmit = (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    registerUser({ name, email, password })
      .then(() => {
        // go to login and prefill
        navigate('/login', { replace: true, state: { email, name } })
      })
      .catch(err => {
        alert('Signup failed: ' + (err.message || err))
      })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-semibold text-white mb-1">Create account</h1>
        <p className="text-gray-400 mb-6">Sign up to continue</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm text-gray-300">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="text-white placeholder:text-gray-400"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-300">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="text-white placeholder:text-gray-400"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-300">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="text-white placeholder:text-gray-400"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-300">Confirm password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="text-white placeholder:text-gray-400"
              required
            />
          </div>
          <Button className="w-full" type="submit">Sign up</Button>
        </form>

        <p className="text-sm text-gray-400 mt-4 text-center">
          Already have an account?{' '}
          <Link className="text-blue-400 hover:underline" to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}


