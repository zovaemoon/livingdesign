import { Outlet, ScrollRestoration } from 'react-router'
import Navbar from './Navbar.jsx'
import DemoBanner from './DemoBanner.jsx'
import { CONTACT_TEXT, SITE_NAME } from '../config.js'

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-3 focus:py-2">
        본문으로 바로가기
      </a>
      <DemoBanner />
      <Navbar />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
        <Outlet />
      </main>
      <footer className="border-t border-stone-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-8 text-xs text-stone-500 sm:flex-row sm:justify-between sm:px-8">
          <span>© {new Date().getFullYear()} {SITE_NAME}</span>
          <span>{CONTACT_TEXT}</span>
        </div>
      </footer>
      <ScrollRestoration />
    </div>
  )
}
