import { createContext, createElement, useContext, useEffect, useState } from 'react'
import { onAuthChange } from '../services/index.js'

const AuthContext = createContext({ user: null, loading: true, isAdmin: false })

// 로그인 상태를 앱 전체에 공유합니다. (.js 파일이라 JSX 대신 createElement 사용)
export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, loading: true })

  useEffect(() => onAuthChange((user) => setState({ user, loading: false })), [])

  const value = { ...state, isAdmin: Boolean(state.user?.isAdmin) }
  return createElement(AuthContext.Provider, { value }, children)
}

export function useAuth() {
  return useContext(AuthContext)
}
