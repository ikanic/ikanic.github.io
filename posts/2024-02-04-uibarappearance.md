---
title: "[UIKit] UIBarAppearance - iOS 시스템 바의 기본 모양 커스터마이징하기"
thumbnail: "https://github.com/user-attachments/assets/9f4f1ced-cdd0-4a8b-a59e-6df5a2c812a0"
created-date: "2024-02-04 23:30"
modified-date: "2024-02-04 23:30"
category: "Swift"
tags:
    [
        "iOS",
        "글또 9기",
        "Swift",
        "UIKit",
        "UIBarAppearance",
        "UINavigationBar",
        "Blur",
        "UITabBar",
        "UIToolBar",
    ]
description: "iOS의 시스템 바 모양을 커스텀 해보자"
---

꽤 오랜 시간 계획해 온 프로젝트가 있었는데, 최근 그 프로젝트를 진행하게 되면서 여러 문제에 직면하게 되었습니다. 그중 하나가 UINavigationBar, UIToolbar 등의 시스템 바와 관련된 부분이었는데요.<br>
이번 시간에는 앱의 시스템 바를 다루면서 고군분투하면서 공부한 내용을 기록하려 합니다.

# 시스템 바를 커스터마이징하게 된 배경

우선 시스템 바를 다루게 된 배경부터 살펴보자면, 가장 처음에는 Navigation Bar와 Toolbar에 빈 공간이 생겨버린 것에서부터 시작하게 됩니다.<br>
!![시뮬레이션1|caption=시뮬1](https://github.com/user-attachments/assets/4fa12db3-93d6-411d-870d-7a68d2bb56d5)<br>
어떤 뷰에서 다른 뷰로 넘어갈 때 위와 같이 네비게이션 바와 툴바에 뜬금없이 세이프 에리어를 지킨 것 같은 빈 공간이 생겨버렸는데요.<br>
이 문제를 해결하기 위해 공식 문서를 뒤적거리다 찾은 것은 `UIBarAppearance`였습니다.

# UIBarAppearance

`UIBarAppearance`는 `Navigation Bar`, `ToolBar`, `TabBar`와 같은 시스템 바의 기본 모양을 커스터마이징하기 위한 객체로 네비게이션 바, 툴바, 탭바에서 공유하는 공통된 특성이 포함되어 있습니다.

이 `UIBarAppearance`라는 클래스를 직접 사용할 수도 있지만, 특정 유형의 바를 구성할 때는 일반적으로 `UINavigationBarAppearance`, `UIToolbarAppearance`, `UITabBarAppearance` 중 적절한 바 모양 서브 클래스를 인스턴스화 해서 사용합니다.

## 시스템 바에서 UIBarAppearance를 사용하는 방법

네비게이션 바와 툴바, 탭 바에는 이렇게 구성한 시스템 바 모양을 설정하는 속성이 있는데, 그 속성에는 아래와 같은 4가지가 있습니다.

- `standardAppearance`
- `compactAppearance`
- `scrollEdgeAppearance`
- `compactScrollEdgeAppearance`

`standardAppearance`와 `compactAppearance`는 각각 표준 높이와 컴팩트한 높이의 시스템 바에 대한 모양을 설정하고, `scrollEdgeAppearance`와 `compactScrollEdgeAppearance`는 스크롤 가능한 콘텐츠의 가장자리가 시스템 바의 가장자리와 정렬될 때 각각 표준 높이와 컴팩트한 높이의 시스템 바에 대한 모양을 설정합니다.

이 중에서 `standardAppearance`와 `scrollEdgeAppearance`는 `UINavigationBar`, `UIToolbar`, `UITabBar` 모두 사용할 수 있고, `compactAppearance`와 `compactScrollEdgeAppearance`는 `UINavigationBar`와 `UIToolbar`에서만 사용할 수 있습니다.

## Apple Design Resource와 Material

!![시뮬레이션2](https://github.com/user-attachments/assets/78584b40-cfa3-4836-a777-6faa6bac057c)<br>
네비게이션 바와 툴바에 생긴 빈 공간은 이렇게 새로 생성한 `UIBarAppearance`를 이용해 없앨 수 있었습니다.

그런데 이렇게 만든 시스템 바는 아이폰의 기본 앱들과는 달리 부자연스러운 느낌이 강하게 들었는데요.<br>
그 이유가 무엇일지 생각해 보다가 아이폰의 기본 앱들은 시스템 바가 단색이 아닌 반투명한 형태임을 알게 되었습니다.<br>
![iOS 기본 앱의 시스템 바](https://github.com/user-attachments/assets/341569be-7d1a-43f4-9362-24f883e8dbbf)<br>
^^iOS 기본 앱의 시스템 바^^<br>
그래서 이 단색을 아이폰의 기본 앱에 사용되는 시스템 바처럼 뒤에 흐림 처리가 된 반투명한 모양으로 바꿀 필요가 있었습니다.<br>
그래서 이 반투명한 모양은 어떻게 구현할 수 있을지 생각하다 [Apple Design Resource 피그마 파일](https://www.figma.com/community/file/1248375255495415511/apple-design-resources-ios-17-and-ipados-17)을 참고하기로 했습니다.<br>
![피그마 네비게이션 바](https://github.com/user-attachments/assets/adc07b22-8c96-447d-a55c-6df14b390240)<br>
이 피그마 파일에서는 바의 fill이 chrome으로 채워져 있는 것을 알 수 있었는데요.<br>
"그렇다면 `UIColor`를 `chrome`으로 채우면 되겠구나!"라고 생각했습니다만, `UIColor`에는 `chrome`이라는 색이 없었습니다.

그렇다면 피그마에 적용된 `chrome`이라는 케이스가 어떤 색이고 알파 값이 얼마인지 알아내서 그대로 적용하면 되겠다고 생각했습니다.<br>
![피그마 크롬](https://github.com/user-attachments/assets/4916faa1-2845-4f51-8688-a833ce6db4ba)<br>
그래서 피그마에 적용된 값을 찾아보았더니 화이트 컬러에 알파 값이 75%로 되어있어 UIColor에 그대로 적용해 보았습니다.그렇지만 이렇게 적용한 색은 원하던 느낌과는 많이 다른 그냥 뿌연 막이 씌어있는 것 같은 느낌이었습니다.<br>
![피그마 메터리얼](https://github.com/user-attachments/assets/d1775879-3fb4-4e20-ad5d-1f0b626951bd)<br>
그러다 발견한 것은 피그마에서 `systemColor`들은 `Colors`에 해당하는 것들이었지만, `chrome`은 `Colors`가 아닌 `Materials`로 되어있는 것을 발견했습니다.<br>
그렇다면 "`UIColor`가 아닌 `UIMaterial`이라는 것이 따로 있나?" 하고 찾아보았지만 아쉽게도 그런 클래스는 존재하지 않았습니다.

"그럼 뭘까?" 하고 고민하던 중에 기본 네비게이션 바나 툴바 등이 반투명 색이니 `UIBarAppearance`에 관련된 내용이 있지 않을까 하고 찾아보게 되었습니다.<br>
그러다 발견한 것이 `UIBarAppearance`의 모양을 구성하는 방법이었습니다.

## UIBarAppearance의 배경 모양을 구성하는 방법

`UIBarAppearance`에는 배경과 그림자의 모양을 구성하는 방법이 있는데, `UIBarAppearance`에서 배경 모양을 구성하는 방법에는 아래의 4가지가 있습니다.

- `@NSCopying var backgroundEffect: UIBlurEffect? { get set }`
- `@NSCopying var backgroundColor: UIColor? { get set }`
- `var backgroundImage: UIImage? { get set }`
- `var backgroundImageContentMode: UIView.ContentMode { get set }`

`backgroundEffect`, `backgroundColor`, `backgroundImage` 프로퍼티는 프로퍼티 이름에서 알 수 있듯이 각각 시스템 바의 배경에 사용할 흐림 효과, 배경색, 그리고 배경색 위에 표시할 이미지를 설정합니다.

UIKit은 아래 그림과 같은 순서로 레이어를 제공하여 화면에 표시하게 됩니다.<br>
![UIKit 레이어 제공 순서](https://github.com/user-attachments/assets/c03bb9bd-70bc-4472-9293-6bbd508973ef)<br>
`backgroundImageContentMode` 프로퍼티는 `backgroundImage` 속성에서 이미지의 크기를 조정하거나 맞춤 방법을 지정할 수 있습니다.

## UIBarAppearance의 그림자 모양을 구성하는 방법

`UIBarAppearance`는 그림자의 모양을 구성하는 아래와 같은 2가지 방법도 제공합니다.

- `@NSCopying var shadowColor: UIColor? { get set }`
- `var shadowImage: UIImage? { get set }`

`shadowColor`와 `shadowImage`는 각각 시스템 바의 그림자에 적용할 색과 이미지를 설정합니다.<br>
UIKit은 이 두 프로퍼티를 사용하여 그림자의 모양을 결정하는데요.<br>
`shadowImage`가 nil인 경우 `shadowColor`의 값에 따라 색이 지정된 기본 그림자가 시스템 바에 표시됩니다.<br>
`shadowColor`가 nil이거나 `clear` 색상을 포함하는 경우 `shadowImage`가 설정되었더라도 그림자가 표시되지 않습니다.

또 `shadowImage`에 템플릿 이미지가 사용된 경우에는 시스템 바는 `shadowImage`에 지정된 이미지를 사용하고 `shadowColor`의 값을 사용하여 색상을 지정하지만, `shadowImage`에 사용된 이미지가 템플릿 이미지가 아닌 경우에는 `shadowColor`의 색상을 사용하지 않고 `shadowImage`의 이미지만 사용하여 표시됩니다.

## UIBarAppearance의 모양 속성을 재설정하는 방법

`UIBarAppearance`에는 배경과 그림자의 모양을 구성하는 방법뿐만 아니라, 모양 속성을 재설정하는 방법 또한 제공하고 있는데 이렇게 `UIBarAppearance`를 재설정하는 방법에는 아래의 3가지 메서드를 사용할 수 있습니다.

- `func configureWithDefaultBackground()`
- `func configureWithOpaqueBackground()`
- `func configureWithTransparentBackground()`

1. **configureWithDefaultBackground()**
   `configureWithDefaultBackground`는 시스템 바의 모양 개체를 배경 및 그림자의 기본값으로 구성합니다.

2. **configureWithOpaqueBackground()**
   `configureWithOpaqueBackground`는 현재 테마에 적합한 불투명 색상으로 시스템 바의 모양 개체를 구성합니다.

3. **configureWithTransparentBackground()**
   `configureWithTransparentBackground`는 배경이 투명하고 그림자가 없는 시스템 바 모양 개체를 구성합니다.

위의 3가지 메서드는 호출할 경우 시스템 바의 모양 프로퍼티에 지정한 이전 값들을 모두 대체하게 됩니다.

이 중에서 아이폰의 기본 앱처럼 반투명한 모양을 만들기 위해 사용할 수 있는 방법은 시스템 바의 모양을 기본값으로 구성하는 `configureWithDefaultBackground()` 메서드였습니다.

이 방법을 이용해 아래와 같이 시스템 바를 구성해 문제를 해결할 수 있었습니다.<br>
!![시뮬레이션3](https://github.com/user-attachments/assets/e7afb8c0-0b87-4ae2-83e4-921ced66ae30)

# 마무리

이렇게 해서 iOS 앱의 시스템 바를 재설정하는 방법을 알아보았는데요.<br>
위에서 설명한 내용 외에도 `UINavigationBarAppearance`, `UIToolbarAppearance`, `UITabBarAppearance` 각각의 클래스에서만 사용할 수 있는 속성과 시스템 바의 버튼에 사용할 수 있는 속성들도 있으니 더 세세한 내용이 궁금하신 분들은 [UINavigationBarAppearance](https://developer.apple.com/documentation/uikit/uinavigationbarappearance), [UIToolbarAppearance](https://developer.apple.com/documentation/uikit/uitoolbarappearance), [UITabBarAppearance](https://developer.apple.com/documentation/uikit/uitabbarappearance), [UITabBarItemAppearance](https://developer.apple.com/documentation/uikit/uitabbaritemappearance), [UITabBarItemStateAppearance](https://developer.apple.com/documentation/uikit/uitabbaritemstateappearance), [UIBarButtonItemAppearance](https://developer.apple.com/documentation/uikit/uibarbuttonitemappearance), [UIBarButtonItemStateAppearance](https://developer.apple.com/documentation/uikit/uibarbuttonitemstateappearance) 각각의 문서를 찾아보시는 것도 좋을 것 같습니다.

이번 시간에 Apple Design Resource를 뒤져본 만큼 다음 시간에는 Apple Design Resource를 보며 실제로 뷰에 Blur를 주는 방법에 대해 알아보겠습니다.

## 후기

이번 글은 기존에 글을 쓰던 방식과는 조금 다르게 개발하면서 생긴 문제와 이를 해결하는 과정, 그리고 해결하기 위해 공부한 부분을 정리해 봤는데요.<br>
글 쓰는 방식을 바꾸다 보니 흐름이 조금 어색하게 느껴지기도 하지만 예시를 들기는 조금 더 편했던 것 같습니다.<br>
또, 실제로 직접 겪은 문제를 해결한 경험이다 보니 더 기억에 잘 남는 것 같기도 하네요.

# 참고자료

- [Apple Developer Documentation/UIKit/UIBarAppearance](https://developer.apple.com/documentation/uikit/uibarappearance)
- [Apple Design Resources - iOS 17 and iPadOS 17](https://www.figma.com/community/file/1248375255495415511/apple-design-resources-ios-17-and-ipados-17)
