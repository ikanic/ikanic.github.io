---
title: "React Hooks 완벽 정리"
created-date: "2024-01-10"
modified-date: "2024-01-10"
category: "Development"
tags: ["React", "JavaScript", "Hooks"]
description: "React Hooks의 핵심 개념과 실전 활용법을 정리합니다. useState, useEffect, useCallback 등 주요 Hooks를 예제와 함께 알아봅니다."
---

# React Hooks 완벽 정리

React 16.8에서 도입된 **Hooks**는 함수형 컴포넌트에서도 상태 관리와 생명주기 기능을 사용할 수 있게 해주는 혁신적인 기능입니다.

## Hooks를 사용하는 이유

### 클래스 컴포넌트의 문제점

- **복잡한 생명주기 메서드**: componentDidMount, componentDidUpdate 등
- **this 바인딩 이슈**: 이벤트 핸들러마다 bind 필요
- **코드 재사용 어려움**: HOC나 Render Props 필요

### Hooks의 장점

- ✅ **간결한 코드**: 함수형 컴포넌트로 통일
- ✅ **로직 재사용**: 커스텀 훅으로 쉽게 공유
- ✅ **직관적인 상태 관리**: useState로 간단하게 처리

## 주요 Hooks

### useState - 상태 관리

가장 기본적인 Hook으로, 컴포넌트에 상태를 추가합니다.

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (

      Count: {count}
      <button onClick={() => setCount(count + 1)}>
        증가


  );
}
```

**핵심 포인트:**

- 초기값을 인자로 받음
- [상태값, 업데이트 함수] 배열 반환
- 함수형 업데이트 지원: `setCount(prev => prev + 1)`

### useEffect - 부수 효과 처리

컴포넌트가 렌더링될 때마다 특정 작업을 수행합니다.

```jsx
import { useEffect, useState } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 데이터 fetching
    fetchUser(userId).then(setUser);

    // cleanup 함수
    return () => {
      // 컴포넌트 언마운트 시 실행
      cancelRequest();
    };
  }, [userId]); // 의존성 배열

  return {user?.name};
}
```

**의존성 배열:**

- `[]`: 마운트 시 한 번만 실행
- `[dep]`: dep 변경 시마다 실행
- 생략: 매 렌더링마다 실행

### useCallback - 함수 메모이제이션

함수를 메모이제이션하여 불필요한 재생성을 방지합니다.

```jsx
import { useCallback, useState } from 'react';

function SearchComponent() {
  const [query, setQuery] = useState('');

  const handleSearch = useCallback(() => {
    console.log('Searching for:', query);
    // 검색 로직
  }, [query]);

  return (

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      Search

  );
}
```

### useMemo - 값 메모이제이션

계산 비용이 높은 값을 캐싱합니다.

```jsx
import { useMemo } from "react";

function ExpensiveComponent({ items }) {
    const sortedItems = useMemo(() => {
        console.log("Sorting items...");
        return items.sort((a, b) => a.value - b.value);
    }, [items]);

    return;
}
```

### useRef - DOM 참조 & 값 유지

DOM 요소에 직접 접근하거나 리렌더링 없이 값을 유지합니다.

```jsx
import { useRef, useEffect } from "react";

function AutoFocusInput() {
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current.focus();
    }, []);

    return;
}
```

## 커스텀 Hook 만들기

반복되는 로직을 커스텀 Hook으로 추출할 수 있습니다.

```jsx
function useLocalStorage(key, initialValue) {
    const [value, setValue] = useState(() => {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : initialValue;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}

// 사용 예시
function App() {
    const [name, setName] = useLocalStorage("name", "");

    return <input value={name} onChange={(e) => setName(e.target.value)} />;
}
```

## Hooks 사용 규칙

### 1. 최상위에서만 호출

❌ **잘못된 예:**

```jsx
function Component() {
    if (condition) {
        const [state, setState] = useState(0); // ❌
    }
}
```

✅ **올바른 예:**

```jsx
function Component() {
    const [state, setState] = useState(0); // ✅

    if (condition) {
        // state 사용
    }
}
```

### 2. React 함수 내에서만 호출

- ✅ 함수형 컴포넌트 내부
- ✅ 커스텀 Hook 내부
- ❌ 일반 JavaScript 함수

## 실전 팁

### 1. 상태 분리하기

```jsx
// ❌ 하나의 객체로 관리
const [state, setState] = useState({ name: "", age: 0 });

// ✅ 독립적인 상태로 분리
const [name, setName] = useState("");
const [age, setAge] = useState(0);
```

### 2. useEffect 의존성 배열 정확히 명시

```jsx
// ESLint 플러그인 사용 권장
// eslint-plugin-react-hooks
```

### 3. 불필요한 리렌더링 방지

```jsx
// useCallback, useMemo 적절히 활용
const memoizedCallback = useCallback(() => {
    doSomething(a, b);
}, [a, b]);
```

## 자주 하는 실수

### 1. 무한 루프

```jsx
// ❌ 의존성 배열 누락
useEffect(() => {
    setCount(count + 1); // 무한 루프!
});

// ✅ 조건 추가 또는 의존성 명시
useEffect(() => {
    if (shouldUpdate) {
        setCount(count + 1);
    }
}, [shouldUpdate]);
```

### 2. stale closure

```jsx
// ❌ 오래된 값 참조
const [count, setCount] = useState(0);

useEffect(() => {
    const timer = setInterval(() => {
        setCount(count + 1); // 항상 초기값 참조
    }, 1000);
}, []);

// ✅ 함수형 업데이트 사용
useEffect(() => {
    const timer = setInterval(() => {
        setCount((prev) => prev + 1);
    }, 1000);
}, []);
```

## 마무리

React Hooks는 처음에는 어렵게 느껴질 수 있지만, 익숙해지면 정말 강력한 도구입니다.

핵심은:

- ✅ 규칙을 지키기
- ✅ 의존성 배열 정확히 관리
- ✅ 적재적소에 메모이제이션 활용

Happy Coding! 🚀
