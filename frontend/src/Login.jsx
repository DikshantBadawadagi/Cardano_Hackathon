// import { useEffect, useState } from 'react'
// import { useLocation, useNavigate, Link } from 'react-router-dom'
// import { Input } from '@/components/ui/input'
// import { Button } from '@/components/ui/button'

// export default function Login() {
//   const navigate = useNavigate()
//   const location = useLocation()
//   const [email, setEmail] = useState('')
//   const [name, setName] = useState('')
//   const [password, setPassword] = useState('')

//   useEffect(() => {
//     if (location.state?.email) setEmail(location.state.email)
//     if (location.state?.name) setName(location.state.name)
//   }, [location.state])

//   const onSubmit = (e) => {
//     e.preventDefault()
//     console.log('Login submit:', { name, email, password })
//     navigate('/dashboard', { 
//       replace: true, 
//       state: { email, name } 
//     })
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
//       <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
//         <h1 className="text-2xl font-semibold text-white mb-1">Welcome back</h1>
//         <p className="text-gray-400 mb-6">Log in to continue</p>

//         <form onSubmit={onSubmit} className="space-y-4">
//           <div>
//             <label className="block mb-1 text-sm text-gray-300">Email</label>
//             <Input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="you@example.com"
//               className="text-white placeholder:text-gray-400"
//               required
//             />
//           </div>
//           <div>
//             <label className="block mb-1 text-sm text-gray-300">Name</label>
//             <Input
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder="Your name"
//               className="text-white placeholder:text-gray-400"
//               required
//             />
//           </div>
//           <div>
//             <label className="block mb-1 text-sm text-gray-300">Password</label>
//             <Input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="••••••••"
//               className="text-white placeholder:text-gray-400"
//               required
//             />
//           </div>
//           <Button className="w-full" type="submit">Log in</Button>
//         </form>

//         <p className="text-sm text-gray-400 mt-4 text-center">
//           New here?{' '}
//           <Link className="text-blue-400 hover:underline" to="/signup">Create an account</Link>
//         </p>
//       </div>
//     </div>
//   )
// }


import { useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { loginUser } from './utils/api'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (location.state?.email) setEmail(location.state.email)
    if (location.state?.name) setName(location.state.name)
  }, [location.state])

  const onSubmit = (e) => {
    e.preventDefault()
    console.log('Login submit:', { email })
    loginUser({ email, password })
      .then(() => {
        navigate('/dashboard', { replace: true, state: { email, name } })
      })
      .catch(err => {
        alert('Login failed: ' + (err.message || err))
      })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-semibold text-white mb-1">Welcome back</h1>
        <p className="text-gray-400 mb-6">Log in to continue</p>

        <form onSubmit={onSubmit} className="space-y-4">
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
          <Button className="w-full" type="submit">Log in</Button>
        </form>

        <p className="text-sm text-gray-400 mt-4 text-center">
          New here?{' '}
          <Link className="text-blue-400 hover:underline" to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  )
}