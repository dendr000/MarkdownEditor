<!-- 
  위치: docs/folderTree.md
  기능 요약: Markdown Editor 프로젝트의 전체 디렉토리 및 파일 구조, 각 파일의 핵심 역할을 정리한 명세서입니다. 
-->

# 프로젝트 폴더 구조 (Markdown Editor)

```text
MARKDOWNEDITOR
├── .vscode
├── data                        # 워크스페이스 타겟으로 사용될 파일 DB 루트
├── docs
│   └── folderTree.md           # 현재 폴더 구조 명세서
├── node_modules
├── public
│   ├── favicon.svg
│   └── icons.svg
├── src
│   ├── api
│   │   ├── browserDb.js        # 브라우저 내장 가상 파일 시스템(IndexedDB) 모듈
│   │   └── fileApi.js          # 백엔드 서버 및 브라우저 DB 통신 어댑터 API
│   ├── assets
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components
│   │   ├── common
│   │   │   └── Modal.css       # 모달 공통 스타일
│   │   ├── diagram
│   │   │   └── DiagramModal.jsx # Mermaid 다이어그램 모달
│   │   ├── editor
│   │   │   ├── toolbar/        # 툴바 아이콘 및 그룹 컴포넌트
│   │   │   │   ├── CommitGuideModal.jsx
│   │   │   │   ├── DetailsModal.jsx
│   │   │   │   ├── FindReplaceModal.jsx # 찾기 및 바꾸기 모달
│   │   │   │   ├── MathModal.jsx
│   │   │   │   ├── TemplateModal.jsx
│   │   │   │   └── ToolbarGroups.jsx # 툴바 아이콘 묶음 분리 파일
│   │   │   ├── AutocompletePopup.jsx
│   │   │   ├── Editor.css
│   │   │   ├── Editor.jsx      # 메인 에디터 (마크다운 입력부 - 단일 구조)
│   │   │   └── OutlineMinimap.jsx # 우측 목차(미니맵) 컴포넌트
│   │   ├── explorer
│   │   │   ├── ExplorerTreeNode.jsx # 탐색기 개별 폴더/파일 메인 렌더링 노드
│   │   │   ├── FileExplorer.jsx # 좌측 탐색기 메인 컴포넌트
│   │   │   ├── NodeActions.jsx # 파일/폴더 추가, 수정, 삭제 액션 버튼 그룹
│   │   │   ├── NodeTooltip.jsx # 상대 경로 표시 및 클립보드 복사 툴팁
│   │   │   └── WorkspaceConfig.jsx # 상단 워크스페이스 경로 및 히스토리 제어바
│   │   ├── preview
│   │   │   ├── CodeBlockRenderer.jsx # 코드 블록 렌더러 분리
│   │   │   ├── GeoJsonBlock.jsx
│   │   │   ├── LinkRenderer.jsx # 뷰어 내 상대 경로 링크 가로채기 모듈
│   │   │   ├── MermaidBlock.jsx
│   │   │   ├── SqlViewer.jsx   # SQL 전용 시각화 뷰어
│   │   │   └── StlBlock.jsx
│   │   ├── table
│   │   │   ├── html-table/
│   │   │   ├── HtmlTable.css
│   │   │   ├── HtmlTableModal.jsx
│   │   │   ├── TableModal.css
│   │   │   └── TableModal.jsx
│   │   ├── tree
│   │   │   └── FolderTreeModal.jsx # 폴더 구조도 마크다운 생성기
│   │   ├── Header.css
│   │   ├── Header.jsx          # 상단 헤더 (테마 및 스토리지 스위칭 포함)
│   │   ├── Preview.css
│   │   └── Preview.jsx         # 실시간 뷰어 메인 컴포넌트 (마크다운 파싱)
│   ├── controllers
│   │   └── fileController.js   # 백엔드 로컬 시스템 접근 핵심 로직 제어
│   ├── hooks
│   │   ├── app
│   │   │   ├── useFileLoader.js # App.jsx 파일 로드/라우팅 제어 훅
│   │   │   └── useScrollSync.js # 양면 스크롤 동기화 연산 훅
│   │   ├── editor
│   │   │   ├── useAutocomplete.js
│   │   │   ├── useEditor.js    # 에디터 파일 모드 및 자동저장 제어 훅
│   │   │   ├── useImageUpload.js
│   │   │   └── useOutline.js   # 마크다운 헤딩 목차 추출 훅
│   │   └── table
│   │       └── useTableGrid.js
│   ├── routes
│   │   └── api.js              # 백엔드 Express 라우터 정의부
│   ├── utils
│   │   ├── clipboard.js
│   │   ├── colorPresets.js
│   │   ├── diagramParser.js
│   │   ├── editorCore.js       # 에디터 DOM 제어 및 VSC 스타일 들여쓰기 래퍼
│   │   ├── githubMarkdownParser.js
│   │   ├── htmlTableParser.js
│   │   ├── pathUtils.js        # 파일 트리 상대 경로 연산 유틸
│   │   ├── tableConverter.js
│   │   └── templates.js
│   ├── App.css
│   ├── App.jsx                 # 최상위 컴포넌트 (상태 및 레이아웃 관리)
│   ├── index.css
│   ├── main.jsx
│   ├── server.js               # 백엔드 서버 진입점(Entry Point)
│   └── workspace-config.json   # 워크스페이스 히스토리 DB 저장소
├── .gitignore
├── index.html
├── package-lock.json
├── package.json
└── start_dev.bat