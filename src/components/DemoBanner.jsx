import { isDemoMode } from '../services/index.js'

export default function DemoBanner() {
  if (!isDemoMode) return null
  return (
    <div className="bg-stone-100 px-4 py-1.5 text-center text-xs text-stone-600" role="note">
      데모 모드 – 데이터는 이 브라우저에만 저장됩니다
    </div>
  )
}
