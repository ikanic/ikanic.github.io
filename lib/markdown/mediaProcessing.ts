import { parseOptions, findClosingBracket } from "../posts/parseHelpers";

// Caption 내부의 마크다운 링크를 HTML로 변환
export function convertCaptionMarkdownToHtml(caption: string): string {
    return caption.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    );
}

// 미디어 라인 파싱 (이미지/비디오)
export function parseMediaLine(
    line: string,
    isVideo: boolean,
): { altAndOptions: string; url: string } | null {
    const prefix = isVideo ? "!![" : "![";
    if (!line.startsWith(prefix)) return null;

    const startIdx = prefix.length;
    const bracketEnd = findClosingBracket(line, startIdx);

    if (
        bracketEnd === -1 ||
        bracketEnd + 1 >= line.length ||
        line[bracketEnd + 1] !== "("
    ) {
        return null;
    }

    const altAndOptions = line.substring(startIdx, bracketEnd);
    const afterBracket = line.substring(bracketEnd + 2);

    const lastParen = afterBracket.lastIndexOf(")");
    if (lastParen === -1) return null;

    const url = afterBracket.substring(0, lastParen);

    return { altAndOptions, url };
}

// 비디오 처리 헬퍼 함수
export function processVideoSyntax(altAndOptions: string, url: string): string {
    let alt = "";
    let caption = "";
    let width = "";
    let height = "";

    if (altAndOptions.includes("\\|")) {
        alt = altAndOptions.replace(/\\\|/g, "|").replace(/\\\\/g, "\\");
    } else if (altAndOptions.includes("|")) {
        const pipeParts = altAndOptions.split("|");
        alt = pipeParts[0].trim().replace(/\\\\/g, "\\");
        const options = pipeParts[1] || "";
        const parsed = parseOptions(options);
        caption = parsed.caption;
        width = parsed.width;
        height = parsed.height;
    } else {
        alt = altAndOptions.replace(/\\\\/g, "\\");
    }

    const style = [];
    if (width) style.push(`width: ${width}${width.match(/\d$/) ? "px" : ""}`);
    if (height)
        style.push(`height: ${height}${height.match(/\d$/) ? "px" : ""}`);

    let html = '<figure class="markdown-media">\n';
    html += `<video${style.length > 0 ? ` style="${style.join("; ")}"` : ""} controls>\n`;
    html += `  <source src="${url}" />\n`;
    html += `  ${alt}\n`;
    html += "</video>\n";
    if (caption) {
        const captionHtml = convertCaptionMarkdownToHtml(caption);
        html += `<figcaption class="markdown-caption">${captionHtml}</figcaption>\n`;
    }
    html += "</figure>";

    return html;
}

// 이미지 처리 헬퍼 함수
export function processImageSyntax(altAndOptions: string, url: string): string {
    let alt = "";
    let caption = "";
    let width = "";
    let height = "";

    if (altAndOptions.includes("\\|")) {
        alt = altAndOptions.replace(/\\\|/g, "|").replace(/\\\\/g, "\\");
    } else if (altAndOptions.includes("|")) {
        const pipeParts = altAndOptions.split("|");
        alt = pipeParts[0].trim().replace(/\\\\/g, "\\");
        const options = pipeParts[1] || "";
        const parsed = parseOptions(options);
        caption = parsed.caption;
        width = parsed.width;
        height = parsed.height;
    } else {
        alt = altAndOptions.replace(/\\\\/g, "\\");
    }

    const style = [];
    if (width) style.push(`width: ${width}${width.match(/\d$/) ? "px" : ""}`);
    if (height)
        style.push(`height: ${height}${height.match(/\d$/) ? "px" : ""}`);

    let html = '<figure class="markdown-media">\n';
    html += `<img src="${url}" alt="${alt}"${style.length > 0 ? ` style="${style.join("; ")}"` : ""} />\n`;
    if (caption) {
        const captionHtml = convertCaptionMarkdownToHtml(caption);
        html += `<figcaption class="markdown-caption">${captionHtml}</figcaption>\n`;
    }
    html += "</figure>";

    return html;
}
