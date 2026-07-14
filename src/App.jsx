// src/App.jsx v1.2
/* * 파일 설명: 애플리케이션의 최상위 부모 컴포넌트로 레이아웃 구조를 잡고 마크다운 원문 텍스트 상태를 하위 컴포넌트들에 공급합니다.
 * 연결 위치: src/main.jsx 파일에서 호출되어 렌더링되며, Header, Preview, Editor 컴포넌트를 자식으로 가집니다.
 */
import { useState } from 'react';
import Header from './components/Header';
import Preview from './components/Preview';
import Editor from './components/editor/Editor'; // 구조 개편에 맞춘 올바른 상대 경로로 수정
import './App.css';

const initialMarkdown = ``;

function App() {
  console.log("App 컴포넌트(v1.2) 렌더링 시작 - 최상위 레이아웃 및 상태 초기화");
  
  // 마크다운 원문 텍스트를 관리하는 전역 상태
  const [markdown, setMarkdown] = useState(initialMarkdown);

  return (
    <div className="app-layout">
      {/* 상단 헤더 영역 (보통 파일 내보내기/가져오기 등의 공통 기능 위치) */}
      <Header markdown={markdown} />
      
      <main className="main-content">
        {/* 좌측 실시간 뷰어 (작성된 마크다운을 깃허브 스타일로 렌더링하여 보여줌) */}
        <Preview markdown={markdown} />
        
        {/* 우측 에디터 영역 (마크다운 텍스트 작성 및 툴바 기능 제공) */}
        <Editor markdown={markdown} setMarkdown={setMarkdown} />
      </main>
    </div>
  );
}

export default App;