---
title: "[Translation] iOS 앱에서 네트워크 상의 텍스트 다국어 지원하기 1️⃣ / Translation 개요, 시스템 내장 UI 환경에서 번역 제공하기"
thumbnail: "https://github.com/user-attachments/assets/92342556-bcda-492c-be7b-6dc99a87c2d8"
created-date: "2024-12-22 22:35"
modified-date: "2024-12-22 22:35"
category: "Swift"
tags: ["Translation", "Framework", "iOS", "SwiftUI", "글또 10기"]
series: "Translation"
seriesOrder: 1
description: "iOS 앱에서 네트워크 상의 텍스트에 다국어를 지원해보자 - 시스템 내장 환경"
---

제 블로그에는 iOS 다국어 지원에 대한 글이 2개 있습니다. 하나는 2022년에 작성했던 예전 방식인 `Strings File`을 사용한 방식에 대한 글이고, 또 하나는 올해 3월에 작성한 `String Catalog`를 사용한 방식입니다. 글을 작성한 이후 개인적으로 다국어 지원에 대한 질문을 여러 경로로 받았습니다.

특히 `String Catalog`를 사용한 방식인 [[iOS] String Catalog - Xcode 15 이후의 iOS 앱에서 다국어 지원하기 (feat. Localization)](./2024-03-31-string-catalog) 작성 이후 앱의 로컬 텍스트가 아닌 네트워크에서 받아온 텍스트를 다국어 지원하는 방법이 있는지에 관한 질문을 몇 번 받았었는데, 당시 제가 알고 있던 지식 수준에서는 iOS로 네트워크 텍스트까지 다국어 지원하는 방법을 잘 알지 못하여 서버에서 다국어 지원을 하는 방법을 사용하거나 댓글 번역 등이 필요하다면 별도의 외부 번역 API를 사용하는 것이 좋을 것 같다고 답했었습니다.

그러던 중 최근 WWDC24 영상을 보다가 `Translation API`에 대해 알게 되었습니다. 이번에는 이 `Translation API`를 이용해 네트워크 텍스트를 번역하는 방법에 대해 공부한 내용을 3부에 걸쳐 정리해보려 합니다.<br>
`Translation API` 3부 중 1부에 해당하는 이번 시간에는 `Translation`의 개요와 시스템 내장 UI 환경에서 번역을 제공하는 방법에 대해 알아보겠습니다.

# Translation

일반적으로 앱 내에서 사용되는 텍스트 중 로컬 텍스트는 `Xcode`의 `String Catalog`나 `Strings File` 등을 사용하여 다국어를 지원할 수 있습니다. 하지만, 네트워크에서 받아오는 텍스트는 이러한 방법만으로 다국어를 지원하기 어려운데요. 이럴 때 사용할 수 있는 것이 `Translation` 프레임워크입니다.<br>
`Translation`은 인앱 번역을 제공하는 프레임워크로, 기본 제공되는 내장 UI를 사용하여 시스템이 사용자에게 번역을 제공하거나, 번역 환경을 커스텀할 수 있습니다.

`Translation` 프레임워크는 문서 상으로는 `iOS 17.4`, `iPadOS 17.4`, `macOS 14.4` 이상의 버전에서 사용할 수 있다고 되어있으나, 실제로는 대부분의 API가 `iOS 18.0`, `iPadOS 18.0`, `macOS 15.0` 이상의 SwiftUI 환경에서만 사용할 수 있습니다.

## 내장 번역 UI 환경에서 번역 제공하기

