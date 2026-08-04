// C:\dev\MarkdownEditor\src\utils\githubMarkdownParser.js
/*
 * 파일 위치: C:\dev\MarkdownEditor\src\utils\githubMarkdownParser.js
 * 파일 설명: 기본 마크다운 파서가 인식하지 못하는 GitHub 고유 문법(Alerts)을 HTML 구조와 공식 SVG 아이콘으로 사전 변환하는 프리프로세서입니다.
 * (v4.0 수정사항): 에디터 환경의 특수 공백(\xA0) 혼입 문제를 해결하기 위해 블록 단위 캡처 정규식 알고리즘으로 전면 교체했습니다.
 */

export const preprocessGitHubFlavored = (text) => {
  if (!text) return '';
  
  // OS별로 다른 줄바꿈 문자를 \n으로 단일화합니다.
  let parsed = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // GitHub 공식 Octicon SVG 경로 데이터
  const icons = {
    note: `<svg class="octicon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>`,
    tip: `<svg class="octicon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.45 2.5 6.41 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.16-.701 2.2-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"></path></svg>`,
    important: `<svg class="octicon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></svg>`,
    warning: `<svg class="octicon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></svg>`,
    caution: `<svg class="octicon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>`
  };

  // 특수 공백(\xA0)을 포함하여 Alerts 블록 전체를 안전하게 캡처하는 정규식
  const alertRegex = /(?:^|\n)([ \t\xA0]*>[ \t\xA0]*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][^\n]*(?:\n[ \t\xA0]*>.*)*)/gi;

  parsed = parsed.replace(alertRegex, (match, block, type) => {
    const currentAlertType = type.toLowerCase();
    const typeTitle = currentAlertType.charAt(0).toUpperCase() + currentAlertType.slice(1);
    const svgIcon = icons[currentAlertType] || '';

    // 캡처된 블록 내부의 불필요한 마크다운 기호(>)와 선언문을 제거하여 내용만 추출
    const cleanContent = block.split('\n').map((line, index) => {
      if (index === 0) {
        return line.replace(/^[ \t\xA0]*>[ \t\xA0]*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t\xA0]*/i, '');
      }
      return line.replace(/^[ \t\xA0]*>[ \t\xA0]?/, '');
    }).join('\n').trim();

    // 마크다운 파서가 내부 텍스트를 정상적으로 인식할 수 있도록 앞뒤로 빈 줄(\n)을 배치
    return `\n<div class="gh-alert gh-alert-${currentAlertType}">\n<p class="gh-alert-title">${svgIcon}${typeTitle}</p>\n\n${cleanContent}\n</div>\n\n`;
  });

  // 인라인 색상 코드 파싱 (Hex, RGB, HSL)
  const colorRegex = /`(#(?:[0-9a-fA-F]{3}){1,2}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\))`(?!\S)/g;
  parsed = parsed.replace(colorRegex, (match, colorCode) => {
    return `<code class="color-viz-code"><span class="color-viz-circle" style="background-color: ${colorCode};"></span>${colorCode}</code>`;
  });

  return parsed;
};