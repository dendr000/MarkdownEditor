export const copyToClipboard = async (text) => {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("복사 실패:", error);
    alert("클립보드 복사에 실패했습니다.");
    return false;
  }
};