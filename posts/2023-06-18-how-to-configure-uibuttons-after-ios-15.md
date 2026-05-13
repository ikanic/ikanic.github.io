---
title: "[UIKit] iOS 15 이후의 UIButton 구성 방법"
created-date: "2023-06-18 01:58"
modified-date: "2023-06-18 01:58"
category: "Swift"
tags:
    [
        "UIButton",
        "UIAction",
        "Button",
        "UIButton.Configuration",
        "UIButton.ConfigurationUpdateHandler",
        "UIKit",
        "iOS",
        "Swift",
        "글또 8기",
    ]
description: "iOS 15 이후에 새롭게 추가된 UIButton 구성 방법에 대해 알아보자"
---

기존에 UIKit에서 `UIButton`을 사용할 때마다, 버튼의 구성 방법이나 버튼에 클릭 이벤트 등을 주기 위해 `selector`를 이용하여 `@objc` 메서드를 사용해야하는 등 약간 불편하기도 하고, 부자연스러운 느낌을 지울 수가 없었는데요.<br>
이번 시간에는 iOS 15 이후에 UIButton의 새로운 구성 방법과 버튼에 이벤트를 주는 방법에 대하여 알아보겠습니다.

# UIButton

사용자가 앱과 상호 작용할 수 있는 방법 중 하나인 버튼은 앱에서 매우 중요한 UI 요소인데요.<br>
UIButton은 사용자의 상호작용에 대한 응답으로 사용자 지정 코드를 실행하는 컨트롤 입니다.

UIButton에는 텍스트 레이블, 이미지, 혹은 이 둘을 모두 사용하여 버튼의 목적을 전달할 수 있고, 모양을 구성하여 앱의 디자인에 맞게 버튼의 색상 등을 지정할 수 있습니다.

## 기존의 UIButton

