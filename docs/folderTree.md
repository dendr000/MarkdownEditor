<!-- docs/folderTree.md -->
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
│   │   │   │   ├── sqlBuilder/ # 시각적 SQL 쿼리 빌더 전용 컴포넌트 모음
│   │   │   │   │   ├── DclMatrixPanel.jsx   # DCL 권한 제어 매트릭스 패널
│   │   │   │   │   ├── DdlGridPanel.jsx     # DDL 스키마 제어 스프레드시트 패널
│   │   │   │   │   ├── DdlGridRow.jsx       # DDL 그리드 개별 행 컴포넌트
│   │   │   │   │   ├── DmlFilterPanel.jsx   # DML 쿼리 필터 및 정렬 제어 패널
│   │   │   │   │   ├── DmlSidebar.jsx       # DML 드래그 앤 드롭 테이블 사이드바
│   │   │   │   │   ├── DmlTableNode.jsx     # DML React Flow 커스텀 테이블 노드
│   │   │   │   │   └── DmlWorkspacePanel.jsx# DML 시각적 조인 워크스페이스 패널
│   │   │   │   ├── CommitGuideModal.jsx
│   │   │   │   ├── DetailsModal.jsx
│   │   │   │   ├── FindReplaceModal.jsx # 찾기 및 바꾸기 모달
│   │   │   │   ├── GlobalSearchModal.jsx # 전역 검색 및 일괄 치환 모달
│   │   │   │   ├── MathModal.jsx
│   │   │   │   ├── SqlQueryBuilderModal.jsx # 시각적 SQL 쿼리 빌더 대형 모달
│   │   │   │   ├── TemplateModal.jsx
│   │   │   │   └── ToolbarGroups.jsx # 툴바 아이콘 묶음 분리 파일
│   │   │   ├── AutocompletePopup.jsx # 가상 자동완성 팝업 UI
│   │   │   ├── CodeOverlay.jsx # 구문 강조(Syntax Highlighting) 및 줄 번호 오버레이
│   │   │   ├── ColorPickerOverlay.jsx # CSS Hex 색상 픽커 오버레이
│   │   │   ├── Editor.css
│   │   │   ├── EditorCodeMode.css # 코드 모드 전용 스타일 분리본
│   │   │   ├── EditorToolbar.css # 툴바 및 팝업 전용 스타일 분리본
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
│   │   │   ├── DiffViewer.jsx  # 파일 분할 비교 뷰어 (Split Diff Viewer)
│   │   │   ├── ErdNode.jsx     # ERD 다이어그램 커스텀 노드 렌더러
│   │   │   ├── GeoJsonBlock.jsx
│   │   │   ├── LinkRenderer.jsx # 뷰어 내 상대 경로 링크 가로채기 모듈
│   │   │   ├── MermaidBlock.jsx
│   │   │   ├── SqlErdViewer.jsx # SQL 기반 ERD 시각화 및 자동 저장 뷰어
│   │   │   ├── SqlFlowViewer.jsx # SQL 리니지 데이터 흐름 다이어그램 렌더러
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
│   │   │   ├── useAutocomplete.js # 예약어 추천 및 팝업 제어 훅
│   │   │   ├── useAutoTyping.js # 괄호 및 HTML 태그 자동 닫기 등 타이핑 어시스트 훅
│   │   │   ├── useCodeFormatter.js # 단축키 기반 코드 포매팅 제어 훅
│   │   │   ├── useColorPicker.js # CSS 색상 픽커 상태 연동 훅
│   │   │   ├── useCommentToggle.js # 확장자 기반 주석(Ctrl+/) 토글 제어 훅
│   │   │   ├── useEditor.js    # 에디터 기본 조작 및 단축키 제어 훅
│   │   │   ├── useImageUpload.js
│   │   │   ├── useOutline.js   # 마크다운 헤딩 목차 추출 훅
│   │   │   └── useSnippetExpand.js # 예약어 치환 및 스니펫(Ctrl+Space) 전개 훅
│   │   └── table
│   │       └── useTableGrid.js
│   ├── routes
│   │   └── api.js              # 백엔드 Express 라우터 정의부
│   ├── utils
│   │   ├── editor/
│   │   │   ├── codeDictionary.js # 언어별 스니펫, 주석 기호 등 통합 데이터 사전
│   │   │   ├── codeFormatter.js # 각 언어별 들여쓰기 및 정렬 연산 유틸
│   │   │   ├── diffUtils.js    # LCS 알고리즘 기반 텍스트 비교 연산 유틸
│   │   │   ├── sqlDclGenerator.js # DCL 권한 매트릭스 SQL 컴파일러
│   │   │   ├── sqlDictGenerator.js # SQL 기반 테이블 명세서 마크다운 생성 유틸
│   │   │   ├── sqlDmlGenerator.js # DML 시각적 조인 워크스페이스 SQL 컴파일러
│   │   │   ├── sqlExportUtils.js # 조립된 쿼리를 JPA Entity, DBML로 내보내는 확장 모듈
│   │   │   ├── sqlGenerator.js # DDL 스프레드시트 그리드 SQL 컴파일러
│   │   │   ├── sqlLinter.js    # 정규식 기반 SQL 문법 오류 감지 유틸
│   │   │   ├── sqlReverseParser.js # CREATE TABLE 텍스트를 파싱하는 역설계 모듈
│   │   │   └── syntaxHighlighter.js # 정규식 기반 구문 강조 파서
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
├── .env
├── .gitignore
├── index.html
├── package-lock.json
├── package.json
└── start_dev.bat