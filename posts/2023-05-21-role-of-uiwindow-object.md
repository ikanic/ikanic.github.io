---
title: "[UIKit] UIWindow 객체의 역할"
created-date: "2023-05-21 23:20"
modified-date: "2023-05-21 23:20"
category: "Swift"
tags: ["UIWindow", "면접질문", "UIKit", "iOS", "Swift", "글또 8기"]
description: "UIWindow 객체의 역할은 무엇인가?"
---

이번 시간에는 iOS 면접을 준비하면서 공부한 UIWindow 객체의 역할에 대해 공부한 내용을 정리해보려고 합니다.<br>
질문은 [Jercy's Interview Questions for iOS Developers](https://github.com/JeaSungLEE/iOSInterviewquestions)에서 참고했습니다.<br>
원 질문의 내용은 **"UIWindow 객체의 역할은 무엇인가?"** 입니다.

# 개요

우리가 일반적으로 iOS 앱의 UI를 구성할 때, Storyboard를 사용하는 방식과 Storyboard 없이 코드로 UI를 구성하는 방식을 사용할 수 있습니다.<br>
직접적으로 UIWindow라는 개념을 처음 접하게 될 때는 아무래도 Storyboard 없이 코드로 UI를 구성하게 될 때가 아닐까 싶은데요.<br>
처음 코드로 UI를 작성할 때, UIWindow라는 게 뭔지도 모르고 일단 코드로 UI를 작성하려면 이게 필요해 하고 SceneDelegate에 무작정 코드를 붙여넣었던 기억이 나네요.

# UIWindow

`UIWindow`는 이름 앞에 붙은 `UI`라는 접두어에서 할 수 있듯이 `UIKit` 프레임워크에 포함된 클래스입니다.<br>
우선 공식 문서를 한번 볼까요.<br>
![UIWindow](https://github.com/user-attachments/assets/5013fe92-f7db-47b9-8f35-749256032196)
^^이미지 출처: [애플 공식 문서 - UIWindow](https://developer.apple.com/documentation/uikit/uiwindow)^^

공식 문서의 첫 부분을 보면 `UIWindow`를 다음과 같이 설명하고 있습니다.

:::quote
The backdrop for your app's user interface and the object that dispatches events to your views.<br>
앱의 사용자 인터페이스의 배경이자 뷰에 이벤트를 전송하는 객체입니다.
:::

번역 때문에 약간 문장이 중의적인 것처럼 보이지만, 앱 UI의 배경이면서 뷰에 이벤트를 전송하는 객체라고 합니다.<br>
또, UIWindow 클래스가 `UIView`를 상속받고 있다는 것을 알 수 있네요.

간단하게 정리하자면 **UIWindow는 UIView의 하위 클래스로, 앱의 UI를 담는 컨테이너이자, 뷰에 이벤트를 전달하는 객체**입니다.

UIWindow는 직접적으로 눈에 보이는 내용은 아니지만 View의 기본 컨테이너를 제공하거나 View를 보여주는 역할을 합니다.

또한 터치 이벤트를 View 및 다른 어플리케이션 객체들에 전달합니다. 터치 이벤트 자체는 이벤트가 발생한 Window로 전달합니다.<br>
키보드 이벤트나 터치와 관련 없는 이벤트는 Key Window로 전달합니다.

Key Window는 하나의 Window로 구성되며 isKeyWindow 프로퍼티를 이용하여 Key Window 여부를 판단합니다.<br>
일반적으로 App의 Main Window는 Key Window입니다.

iOS 13 이전까지는 **"하나의 앱은 하나의 Window를 갖는다."**가 기본 이었으나, iOS 13부터는 아이패드의 지원으로 인해 AppDelegate와 SceneDelegate의 분리로 SceneDelegate를 사용하면 하나의 앱에 여러개의 Window를 사용할 수 있습니다.

Window는 앱이 직접적으로 보여지는 Foreground일 때 뿐만 아니라 Background일 때도 사용해야 합니다.<br>
Foreground에서는 `makeKeyAndVisible()`를 사용하여 Window를 보여주고 해당 Window를 Key Window로 만들어 줍니다.

흔치는 않지만, UIWindow를 상속받아 사용하는 경우도 있습니다.

# Window 객체를 직접 만들어서 사용하는 경우

일반적으로 Storyboard를 사용한다면 직접적으로 Window 객체를 직접 생성하여 사용하지 않아도 됩니다.<br>
하지만, Storyboard를 사용하지 않고 UI를 코드로 구성한다면 Window 객체를 직접 생성하여 사용할 수 있습니다.

Storyboard를 사용하고, 하지 않을 때의 SceneDelegate 예시는 아래와 같습니다.

## Storyboard를 사용하지 않을 때 SceneDelegate 예시

```swift title="SceneDelegate.swift" {8-14}
import UIKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let scene = (scene as? UIWindowScene) else { return }
        window = UIWindow(windowScene: scene)

        let navi = UINavigationController(rootViewController: UIViewController())
        window?.rootViewController = navi

        window?.makeKeyAndVisible()
    }

    ...

}
```

## Storyboard를 사용할 때 SceneDelegate 예시

```swift title="SceneDelegate.swift" {8}
import UIKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let _ = (scene as? UIWindowScene) else { return }
    }

    ...

}
```

# 후기

이번 시간에는 UIWindow 객체의 역할에 대해 알아보았는데요.<br>
그동안 코드로 UI를 작성하면서 이해하지 않고 그냥 복사 붙여넣기만 하던 UIWindow에 대해 조금이나마 이해하고 사용할 수 있게 되어서 iOS 앱 개발에 대한 이해가 조금 늘어난 것 같네요.

## 참고자료

- [Apple Developer Documentation/UIKit/UIWindow](https://developer.apple.com/documentation/uikit/uiwindow)
- [Neph's iOS blog - UIWindow의 역할](https://neph3779.github.io/WhatIsUIWindow/)
