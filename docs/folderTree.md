# 프로젝트 폴더 구조 (Markdown Editor)

MARKDOWNEDITOR
├── .vscode
├── docs
│   └── folderTree.md                 # 현재 폴더 구조 명세서
├── node_modules
├── public
│   ├── favicon.svg
│   └── icons.svg
├── src
│   ├── assets
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components
│   │   ├── common
│   │   │   └── Modal.css             # 모달 공통 스타일
│   │   ├── editor
│   │   │   ├── toolbar/              # 툴바 아이콘 및 그룹 컴포넌트
│   │   │   │   ├── CommitGuideModal.jsx # Git 커밋 메시지 컨벤션 가이드 모달
│   │   │   │   ├── DetailsModal.jsx  # 접기/펼치기 HTML 생성 모달
│   │   │   │   ├── MathModal.jsx     # 수식 (LaTeX) 작성기 모달
│   │   │   │   └── TemplateModal.jsx # 템플릿 보관함 관리 모달
│   │   │   ├── AutocompletePopup.jsx # 깃허브 가상 자동완성(@, #, :) 팝업 UI
│   │   │   ├── OutlineMinimap.jsx    # 자동 목차 아웃라인 미니맵 UI
│   │   │   ├── Editor.css
│   │   │   └── Editor.jsx            # 메인 에디터 (마크다운 입력부)
│   │   ├── preview
│   │   │   ├── GeoJsonBlock.jsx      # Leaflet 기반 맵 렌더러
│   │   │   ├── MermaidBlock.jsx      # 다이어그램 SVG 렌더러
│   │   │   └── StlBlock.jsx          # Three.js 기반 3D 모델 렌더러
│   │   ├── table
│   │   │   ├── html-table/           # 고급 HTML 표 작성기 컴포넌트 및 스타일
│   │   │   ├── HtmlTable.css
│   │   │   ├── HtmlTableModal.jsx    # 고급 HTML 표 모달
│   │   │   ├── TableModal.css
│   │   │   └── TableModal.jsx        # 기본 마크다운 표 모달
│   │   ├── Header.css
│   │   ├── Header.jsx                # 상단 헤더
│   │   ├── Preview.css
│   │   └── Preview.jsx               # 실시간 뷰어 (ReactMarkdown 및 수식 렌더러 연동)
│   ├── hooks
│   │   ├── editor
│   │   │   ├── useAutocomplete.js    # 가상 자동완성 키보드/상태 제어 훅
│   │   │   ├── useImageUpload.js     # 드래그 앤 드롭 및 클라우드 이미지 업로드 통신 훅
│   │   │   └── useOutline.js         # 본문 헤더(#) 스캔 및 목차 트리 데이터 구조화 훅
│   │   └── table
│   │       ├── useTableGrid.js       # 표 그리드 셀 선택 및 병합 제어 훅
│   │       └── useHtmlTable.js       # HTML 표 상태 제어 훅
│   ├── utils
│   │   ├── clipboard.js              # 코드 블록 복사 유틸
│   │   ├── colorPresets.js           # 툴바 색상 프리셋
│   │   ├── diagramParser.js          # 다이어그램 파싱/역파싱 유틸
│   │   ├── githubMarkdownParser.js   # Alerts 및 색상 시각화 정규식 파서
│   │   ├── htmlTableParser.js        # HTML 표 ↔ DOM 변환 파서
│   │   ├── localDb.js                # 로컬 스토리지 DB CRUD 래퍼
│   │   ├── tableConverter.js         # 마크다운 표 텍스트 변환 파서
│   │   └── templates.js              # 기본 제공 마크다운 템플릿(Snippet) 문자열 저장소
│   ├── App.css
│   ├── App.jsx                       # 최상위 컴포넌트 (상태 및 레이아웃 관리)
│   ├── index.css
│   └── main.jsx
├── .gitattributes
├── .gitignore
├── .oxlintrc.json
├── index.html                        # KaTeX CSS CDN 추가 대상
├── package-lock.json
├── package.json                      # remark-math, rehype-katex 등 의존성 추가 대상
├── README.md
├── run.png
└── start_dev.bat                     # 로컬 서버 실행 배치 파일