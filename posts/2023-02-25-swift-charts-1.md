---
title: "[Swift Charts] 1️⃣ Swift Charts 가볍게 훑어보기"
created-date: "2023-02-25 21:10"
modified-date: "2023-02-25 21:10"
category: "Swift"
tags:
    [
        "Swift Charts",
        "Framework",
        "SwiftUI",
        "iOS",
        "Swift",
        "글또 8기",
        "훑어보기",
    ]
series: "Swift Charts"
seriesOrder: 1
description: "Swift Charts를 가볍게 훑어보자"
---

진행 중이던 프로젝트에 막대형 그래프 모양이 필요해서 iOS로 차트를 그리는 방법을 찾다가 공부한 내용을 정리합니다.<br>
이번 시간에는 Swift Charts에 대해 애플의 공식 문서 예제를 따라하며 가볍게 훑어보겠습니다.

# 개요

**Swift Charts**(이하 '스위프트 차트')는 WWDC 2022에서 애플이 공개한 SwiftUI 프레임워크입니다.

Apple의 [Swift Charts 문서](https://developer.apple.com/documentation/charts)에서는 스위프트 차트를 **"데이터를 유용한 시각화 자료로 변환하기 위한 강력하고 간결한 SwiftUI 프레임워크로, 스위프트 차트를 사용하면 최소한의 코드로 효과적이고 커스터마이징할 수 있는 차트를 만들 수 있다"**고 소개하고 있습니다.

스위프트 차트는 _마크(marks)_, _스케일(scales)_, _축(axes)_, _범례(legends)_ 를 구성 요소로 제공하며, 이 요소들을 조합하여 다양한 데이터 기반 차트를 개발할 수 있습니다.<br>
![다양한 차트](https://github.com/user-attachments/assets/f8f2688f-6edf-4737-994e-9d0dcca2c139)
^^이미지 출처: [애플 공식 문서 - Swift Charts](https://developer.apple.com/documentation/charts)^^

데이터의 _패턴_ 이나 _추세(trend)_ 를 전달하기 위해 스위프트 차트를 여러가지 방법으로 사용할 수 있습니다.<br>
_꺾은 선형 차트(line charts_), _막대형 차트(bar charts)_, _분산형 차트(scatter charts)_ 등 다양한 차트를 만들 수 있습니다.<br>
스위프트 차트를 사용해서 차트를 만들면 데이터에 맞는 스케일과 축이 자동으로 생성됩니다.

스위프트 차트는 _현지화(localization)_ 와 _접근성(accessiblity)_ 기능 또한 지원하며, 차트 수정자(`chart modifier`)를 사용하여 기본 동작을 재정의하여 차트를 원하는 대로 _사용자 지정(customize)_ 하여 만들 수도 있습니다.<br>
예를 들면 차트에 애니메이션을 추가하여 동적인 환경을 만들 수 있습니다.

# 스위프트 차트를 사용해 차트 만들기

![장난감 컬렉션](https://github.com/user-attachments/assets/6f075e11-7712-413a-816f-956e61350c3f)
^^이미지 출처: [애플 공식 문서 - Creating a chart using Swift Charts](https://developer.apple.com/documentation/charts/creating-a-chart-using-swift-charts)^^

지금부터는 Apple의 [Creating a chart using Swift Charts 문서](https://developer.apple.com/documentation/charts/creating-a-chart-using-swift-charts)를 보면서 차트 만드는 방법을 차근차근 따라해 보겠습니다.

문서에서는 아래와 같은 색과 모양의 장난감 컬렉션이 있다고 가정했습니다.

|        | 정육면체 | 구  | 피라미드 | 합계 |
| :----: | :------: | :-: | :------: | :--: |
| 분홍색 |    1     |  2  |    0     |  3   |
| 노랑색 |    1     |  1  |    2     |  4   |
| 보라색 |    1     |  1  |    1     |  3   |
| 초록색 |    2     |  0  |    1     |  3   |
|  합계  |    5     |  4  |    4     |  13  |

위 테이블에서 어떤 장난감 모양이 가장 많고, 어떤 색의 장난감이 몇개나 되는지 등을 쉽게 확인할 수 있습니다.<br>
하지만, 이 데이터를 차트로 표현하면 더 효과적으로 많은 양의 정보를 한 번에 보여줄 수 있습니다.

생성하는 차트의 종류와 구성 방법은 표시하려는 내용에 따라 달라집니다.

스위프트 차트로 차트를 만들기 위해서는

1. 먼저 **데이터를 정의**하고,
2. **마크와 데이터 속성으로 차트 뷰를 초기화** 합니다.
3. 그런 다음 **수정자(modifier)를 사용하여 범례, 축 및 스케일 등 차트의 다양한 구성 요소를 사용자 지정**합니다.

우선 데이터를 정의해보겠습니다.

먼저, 장난감의 색은 생각하지 않고, 어떤 모양의 장난감이 가장 많은지를 표현하기 위한 차트를 만들어 보겠습니다.<br>
장난감의 모양과 개수 정보를 갖는 `Toy` 구조체를 만듭니다.

```swift title="Toy.swift"
struct Toy {
    var type: String
    var count: Double
}
```

그런 다음 테이블의 데이터를 저장하기 위해 Toy 구조체 배열을 초기화 합니다.

```swift
var data: [Toy] = [
    .init(type: "정육면체", count: 5),
    .init(type: "구", count: 5),
    .init(type: "피라미드", count: 5),
]
```

그 다음으로 차트 뷰를 초기화하고 마크를 만들어 보겠습니다.

우선, 그리려고 하는 데이터의 컨테이너 역할을 할 차트 뷰를 만듭니다.

```swift title="BarChart.swift"
import Charts
import SwiftUI

struct BarChart: View {
    var body: some View {
        Chart {
            // 마크 추가
        }
    }
}
```

`Chart` 블록 안에서, 데이터를 나타내는 그래픽 마크를 지정합니다.<br>
`BarMark`, `PointMark`, `LineMark` 등 다양한 종류의 마크로 데이터를 채울 수 있습니다.

데이터를 시각화하려는 방식에 따라 마크의 종류를 선택할 수 있습니다.<br>
예를 들어, LineMark를 사용하여 꺾은 선형 차트를 만들거나, PointMark를 사용하여 분산형 차트를 만들 수 있습니다.<br>
예제에서는 막대형 차트를 만드는 것이 각 모양별 장난감 수를 전달하는 좋은 방법이므로 BarMark를 사용합니다.

```swift
Chart {
    BarMark(
        x: .value("모양", data[0].type),
        y: .value("합계", data[0].count)
    )
    BarMark(
        x: .value("모양", data[1].type),
        y: .value("합계", data[1].count)
    )
    BarMark(
        x: .value("모양", data[2].type),
        y: .value("합계", data[2].count)
    )
}
```

결과 차트를 보면 정육면체 장난감 모양이 가장 많이 나타난다는 것을 명확하게 알 수 있습니다.<br>
![기본 막대 차트](https://github.com/user-attachments/assets/8a1aa8aa-3a3e-4d85-a528-ac82ccbf97cd)
위의 차트를 조금 더 자세하게 뜯어보면 아래와 같은 요소로 구성되어 있습니다.<br>
![기본 막대 차트 구성 요소](https://github.com/user-attachments/assets/c272df38-17ec-4ceb-944d-83e0a60a0e2c)
스케일은 각 BarMark의 위치, 높이 및 색상을 결정합니다.<br>
데이터를 y 차원에 그릴 때, 스위프트 차트는 데이터 값을 매핑하기 위해 y 축에 대한 축 값을 자동으로 생성합니다.<br>
y 차원의 스케일은 각각의 모양 그룹의 총합의 범위와 일치하도록 조정됩니다.

위의 코드는 각각의 BarMark를 개별적으로 나열하여 작성해야 합니다.<br>
하지만, 규칙적이고 반복적인 데이터의 경우 `ForEach` 구조를 사용하여 동일한 차트를 보다 간결하게 표현할 수 있습니다.<br>
위에서 작성한 BarMark를 ForEach를 사용하여 간결한 구조로 변경해 보겠습니다.

먼저, ForEach를 사용하기 위해 Toy 구조체에 `Identifiable` 프로토콜을 채택합니다.<br>
Identifiable 프로토콜을 채택하기 위해서는 각각의 아이템을 식별하기 위한 식별자를 가져야하므로, `UUID` 타입의 `id`를 구조체의 멤버로 추가해 줍니다.

```swift title="Toy.swift"
struct Toy: Identifiable {
    var type: String
    var count: Double
    var id = UUID()
}
```

그 후, 아래와 같이 ForEach를 사용하여 Chart 블록 내부를 변경합니다.

```swift
Chart {
    ForEach(data) { shape in
        BarMark(
            x: .value("모양", shape.type),
            y: .value("합계", shape.count)
        )
    }
}
```

이렇게 ForEach를 사용하여 간결하게 변경한 코드로도 이전과 같은 결과를 확인할 수 있습니다.

## 추가 데이터 속성 탐색

위의 막대형 차트는 각 장난감의 모양별 개수를 보여주지만, 앞의 표에서는 각 장난감을 색상별로도 구분하고 있습니다.<br>
_누적 막대형 차트(stacked bar chart)_ 를 사용하면 각 장난감의 모양별 개수뿐만 아니라 색상 분포도 시각화할 수 있습니다.<br>
새로운 정보인 색상을 구분하여 보여주려면 먼저 데이터 구조에서 색상을 표현할 수 있도록 변경해야 합니다.

Toy 구조체에 색상을 표현하기 위한 프로퍼티를 추가합니다.

```swift title="Toy.swift"
struct Toy: Identifiable {
    var color: String
    var type: String
    var count: Double
    var id = UUID()
}
```

그런 다음 색상 정보를 포함하도록 초기화된 데이터를 업데이트합니다.

```swift
var data: [ToyShape] = [
    .init(color: "초록색", type: "정육면체", count: 2),
    .init(color: "초록색", type: "구", count: 0),
    .init(color: "초록색", type: "피라미드", count: 1),
    .init(color: "보라색", type: "정육면체", count: 1),
    .init(color: "보라색", type: "구", count: 1),
    .init(color: "보라색", type: "피라미드", count: 1),
    .init(color: "분홍색", type: "정육면체", count: 1),
    .init(color: "분홍색", type: "구", count: 2),
    .init(color: "분홍색", type: "피라미드", count: 0),
    .init(color: "노랑색", type: "정육면체", count: 1),
    .init(color: "노랑색", type: "구", count: 1),
    .init(color: "노랑색", type: "피라미드", count: 2)
]
```

이 추가 정보를 표현하기 위해서는 BarMark에 `foregroundStyle(by:)` 메서드를 추가하고 데이터의 색상 속성을 _표시할 수 있는(plottable)_ 값으로 지정합니다.

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
```

이제 차트는 각각의 막대를 아래와 같이 각 도형의 색상 수를 나타내는 여러 부분으로 분할하여 보여줍니다.<br>
![누적 막대 차트](https://github.com/user-attachments/assets/cfa1c578-2cb6-4e84-bb48-2f5baa44fee1)
누적 막대형 차트는 색상을 나타내는 새 데이터를 보여주고 범례를 추가하여 어떤 색상이 어떤 종류의 데이터를 나타내는지 표시합니다.<br>
![누적 막대 차트 구성 요소](https://github.com/user-attachments/assets/acd33b6e-6f45-4e15-83eb-61833a1f37df)

## 차트 사용자 지정

많은 차트에서 기본 구성만으로도 보여주고자 하는 정보를 잘 표현할 수 있습니다.<br>
하지만, 위의 경우 스위프트 차트가 각 마크에 할당하는 색상이 마크가 나타내는 장난감의 색상과 일치하지 않습니다.<br>
`chartForegroundStyleScale(\_:)` 차트 수정자를 추가하면 이러한 기본 색상 스케일을 재정의하도록 차트를 사용자 지정할 수 있습니다.

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

![누적 막대 차트 색상 변경](https://github.com/user-attachments/assets/f001e0a9-6d24-496c-818a-acb067ae21e8)
이제 색상의 이름이 차트에서 사용된 색상과 일치하여 차트를 더 쉽게 이해할 수 있습니다.<br>
![누적 막대 차트 색상 변경 구성 요소](https://github.com/user-attachments/assets/14801588-9915-40ee-8ca1-a76bdf6c2896)
이제 차트가 장난감의 모양과 색상 간의 관계를 명확하게 보여줍니다.<br>
그 외에도 다양한 방법으로 차트를 사용자 지정할 수 있습니다.<br>
예를 들면 막대 너비를 설정하고, 다른 범례 기호를 선택하거나, 축을 변경할 수도 있습니다.

해당 예제의 코드 전문은 [여기](https://github.com/ikanic/SwiftUICodeForBlog/blob/main/SwiftUIForBlog/BarChart.swift)에서 확인할 수 있습니다.

# 후기

이번 시간에는 Swift Charts에 대해 가볍게 훑어보았는데, 생각보다 Swift Charts가 잘 만들어져 있다는 인상을 받았습니다.<br>
단순히 단색의 정적인 차트만 보여주는 것이 아니라, 차트 안에서도 그룹별로, 또 그룹 내에서도 서브 그룹별로 색상을 나눠서 표현할 수 있고, 필요하다면 애니메이션도 넣어 동적으로 보여줄 수 있다는 점에서 꽤 본격적이다는 생각이 들었는데요.

아쉽게도 진행 중인 프로젝트가 UIKit 기반이기도 하고, 사용하려던 것과는 조금 다른 모양이어서 프로젝트에 직접 반영하진 못했지만, Swift Charts에 대해 공부해볼 수 있는 좋은 기회가 된 것 같습니다.<br>
언젠가 기회가 된다면 제대로 Swift Charts를 써보고 싶네요.

다음 시간에는 [Swift Charts 2️⃣ - Swift Charts 톺아보기](./2023-03-13-swift-charts-2)로 Swift Charts에 대해 어떤 프로퍼티와 메서드를 사용할 수 있는지 조금 더 자세하게 살펴보도록 하겠습니다.

여담으로 단순히 문서를 번역하고 무작정 따라한 것에 가까운 글이었는데, 생각보다 정말 오랜 시간이 걸리네요.<br>
제대로 개발 글 쓰시는 분들 정말 존경합니다. ㅠㅠ

# 레퍼런스

- [Apple Developer Documentation/Swift Charts](https://developer.apple.com/documentation/charts)
- [Apple Developer Documentation/Swift Charts/Creating a chart using Swift Charts](https://developer.apple.com/documentation/charts/creating-a-chart-using-swift-charts)

### 게시물 수정내역

2023.02.27 22:17 _계층_ 으로 번역했던 _Scales_ 를 _스케일_ 로 변경<br>
2023.02.27 22:23 _기본 막대 차트 구성 요소, 누적 막대 차트 구성 요소_ 그림 번역 변경<br>
2023.02.27 22:40 게시물 제목 변경 _[SwiftUI] Swift Charts 1️⃣ - Swift Charts 가볍게 훑어보기 -> [Swift Charts] 1️⃣ Swift Charts 가볍게 훑어보기_<br>
2023.02.28 01:19 _plottable_ 번역을 _구분할 수 있는_ 에서 _표시할수 있는_ 으로 변경
