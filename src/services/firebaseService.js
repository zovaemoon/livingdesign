// Firebase(Firestore + Google 로그인) 서비스. mockService.js 와 같은 함수들을 제공합니다.
// Spark(무료) 요금제 기준: Cloud Functions / Storage 는 쓰지 않습니다.
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { firebaseConfig } from './firebaseConfig.js'
import { isAdminEmail } from '../utils/admin.js'
import { PAGE_SIZE } from '../config.js'

// 데모 모드에서는 이 파일이 import 되기만 하고 호출되지 않으므로, 처음 쓸 때 초기화합니다.
let cached = null
function fb() {
  if (!cached) {
    const app = initializeApp(firebaseConfig)
    cached = { auth: getAuth(app), db: getFirestore(app) }
  }
  return cached
}

const COMMENT_LIMIT = 300

const ERROR_MESSAGES = {
  'auth/popup-closed-by-user': '로그인 창이 닫혔습니다. 다시 시도해 주세요.',
  'auth/cancelled-popup-request': '로그인 창이 닫혔습니다. 다시 시도해 주세요.',
  'auth/popup-blocked': '브라우저가 팝업을 막았습니다. 주소창의 팝업 차단을 해제한 뒤 다시 시도해 주세요.',
  'auth/unauthorized-domain':
    '이 사이트 주소가 Firebase에 등록되지 않았습니다. Firebase 콘솔 > Authentication > 설정 > 승인된 도메인에 주소를 추가해 주세요.',
  'auth/network-request-failed': '네트워크 연결을 확인해 주세요.',
  'permission-denied': '권한이 없습니다. 로그인 상태나 Firestore 보안 규칙을 확인해 주세요.',
  'failed-precondition':
    '데이터베이스 인덱스가 필요합니다. 브라우저 개발자 도구(F12) 콘솔에 나온 링크를 눌러 인덱스를 만들어 주세요.',
  unavailable: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.',
  'resource-exhausted': '오늘 무료 사용량을 모두 썼습니다. 내일 다시 시도해 주세요.',
}

function toKoreanError(err) {
  // 원본 오류(인덱스 생성 링크 포함)는 콘솔에 남겨 둡니다.
  console.error(err)
  if (err?.isUserMessage) return err
  const message = ERROR_MESSAGES[err?.code] || '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
  const translated = new Error(message)
  translated.code = err?.code
  return translated
}

function userError(message) {
  const err = new Error(message)
  err.isUserMessage = true
  return err
}

async function run(fn) {
  try {
    return await fn()
  } catch (err) {
    throw toKoreanError(err)
  }
}

function toMillis(value) {
  if (!value) return null
  if (typeof value.toMillis === 'function') return value.toMillis()
  return value
}

function fromDoc(snap) {
  const data = snap.data({ serverTimestamps: 'estimate' })
  const result = { id: snap.id, ...data }
  for (const key of ['createdAt', 'updatedAt']) {
    if (key in result) result[key] = toMillis(result[key])
  }
  return result
}

function toAppUser(u) {
  return {
    uid: u.uid,
    displayName: u.displayName || u.email || '이름 없음',
    email: u.email || '',
    photoURL: u.photoURL || '',
    isAdmin: isAdminEmail(u.email),
  }
}

function currentUserOrThrow() {
  const u = fb().auth.currentUser
  if (!u) throw userError('로그인이 필요합니다.')
  return toAppUser(u)
}

async function getPage(baseQuery, pageSize, cursor) {
  const parts = [baseQuery]
  if (cursor) parts.push(startAfter(cursor))
  parts.push(limit(pageSize))
  const snap = await getDocs(query(...parts))
  const docs = snap.docs
  return {
    items: docs.map(fromDoc),
    // 커서는 마지막 문서 스냅샷입니다. 다음 페이지가 없을 수도 있지만 한 번 더 읽어 확인하는 비용을 아낍니다.
    nextCursor: docs.length === pageSize ? docs[docs.length - 1] : null,
  }
}

// ── 인증 ─────────────────────────────────────────

export const isDemo = false

export function onAuthChange(cb) {
  return onAuthStateChanged(fb().auth, (u) => cb(u ? toAppUser(u) : null))
}

export function signInWithGoogle() {
  return run(async () => {
    const { auth, db } = fb()
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    const { user } = await signInWithPopup(auth, provider)
    const ref = doc(db, 'users', user.uid)
    const profile = {
      displayName: user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
    }
    const existing = await getDoc(ref)
    if (existing.exists()) {
      await updateDoc(ref, profile)
    } else {
      await setDoc(ref, { ...profile, createdAt: serverTimestamp() })
    }
    return toAppUser(user)
  })
}

export async function demoSignIn() {
  throw userError('Firebase 모드에서는 데모 로그인을 사용할 수 없습니다.')
}

export async function resetDemoData() {
  throw userError('Firebase 모드에서는 사용할 수 없습니다.')
}

export function signOut() {
  return run(() => firebaseSignOut(fb().auth))
}

// ── 수업 ─────────────────────────────────────────

export function listCourses({ pageSize = PAGE_SIZE, cursor = null } = {}) {
  return run(() => {
    const base = query(collection(fb().db, 'courses'), orderBy('createdAt', 'desc'))
    return getPage(base, pageSize, cursor)
  })
}

