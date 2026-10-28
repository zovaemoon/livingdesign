// 화면(컴포넌트)은 반드시 이 파일만 import 합니다.
// Firebase 환경변수가 있으면 Firebase, 없으면 데모(localStorage) 서비스를 사용합니다.
import * as mockService from './mockService.js'
import * as firebaseService from './firebaseService.js'
import { hasFirebaseConfig } from './firebaseConfig.js'

const service = hasFirebaseConfig ? firebaseService : mockService

export const isDemoMode = !hasFirebaseConfig

export const {
  onAuthChange,
  signInWithGoogle,
  demoSignIn,
  signOut,
  resetDemoData,
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  listPosts,
  listRecentPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  listComments,
  subscribeComments,
  addComment,
  deleteComment,
} = service
