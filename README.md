# Living Design Lab — 리빙디자인 연구 페이지

수업 자료와 학생 작품을 한곳에 모으고, 작품마다 댓글로 토론하는 웹사이트입니다.

- **데모 모드**: Firebase 설정 없이 바로 동작합니다. 데이터는 *보고 있는 브라우저에만* 저장됩니다.
- **Firebase 모드**: Netlify에 Firebase 설정값(환경변수)만 넣으면 Google 로그인과 실제 데이터베이스(Firestore)로 바뀝니다. 코드를 고칠 필요가 없습니다.
- Firebase **무료(Spark) 요금제**만으로 운영할 수 있게 만들었습니다. (Cloud Functions, Storage 사용 안 함)

---

## 목차

1. [내 컴퓨터에서 실행하기](#-내-컴퓨터에서-실행하기)
2. [GitHub에 올리기](#-github에-올리기)
3. [Netlify 연결 및 배포 (데모 모드)](#-netlify-연결-및-배포-데모-모드)
4. [Firebase 프로젝트 만들기](#-firebase-프로젝트-만들기)
5. [Firebase 설정값을 Netlify에 입력하기](#-firebase-설정값을-netlify에-입력하기)
6. [승인된 도메인 추가 (꼭!)](#-승인된-도메인-추가-꼭)
7. [보안 규칙 붙여넣기](#-보안-규칙-붙여넣기)
8. [인덱스 오류가 날 때](#-인덱스-오류가-날-때)
9. [자주 발생하는 오류와 해결법](#-자주-발생하는-오류와-해결법)
10. [사이트 문구 바꾸기](#사이트-문구-바꾸기) · [사용 방법](#사용-방법) · [다음 단계로 추가하기 좋은 기능](#다음-단계로-추가하기-좋은-기능)

---

## ① 내 컴퓨터에서 실행하기

> 웹사이트를 Netlify에만 올려서 쓸 거라면 이 단계는 건너뛰어도 됩니다.

1. [Node.js](https://nodejs.org/ko) **20 LTS 이상**(20.19 이상)을 설치합니다. 설치 후 터미널(맥: "터미널", 윈도우: "명령 프롬프트")에서 확인:
   ```bash
   node -v
   ```
   `v20.19.0` 이상(또는 v22, v24)이 나오면 됩니다.
2. 이 프로젝트 폴더로 이동한 뒤 필요한 부품을 설치합니다(처음 한 번만).
   ```bash
   npm install
   ```
3. 개발용 서버를 켭니다.
   ```bash
   npm run dev
   ```
4. 터미널에 나온 주소(보통 `http://localhost:5173`)를 브라우저로 엽니다.
5. 끝낼 때는 터미널에서 `Ctrl + C` 를 누릅니다.

배포용 파일을 미리 만들어 확인하고 싶다면 `npm run build` → `dist` 폴더가 만들어집니다.

## ② GitHub에 올리기

이미 GitHub 저장소(`zovaemoon/livingdesign`)에 코드가 올라가 있다면 이 단계는 끝난 것입니다.
새로 올릴 때는:

1. [github.com](https://github.com) 에 로그인 → 오른쪽 위 **+** → **New repository** → 이름 입력 → **Create repository**
2. 화면에 나오는 안내대로, 프로젝트 폴더에서 아래 명령을 실행합니다.
   ```bash
   git init
   git add .
   git commit -m "첫 업로드"
   git branch -M main
   git remote add origin https://github.com/내아이디/저장소이름.git
   git push -u origin main
   ```

> `.env` 파일(비밀 설정값)은 `.gitignore` 에 들어 있어서 GitHub에 올라가지 않습니다. 안심하세요.

## ③ Netlify 연결 및 배포 (데모 모드)

1. [app.netlify.com](https://app.netlify.com) 에 GitHub 계정으로 가입/로그인합니다.
2. **Add new site → Import an existing project → GitHub** 를 누르고 저장소를 고릅니다.
3. 설정 화면은 자동으로 채워집니다(`netlify.toml` 덕분). 확인만 하세요.
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Deploy** 를 누릅니다. 1~2분 뒤 `https://무작위이름.netlify.app` 주소가 생깁니다.
5. 사이트 이름을 바꾸려면 **Site configuration → Change site name** (예: `livingdesign-lab.netlify.app`).

이제 사이트 맨 위에 **"데모 모드 – 데이터는 이 브라우저에만 저장됩니다"** 배너가 보입니다.
로그인 화면에서 **데모: 교수로 로그인 / 학생으로 로그인** 버튼으로 모든 기능을 미리 써 볼 수 있습니다.
(데모 데이터는 각자 브라우저에만 저장되므로 학생들과 공유되지 않습니다.)

이후 GitHub에 코드가 올라갈 때마다 Netlify가 **자동으로 다시 배포**합니다.

## ④ Firebase 프로젝트 만들기

### 4-1. 프로젝트 생성
1. [console.firebase.google.com](https://console.firebase.google.com) 에 Google 계정으로 로그인
2. **프로젝트 만들기** → 이름 입력(예: `livingdesign-lab`) → Google 애널리틱스는 **사용 안 함**으로 두어도 됩니다 → 만들기
3. 요금제가 **Spark(무료)** 인지 확인합니다(왼쪽 아래 표시). 결제 수단을 등록하지 마세요.

### 4-2. Firestore 데이터베이스 만들기
1. 왼쪽 메뉴 **빌드 → Firestore Database → 데이터베이스 만들기**
2. 위치: **asia-northeast3 (서울)** 권장 *(한 번 정하면 바꿀 수 없습니다)*
3. **프로덕션 모드에서 시작** 선택 → 만들기
   (보안 규칙은 ⑦단계에서 넣습니다)

### 4-3. Google 로그인 켜기
1. 왼쪽 메뉴 **빌드 → Authentication → 시작하기**
2. **로그인 방법** 탭 → **Google** → **사용 설정** 스위치 켜기
3. 프로젝트 지원 이메일 선택 → **저장**

### 4-4. 웹 앱 등록 (설정값 받기)
1. 왼쪽 위 톱니바퀴 ⚙️ → **프로젝트 설정**
2. 아래쪽 **내 앱** → 웹 아이콘 **`</>`** 클릭
3. 앱 닉네임 입력(예: `web`) → *Firebase 호스팅은 체크하지 않습니다* → **앱 등록**
4. 화면에 나오는 `firebaseConfig` 값을 메모장에 복사해 둡니다. 예:
   ```js
   const firebaseConfig = {
     apiKey: "AIza....",
     authDomain: "livingdesign-lab.firebaseapp.com",
     projectId: "livingdesign-lab",
     storageBucket: "...",        // 사용하지 않음
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abcd..."
   };
   ```

## ⑤ Firebase 설정값을 Netlify에 입력하기

1. Netlify에서 내 사이트 → **Site configuration → Environment variables → Add a variable** (여러 개면 **Import from a .env file** 이 편합니다)
2. 아래 6개를 입력합니다. 값은 ④-4에서 복사한 것을 따옴표 없이 넣습니다.

   | 변수 이름 | 넣을 값 |
   |---|---|
   | `VITE_FIREBASE_API_KEY` | `apiKey` 값 |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` 값 |
   | `VITE_FIREBASE_PROJECT_ID` | `projectId` 값 |
   | `VITE_FIREBASE_APP_ID` | `appId` 값 |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` 값 |
   | `VITE_ADMIN_EMAILS` | 교수님 Google 이메일 (여러 명이면 `a@gmail.com,b@gmail.com`) |

   **Import from a .env file** 로 붙여 넣을 때의 예:
   ```
   VITE_FIREBASE_API_KEY=AIza....
   VITE_FIREBASE_AUTH_DOMAIN=livingdesign-lab.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=livingdesign-lab
   VITE_FIREBASE_APP_ID=1:1234567890:web:abcd...
   VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
   VITE_ADMIN_EMAILS=professor@gmail.com
   ```
3. **Deploys → Trigger deploy → Deploy site** 를 눌러 다시 배포합니다.
   *(환경변수는 다시 배포해야 반영됩니다)*
4. 배포가 끝나면 사이트 상단의 데모 배너가 사라지고, 로그인 화면에 **Google 계정으로 로그인** 버튼이 나타납니다.

> 내 컴퓨터에서 Firebase 모드로 실행하려면 `.env.example` 파일을 복사해 `.env` 로 이름을 바꾸고 같은 값을 채운 뒤 `npm run dev` 를 다시 실행하세요.
>
> 참고: Firebase 웹 설정값(apiKey 등)은 원래 브라우저에 공개되는 값이라 노출되어도 괜찮습니다. 실제 보안은 ⑦단계의 **보안 규칙**이 지킵니다.

## ⑥ 승인된 도메인 추가 (꼭!)

**이 단계를 빠뜨리면 Google 로그인이 실패합니다.**

1. Firebase 콘솔 → **Authentication → 설정(Settings) 탭 → 승인된 도메인**
2. **도메인 추가** → Netlify 주소를 `https://` 없이 입력합니다.
   예: `livingdesign-lab.netlify.app`
3. 나중에 개인 도메인(예: `lab.school.ac.kr`)을 연결하면 그 주소도 추가합니다.

(`localhost` 는 기본으로 들어 있어서 내 컴퓨터 실행은 따로 추가하지 않아도 됩니다.)

## ⑦ 보안 규칙 붙여넣기

보안 규칙은 "누가 무엇을 읽고 쓸 수 있는지"를 Firebase 서버에서 강제하는 장치입니다.
화면에서 버튼을 숨기는 것만으로는 막을 수 없기 때문에 **반드시** 넣어야 합니다.

1. 이 프로젝트의 [`firestore.rules`](./firestore.rules) 파일을 열어 전체 내용을 복사합니다.
2. Firebase 콘솔 → **Firestore Database → 규칙** 탭 → 기존 내용을 모두 지우고 붙여 넣습니다.
3. 맨 위쪽의 아래 부분을 **교수님 이메일로 바꿉니다** (⑤의 `VITE_ADMIN_EMAILS` 와 같게):
   ```
   function adminEmails() {
     return ['PROFESSOR_EMAIL@example.com'];
   }
   ```
   예: `return ['professor@gmail.com'];` / 여러 명: `return ['a@gmail.com', 'b@school.ac.kr'];`
4. **게시** 를 누릅니다.

규칙에 들어 있는 내용 요약:
- 모든 데이터는 **로그인한 사람만** 읽을 수 있습니다.
- 수업 만들기/수정/삭제, 수업 자료 작성은 **교수만** 가능합니다.
- 학생 작품은 로그인한 누구나 올릴 수 있고, **본인 글만** 수정/삭제할 수 있습니다(교수는 모두 가능).
- 댓글은 누구나 쓸 수 있고, **본인 댓글만** 삭제할 수 있습니다(교수, 그리고 게시물 작성자도 삭제 가능 — 게시물을 지울 때 달린 댓글을 함께 정리하기 위해).
- 제목 100자, 본문 5000자, 댓글 1000자, 이미지·링크 각 5개, `http(s)://` 주소만 허용.

**선택 옵션 — 학교 이메일만 허용하기**: `firestore.rules` 안의 `signedIn()` 부분 주석을 참고해,
`request.auth.token.email.matches('.*@school[.]ac[.]kr$')` 의 `school` 을 학교 도메인으로 바꿔 사용하세요.

## ⑧ 인덱스 오류가 날 때

수업 페이지의 목록이나 홈 화면의 "최근 게시물"이 **"데이터베이스 인덱스가 필요합니다"** 오류를 보이면, 검색용 색인(인덱스)을 한 번 만들어 주면 됩니다.

**방법 A (가장 쉬움)**
1. 오류가 난 화면에서 키보드 `F12` (맥: `Cmd + Option + I`) → **Console(콘솔)** 탭
2. 빨간 오류 메시지 안의 `https://console.firebase.google.com/...` 로 시작하는 **링크를 클릭**
3. 열린 Firebase 화면에서 **색인 만들기(Create index)** 클릭
4. 상태가 "사용 설정됨(Enabled)"이 될 때까지 몇 분 기다린 뒤 새로고침

필요한 인덱스는 2개입니다(각각 한 번씩 위 과정을 하면 됩니다).

**방법 B (직접 만들기)**: Firestore Database → **색인** 탭 → **복합 색인 만들기**
| 컬렉션 | 필드 1 | 필드 2 | 필드 3 |
|---|---|---|---|
| `posts` | `courseId` 오름차순 | `type` 오름차순 | `createdAt` 내림차순 |
| `posts` | `type` 오름차순 | `createdAt` 내림차순 | — |

(같은 내용이 [`firestore.indexes.json`](./firestore.indexes.json) 에 들어 있습니다. Firebase CLI를 쓰는 분은 `firebase deploy --only firestore:indexes` 로 한 번에 만들 수 있습니다.)

## ⑨ 자주 발생하는 오류와 해결법

| 증상 | 원인 / 해결 |
|---|---|
| 로그인 시 "이 사이트 주소가 Firebase에 등록되지 않았습니다" (`auth/unauthorized-domain`) | ⑥단계: 승인된 도메인에 Netlify 주소를 추가하세요. |
| 로그인 버튼을 눌러도 아무 창이 안 뜸 / "팝업을 막았습니다" | 브라우저 주소창 오른쪽의 팝업 차단 아이콘 → 이 사이트 허용. |
| 로그인은 되는데 "권한이 없습니다" | ⑦단계 보안 규칙이 게시되었는지, 규칙의 교수 이메일이 정확한지 확인. |
| 교수인데 "수업 추가" 버튼이 안 보임 | Netlify 환경변수 `VITE_ADMIN_EMAILS` 이메일 철자 확인 → **다시 배포**(Trigger deploy). |
| 버튼은 보이는데 저장 시 "권한이 없습니다" | `VITE_ADMIN_EMAILS`(화면용)와 `firestore.rules` 의 `adminEmails()`(실제 권한) 이메일이 같은지 확인. |
| 환경변수를 넣었는데 아직 데모 모드 | 변수 이름 철자(`VITE_` 로 시작) 확인 후 **다시 배포**. 변수는 배포할 때 반영됩니다. |
| "데이터베이스 인덱스가 필요합니다" | ⑧단계. |
| 새로고침하면 "Page not found" | `netlify.toml` 이 저장소 최상위에 있는지 확인. |
| 이미지가 "이미지를 불러올 수 없습니다"로 나옴 | 주소가 이미지 파일 주소인지 확인. Google Drive는 파일 공유를 **'링크가 있는 모든 사용자'** 로 바꿔야 합니다. |
| "오늘 무료 사용량을 모두 썼습니다" | Spark 요금제 하루 한도(읽기 5만 회 등) 초과. 다음 날(태평양 시간 자정) 자동 초기화됩니다. |
| Netlify 빌드 실패 | Deploys → 실패한 배포 → 로그 확인. Node 버전은 `netlify.toml` 에서 20으로 지정되어 있습니다. |
| 데모 데이터를 처음 상태로 돌리고 싶음 | 데모 모드 로그인 화면 아래 **데모 데이터 초기화** 클릭. |

---

## 사이트 문구 바꾸기

사이트 이름("Living Design Lab"), 소개 문구, 문의 문구는 [`src/config.js`](./src/config.js) 한 곳에 모여 있습니다.
GitHub 웹사이트에서 이 파일을 열고 연필(✏️) 아이콘으로 수정 → **Commit changes** 하면 Netlify가 자동으로 다시 배포합니다.

포인트 색은 [`src/index.css`](./src/index.css) 의 `--color-accent` 값(현재 테라코타 `#b45309`)을 바꾸면 됩니다.

## 사용 방법

- **교수**: 수업 → **+ 수업 추가** → 수업 상세에서 **[수업 자료] 탭 → + 자료 추가**. 모든 글과 댓글을 지울 수 있습니다. 수업에 게시물이 남아 있으면 수업은 삭제되지 않습니다(게시물을 먼저 삭제).
- **학생**: 수업 상세 → **[학생 작품] 탭 → + 작품 올리기**. 본인 글 수정/삭제, 댓글 작성/삭제.
- **이미지**: 이미지 파일의 인터넷 주소를 붙여 넣습니다(최대 5개). Google Drive 공유 링크(`https://drive.google.com/file/d/…/view`)를 붙여 넣으면 자동으로 이미지 주소로 바뀝니다. **Drive 파일은 '링크가 있는 모든 사용자'로 공유해야 보입니다.**
- **링크**: PDF, 노션, Behance 등 외부 링크(최대 5개).
- 게시물의 이미지를 누르면 크게 볼 수 있습니다(← → 키로 넘기기, Esc 로 닫기).

## 프로젝트 구조 (개발자용)

```
src/
  components/  Navbar, PostCard, PostList, CommentList, ImageWithFallback, DemoBanner, Lightbox ...
  pages/       Home, Login, Courses, CourseDetail, PostDetail, PostEditor, NotFound
  services/    index.js(모드 선택), mockService.js(데모), firebaseService.js, firebaseConfig.js
  hooks/       useAuth.js (AuthProvider)
  utils/       driveLink.js, validate.js, formatDate.js, admin.js
  config.js    사이트 이름·소개 문구
firestore.rules, firestore.indexes.json, netlify.toml, .env.example
```

- 화면 코드는 `services/index.js` 만 import 합니다. `VITE_FIREBASE_API_KEY` 가 있으면 Firebase, 없으면 데모 서비스가 쓰입니다.
- 무료 요금제 절약: 목록은 12개씩 + "더 보기"(커서 페이지네이션), 실시간 리스너는 게시물 상세의 댓글에만 사용하고 화면을 벗어나면 해제, 댓글 수는 `increment()` 로 댓글 작성/삭제와 같은 batch에서 갱신.
- 기술: React 19, React Router 7, Vite 8, Tailwind CSS 4, Firebase JS SDK 13(모듈식), Pretendard.
- React Router 8은 Node 22 이상이 필요해서, Node 20 기준에 맞춰 7 버전을 사용합니다.
- `npm audit` 에 나오는 `@grpc/grpc-js` 경고는 Firebase SDK의 Node.js(서버)용 부분에 해당하며, 브라우저용 웹사이트에는 포함되지 않습니다.

## 다음 단계로 추가하기 좋은 기능

1. **학생 작품 "좋아요"/북마크** — 문서 1개에 카운트만 두면 무료 요금제로 충분합니다.
2. **태그·검색** — 작품에 재료/주제 태그(예: 목재, 조명)를 달고 태그별로 모아 보기.
3. **과제(주차)별 분류** — 수업 안에 "1주차 과제" 같은 묶음을 만들어 작품을 정리.
4. **교수 피드백 표시** — 교수 댓글을 강조 표시하거나 상단 고정.
5. **댓글 답글(대댓글)** 및 새 댓글 알림 배지.
6. **공개 포트폴리오 모드** — 선택한 작품만 로그인 없이 볼 수 있는 전시 페이지(보안 규칙에 `public` 필드 조건 추가).
7. **학생 프로필 페이지** — 학생별로 올린 작품 모아 보기.
8. **수업 자료 정렬·고정** — 중요한 공지를 맨 위에 고정.
9. **이미지 업로드 편의** — Cloudinary·ImgBB 같은 외부 무료 이미지 호스팅 연동(Storage 없이).
10. **학기별 아카이브** — 학기 필터로 지난 학기 수업 모아 보기.
11. **다크 모드 / 영문 페이지** 등 표시 옵션.
