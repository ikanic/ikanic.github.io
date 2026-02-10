---
title: "iOS 앱에 Widget 추가하기"
created-date: "2022-07-10 09:23"
modified-date: "2022-07-10 09:23"
category: "Swift"
tags: ["Widget", "WidgetBundle", "SwiftUI", "iOS", "Swift", "글또 7기"]
description: "iOS 앱에 Widget을 추가해보자"
---

# 서론

최근 Apple Developer Academy @POSTECH에서의 두 번째 팀 프로젝트(MC2)를 마치고, 세 번째 팀 프로젝트(MC3)를 시작했다.<br>
그동안은 팀 프로젝트 사이에 개인 프로젝트가 있었는데, 이번에는 개인 프로젝트 없이 바로 새로운 팀 프로젝트로 들어갔다.<br>
항상 새로운 팀 프로젝트가 시작되면 초반에는 기획 단계라서 개발을 전혀하지 않게 되는데, 이렇게 많은 개발자들과 디자이너들 기획자들이 모인 환경일 때 최대한 많은 프로젝트를 해보고 싶어서 친한 친구와 둘이서 팀으로 사이드 프로젝트를 시작했다.<br>
이번 사이드 프로젝트는 위젯이 주요 기능 중 하나였는데, 위젯을 추가하면서 공부한 내용을 정리해보고자 한다.

# WidgetKit

WidgetKit은 iOS의 홈 화면과 Today View, macOS의 알림 센터에 위젯을 배치하고 iPhone의 잠금 화면에 액세서리 위젯을 배치하고, watchOS의 컴플리케이션으로 액세서리 위젯을 배치하여 사용자가 앱의 콘텐츠에 즉시 액세스 할 수 있도록 한다.<br>
다양한 크기(small, medium, large, extra large) 및 액세서리 스타일(watchOS의 경우 원형, 직사각형, 평면 및 모서리)을 사용하여 광범위한 정보를 표시할 수 있다.<br>
다가오는 iOS 16 및 watchOS 9부터 WidgetKit을 사용하면 watchOS에서 컴플리케이션으로 표시되고 iPhone의 잠금 화면에서 위젯으로 나타나는 액세서리 위젯을 생성할 수도 있다.<br>
액세서리 위젯은 iOS 앱 콘텐츠를 Apple Watch로, watchOS 앱 콘텐츠를 iPhone으로 가져올 수 있게한다.

# iOS 앱에 Widget 추가하기

