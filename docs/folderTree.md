# 프로젝트 폴더 구조 (Markdown Editor)
MARKDOWNEDITOR
├── .vscode
├── data # [신규] 워크스페이스 타겟으로 사용될
파일 DB 루트
├── docs
│ └── folderTree.md # 현재 폴더 구조 명세서
├── node_modules
├── public
│ ├── favicon.svg
│ └── icons.svg
├── src
│ ├── api
│ │ └── fileApi.js # 백엔드 서버 통신 API 유틸
│ ├── assets
│ │ ├── hero.png
│ │ ├── react.svg
│ │ └── vite.svg
│ ├── components
│ │ ├── common
│ │ │ └── Modal.css # 모달 공통 스타일
│ │ ├── diagram
│ │ │ └── DiagramModal.jsx # Mermaid 다이어그램 모달
│ │ ├── editor
│ │ │ ├── toolbar/ # 툴바 아이콘 및 그룹 컴포넌트
│ │ │ │ ├── CommitGuideModal.jsx
│ │ │ │ ├── DetailsModal.jsx
│ │ │ │ ├── FindReplaceModal.jsx # 찾기 및 바꾸기 모달
│ │ │ │ ├── MathModal.jsx
│ │ │ │ ├── TemplateModal.jsx
│ │ │ │ └── ToolbarGroups.jsx # 툴바 아이콘 묶음 분리 파일
│ │ │ ├── AutocompletePopup.jsx
│ │ │ ├── Editor.css
│ │ │ └── Editor.jsx # 메인 에디터 (마크다운 입력부)
│ │ ├── explorer
│ │ │ ├── ExplorerTreeNode.jsx # [신규] 탐색기 개별 폴더/파일 노드
및 복사 툴팁
│ │ │ ├── FileExplorer.jsx # 좌측 탐색기 메인 컴포넌트
│ │ │ └── WorkspaceConfig.jsx # [신규] 상단 워크스페이스 경로 및
히스토리 제어바
│ │ ├── preview
│ │ │ ├── CodeBlockRenderer.jsx # [신규] 코드 블록 및 뷰어 렌더러
분리
│ │ │ ├── GeoJsonBlock.jsx
│ │ │ ├── LinkRenderer.jsx # [신규] 뷰어 내 상대 경로 링크
가로채기 모듈
│ │ │ ├── MermaidBlock.jsx

│ │ │ └── StlBlock.jsx
│ │ ├── table
│ │ │ ├── html-table/
│ │ │ ├── HtmlTable.css
│ │ │ ├── HtmlTableModal.jsx
│ │ │ ├── TableModal.css
│ │ │ └── TableModal.jsx
│ │ ├── tree
│ │ │ └── FolderTreeModal.jsx # 폴더 구조도 마크다운 생성기
│ │ ├── Header.css
│ │ ├── Header.jsx # 상단 헤더
│ │ ├── Preview.css
│ │ └── Preview.jsx # 실시간 뷰어 메인 컴포넌트
│ ├── controllers
│ │ └── fileController.js # [신규] 백엔드 로컬 시스템 접근 핵심
로직 제어
│ ├── hooks
│ │ ├── editor
│ │ │ ├── useAutocomplete.js
│ │ │ └── useImageUpload.js
│ │ └── table
│ │ └── useTableGrid.js
│ ├── routes
│ │ └── api.js # [신규] 백엔드 Express 라우터
정의부
│ ├── utils
│ │ ├── clipboard.js
│ │ ├── colorPresets.js
│ │ ├── diagramParser.js
│ │ ├── editorCore.js # [신규] 에디터 DOM 제어 및 VSC
스타일 들여쓰기 래퍼
│ │ ├── githubMarkdownParser.js
│ │ ├── htmlTableParser.js
│ │ ├── tableConverter.js
│ │ └── templates.js
│ ├── App.css
│ ├── App.jsx # 최상위 컴포넌트 (상태 및 레이아웃
관리)
│ ├── index.css
│ ├── main.jsx
│ ├── server.js # 백엔드 서버 진입점(Entry Point)
│ └── workspace-config.json # 워크스페이스 히스토리 DB 저장소
├── .gitignore
├── index.html
├── package-lock.json
├── package.json
└── start_dev.bat