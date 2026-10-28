// 서비스 계층은 날짜를 밀리초 숫자로 돌려줍니다.
export function formatDate(millis) {
  if (!millis) return ''
  return new Date(millis).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(millis) {
  if (!millis) return ''
  return new Date(millis).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
