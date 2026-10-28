const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

// 화면에 버튼을 보일지 정하는 용도일 뿐, 실제 권한은 firestore.rules 가 강제합니다.
export function isAdminEmail(email) {
  return Boolean(email) && adminEmails.includes(email.toLowerCase())
}
