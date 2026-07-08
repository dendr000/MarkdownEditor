// src/components/Preview.jsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 'github-markdown-css/github-markdown.css'; // 깃허브 오리지널 CSS 주입
import './Preview.css';

function Preview({ markdown }) {
  return (
    <div className="preview-container">
      {/* markdown-body 클래스가 깃허브 스타일을 자동 적용합니다 */}
      <div className="preview-content markdown-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default Preview;