Apple은 이전까지 테두리가 없는 평평한 디자인의 버튼을 채택해왔는데요.<br>
이러한 디자인은 깔끔하긴 하지만, 버튼이 많아질 수록 중요도를 파악하기 어렵다는 단점이 있습니다.<br>
![iOS 기본 앱의 다양한 버튼](https://github.com/user-attachments/assets/ec4c27a4-00e5-44c9-8478-2be4042133fd)
iOS의 기본 앱 중 Mail이나 AppStore를 보면 버튼의 중요도나 강조하는 부분에 따라 버튼의 모양, 크기, 색 등이 모두 다르게 표현된 것을 알 수 있습니다.<br>
일반적으로 중요도가 낮은 경우 기존의 테두리 없는 버튼, 그것보다는 조금 더 중요할 때는 회색 배경, 아주 중요한 경우에는 파란색 배경을 사용하는 등의 방식으로 버튼의 중요도를 표현하고 있죠.

## 새로운 UIButton

이렇게 다양한 형태의 버튼이 필요해지면서 Apple의 Human Interface Guideline에 버튼의 스타일이 추가되었습니다.<br>
WWDC 2019에서는 SwiftUI가 발표되며 iOS에서 버튼의 스타일링이 더 유연하고 간편해졌죠.<br>
![버튼 스타일](https://github.com/user-attachments/assets/983abcf6-8ee4-433e-aa7c-430336c51fdf)
^^이미지 출처: [Apple Human Interface Guideline - Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)^^

하지만 UIKit에서는 이러한 버튼의 스타일링에 대한 지원이 미비했습니다.<br>
버튼을 커스텀해서 유사하게 만들 수는 있지만, 이러한 스타일에 대한 기본 지원이 없었죠.

이러한 구식의 UIButton에 대한 변화가 iOS 13부터 시작되었는데요.<br>
iOS 15에서는 UIButton에 Configuration이 추가되며 드디어 UIKit에서도 버튼의 스타일링에 대한 지원이 추가되었습니다.

# Configuration

기존의 UIButton은 아래와 같이 버튼 객체를 생성한 후 setTitle, setImage 등의 메서드를 통해 버튼의 모양 등을 구성해야 했습니다.

```swift
...

private let button = UIButton()

...

button.setTitle("Button", for: .normal)
button.setTitleColor(.systemBlue, for: .normal)
button.setImage(UIImage(systemName: "heart"), for: .normal)

...
```

iOS 15에서 추가된 `UIButton.Configuration`은 이러한 버튼에 대한 기본 구성을 조금 더 쉽게 할 수 있게 만들어주는데요.
Configuration은 크게 tinted, filled, gray, plain의 4가지가 있습니다.

```swift
UIButton.Configuration.tinted()
UIButton.Configuration.filled()
UIButton.Configuration.gray()
UIButton.Configuration.plain()
```

Configuration을 사용하기 위해서는 아래와 같이 `UIButton.Configuration` 객체를 만든 후 UIButton 객체를 생성할 때, configuration에 해당 객체를 넣어주면 됩니다.

```swift
private let buttonConfig = UIButton.Configuration.filled()
private lazy var button = UIButton(configuration: buttonConfig)
```

Configuration을 사용하면 title, image뿐만 아니라 subtitle도 설정할 수 있습니다.

```swift
button.title = "제목"
button.subtitle = "부제목"
button.image = UIImage(systemName: "heart")
```

또한, 버튼 내부의 이미지의 위치나 버튼의 컨텐츠간 간격, 버튼 사이즈도 쉽게 조정할 수 있습니다.

```swift
button.titlePadding = 10
button.imagePadding = 10

button.imagePlacement = .bottom

button.buttonSize = .medium
```

button 컨텐츠의 padding은 아래와 같이 구성됩니다.<br>
![UIButton Configuration Padding](https://github.com/user-attachments/assets/f2304cae-be5c-49fa-9f75-0dbf06748f99)
^^이미지 출처: [WWDC 2021 - Meet the UIKit button system](https://developer.apple.com/videos/play/wwdc2021/10064)^^

# ConfigurationUpdateHandler

`UIButton`은 클릭했을 때와 클릭하지 않았을 때의 모양을 다르게 하는 등, 상황에 따라 버튼의 구성을 다르게 하는 방법을 제공하는데요.<br>
기존에는 `setTitle`, `setImage` 등의 메서드의 `for` 파라미터를 이용하여 아래와 같이 구성할 수 있었습니다.

```swift
button.setTitle("일반", for: .normal)
button.setTitle("클릭됨", for: .highlighted)

button.setTitleColor(.white, for: .normal)
button.setTitleColor(.black, for: .highlighted)

button.setImage(UIImage(systemName: "heart"), for: .normal)
button.setImage(UIImage(systemName: "heart.fill"), for: .highlighted)
```

이 방법으로도 충분히 상황에 맞는 직관적인 코드를 작성할 수 있지만, 모든 setter 메서드 뒤에 for 파라미터가 계속 반복되어야 하고 코드가 길어지는 불편함이 있었죠.

iOS 15에서부터는 `UIButton.ConfigurationUpdateHandler`가 추가되어 더 간편하게 상황별로 버튼의 구성을 바꿀 수 있게 되었습니다. ConfiguratinUpdateHandler는 아래와 같이 사용할 수 있습니다.

```swift
button.configurationUpdateHandler = { btn in
    switch btn.state {
        case .highlighted:
            btn.configuration?.title = "클릭됨"
            btn.configuration?.image = UIImage(systemName: "heart.fill")?.withTintColor(.red, renderingMode: .alwaysOriginal)
        default:
            btn.configuration?.title = "클릭안됨"
            btn.configuration?.image = UIImage(systemName: "heart)
    }
}
```

이 핸들러는 버튼의 상태를 관찰하고 있다가 변동 사항이 생기면 해당 코드를 수행하는 방식인데요.<br>
그래서 아래와 같이 handler 안에 configuration을 변경하는 것이 아닌 다른 코드를 집어넣어도 실행되는 것을 확인할 수 있습니다.

```swift
button.configurationUpdateHandler = { btn in
    switch btn.state {
        case .highlighted:
            print("눌렸음~")
        default:
            print("안눌렸음~")
    }
}
```

하지만, configurationUpdateHandler의 이름에서 알 수 있듯이 버튼의 구성을 변경하기 위한 클로저이므로, 이 안에서 다른 코드를 실행하기 보다는 구성을 변경하는 코드만 실행하는 것이 용도에 더 알맞는 코드가 될 것 같네요.

# UIAction

이번에는 UIButton에 이벤트를 주는 방식의 변화에 대해 알아볼텐데요.<br>
기존에 UIButton에 이벤트를 주기 위해서는 `addTarget`이라는 메서드를 사용했습니다.

아래와 같이 addTarget을 이용하여 selector를 통해 `@objc` 메서드를 버튼의 이벤트로 사용할 수 있었죠.

```swift
...

button.addTarget(self, action: #selector(onClickButton), for: .touchUpInside)

...

@objc func onClickButton() {
    print("버튼이 클릭됨~")
}

...
```

iOS 14부터 `UIControl`에 새로운 생성자가 생기며 UIButton에서도 기존의 방식이 아닌 새로운 방식으로 이벤트를 줄 수 있게 되었습니다.
바로 iOS 13에서 추가된 `UIAction`을 이용하는 방식인데요.

아래와 같이 사용할 수 있습니다.

```swift
private let buttonAction = UIAction { \_ in print("클릭됨~") }
private lazy var button = UIButton(primaryAction: buttonAction)
```

혹은 configuration과 함께 아래처럼 사용할 수도 있습니다.

```swift
private let buttonConfig = UIButton.Configuration.filled()
private let buttonAction = UIAction { \_ in print("클릭됨~") }
private lazy var button = UIButton(configuration: buttonConfig, primaryAction: buttonAction)
```

UIAction을 조금 살펴보면 UIAction에도 title, image 등을 설정할 수 있는데요.
UIAction에 title, image 등의 파라미터를 설정하면 UIButton에도 해당 파라미터가 반영되는 것을 볼 수 있습니다.

```swift
private let buttonAction = UIAction(title: "버튼", image: UIImage(systemName: "heart")) { \_ in
    print("클릭됨~")
}
```

다만, subtitle, attribute 등의 일부 파라미터는 존재하긴 하지만, UIButton에는 적용되지 않네요.

# 구성 방식의 우선순위

자 그런데 이렇게 Configuration, UIAction이 추가되었어도 기존의 setTitle 등의 방식을 사용하지 못하는 것은 아닌데요.
그렇다면 기존 방식과 Configuration이 동시에 사용되면 어떻게 될까요?

아래와 같은 코드로 setTitle과 configuration.title의 우선순위를 실험해보겠습니다.

```swift
button.setTitle("기존 방식", for: .normal)
button.configuration?.title = "새로운 방식"
```

![setTitle과 configuration 우선 순위 비교](https://github.com/user-attachments/assets/eac16c93-fc9d-475c-bfcd-b0153b5f9e8a)

같이 사용하게 되면 configuration이 무시되는 것을 볼 수 있습니다.

그렇다면 setTitle과 UIAction을 비교해볼까요?

```swift
...

private lazy var buttonAction = UIAction(title: "UIAction 방식") { \_ in
print("클릭됨~")
}

...

button.setTitle("기존 방식", for: .normal)

...
```

![setTitle과 UIAction 우선 순위 비교](https://github.com/user-attachments/assets/eac16c93-fc9d-475c-bfcd-b0153b5f9e8a)
마찬가지로 setTitle 방식으로 구성한 "기존 방식"이라는 글자가 출력되네요.

그렇다면, UIAction과 Configuration은 어떨까요?

```swift
...

private lazy var buttonAction = UIAction(title: "UIAction 방식") { \_ in
    print("클릭됨~")
}

...

button.configuration?.title = "새로운 방식"

...
```

![configuration과 UIAction 우선 순위 비교](https://github.com/user-attachments/assets/275d914a-6bd7-48cb-95dc-3c1ebacf61ae)

여기에서는 UIAction이 우선순위가 더 높은 것을 볼 수 있네요.

그렇다면 마지막으로 setTitle과 ConfigurationUpdateHandler는 우선 순위가 어떤지 한 번 볼까요?

```swift
button.setTitle("기존 방식", for: .normal)

button.configurationUpdateHandler = { btn in
    switch btn.state {
        case .highlighted:
            btn.configuration?.title = "클릭됨"
        default:
            btn.configuration?.title = "새로운 방식"
    }
}
```

![setTitle과 configurationUpdateHandler 우선 순위 비교](https://github.com/user-attachments/assets/f6a209d2-dfef-4ec6-addc-63f9d83f10a7)
configuraitonUpdateHandler를 사용하게 되면 configurationUpdateHandler의 구성이 실행되네요.

이것을 봤을 때, UIButton의 구성 우선순위는 **ConfigurationUpdateHandler > UIButton 기존 구성 방식 > UIAction > UIButton.Configuration의 순서**라고 생각해볼 수 있겠네요.

# 마무리

이번 시간에는 iOS 15 이후의 UIButton 구성 방법에 대해 알아보았는데요.<br>
기존의 UIButton 구성 방식을 사용하면서 느꼈던 불편함과 어색함이 새로운 구성 방식에서는 많이 해결된 것 같고, 기존 방식보다 더 편리하게, 또 조금 더 이해하기 쉬운 코드가 된 것 같다는 느낌을 많이 받았습니다.

특히 ConfigurationUpdateHandler를 사용하면서 버튼의 상태가 바뀔 때 구성을 바꾸는 것이 코드적으로 조금 더 직관적이지 않았나 생각합니다.<br>
또, UIAction을 사용할 수 있게 되면서 기존의 selector를 사용할 때 느꼈던 문법적인 불편함도 해소된 것 같습니다.

앞으로의 UIButton은 또 어떤 방식으로 새로운 업데이트가 있을지 기대가 되네요.<br>

위에서 사용한 예제들은 조금 더 다듬은 코드로 [기존 UIButton 구성 방법, 새로운 UIButton 구성 방법](https://github.com/ikanic/iOS-UIKit-Dev-Note/blob/main/iOS_UIKit_Dev_Note/UIButton/NewUIButtonViewController.swift)에서 확인하실 수 있습니다.

## 후기

UIButton은 UIKit으로 앱을 만들 때, 정말 많이 사용하게 되는 요소 중 하나인데, 그동안은 사용하면서 코드가 복잡해지는 느낌이 강해서 많이 불편했는데, 이번에 사용해보면서 그런 복잡함이 많이 줄어든 것 같아서 편했던 것 같네요.<br>
UIButton뿐만 아니라 UICollectionView, UITableView 등 불편한 구성 방식을 가지고 있는 UIKit 요소들이 조금씩 새로운 구성 방식을 추가해서 UIKit도 SwiftUI 못지않게 직관적으로 변하고 있지 않나라는 생각도 드는 것 같아요.

이러한 변화들이 앞으로 Apple 생태계의 애플리케이션을 더 쉽게 만들 수 있게 도와주는 것 같아서 앞으로의 UIKit 업데이트들이 많이 기대가 되네요.

# 레퍼런스

- [Apple Developer Documentation/UIKit/UIButton](https://developer.apple.com/documentation/uikit/uibutton)
- [WWDC2021 - Meet the UIKit button system](https://developer.apple.com/videos/play/wwdc2021/10064)
- [Human Interface Guidelines/Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
- [Apple Developer Documentation/UIKit/UIAction](https://developer.apple.com/documentation/uikit/uiaction)

### 히스토리

- 2023.06.18 01:58 최초 발행
- 2023.06.18 19:12 iOS 기본 앱에 적용된 다양한 버튼 예시 사진 추가
- 2023.06.19 00:50 버튼 스타일 사진 위치 변경