우선 Widget을 구성하기 위해서는 Widget Extension을 추가해야 한다.<br>
![새 Target 추가](https://github.com/user-attachments/assets/19862541-557f-4302-bcbc-ffbbb8b7bfe9)
![Widget Extension 추가](https://github.com/user-attachments/assets/4908fbb8-c4a3-4003-b9ba-79766f40cf67)
![Widget Extension 생성](https://github.com/user-attachments/assets/f3f9ce7c-460b-499e-b192-21606bfcbf69)
Widget Extension은 Xcode 상단 툴바에서 File > New > Target을 선택한 후 Widget Extension을 선택하여 추가할 수 있다.<br>
![Widget Active](https://github.com/user-attachments/assets/8f33f760-2f55-46be-bfa6-19e03b835614)
위젯을 추가하려 하면 Active 하겠냐는 창이 나오는데 확인을 누르면 위젯이 만들어지게 된다.

앱에 여러 Extension이 포함될 수 있지만, 일반적으로 모든 위젯은 단일 Widget Extension에 포함한다.<br>
다만 일부 위젯에는 위치 정보를 사용하고 다른 위젯에서는 사용하지 않는 등 권한 및 용도가 명확하게 다른 경우에는 별도의 Widget Extension을 사용하는 것이 좋다.<br>

Widget Extension 템플릿은 Widget 프로토콜을 준수하는 초기 위젯 구현을 제공한다. 이 위젯의 body 속성은 Widget에 사용자 구성 속성이 있는지 여부를 결정한다. 구성에는 `StaticConfiguration`과 `IntentConfiguration`의 두 가지가 있다.

`StaticConfiguratioin`은 사용자 구성 속성이 없는 경우로 주식 시장 위젯이나 트렌드 헤드라인을 표시하는 뉴스 위젯 등이 있다.<br>
`IntentConfiguration`은 사용자 구성 속성이 있는 위젯으로, SiriKit Custom Definetion File을 사용하여 속성을 정의한다. 예시로는 특정 도시를 선택할 수 있는 날씨 위젯 등이 있다.

위젯을 처음 생성하면 아래와 같은 코드 구조를 확인할 수 있다.

```swift title="TestWidget.swift"
import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date())
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        var entries: [SimpleEntry] = []

        // Generate a timeline consisting of five entries an hour apart, starting from the current date.
        let currentDate = Date()
        for hourOffset in 0 ..< 5 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            let entry = SimpleEntry(date: entryDate)
            entries.append(entry)
        }

        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }

}

struct SimpleEntry: TimelineEntry {
    let date: Date
}

struct TestWidgetEntryView : View {
    var entry: Provider.Entry

        var body: some View {
            Text(entry.date, style: .time)
        }

}

@main
struct TestWidget: Widget {
    let kind: String = "TestWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            TestWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("My Widget")
        .description("This is an example widget.")
    }

}

struct TestWidget_Previews: PreviewProvider {
    static var previews: some View {
        TestWidgetEntryView(entry: SimpleEntry(date: Date()))
           .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}
```

다음으로는 위의 코드를 하나하나 살펴보겠다.

첫 번째로 볼 코드는 Provider이다.

```swift
struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
      SimpleEntry(date: Date())
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        var entries: [SimpleEntry] = []

        // Generate a timeline consisting of five entries an hour apart, starting from the current date.
        let currentDate = Date()
        for hourOffset in 0 ..< 5 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            let entry = SimpleEntry(date: entryDate)
            entries.append(entry)
        }

        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }

}
```

Provider는 시간에 따른 위젯의 업데이트 로직을 나타낸다.<br>
Provider의 가장 위에 있는 placeholder function은 특정 내용 없이 위젯을 보여주게 된다.<br>
getSnapshot function은 위젯이 일시적으로 호출하는 함수로 샘플 데이터를 제공한다. 위젯 갤러리에 보이는 위젯 샘플이 이에 해당한다.<br>
getTimeline function은 현재 시간과 위젯을 업데이트할 향후 시간에 대한 타임라인 항목을 제공한다.

다음으로 볼 코드는 View이다.

```swift
struct TestWidgetEntryView : View {
    var entry: Provider.Entry

    var body: some View {
        Text(entry.date, style: .time)
    }

}
```

View는 일반적인 SwiftUI iOS 앱을 만들 때와 같이 화면에 보일 내용을 정의한다.

다음으로 볼 코드는 Widget이다.

```swift
@main
struct TestWidget: Widget {
    let kind: String = "TestWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            TestWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("My Widget")
        .description("This is an example widget.")
    }

}
```

kind는 Widget의 식별자 역할을 한다. 한 Widget Extension에 여러 Widget이 나오게 된다면 반드시 kind를 다르게 해주어야만 한다.<br>
![Widget 추가](https://github.com/user-attachments/assets/5e842e1f-2285-4d1b-bca4-ed42ca436608)
configurationDisplayName과 description은 각각 위젯 갤러리의 타이틀과 설명을 나타낸다.

현재는 Widget Extension에서 하나의 Widget만을 제공하는데, 하나의 Widget Extension에서 여러 Widget을 제공할 수도 있다.<br>
이럴 때는 아래와 같이 WidgetBundle을 사용하여 여러 Widget을 한 Widget Extension에서 제공할 수 있다.

```swift
@main
struct TestWidgetBundle: WidgetBundle {
    @WidgetBundleBuilder
    var body: some Widget {
        TestWidget()
        AnotherWidget()
    }
}
```

이때, 주의해야 할 점은 반드시 Widget이 아닌 WidgetBundle에 `@main`을 작성해야 한다.

# 후기

Widget에 대해 공부한 내용이 더 많은데, 당장 정리가 안돼서 이 정도밖에 기록하지 못했다. 시간이 나는 대로 위젯 편집에 대한 내용을 추가할 예정이다.

# 레퍼런스

- [Apple Developer Documentation/WidgetKit](https://developer.apple.com/documentation/widgetkit/)
