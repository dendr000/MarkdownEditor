// src/utils/editor/codeDictionary.js v1.0
/*
 * 파일 위치: src/utils/editor/codeDictionary.js
 * 파일 설명: 에디터에서 지원하는 각 프로그래밍 언어별 주석 기호, 단축 스니펫, 자동 치환 규칙을 정의한 사전(Dictionary) 파일입니다.
 * 연결 위치: src/hooks/editor/useCommentToggle.js, src/hooks/editor/useSnippetExpand.js
 */

console.log("[codeDictionary v1.0] 언어별 에디터 사전 데이터 로드 완료");

// 파일 확장자를 기반으로 내부적으로 처리할 언어 타입을 반환하는 함수입니다.
export const getLanguage = (fileName) => {
  console.log(`[codeDictionary v1.0] 확장자 분석 요청: ${fileName}`);
  if (!fileName) return 'text';
  const ext = fileName.split('.').pop().toLowerCase();
  
  const languageMap = {
    'js': 'javascript', 'jsx': 'javascript', 'ts': 'javascript', 'tsx': 'javascript',
    'html': 'html', 'xml': 'html', 'svg': 'html',
    'css': 'css', 'scss': 'css',
    'sql': 'sql',
    'md': 'markdown',
    'java': 'java'
  };
  
  const result = languageMap[ext] || 'text';
  console.log(`[codeDictionary v1.0] 분석 결과: ${ext} -> ${result}`);
  return result;
};

// 언어별 주석 기호 매핑 테이블입니다.
export const COMMENT_DICT = {
  javascript: { type: 'single', symbol: '// ' },
  java: { type: 'single', symbol: '// ' },
  css: { type: 'multi', start: '/* ', end: ' */' },
  html: { type: 'multi', start: '<!-- ', end: ' -->' },
  sql: { type: 'single', symbol: '-- ' },
  markdown: { type: 'multi', start: '<!-- ', end: ' -->' }
};

// 언어별 단축어(Ctrl+Space) 스니펫 테이블입니다. '|' 기호는 텍스트 삽입 후 커서가 위치할 곳을 의미합니다.
export const SNIPPET_DICT = {
  javascript: {
    'clg': 'console.log(|);',
    'func': 'function |() {\n  \n}',
    'afn': 'const | = () => {\n  \n};',
    'import': 'import { | } from "";'
  },
  html: {
    'div': '<div>|</div>',
    'span': '<span>|</span>',
    'p': '<p>|</p>',
    'a': '<a href="|"></a>',
    'img': '<img src="|" alt="" />'
  },
  css: {
    'df': 'display: flex;|',
    'jcc': 'justify-content: center;|',
    'aic': 'align-items: center;|'
  },
  sql: {
    'sel': 'SELECT |\nFROM \nWHERE ;',
    'ct': 'CREATE TABLE | (\n  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY\n);'
  }
};

// 스페이스바 또는 엔터 입력 시 자동으로 코드를 교정하는 치환 규칙입니다.
export const REPLACE_DICT = {
  javascript: {
    '==': '===',
    '!=': '!==',
    'class=': 'className=',
    'for=': 'htmlFor='
  },
  sql: {
    'select': 'SELECT', 'from': 'FROM', 'where': 'WHERE', 'insert': 'INSERT',
    'update': 'UPDATE', 'delete': 'DELETE', 'create': 'CREATE', 'table': 'TABLE',
    'int': 'INT', 'varchar': 'VARCHAR', 'bigint': 'BIGINT', 'and': 'AND', 'or': 'OR'
  }
};

// 언어별 자동완성(Autocomplete) 추천 키워드 사전입니다.
export const KEYWORD_DICT = {
  java: [
    { id: '@RequestMapping', name: '@RequestMapping', desc: 'Spring URL 매핑 애노테이션' },
    { id: '@RestController', name: '@RestController', desc: 'Spring REST 컨트롤러' },
    { id: '@Autowired', name: '@Autowired', desc: 'Spring 의존성 주입' },
    { id: 'public static void main', name: 'public static void main', desc: '메인 메서드' },
    { id: 'System.out.println', name: 'System.out.println', desc: '표준 출력' }
  ],
  javascript: [
    { id: 'document.getElementById', name: 'document.getElementById', desc: 'DOM 요소 선택' },
    { id: 'setTimeout', name: 'setTimeout', desc: '타이머 함수' },
    { id: 'Promise', name: 'Promise', desc: '비동기 객체' }
  ],
  sql: [
    { id: 'LEFT OUTER JOIN', name: 'LEFT OUTER JOIN', desc: '외부 조인' },
    { id: 'ORDER BY', name: 'ORDER BY', desc: '정렬 기준' },
    { id: 'GROUP BY', name: 'GROUP BY', desc: '그룹화' }
  ]
};