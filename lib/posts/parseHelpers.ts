import { PostData } from "./types";

// 날짜 포맷 파싱
export function parseDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString().split("T")[0];
    const match = dateStr.match(/(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : dateStr;
}

// 정렬용 날짜 가져오기
export function getSortDate(post: PostData): string {
    return post.modifiedDate || post.createdDate;
}

// 옵션 파싱 헬퍼 함수
export function parseOptions(options: string): {
    caption: string;
    width: string;
    height: string;
} {
    let caption = "";
    let width = "";
    let height = "";

    let i = 0;
    const optionPairs: string[] = [];
    let currentPair = "";

    while (i < options.length) {
        const char = options[i];

        // 백슬래시 처리
        if (char === "\\" && i + 1 < options.length) {
            const nextChar = options[i + 1];
            if (nextChar === ",") {
                currentPair += ",";
                i += 2;
                continue;
            } else if (nextChar === "\\") {
                currentPair += "\\";
                i += 2;
                continue;
            }
        }

        // 일반 쉼표
        if (char === ",") {
            if (currentPair.trim()) {
                optionPairs.push(currentPair.trim());
            }
            currentPair = "";
            i++;
            continue;
        }

        // 일반 문자
        currentPair += char;
        i++;
    }

    if (currentPair.trim()) {
        optionPairs.push(currentPair.trim());
    }

    optionPairs.forEach((pair: string) => {
        const eqIndex = pair.indexOf("=");
        if (eqIndex > 0) {
            const key = pair.substring(0, eqIndex).trim();
            const value = pair.substring(eqIndex + 1).trim();
            if (key === "caption") caption = value;
            else if (key === "width") width = value;
            else if (key === "height") height = value;
        }
    });

    return { caption, width, height };
}

// `[` `]` 괄호 매칭으로 올바른 닫는 ] 찾기
export function findClosingBracket(str: string, startIdx: number): number {
    let depth = 1;

    for (let i = startIdx; i < str.length; i++) {
        if (str[i] === "\\" && i + 1 < str.length) {
            i++;
            continue;
        }

        if (str[i] === "[") {
            depth++;
        } else if (str[i] === "]") {
            depth--;
            if (depth === 0) {
                return i;
            }
        }
    }

    return -1;
}
