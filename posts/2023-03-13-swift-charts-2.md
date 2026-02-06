---
title: "[Swift Charts] 2️⃣ Swift Charts 톺아보기 - Chart"
created-date: "2023-03-13 01:40"
modified-date: "2023-03-13 01:40"
category: "Swift"
tags:
    [
        "Framework",
        "iOS",
        "Swift",
        "Swift Charts",
        "SwiftUI",
        "글또 8기",
        "톺아보기",
        "Chart",
        "Chart Content",
    ]
series: "Swift Charts"
seriesOrder: 2
description: "Swift Charts의 Chart에 대해 깊게 톺아보자"
---

지난 시간에 이어 이번에는 Swift Charts(이하 '스위프트 차트')에 대해 코드와 함께 세세하게 살펴보도록 하겠습니다.

지난 글의 내용을 모르셔도 상관 없지만, [여기](./2023-02-25-swift-charts-1)를 클릭하셔서 지난 글을 보고 오시면 이해에 더 도움이 됩니다.

# 개요

![Swift Charts](https://github.com/user-attachments/assets/759578f7-1891-4700-98ac-4bc7df54076f)
^^이미지 출처: [애플 WWDC22 - Hello Swift Charts](https://developer.apple.com/videos/play/wwdc2022/10136/)^^

지난 시간에 보았듯, 스위프트 차트는 WWDC에서 애플이 공개한 SwiftUI 프레임워크입니다.

먼저, 스위프트 차트를 사용하여 개발하기 위해서는 Xcode 14 버전 이상이 필요하며, 지원하는 대상 OS는 iOS 16, iPadOS 16, macOS 13, Mac Catalyst 16, tvOS 16, watchOS 9 이상에서 지원합니다.

지난 시간에 스위프트 차트는 마크(marks), 스케일(scales), 축(axes), 범례(legends) 등의 구성 요소를 조합하여 다양한 차트를 만들 수 있다고 했는데요.

이 요소들에 대해 하나하나 뜯어보기 전에, 지난 시간에 사용했던 코드를 잠시 살펴보고 가겠습니다.

```swift
Chart {
    ForEach(data) { shape in
        BarMark(
            x: .value("모양", shape.type),
            y: .value("합계", shape.count)
        )
        .foregroundStyle(by: .value("색상", shape.color))
    }
}
.chartForegroundStyleScale([
    "초록색": .green, "보라색": .purple, "분홍색": .pink, "노랑색": .yellow
])
```

지난 시간에 이런 식의 코드를 사용하여 누적 막대 그래프를 만들어 보았는데요.<br>
여기서 `Chart`라는 처음보는 요소가 나오네요.

이번 시간에는 우선 이 `Chart`에 대해 알아보고 가겠습니다.

# Chart

`Chart`는 차트를 표시하는 SwiftUI 뷰입니다.

내부적으로는 `struct Chart<Content> where Content: ChartContent`의 형태로 구현되어 있는데요.<br>
View 중에서도 내부 콘텐츠가 `ChartContent`라는 프로토콜을 채택하고 있는 뷰입니다.

그렇다면 `ChartContent` 프로토콜을 무엇일까요?

## ChartContent

`ChartContent` 프로토콜은 차트에 그리는 콘텐츠를 나타내는 타입이라고 하는데요.

마크나 심볼 등, 모든 차트의 콘텐츠들은 `ChartContent`를 채택하고 있습니다.

`ChartContent` 프로토콜에는 마크의 모양이나 위치, 심볼의 모양, 마크 어노테이션 등 차트에 들어가는 콘텐츠들을 설정하는 함수들이 구현되어 있습니다.

다시 `Chart`에 대해 살펴봅시다.

Chart를 초기화하는 생성자(Initializer)에는 `.init(content: () -> Content)`, `.init<Data, C>(Data, content: (Data.Element) -> C)`, `.init<Data, ID, C>(Data, id: KeyPath<Data.Element, ID>, content: (Data.Element) -> C)`의 3가지가 있는데, 각각의 의미는 아래와 같습니다.

## Chart를 초기화하는 방법

- Content만 사용하여 차트 구성
- Data와 Content를 사용하여 차트 구성
- Data와 ID, Content를 사용하여 차트 구성

위의 3가지 방법을 지난 시간에 사용했던 코드를 이용하여 하나씩 살펴보겠습니다.

우선 지난 시간에 사용했던 데이터의 구조는 아래와 같습니다.

```swift titile="Toy.swift"
struct Toy: Identifiable {
    var color: String
    var type: String
    var count: Double
    var id = UUID()
}
```

해당 구조에 사용된 데이터는 아래와 같습니다.

|        | 정육면체 | 구  | 피라미드 | 합계 |
| :----: | :------: | :-: | :------: | :--: |
| 분홍색 |    1     |  2  |    0     |  3   |
| 노랑색 |    1     |  1  |    2     |  4   |
| 보라색 |    1     |  1  |    1     |  3   |
| 초록색 |    2     |  0  |    1     |  3   |
|  합계  |    5     |  4  |    4     |  13  |

1. **Content만 사용하여 차트 구성**

우선 첫 번째 방법인 Content만 사용하여 차트를 구성하는 방법을 알아보겠습니다.

Content만 사용하여 차트를 구성하는 방법에는 `.init(content: () -> Content)` 생성자를 사용할 수 있습니다.

이 생성자를 사용한다면 아래와 같이 자유롭게 차트를 구성할 수 있습니다.

```swift
Chart {
    BarMark(
        x: .value("모양", data[0].type),
        y: .value("합계", data[0].count)
    )
    .foregroundStyle(by: .value("색상", data[0].color))

    ...

    BarMark(
        x: .value("모양", data[11].type),
        y: .value("합계", data[11].count)
    )
    .foregroundStyle(by: .value("색상", data[11].color))
}
.chartForegroundStyleScale([
    "초록색": .green, "보라색": .purple, "분홍색": .pink, "노랑색": .yellow
])
```

혹은 맨 위에서 봤던 것처럼 `ForEach`를 사용하여 반복되는 부분은 줄일 수도 있습니다.

하지만 이렇게 같은 계열의 데이터를 이용하여 차트를 구성한다면 2,3번 방법이 더 좋은 선택이 될 수도 있을 것 같습니다.

비교적 자유로움은 덜하지만 이렇게 반복되는 구조를 표현하기 좋은 두 가지 방법을 살펴보겠습니다.

2. **Data와 Content를 사용하여 차트 구성**

Data와 Content를 사용하여 차트를 구성하는 방법에는 `.init<Data, C>(Data, content: (Data.Element) -> C)` 생성자를 사용할 수 있습니다.

이 생성자를 사용할 경우 내부적으로 `ForEach`를 사용하는 것과 비슷한 동작을 하므로 이 방법을 사용하여 차트에 사용될 데이터는 반드시 `Identifiable` 프로토콜을 채택해야만 합니다.

이 생성자를 사용하려면 ForEach처럼 차트의 후행 클로저(Trailing Closure)에 사용할 클로저 아규먼트 이름을 명시합니다.

이 방법으로 위에서 사용한 코드를 재구성해보면 아래와 같습니다.

```swift
Chart(data) { shape in
    BarMark(
        x: .value("모양", shape.type),
        y: .value("합계", shape.count)
    )
    .foregroundStyle(by: .value("색상", shape.color))
}
.chartForegroundStyleScale([
`"초록색": .green, "보라색": .purple, "분홍색": .pink, "노랑색": .yellow
])
```

위에서 사용한 코드보다 훨씬 간결하고, `ForEach`를 사용할 때 보다도 조금 더 깔끔해보이죠?

3. **Data와 ID, Content를 사용하여 차트 구성**

Chart를 초기화하는 방법 중 마지막 방법, Data와 ID, Content를 사용하여 차트를 구성하는 방법에는 `.init<Data, ID, C>(Data, id: KeyPath<Data.Element, ID>, content: (Data.Element) -> C)` 생성자를 사용할 수 있습니다.

이 생성자도 2번째 방법과 사용법이 거의 유사한데요.

이 방법을 사용하여 코드를 재구성해보면 아래와 같습니다.

```swift
Chart(data, id: \.id) { shape in
    BarMark(
        x: .value("모양", shape.type),
        y: .value("합계", shape.count)
    )
    .foregroundStyle(by: .value("색상", shape.color))
}
.chartForegroundStyleScale([
    "초록색": .green, "보라색": .purple, "분홍색": .pink, "노랑색": .yellow
])
```

`data` 옆에 `id`가 붙었다는 것을 제외하면 2번째 방법과 별로 다른게 없어보이죠?<br>
2번째 방법과의 차이점이라면 이 생성자를 사용할 때에는 데이터에 `Identifiable` 프로토콜을 채택하지 않아도 된다는 것입니다.<br>
2, 3번째 방법은 `SwiftUI`의 `ForEach`와 사용법이 상당히 유사한 것 같네요.

# 마무리

이번 시간에는 스위프트 차트의 가장 기본이 되는 `Chart`에 대해서 알아보았습니다.<br>
다음 시간부터는 본격적으로 차트의 구성 요소들을 살펴볼텐데요.

다음 시간에는 차트의 구성 요소 중 `Marks`에 대해 알아보겠습니다.

## 후기

원래는 이번 내용으로 스위프트 차트를 전부 끝내버리고 싶었는데, 하나하나 톺아보려고 하니 생각보다 내용이 상당히 많네요.<br>
어쩌다보니 장편 시리즈가 되어버릴 것 같지만, 상당히 재미있고 흥미로운 주제여서 한번 열심히 해보겠습니다. 후후

# 레퍼런스

- [Apple Developer Documentation/Swift Charts/Chart](https://developer.apple.com/documentation/charts/chart)
