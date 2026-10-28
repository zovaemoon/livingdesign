import { useState } from 'react'

// 외부 이미지가 깨졌을 때 회색 안내 상자를 대신 보여 줍니다.
export default function ImageWithFallback({ src, alt, className = '', ...rest }) {
  const [failedSrc, setFailedSrc] = useState(null)

  if (!src || failedSrc === src) {
    return (
      <div
        className={`flex items-center justify-center bg-stone-200 p-4 text-center text-xs text-stone-500 ${className}`}
        role="img"
        aria-label={alt ? `${alt} (이미지를 불러올 수 없습니다)` : '이미지를 불러올 수 없습니다'}
      >
        이미지를 불러올 수 없습니다
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)}
      {...rest}
    />
  )
}
