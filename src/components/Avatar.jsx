import { useState } from 'react'

const SIZES = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm' }

// 프로필 사진이 없거나 깨지면 이름 첫 글자를 보여 줍니다.
export default function Avatar({ name, photoURL, size = 'sm' }) {
  const [failed, setFailed] = useState(false)
  const sizeClass = SIZES[size] || SIZES.sm
  if (photoURL && !failed) {
    return (
      <img
        src={photoURL}
        alt={`${name || '사용자'} 프로필 사진`}
        className={`${sizeClass} shrink-0 rounded-full object-cover`}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    )
  }
  return (
    <span
      className={`${sizeClass} inline-flex shrink-0 items-center justify-center rounded-full bg-stone-200 font-medium text-stone-600`}
      aria-hidden="true"
    >
      {(name || '?').trim().charAt(0)}
    </span>
  )
}
