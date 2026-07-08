// src/App.jsx
import { useState } from 'react';
import Header from './components/Header';
import Preview from './components/Preview';
import Editor from './components/Editor';
import './App.css';

const initialMarkdown = `# GitHub Markdown Live Editor 🚀

**오른쪽 화면**에 마크다운을 작성하면 **왼쪽 화면**에 실시간으로 렌더링 됩니다.

## 📝 지원하는 깃허브 문법 (GFM)
- [x] 체크리스트 (Task list)
- ~~취소선~~ 적용 가능
- **굵은 글씨** 및 *기울임*

### 💻 코드 블록 (Code Block)
\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

### 📊 표 (Table)
| 기능 | 프레임워크 | 비고 |
| :--- | :---: | :--- |
| UI | React | 빠르고 유연함 |
| CSS | Plain CSS | Tailwind 미사용 |
`;

function App() {
  const [markdown, setMarkdown] = useState(initialMarkdown);

  return (
    <div className="app-layout">
      <Header markdown={markdown} />
      <main className="main-content">
        {/* Flexbox를 통해 자동으로 5:5로 양분됩니다 */}
        <Preview markdown={markdown} />
        <Editor markdown={markdown} setMarkdown={setMarkdown} />
      </main>
    </div>
  );
}

export default App;