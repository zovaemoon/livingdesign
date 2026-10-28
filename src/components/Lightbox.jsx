import { useEffect, useRef } from 'react'
import ImageWithFallback from './ImageWithFallback.jsx'

// 이미지 크게 보기. Esc 로 닫고, 좌우 화살표로 넘깁니다.
export default function Lightbox({ images, index, alt, onClose, onChange }) {
  const closeRef = useRef(null)
  const count = images.length

  useEffect(() => {
    const previousFocus = document.activeElement
    closeRef.current?.focus()
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
      previousFocus?.focus?.()
    }
  }, [])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && count > 1) onChange((index + 1) % count)
      if (e.key === 'ArrowLeft' && count > 1) onChange((index - 1 + count) % count)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, count, onClose, onChange])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="이미지 크게 보기"
      onClick={onClose}
    >
      <div className="relative max-h-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
        <ImageWithFallback
          src={images[index]}
          alt={`${alt} (${index + 1}/${count})`}
          className="max-h-[85vh] max-w-full min-w-64 object-contain"
        />
        <p className="mt-3 text-center text-xs text-stone-400">
          {index + 1} / {count}
        </p>
      </div>
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 px-3 py-1 text-2xl text-white"
        aria-label="닫기"
      >
        ×
      </button>
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onChange((index - 1 + count) % count)
            }}
            className="absolute left-2 px-3 py-2 text-3xl text-white sm:left-6"
            aria-label="이전 이미지"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onChange((index + 1) % count)
            }}
            className="absolute right-2 px-3 py-2 text-3xl text-white sm:right-6"
            aria-label="다음 이미지"
          >
            ›
          </button>
        </>
      )}
    </div>
  )
}
