// src/App.jsx v1.3
/* * 파일 설명: 애플리케이션의 최상위 부모 컴포넌트로 레이아웃 구조를 잡고 마크다운 원문 텍스트 상태를 하위 컴포넌트들에 공급합니다. 로컬 스토리지 연동으로 데이터 유실을 방지합니다.
 * 연결 위치: src/main.jsx 파일에서 호출되어 렌더링되며, Header, Preview, Editor 컴포넌트를 자식으로 가집니다.
 */
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Preview from './components/Preview';
import Editor from './components/editor/Editor';
import './App.css';

const initialMarkdown = ``;

function App() {
  console.log("App 컴포넌트(v1.3) 렌더링 시작 - 최상위 레이아웃 구성 및 로컬 스토리지 연동 가동");
  
  // 마크다운 원문 텍스트 상태 초기화 시 로컬 스토리지 확인 후 데이터 복원
  const [markdown, setMarkdown] = useState(() => {
    console.log("useState 초기화 함수 실행 - 로컬 스토리지 데이터 검색 시도");
    const saved = localStorage.getItem('markdown-save');
    if (saved !== null) {
      console.log("로컬 스토리지에서 저장된 마크다운 데이터 발견 성공. 해당 데이터로 상태를 초기화합니다.");
      return saved;
    }
    console.log("저장된 데이터 없음 - 기본 빈 문자열로 초기화합니다.");
    return initialMarkdown;
  });

  // markdown 상태가 변경될 때마다 로컬 스토리지에 동기화
  useEffect(() => {
    console.log("useEffect 실행 - markdown 상태 변경 감지, 로컬 스토리지에 데이터를 덮어씁니다.");
    localStorage.setItem('markdown-save', markdown);
  }, [markdown]);

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