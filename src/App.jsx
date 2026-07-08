// src/App.jsx v1.1
/* 
 * 파일 설명: 애플리케이션의 최상위 부모 컴포넌트로 레이아웃 구성 및 마크다운 상태를 관리함
 * 연결 위치: main.jsx에서 렌더링되며 Header, Preview, Editor 컴포넌트를 자식으로 가짐
 */
import { useState } from 'react';
import Header from './components/Header';
import Preview from './components/Preview';
import Editor from './components/Editor';
import './App.css';

const initialMarkdown = ``;

function App() {
  console.log("App 컴포넌트(v1.1) 렌더링 시작");
  const [markdown, setMarkdown] = useState(initialMarkdown);

  return (
    <div className="app-layout">
      <Header markdown={markdown} />
      <main className="main-content">
        <Preview markdown={markdown} />
        <Editor markdown={markdown} setMarkdown={setMarkdown} />
      </main>
    </div>
  );
}

export default App;