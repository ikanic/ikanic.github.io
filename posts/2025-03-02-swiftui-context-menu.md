---
title: "[SwiftUI] SwiftUI 앱에서 빠른 메뉴(Context Menu) 제공하기"
thumbnail: "https://github.com/user-attachments/assets/694800bf-8f42-4659-86f0-06fb954ff720"
created-date: "2025-03-02 22:32"
modified-date: "2025-03-02 22:32"
category: "Swift"
tags: ["Context Menu", "빠른 메뉴", "SwiftUI", "iOS", "글또 10기"]
description: "SwiftUI에서 빠르게 메뉴를 보일 수 있는 Context Menu를 제공해보자"
---

앱을 사용하다보면 다양한 방법으로 메뉴를 표시하는 경우가 있습니다. 이번 시간에는 이 중에서 콘텍스트 메뉴(Context Menu, 컨텍스트 메뉴) 및 SwiftUI에서 콘텍스트 메뉴를 제공하는 방법에 대해 알아보려고 합니다.

콘텍스트 메뉴는 사용자가 클릭한 위치나 선택한 항목에 따라 나타나는 팝업 메뉴로 플랫폼에 따라 **콘텍스트 메뉴, 콘텍스쳐 메뉴, 바로 가기 메뉴, 빠른 메뉴** 등의 다양한 명칭을 갖고 있습니다.<br>
여기서는 Apple [휴먼 인터페이스 가이드라인(HIG)](https://developer.apple.com/kr/design/human-interface-guidelines/context-menus)의 한국어 번역을 따라 빠른 메뉴라는 명칭을 사용하겠습니다.

# 빠른 메뉴

빠른 메뉴는 특정 동작을 통해 자주 사용하는 항목에 편리하게 접근할 수 있는 메뉴로, 인터페이스를 어수선하게 만들지 않고 항목과 직접 관련된 기능에 접근할 수 있게 만드는 메뉴입니다.<br>
기본적으로 제스처를 통해 보여지기 전까지는 밖으로 노출되어 있지 않고 숨겨져 있기 때문에 사용자에게 빠른 메뉴가 있는지 인지할 수 있도록 해야합니다.

빠른 메뉴는 주로 아래와 같은 제스처를 통해 노출될 수 있습니다.

- visionOS, iOS 및 iPadOS의 시스템 정의된 길게 터치(Long Press) 또는 핀치 제스처
- macOS 및 iPadOS에서 Control 키를 누르는 동안 마우스나 트랙 패드 등의 포인팅 장치 클릭
- macOS 또는 iPadOS의 Magic Trackpad에서 보조 클릭 사용

# SwiftUI에서 빠른 메뉴 기능 제공하기

SwiftUI에서는 이러한 빠른 메뉴를 제공하기 위한 다양한 모디파이어를 지원합니다.<br>
SwiftUI에서는 우리가 흔히 사용하는 일반적인 뷰, 앱에서 각 섹션을 이동하는 데 사용할 수 있는 탭, 계층으로 구성된 데이터를 표시하는 데 사용하는 테이블에 빠른 메뉴를 적용할 수 있습니다.

뷰, 탭, 테이블에서 사용되는 실제 모디파이어는 다르지만 각 모디파이어의 이름이 같고 동작도 거의 유사하므로 일반적인 뷰에서 사용되는 모디파이어들을 대표적으로 소개해보겠습니다.

빠른 메뉴는 다양한 앱에서 사용되는데 Apple의 기본 앱 중에서는 대표적으로 메시지 앱이 있습니다.<br>
메시지 앱에서 상대가 보낸 메시지 혹은 내가 보낸 메시지를 길게 누르면 아래와 같은 빠른 메뉴를 볼 수 있는데, 이렇게 단순한 빠른 메뉴는 `contextMenu(menuItems:)` 모디파이어를 통해 쉽게 제공할 수 있습니다.<br>

<table>
    <tr>
        <td><img src="https://github.com/user-attachments/assets/a8d6609e-6774-46a7-95be-317b968f7b26"></td>
        <td><img src="https://github.com/user-attachments/assets/173cb4ac-92de-40d9-8c2c-30581cb033c1"></td>
    </tr>
</table>

```swift
nonisolated
func contextMenu<MenuItems>(@ViewBuilder menuItems: () -> MenuItems) -> some View where MenuItems: View
```

`contextMenu(menuItems:)` 모디파이어는 간단하게 뷰에 빠른 메뉴를 제공할 수 있는 모디파이어로, `menuItems` 클로저에 `Button`, `Toggle`, `Picker` 등의 컨트롤을 추가하여 메뉴를 구성할 수 있습니다.<br>
만약 `menuItems` 클로저에 아무 것도 추가하지 않는다면 빠른 메뉴를 비활성화합니다.

다음 예시 코드는 채팅 버블에 간단하게 빠른 메뉴를 추가하는 예시입니다.

```swift
ChattingBubble()
    .contextMenu {
        Button("답장") {
            // 동작
        }
        ...
        Button("복사") {
            // 동작
        }
    }
```

위와 같은 코드로 아래와 같이 간단한 빠른 메뉴를 추가할 수 있습니다.<br>
![빠른 메뉴 추가](https://github.com/user-attachments/assets/0e084e82-8e5d-4d7d-8140-fac6a2f2c707)<br>
만약, 예시 이미지에서 본 것처럼 메뉴에 아이콘을 추가하고 싶다면 버튼을 아래와 같이 변경해서 아이콘을 추가할 수 있습니다.

```swift
Button(action: {}) {
    Label("답장", systemImage: "arrowshape.turn.up.backward")
}
```

![빠른 메뉴 아이콘 추가](https://github.com/user-attachments/assets/e2117242-e0c5-407a-b925-dcfdd585403d)
빠른 메뉴에는 `Menu`를 사용하여 하위 메뉴를 정의하거나 `Section`을 사용하여 항목을 그룹화할 수도 있습니다.

```swift
.contextMenu {
    Button("답장") {}
    Section {
        Button("복사") {}
        Button("번역") {}
        Button("더 보기...") {}
    }
}
```

![빠른 메뉴 그룹화](https://github.com/user-attachments/assets/47538c73-7333-4678-bc86-cea054872d77)
혹은 `Section` 대신 `Divider`를 사용하여 각 메뉴끼리 구분하는 방법도 있습니다.

```swift
.contextMenu {
    Button("답장") {}
    Divider()
    Button("복사") {}
    ...
}
```

`macOS`를 제외한 플랫폼에서는 빠른 메뉴를 불러올 때, 프리뷰를 함께 표시하는 것을 볼 수 있는데 이 프리뷰를 커스텀할 수도 있습니다.<br>
예를 들면 메시지 앱의 아래와 같은 화면이 있습니다.<br>

<table>
    <tr>
        <td><img src="https://github.com/user-attachments/assets/91a88239-5587-4899-8e2a-d460cd7ffd30"></td>
        <td><img src="https://github.com/user-attachments/assets/c0a45c1d-2d82-4730-bc0f-595ebe0c14e7"></td>
    </tr>
</table>

이와 같은 커스텀 프리뷰는 `contextMenu(menuItems:preview:)` 모디파이어를 통해 제공할 수 있습니다.

```swift
nonisoltated
func contextMenu<M, P>(@ViewBuilder menuItems: () -> M, @ViewBuilder preview: () -> P) -> some View where M: View, P: View
```

`contextMenu(menuItems:preview)` 모디파이어는 기본적으로 `contextMenu(menuItems:)`와 동작이 같으나, `preview`를 통해 커스텀 프리뷰를 제공할 수 있다는 점이 다릅니다.<br>
`preview`는 시스템에서 메뉴와 함께 표시하는 뷰로, `preview` 클로저에 뷰를 추가하여 커스텀 프리뷰를 제공합니다.<br>
일반적으로 `preview`로 제공된 뷰는 시스템에서 콘텐츠의 크기에 맞게 프리뷰의 크기가 조정됩니다.

```swift
MessageView()
    .contextMenu {
        ...
    } preview: {
        ChattingView()
    }
```

![빠른 메뉴 프리뷰](https://github.com/user-attachments/assets/d7ec12eb-8b4e-453d-a2a7-fce46e4e6443)<br>
`contextMenu(menuItems:)`나 `contextMenu(menuItems:preview)` 등의 모디파이어만으로 제공된 프리뷰는 일반적으로 둥근 사각형의 모양을 띄고 있습니다.<br>
이러한 프리뷰의 모양이나 모서리 반경을 변경하기 위해 `contentShape(_:_:eoFill)` 모디파이어를 사용할 수 있습니다.

```swift
nonisolated
func contentShape<S>(_ kind: ContentShapeKinds, _ shape: S, eoFill: Bool = false) -> some View where S: Shape
```

아래의 코드는 둥근 사각형의 프리뷰를 원형으로 바꾸는 예시 입니다.

```swift
ChattingBubble()
    .contentShape(.contextMenuPreview, Circle())
    .contextMenu { ... }
```

![빠른 메뉴 원형 프리뷰](https://github.com/user-attachments/assets/fbf76fb4-8c0f-49b6-ba02-1dc0a43be7df)

# 참고자료

- [Human Interface Guidelines - Context Menus](https://developer.apple.com/kr/design/human-interface-guidelines/context-menus)
- [Apple Developer Documentation/SwiftUI/View/contextMenu(menuItems:)](<https://developer.apple.com/documentation/swiftui/view/contextmenu(menuitems:)>)
- [Apple Developer Documentation/SwiftUI/View/contextMenu(menuItems:preview:)](<https://developer.apple.com/documentation/swiftui/view/contextmenu(menuitems:preview:)>)
- [Apple Developer Documentation/SwiftUI/View/contentShape(\_:\_:eoFill:)](<https://developer.apple.com/documentation/swiftui/view/contentshape(_:_:eofill:)>)
