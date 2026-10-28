// Firebase 설정값은 코드에 직접 쓰지 않고 환경변수(.env 또는 Netlify 환경변수)에서 읽습니다.
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
}

export const hasFirebaseConfig = Boolean(firebaseConfig.apiKey)
