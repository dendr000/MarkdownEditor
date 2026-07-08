# 1. 리액트 프로젝트 생성
npm create vite@latest github-markdown-editor -- --template react

# 2. 프로젝트 폴더로 이동
cd github-markdown-editor

# 3. 깃허브 마크다운 파싱 및 스타일링에 필요한 라이브러리 설치
npm install react-markdown remark-gfm github-markdown-css

# 4. 개발 서버 실행 (코드 작성 완료 후 확인)
npm run dev

# 구문 강조
npm install react-syntax-highlighter