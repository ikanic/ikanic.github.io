---
title: "마크다운 스타일 테스트"
thumbnail: "https://taek0622.github.io/assets/img/posts/react-logo.png"
created-date: "2024-01-30"
modified-date: "2026-01-15"
category: "Test"
tags: ["Markdown", "Test"]
description: "블로그에서 사용 가능한 모든 마크다운 스타일을 테스트합니다."
---

# 마크다운 스타일 가이드

이 포스트는 블로그에서 사용 가능한 모든 마크다운 스타일을 보여줍니다.

## 텍스트 스타일

일반 텍스트입니다. **굵은 텍스트**와 _기울임 텍스트_, 그리고 ***굵은 기울임***을 사용할 수 있습니다.

~~취소선~~도 사용 가능합니다.

## 링크와 이미지

[Next.js 공식 사이트](https://nextjs.org)를 방문해보세요.

자동 링크: https://github.com

## 코드

인라인 코드는 `const greeting = "Hello World";` 이렇게 사용합니다.

코드 블록:

```javascript title="example.js"
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55
```

```python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)
```

### Diff 예제

```javascript
function calculate(a, b) {
- return a + b;
+ return a * b;
}

- const result = calculate(5, 3); // 8
+ const result = calculate(5, 3); // 15
```

### 코드 하이라이팅

```swift {6}
var a = 3
var b = 2
print(add(a, b))

func add(_ a: Int, _ b: Int) -> `Int` {
    return a + b
}
```

## Mermaid 다이어그램

```mermaid
graph TD
    A[Start] --> B[Process]
    B --> C{Decision}
    C -->|Yes| D[End]
    C -->|No| B
```

## 리스트

### 순서 없는 리스트

- 첫 번째 항목
- 두 번째 항목
    - 중첩된 항목 1
    - 중첩된 항목 2
- 세 번째 항목

### 순서 있는 리스트

1. 첫 번째 단계
2. 두 번째 단계
3. 세 번째 단계
    1. 세부 단계 A
    2. 세부 단계 B

### 체크리스트

- [x] 완료된 작업
- [x] 또 다른 완료 작업
- [ ] 진행 중인 작업
- [ ] 예정된 작업

## 인용문

> 훌륭한 개발자는 좋은 코드를 작성하지만,
> 최고의 개발자는 좋은 문서를 작성합니다.

> 단일 라인 인용문입니다.

## 표

| 기능        | JavaScript | TypeScript | Python     |
| ----------- | ---------- | ---------- | ---------- |
| 정적 타이핑 | ❌         | ✅         | 선택적     |
| 컴파일      | ❌         | ✅         | ❌         |
| 인기도      | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ |

성능 비교:

| 라이브러리 | 번들 크기 | 속도 | 사용성 |
| :--------- | --------: | :--: | :----- |
| React      |      44KB | 빠름 | 쉬움   |
| Vue        |      34KB | 빠름 | 쉬움   |
| Angular    |     143KB | 보통 | 보통   |

## 구분선

첫 번째 섹션

---

두 번째 섹션

---

세 번째 섹션

## 중첩된 요소

1. **프론트엔드 개발**
    - HTML/CSS 기초
    - JavaScript 심화
        ```javascript
        const skills = ["React", "Vue", "Angular"];
        ```
    - 프레임워크 선택

2. **백엔드 개발**

    > API 설계가 가장 중요합니다.
    - RESTful API
    - GraphQL

3. **데브옵스**
    - CI/CD 파이프라인
    - 클라우드 서비스

## 이모지

텍스트에 이모지도 사용할 수 있습니다! 🎉 🚀 💻 🎨 ✨

## 특수 문자

HTML 엔티티: &copy; &trade; &reg;

특수 기호: © ® ™ € £ ¥

## 마무리

이것으로 **마크다운 스타일 테스트**를 마칩니다.

모든 스타일이 제대로 렌더링되는지 확인해보세요! ✅
