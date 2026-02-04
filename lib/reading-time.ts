/**
 * 개발 블로그에 최적화된 독서 시간 계산
 * 텍스트, 코드, 이미지를 각각 다르게 계산하여 정확도 향상
 */

interface ReadingTimeResult {
    minutes: number;
    text: string;
    words: number;
    codeLines: number;
    images: number;
}

export function calculateReadingTime(content: string): ReadingTimeResult {
    // 1. 코드 블록 추출 및 라인 수 계산
    const codeBlockRegex = /```[\s\S]*?```/g;
    const codeBlocks = content.match(codeBlockRegex) || [];
    let totalCodeLines = 0;

    codeBlocks.forEach((block) => {
        // 코드 블록에서 실제 코드 라인만 카운트 (빈 줄 제외)
        const lines = block
            .split("\n")
            .filter((line) => line.trim().length > 0);
        // 첫 줄(```)과 마지막 줄(```) 제외
        totalCodeLines += Math.max(0, lines.length - 2);
    });

    // 2. 이미지 개수 계산
    const imageRegex = /!\[.*?\]\(.*?\)/g;
    const htmlImageRegex = /<img[^>]*>/g;
    const markdownImages = content.match(imageRegex) || [];
    const htmlImages = content.match(htmlImageRegex) || [];
    const totalImages = markdownImages.length + htmlImages.length;

    // 3. 코드 블록과 이미지를 제거한 순수 텍스트 추출
    let textContent = content;

    // 코드 블록 제거
    textContent = textContent.replace(codeBlockRegex, "");

    // 인라인 코드 제거
    textContent = textContent.replace(/`[^`]+`/g, "");

    // 이미지 제거
    textContent = textContent.replace(imageRegex, "");
    textContent = textContent.replace(htmlImageRegex, "");

    // HTML 태그 제거
    textContent = textContent.replace(/<[^>]*>/g, "");

    // 마크다운 문법 제거
    textContent = textContent.replace(/#+\s/g, ""); // 헤더
    textContent = textContent.replace(/[*_~]/g, ""); // 강조
    textContent = textContent.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); // 링크

    // 4. 단어 수 계산 (한글 + 영문 혼합)
    // 한글: 글자 수 기준
    // 영문: 단어 수 기준
    const koreanChars = textContent.match(/[가-힣]/g) || [];
    const koreanCharCount = koreanChars.length;

    // 영문 단어 (공백으로 구분된 영문 단어만)
    const englishWords =
        textContent.match(/[a-zA-Z]+/g)?.filter((word) => word.length > 1) ||
        [];
    const englishWordCount = englishWords.length;

    // 5. 읽기 시간 계산
    // 한글: 500자/분
    // 영문: 200단어/분
    const koreanReadingTime = koreanCharCount / 500;
    const englishReadingTime = englishWordCount / 200;

    // 코드: 라인당 5초 (0.083분)
    const codeReadingTime = totalCodeLines * 0.083;

    // 이미지: 개당 12초 (0.2분)
    const imageViewingTime = totalImages * 0.2;

    // 총 시간 (분)
    const totalMinutes =
        koreanReadingTime +
        englishReadingTime +
        codeReadingTime +
        imageViewingTime;

    // 최소 1분
    const roundedMinutes = Math.max(1, Math.ceil(totalMinutes));

    // 6. 결과 텍스트 생성
    let readingText = `${roundedMinutes}분`;

    // 상세 정보 (개발 모드에서 확인용)
    if (process.env.NODE_ENV === "development") {
        console.log({
            totalMinutes: totalMinutes.toFixed(2),
            koreanChars: koreanCharCount,
            englishWords: englishWordCount,
            codeLines: totalCodeLines,
            images: totalImages,
            breakdown: {
                text: (koreanReadingTime + englishReadingTime).toFixed(2),
                code: codeReadingTime.toFixed(2),
                images: imageViewingTime.toFixed(2),
            },
        });
    }

    return {
        minutes: roundedMinutes,
        text: readingText,
        words: koreanCharCount + englishWordCount,
        codeLines: totalCodeLines,
        images: totalImages,
    };
}

/**
 * 마크다운 원본에서 독서 시간 계산
 */
export function getReadingTimeFromMarkdown(
    markdown: string,
): ReadingTimeResult {
    return calculateReadingTime(markdown);
}

/**
 * HTML에서 독서 시간 계산 (이미 변환된 콘텐츠)
 */
export function getReadingTimeFromHTML(html: string): ReadingTimeResult {
    // HTML을 마크다운스럽게 역변환
    let content = html;

    // 코드 블록 처리 (pre > code)
    const codeBlockRegex = /<pre[^>]*>[\s\S]*?<\/pre>/g;
    const codeBlocks = content.match(codeBlockRegex) || [];
    let totalCodeLines = 0;

    codeBlocks.forEach((block) => {
        const codeContent = block.replace(/<[^>]*>/g, "");
        const lines = codeContent
            .split("\n")
            .filter((line) => line.trim().length > 0);
        totalCodeLines += lines.length;
    });

    // 이미지
    const imageRegex = /<img[^>]*>/g;
    const images = content.match(imageRegex) || [];
    const totalImages = images.length;

    // 코드 블록과 이미지 제거
    content = content.replace(codeBlockRegex, "");
    content = content.replace(imageRegex, "");
    content = content.replace(/<code[^>]*>.*?<\/code>/g, "");

    // 모든 HTML 태그 제거
    content = content.replace(/<[^>]*>/g, " ");

    // HTML 엔티티 디코딩
    content = content.replace(/&nbsp;/g, " ");
    content = content.replace(/&quot;/g, '"');
    content = content.replace(/&amp;/g, "&");
    content = content.replace(/&lt;/g, "<");
    content = content.replace(/&gt;/g, ">");

    // 한글/영문 카운트
    const koreanChars = content.match(/[가-힣]/g) || [];
    const koreanCharCount = koreanChars.length;

    const englishWords =
        content.match(/[a-zA-Z]+/g)?.filter((word) => word.length > 1) || [];
    const englishWordCount = englishWords.length;

    // 시간 계산
    const koreanReadingTime = koreanCharCount / 500;
    const englishReadingTime = englishWordCount / 200;
    const codeReadingTime = totalCodeLines * 0.083;
    const imageViewingTime = totalImages * 0.2;

    const totalMinutes =
        koreanReadingTime +
        englishReadingTime +
        codeReadingTime +
        imageViewingTime;
    const roundedMinutes = Math.max(1, Math.ceil(totalMinutes));

    return {
        minutes: roundedMinutes,
        text: `${roundedMinutes}분`,
        words: koreanCharCount + englishWordCount,
        codeLines: totalCodeLines,
        images: totalImages,
    };
}
