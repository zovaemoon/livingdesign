import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth.js'
import { signOut } from '../services/index.js'
import { SITE_NAME } from '../config.js'
import Avatar from './Avatar.jsx'

function navClass({ isActive }) {
  return `text-sm transition-colors hover:text-stone-900 ${isActive ? 'text-stone-900 font-medium' : 'text-stone-500'}`
}

export default function Navbar() {
  const { user, loading, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <header className="border-b border-stone-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8" aria-label="주요 메뉴">
        <Link to="/" className="text-base font-semibold tracking-tight text-stone-900 sm:text-lg">
          {SITE_NAME}
        </Link>
        <div className="flex items-center gap-5 sm:gap-7">
          <NavLink to="/" end className={navClass}>
            홈
          </NavLink>
          <NavLink to="/courses" className={navClass}>
            수업
          </NavLink>
          {loading ? (
            <span className="h-7 w-7 rounded-full bg-stone-100" aria-hidden="true" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2" title={user.email}>
                <Avatar name={user.displayName} photoURL={user.photoURL} />
                <span className="hidden text-sm text-stone-600 md:inline">
                  {user.displayName}
                  {isAdmin && <span className="ml-1 text-xs text-accent">교수</span>}
                </span>
              </span>
              <button type="button" onClick={handleSignOut} className="text-sm text-stone-500 hover:text-stone-900">
                로그아웃
              </button>
            </div>
          ) : (
            <NavLink to="/login" className={navClass}>
              로그인
            </NavLink>
          )}
        </div>
      </nav>
      {error && (
        <p className="px-5 pb-2 text-right text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </header>
  )
}
