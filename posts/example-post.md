---
title: "Next.js와 GitHub Pages로 블로그 만들기"
created-date: "2024-01-15"
modified-date: "2024-01-15"
category: "Development"
tags: ["Next.js", "React", "GitHub Pages"]
series: "블로그 개발기"
seriesOrder: 1
description: "Next.js와 Tailwind CSS를 사용하여 GitHub Pages에 배포 가능한 정적 블로그를 만드는 방법을 알아봅니다."
---

# Next.js로 블로그 만들기

이 포스트에서는 **Next.js**와 **Tailwind CSS**를 사용하여 GitHub Pages에 배포할 수 있는 블로그를 만드는 방법을 소개합니다.

## 왜 Next.js인가?

Next.js는 React 기반의 프레임워크로, 다음과 같은 장점이 있습니다:

- **정적 사이트 생성(SSG)**: GitHub Pages에 최적화
- **파일 기반 라우팅**: 직관적인 페이지 구조
- **최적화된 성능**: 이미지 최적화, 코드 스플리팅 등
- **개발 경험**: Hot Module Replacement, TypeScript 지원

## 프로젝트 설정

먼저 Next.js 프로젝트를 생성합니다:

```bash
npx create-next-app@latest my-blog --typescript --tailwind
cd my-blog
```

필요한 패키지들을 설치합니다:

```bash
npm install gray-matter remark remark-html date-fns
```

### 각 패키지의 역할

- `gray-matter`: 마크다운 frontmatter 파싱
- `remark`, `remark-html`: 마크다운을 HTML로 변환
- `date-fns`: 날짜 포맷팅

## 마크다운 파일 작성

포스트는 마크다운 형식으로 작성하며, frontmatter에 메타데이터를 포함합니다:

```markdown
---
title: "포스트 제목"
date: "2024-01-15"
category: "카테고리"
tags: ["태그1", "태그2"]
series: "시리즈 이름"
seriesOrder: 1
excerpt: "포스트 요약"
---

# 본문 내용

여기에 포스트 내용을 작성합니다.
```

## 배포하기

GitHub Pages에 배포하기 위해 `next.config.js`를 수정합니다:

```javascript
module.exports = {
    output: "export",
    images: {
        unoptimized: true,
    },
};
```

> **참고**: GitHub Pages는 정적 파일만 호스팅할 수 있으므로 `output: 'export'` 설정이 필수입니다.

## 마무리

이제 기본적인 블로그 구조가 완성되었습니다! 다음 포스트에서는 글래스모피즘 디자인을 적용하는 방법을 알아보겠습니다.

### 다음 단계

1. 글래스모피즘 디자인 적용
2. 시리즈 기능 구현
3. 검색 기능 추가
4. GitHub Actions로 자동 배포

---

이제 블로그가 준비되었습니다! 🎉
