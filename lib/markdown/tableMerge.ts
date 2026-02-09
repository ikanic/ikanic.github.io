// 테이블 셀 병합 정보 파싱
export function parseCellMerge(cell: string): {
    content: string;
    colspan: number;
    rowspan: number;
} {
    let content = cell.trim();
    let colspan = 1;
    let rowspan = 1;

    // <-n> 패턴 (가로 병합) - n칸 차지
    const colspanMatch = content.match(/<-(\d+)>/);
    if (colspanMatch) {
        colspan = parseInt(colspanMatch[1]);
        content = content.replace(/<-\d+>/g, "").trim();
    }

    // <!n> 패턴 (세로 병합) - n칸 차지
    const rowspanMatch = content.match(/<!(\d+)>/);
    if (rowspanMatch) {
        rowspan = parseInt(rowspanMatch[1]);
        content = content.replace(/<!(\d+)>/g, "").trim();
    }

    return { content, colspan, rowspan };
}

// 테이블 셀 병합 처리 함수
export function processTableMerge(content: string): string {
    const tablePattern = /(\|[^\n]+\|\n)(\|[\s:|-]+\|\n)((?:\|[^\n]+\|\n?)+)/g;

    return content.replace(tablePattern, (match, header, separator, body) => {
        if (!match.includes("<-") && !match.includes("<!")) {
            return match;
        }

        console.log("Processing table:", { header, body });

        const headerCells = header
            .trim()
            .split("|")
            .slice(1, -1)
            .map((c: string) => c.trim());

        const bodyLines = body
            .trim()
            .split("\n")
            .map((line: string) => {
                return line
                    .split("|")
                    .slice(1, -1)
                    .map((c: string) => c.trim());
            });

        console.log("Parsed header:", headerCells);
        console.log("Parsed body:", bodyLines);

        let html = '\n<table class="markdown-table-merged">\n';

        // 헤더 생성
        html += "<thead>\n<tr>\n";
        let skipCols = 0;
        headerCells.forEach((cell: string, idx: number) => {
            if (skipCols > 0) {
                skipCols--;
                return;
            }

            const {
                content: cellContent,
                colspan,
                rowspan,
            } = parseCellMerge(cell);
            console.log(`Header cell ${idx}:`, {
                cellContent,
                colspan,
                rowspan,
            });

            const attrs = [];
            if (colspan > 1) attrs.push(`colspan="${colspan}"`);
            if (rowspan > 1) attrs.push(`rowspan="${rowspan}"`);

            html += `  <th${attrs.length > 0 ? " " + attrs.join(" ") : ""}>${cellContent}</th>\n`;
            skipCols = colspan - 1;
        });
        html += "</tr>\n</thead>\n";

        // 본문 생성
        html += "<tbody>\n";
        const skipCells = new Map<string, boolean>();

        bodyLines.forEach((cells: string[], rowIdx: number) => {
            html += "<tr>\n";

            let colIdx = 0;
            let cellIdx = 0;

            while (cellIdx < cells.length || colIdx < 10) {
                if (skipCells.get(`${rowIdx}-${colIdx}`)) {
                    colIdx++;
                    continue;
                }

                if (cellIdx >= cells.length) break;

                const cell = cells[cellIdx];
                const {
                    content: cellContent,
                    colspan,
                    rowspan,
                } = parseCellMerge(cell);

                console.log(`Body cell [${rowIdx}][${colIdx}]:`, {
                    cellContent,
                    colspan,
                    rowspan,
                });

                const attrs = [];
                if (colspan > 1) attrs.push(`colspan="${colspan}"`);
                if (rowspan > 1) attrs.push(`rowspan="${rowspan}"`);

                html += `  <td${attrs.length > 0 ? " " + attrs.join(" ") : ""}>${cellContent}</td>\n`;

                for (let r = 0; r < rowspan; r++) {
                    for (let c = 0; c < colspan; c++) {
                        if (r === 0 && c === 0) continue;
                        skipCells.set(`${rowIdx + r}-${colIdx + c}`, true);
                    }
                }

                colIdx += colspan;
                cellIdx++;
            }

            html += "</tr>\n";
        });

        html += "</tbody>\n</table>\n";
        return html;
    });
}
