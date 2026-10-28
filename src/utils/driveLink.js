// Google Drive 공유 링크는 이미지 파일 자체가 아니라 뷰어 페이지라서 <img>에 바로 쓸 수 없습니다.
// 썸네일 주소로 바꾸면 이미지로 표시됩니다.
const DRIVE_PATTERNS = [
  /^https?:\/\/drive\.google\.com\/file\/d\/([\w-]+)/,
  /^https?:\/\/drive\.google\.com\/(?:open|uc|thumbnail)\?(?:.*&)?id=([\w-]+)/,
]

export function extractDriveFileId(url) {
  const text = (url || '').trim()
  for (const pattern of DRIVE_PATTERNS) {
    const match = text.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function toDisplayImageUrl(url) {
  const text = (url || '').trim()
  const fileId = extractDriveFileId(text)
  if (!fileId) return text
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`
}