export function getCourse(id) {
  return run(async () => {
    const snap = await getDoc(doc(fb().db, 'courses', id))
    return snap.exists() ? fromDoc(snap) : null
  })
}

export function createCourse(data) {
  return run(async () => {
    const user = currentUserOrThrow()
    const ref = await addDoc(collection(fb().db, 'courses'), {
      title: data.title.trim(),
      semester: (data.semester || '').trim(),
      description: data.description || '',
      createdAt: serverTimestamp(),
      createdBy: user.uid,
    })
    return ref.id
  })
}

export function updateCourse(id, data) {
  return run(() =>
    updateDoc(doc(fb().db, 'courses', id), {
      title: data.title.trim(),
      semester: (data.semester || '').trim(),
      description: data.description || '',
    }),
  )
}

export function deleteCourse(id) {
  return run(async () => {
    const { db } = fb()
    // 게시물이 남은 수업은 지우지 않습니다(고아 게시물 방지). 1개만 읽어 확인합니다.
    const remaining = await getDocs(query(collection(db, 'posts'), where('courseId', '==', id), limit(1)))
    if (!remaining.empty) {
      throw userError('이 수업에 게시물이 남아 있어 삭제할 수 없습니다. 게시물을 먼저 모두 삭제해 주세요.')
    }
    await deleteDoc(doc(db, 'courses', id))
  })
}

// ── 게시물 ───────────────────────────────────────

export function listPosts({ courseId, type, pageSize = PAGE_SIZE, cursor = null }) {
  return run(() => {
    const base = query(
      collection(fb().db, 'posts'),
      where('courseId', '==', courseId),
      where('type', '==', type),
      orderBy('createdAt', 'desc'),
    )
    return getPage(base, pageSize, cursor)
  })
}

export function listRecentPosts(type, n) {
  return run(async () => {
    const snap = await getDocs(
      query(collection(fb().db, 'posts'), where('type', '==', type), orderBy('createdAt', 'desc'), limit(n)),
    )
    return snap.docs.map(fromDoc)
  })
}

export function getPost(id) {
  return run(async () => {
    const snap = await getDoc(doc(fb().db, 'posts', id))
    return snap.exists() ? fromDoc(snap) : null
  })
}

export function createPost(data) {
  return run(async () => {
    const user = currentUserOrThrow()
    const ref = await addDoc(collection(fb().db, 'posts'), {
      courseId: data.courseId,
      type: data.type,
      title: data.title,
      content: data.content,
      imageUrls: data.imageUrls,
      links: data.links,
      authorId: user.uid,
      authorName: user.displayName,
      authorPhoto: user.photoURL,
      commentCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return ref.id
  })
}

export function updatePost(id, data) {
  return run(() =>
    updateDoc(doc(fb().db, 'posts', id), {
      title: data.title,
      content: data.content,
      imageUrls: data.imageUrls,
      links: data.links,
      updatedAt: serverTimestamp(),
    }),
  )
}

export function deletePost(id) {
  return run(async () => {
    const { db } = fb()
    // 하위 댓글이 남지 않도록 댓글을 먼저 지운 뒤 게시물을 지웁니다(batch 1회 최대 500건).
    const commentsSnap = await getDocs(collection(db, 'posts', id, 'comments'))
    const refs = commentsSnap.docs.map((d) => d.ref)
    for (let i = 0; i < refs.length; i += 450) {
      const batch = writeBatch(db)
      refs.slice(i, i + 450).forEach((ref) => batch.delete(ref))
      await batch.commit()
    }
    await deleteDoc(doc(db, 'posts', id))
  })
}

// ── 댓글 ─────────────────────────────────────────

function commentsQuery(postId) {
  return query(collection(fb().db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'), limit(COMMENT_LIMIT))
}

export function listComments(postId) {
  return run(async () => {
    const snap = await getDocs(commentsQuery(postId))
    return snap.docs.map(fromDoc)
  })
}

// 실시간 리스너는 게시물 상세의 댓글에만 씁니다. 반환된 함수를 꼭 호출해 해제해야 합니다.
export function subscribeComments(postId, onData, onError) {
  return onSnapshot(
    commentsQuery(postId),
    (snap) => onData(snap.docs.map(fromDoc)),
    (err) => onError?.(toKoreanError(err)),
  )
}

export function addComment(postId, content) {
  return run(async () => {
    const user = currentUserOrThrow()
    const { db } = fb()
    const commentRef = doc(collection(db, 'posts', postId, 'comments'))
    const batch = writeBatch(db)
    batch.set(commentRef, {
      content: content.trim(),
      authorId: user.uid,
      authorName: user.displayName,
      authorPhoto: user.photoURL,
      createdAt: serverTimestamp(),
    })
    batch.update(doc(db, 'posts', postId), { commentCount: increment(1) })
    await batch.commit()
    return commentRef.id
  })
}

export function deleteComment(postId, commentId) {
  return run(async () => {
    const { db } = fb()
    const batch = writeBatch(db)
    batch.delete(doc(db, 'posts', postId, 'comments', commentId))
    batch.update(doc(db, 'posts', postId), { commentCount: increment(-1) })
    await batch.commit()
  })
}
