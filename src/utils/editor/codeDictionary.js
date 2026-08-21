// C:\dev\MarkdownEditor\src\utils\editor\codeDictionary.js v1.4
/*
 * 파일 위치: C:\dev\MarkdownEditor\src\utils\editor\codeDictionary.js
 * 기능 요약: 에디터에서 지원하는 각 프로그래밍 언어별 주석 기호, 단축 스니펫, 자동 치환 규칙을 정의한 사전(Dictionary) 파일입니다. (배포를 위해 콘솔 로그 출력 기능이 제거되었습니다.)
 * (v1.3 수정사항): SQL_UPPERCASE_KEYWORDS 셋업을 자동완성 팝업(KEYWORD_DICT)과 완벽하게 동기화하여 중복 선언을 제거했습니다.
 */

export const getLanguage = (fileName) => {
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
  return result;
};

export const COMMENT_DICT = {
  javascript: { type: 'single', symbol: '// ' },
  java: { type: 'single', symbol: '// ' },
  css: { type: 'multi', start: '/* ', end: ' */' },
  html: { type: 'multi', start: '<!-- ', end: ' -->' },
  sql: { type: 'single', symbol: '-- ' },
  markdown: { type: 'multi', start: '<!-- ', end: ' -->' }
};

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

// [핵심] SQL 자동완성 포매팅과 팝업 추천 리스트에 모두 공통으로 사용되는 절대 사전(Master Dictionary)
export const SQL_UPPERCASE_KEYWORDS = new Set([
  // 1개 단어
  'select', 'from', 'where', 'and', 'or', 'insert', 'into', 'update', 'set', 'delete',
  'create', 'table', 'view', 'alter', 'drop', 'int', 'varchar', 'bigint', 'datetime',
  'text', 'boolean', 'not', 'null', 'primary', 'key', 'foreign', 'references', 'default',
  'as', 'join', 'inner', 'left', 'right', 'outer', 'on', 'group', 'by', 'order', 'having',
  'limit', 'with', 'case', 'when', 'then', 'else', 'end', 'is', 'in', 'exists', 'like',
  'asc', 'desc', 'between', 'union', 'all', 'any', 'some', 'index', 'database', 'show',
  'use', 'grant', 'revoke', 'commit', 'rollback', 'cascade', 'restrict', 'engine', 'collate',
  'comment', 'auto_increment', 'current_timestamp', 'unsigned', 'char', 'tinyint',
  // 2개 단어 조합
  'primary key', 'foreign key', 'unique key', 'not null', 'set null', 'on delete', 'on update',
  'order by', 'group by', 'inner join', 'left join', 'right join', 'outer join', 'default charset',
  'character set',
  // 3개 단어 조합
  'if not exists', 'left outer join', 'right outer join'
]);

const JAVA_KEYWORDS = [
  'public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 
  'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'default',
  'static', 'final', 'abstract', 'synchronized', 'volatile', 'transient',
  'try', 'catch', 'finally', 'throw', 'throws', 'new', 'this', 'super', 'instanceof',
  'int', 'long', 'double', 'float', 'boolean', 'char', 'byte', 'short', 'void',
  'String', 'List', 'Map', 'Set', 'HashMap', 'ArrayList', 'Exception',
  '@Override', '@Autowired', '@RestController', '@RequestMapping', '@GetMapping', 
  '@PostMapping', '@Service', '@Repository', '@Component', '@Bean',
  'System.out.println', 'public static void main'
];

export const KEYWORD_DICT = {
  java: JAVA_KEYWORDS.map(kw => ({ id: kw, name: kw, desc: 'Java 예약어' })),
  javascript: [
    { id: 'document.getElementById', name: 'document.getElementById', desc: 'DOM 요소 선택' },
    { id: 'setTimeout', name: 'setTimeout', desc: '타이머 함수' },
    { id: 'Promise', name: 'Promise', desc: '비동기 객체' }
  ],
  // 방대한 SQL Set 셋업을 배열로 동적 변환하여 자동완성 팝업 리스트에 완벽하게 꽂아 넣습니다.
  sql: Array.from(SQL_UPPERCASE_KEYWORDS).map(kw => ({ id: kw, name: kw.toUpperCase(), desc: 'SQL 예약어' }))
};