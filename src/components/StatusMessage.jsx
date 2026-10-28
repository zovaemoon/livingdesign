// 로딩 / 오류 / 빈 상태 공통 화면
export function LoadingState({ text = '불러오는 중…' }) {
  return (
    <div className="flex items-center gap-3 py-12 text-sm text-stone-500" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-stone-700" aria-hidden="true" />
      {text}
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="my-6 border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
      <p>{message || '문제가 발생했습니다.'}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-2 text-xs underline underline-offset-2">
          다시 시도
        </button>
      )}
    </div>
  )
}

export function EmptyState({ text, children }) {
  return (
    <div className="border border-dashed border-stone-300 px-6 py-12 text-center text-sm text-stone-500">
      <p>{text}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