`Translation`을 이용하면 다양한 번역 환경을 제공할 수 있는데, 그중 시스템 내장 UI를 이용해보겠습니다.<br>
우선 아래와 같이 외국어로 작성된 댓글 뷰가 있다고 가정해보겠습니다.<br>
![댓글 뷰](https://github.com/user-attachments/assets/20452b3a-29fc-4841-80fa-1eda11249861)<br>
위 뷰에는 아래와 같은 코드가 사용되었습니다.

```swift title="Comment.swift"
struct Comment: Hashable {
    var userName: String
    var originalText: String
    var date: String
}
```

`Comment` struct는 뷰에서 보여줄 댓글 작성자, 댓글 내용, 댓글 작성 날짜를 저장하기 위한 모델을 정의합니다.

```swift title="CommentService.swift"
@Observable
class CommentService {
    var comments: [Comment] = [.init(userName: "미뉴", originalText: "こんにちは, 世界!", date: "1995.06.22. 18:20"),
                               .init(userName: "뭉뭉이", originalText: "すごい-!", date: "2005.03.31. 19:22"),
                               .init(userName: "이브니즈", originalText: "おめでとう-!", date: "2023.09.19. 18:00")]
}
```

`CommentService`는 실제 댓글을 저장하는 class로 예시에서는 임의로 배열에 내용을 미리 저장해뒀지만, 실제 앱에서는 `URLSession` 등을 통해 네트워크에서 댓글을 받아와 배열에 저장하는 등의 내용을 작성하게 됩니다.

```swift title="CommentView.swift"
import SwiftUI

struct CommentView: View {
    var userName: String
    var originalText: String
    var date: String

    var body: some View {
        VStack(alignment: .leading) {
            HStack {
                Image(systemName: "person.crop.circle")
                Text(userName)
                Spacer()
                Text(date)
                    .font(.footnote)
            }

            Divider()

            Text(originalText)
        }
        .padding()
        .background {
            RoundedRectangle(cornerRadius: 16)
                .foregroundStyle(Color(uiColor: .systemGray6))
        }
    }
}
```

`CommentView`는 실제 댓글 하나하나를 보여주는 뷰입니다.

```swift title="SystemUITranslationView.swift"
import SwiftUI

struct SystemUITranslationView: View {
@Environment(CommentService.self) var commentService

    var body: some View {
        NavigationStack {
            VStack {
                ForEach(commentService.comments, id: \.self) { comment in
                    CommentView(userName: comment.userName, originalText: comment.originalText, date: comment.date)
                }
            }
        }
        .padding
        .navigationTitle("Translation")
        .navigationBarTitleDisplayMode(.inline)
    }
}
```

마지막으로 `SystemUITranslationView`는 `CommentView`들을 모아서 보여주는 뷰입니다.

`Translation`을 이용해 시스템 내장 UI로 번역 환경을 제공하려면 번역할 텍스트가 포함된 SwiftUI 뷰에 `translationPresentation(isPresented:text:attachmentAnchor:arrowEdge:replacementAction:)` 모디파이어를 연결해 사용할 수 있습니다.

- `nonisolated func translationPresentation(isPresented: Binding<Bool>, text: String, attachmentAnchor: PopoverAttachmentAnchor = .rect(.bounds), arrowEdge: Edge = .top, replacementAction: ((String) -> Void)? = nil) -> some View`
    - 이 모디파이어는 `isPresented` 파라미터로 주어진 조건이 참일 때 `text` 파라미터의 텍스트를 번역하는 팝오버를 표시합니다.
    - `isPresented` 파라미터는 팝오버 표시 여부를 결정하는 `Bool` 값에 대한 바인딩으로 `false`일 경우 팝오버를 표시하지 않고, `true`일 경우 팝오버를 표시합니다.
    - `text` 파라미터는 번역할 텍스트로, 만약 팝오버가 표시된 후에 `text`의 값이 변경되더라도 이미 표시된 팝오버에는 영향을 주지 않습니다.
    - `attchmentAnchor` 파라미터는 팝오버의 부착 지점을 정의하는 위치 앵커로 기본값은 `bounds`입니다.
    - `arrowEdge` 파라미터는 macOS에서 팝오버의 화살표 위치를 정의하는 부착 앵커의 가장자리 부분을 의미합니다. 기본값은 `Edge.top`으로, iOS에서는 이 파라미터를 설정해도 무시됩니다.
    - `replacementAction` 파라미터는 "번역으로 대치" 버튼과 상호 작용할 때 수행할 옵셔널 액션으로, 이 액션을 제공하면 번역 팝오버에 "번역으로 대치" 버튼이 나타나게 됩니다.

우리는 `CommentView`에 번역 버튼을 만든 후 `translationPresentation` 모디파이어를 붙여서 각각의 댓글을 번역할 수 있게 만들어 볼 것입니다.

먼저 `translationPresentation` 모디파이어의 `isPresented` 파라미터에 사용될 `Bool` 타입의 파라미터 `isShowingPopover` 변수를 선언해주겠습니다.

```swift title="CommentView.swift" {3}
struct CommentView: View {
    ...
    @State private var isShowingPopover = false

    var body: some View {
        ...
    }
}
```

그 후 `isShowingPopover` 변수를 토글해 줄 버튼을 만들어주겠습니다.

```swift title="CommentView.swift" {10-14}
struct CommentView: View {
    ...

    var body: some View {
        VStack(alignment: .leading) {
            HStack {
                ...
                Text(date)
                    .font(.footnote)
                Button {
                    isShowingPopover.toggle()
                } label: {
                    Image(systemName: "translate")
                }
            }

            ...
        }
        ...
    }
}
```

그리고 마지막으로 `translationPresentation` 모디파이어를 붙여 댓글을 번역할 수 있게 합니다.

```swift title="CommentView.swift" {9}
struct CommentView: View {
    ...
    @State private var isShowingPopover = false

    var body: some View {
        VStack(alignment: .leading) {
            ...
        }
        .translationPresentation(isPresented: $isShowingPopover, text: originalText)
        ...
    }

}
```

!![translationPresentation 번역](https://github.com/user-attachments/assets/657c8b81-e028-443d-aa96-4b441ba4faea)<br>
`translationPresentation` 모디파이어를 이용한 번역은 긴 텍스트 문자열도 지원하지만, 일반적으로 두 문장 이하의 짧은 텍스트에서 가장 잘 작동합니다.

### 번역으로 대치 기능 사용하기

이번에는 `translationPresentation` 모디파이어의 `replacementAction` 파라미터를 이용해 번역 팝오버에서 "번역으로 대치"를 선택하면 댓글의 내용이 번역된 내용으로 변하는 기능을 구현해보겠습니다.

"번역으로 대치" 기능의 사용 방법은 아주 간단합니다.<br>
우선, 아래와 같은 코드의 뷰가 있다고 가정해보겠습니다.

```swift title="ContentView.swift"
import SwiftUI

struct ContentView: View {
    @State private var isShowingPopover = false
    @State private var text = "こんにちは, 世界!"

    var body: some View {
        VStack {
            Text(text)
                .translationPresentation(isPresented: $isShowingPopover, text: text)
            Button("번역") {
                isShowingPopover.toggle()
            }
        }
        .padding()
    }
}
```

"번역으로 대치" 기능은 `translationPresentation` 모디파이어에 `replacementAction` 후행 클로저를 추가하여 원본 텍스트를 번역된 텍스트로 바꿀 수 있습니다.

```swift title="ContentView.swift" {8-9}
struct ContentView: View {
    ...

    var body: some View {
        VStack {
            Text(text)
                .translationPresentation(isPresented: $isShowingPopover, text: text) `{ translated in`
                    text = translated
                }
            ...
        }
        ...
    }
}
```

이 클로저는 번역 버튼을 눌러 나타난 팝오버에서 "번역으로 대치" 버튼을 선택하면 번역이 완료된 후에 실행되어, 입력 텍스트를 번역된 텍스트로 변경합니다.<br>
!![번역으로 대치](https://github.com/user-attachments/assets/f9d6b09e-a0fe-4077-bfe6-a5f7e4c0d2ad)

### 번역으로 대치 응용

위의 번역으로 대치를 응용해서 처음에 작성했던 댓글 번역 코드에서 "번역으로 대치" 버튼을 누르면 원본 텍스트 아래에 번역된 텍스트를 보여주는 기능을 구현해보겠습니다.

우선 아까 작성한 `CommentView`에 번역된 텍스트를 표시할 `translationText` 변수를 추가합니다.

```swift title="CommentView.swift" {3}
struct CommentView: View {
    ...
    @State private var translationText: String?

    var body: some View {
        ...
    }
}
```

그리고 "변역으로 대치" 버튼이 눌렸을 때, 원본 텍스트 아래에 번역된 텍스트를 보여줄 뷰를 추가합니다.

```swift title="CommentView.swift" {12}
struct CommentView: View {
    ...
    var body: some View {
        VStack(alignment: .leading) {
            ...
            Text(originalText)

            if translationText != nil {
                Divider()
                Text("번역된 텍스트")
                    .font(.footnote)
                Text(translationText!)
            }
        }
        ...
    }
}
```

마지막으로 `translationPresentation` 모디파이어에 후행 클로저를 추가해 "번역으로 대치" 버튼이 눌렸을 때, 번역된 텍스트를 `translationText` 변수에 저장될 수 있게 합니다.

```swift title="CommentView.swift" {8-9}
struct CommentView: View {
    ...
    var body: some View {
        VStack(alignment: .leading) {
            ...
        }
        .translationPresentation(isPresented: $isShowingPopover, text: originalText) `{ translated in`
            translationText = translated
        }
        ...
    }
}
```

!![번역으로 대치 응용](https://github.com/user-attachments/assets/7ebf8ea3-c640-4523-9bb2-9d84d36e28c0)

### 시스템에서 원본 언어를 감지할 수 없는 경우

시스템에서 원본 언어를 감지할 수 있는 경우 사용자의 별다른 동작 없이 번역이 실행되지만, 만약 시스템에서 원본 언어를 감지할 수 없는 경우 다음과 같이 사용자에게 번역할 언어를 선택하라는 메시지를 표시합니다.<br>
![언어 감지 불가](https://github.com/user-attachments/assets/16ca55c6-a833-4da5-819e-21629c1d0cd5)<br>
이 때 원하는 번역 언어를 적절히 선택하면 각 언어에 알맞는 번역을 볼 수 있습니다.<br>
![번역 언어 선택](https://github.com/user-attachments/assets/63153591-e36e-4ab2-8b8f-59015dbf4148)

## 시스템 내부 UI로 번역이 제공되는 곳

`Translation`을 활용해 시스템 내부 UI로 번역이 제공되는 대표적인 Apple의 기능으로는 iMessage의 번역 기능, Safari의 등이 있습니다.<br>
!![iMessage 번역 기능|caption=iMessage 번역 기능](https://github.com/user-attachments/assets/9593ef8e-e685-45f3-81e4-bd37f6747216)<br>
!![Safari 번역 기능|caption=Safari 번역 기능](https://github.com/user-attachments/assets/3d3d56cc-1bea-4e89-8c83-21fcff6a9c8f)

# 마무리

이번 시간에는 `translation` 프레임워크의 개요와 시스템 내부 UI를 이용해 번역하는 방법을 알아보았는데요.<br>
시스템 내부 UI도 좋은 번역 환경을 제공하지만, 실제 앱에서는 조금 더 자연스러운 형태의 번역 환경이 필요하기도 합니다.<br>
다음 시간에는 시스템 내부 UI보다 더 앱에 잘 녹아들 수 있는 커스텀 번역 환경으로 `translation`을 사용하는 방법에 대해 알아보겠습니다.

# 참고자료

- [Apple Developer Documentation/Translation](https://developer.apple.com/documentation/translation)
- [Apple Developer Documentation/SwiftUI/View/tanslationPresentation(isPresented:text:attachementAnchor:arrowEdge:replacementAction:)](<https://developer.apple.com/documentation/swiftui/view/translationpresentation(ispresented:text:attachmentanchor:arrowedge:replacementaction:)>)
