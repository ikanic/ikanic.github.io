---
title: "[Cocoa Design Patterns] KVO 패턴"
created-date: "2023-07-02 22:58"
modified-date: "2023-07-02 22:58"
category: "Swift"
tags: ["KVO", "Design Patterns", "Cocoa Framework", "iOS", "Swift", "글또 8기"]
description: "Cocoa Design Patterns의 KVO 패턴을 알아보자"
---

개인적으로 미디어 플레이에 관심이 많아서 최근 개인 프로젝트로 뮤직 플레이어를 만들어 보기 시작했는데요.<br>
뮤직 플레이어를 만들기 위해 이런 저런 방법을 찾다가 `AVPlayer`를 사용하기로 했는데, `AVPlayer` 문서를 보던 중 `KVO`라는 낯선 단어를 발견했습니다.<br>
`AVPlayer`에서의 간략한 설명으로만 보았을 때는 무언가 상태를 관측하는 듯 한데, 제대로 된 설명이 있지 않아 `KVO`가 무엇이고, 어떻게 사용할 수 있는지에 대해 공부한 내용을 정리해보려고 합니다.

# KVO

`KVO`는 Key-Value Observing의 약자로, `Delegate`나 `Notification` 등과 같이 특정 이벤트가 발생할 때, 원하는 객체에 이를 알려 적절한 동작을 하는 커뮤니케이션을 위한 패턴 중 하나로, 키-값 관찰이라는 이름처럼 특정 키의 값을 관찰하고 있다가 값이 변경되면 다른 객체에 알리는 코코아 프로그래밍 패턴입니다.

`MVVM`, `MVC` 등의 디자인 패턴을 사용할 때, `Model`과 `View` 등 앱에서 논리적으로 분리된 부분간의 변경 사항을 전달할 때 유용하게 사용될 수 있습니다.

그럼 이제부터 `KVO`를 코드로 작성하며 `iOS`에서 어떻게 사용될 수 있을지 알아보겠습니다.

# iOS에서의 KVO

우선 아래와 같은 뷰가 있다고 가정해 보겠습니다.<br>
![예시 뷰](https://github.com/user-attachments/assets/a73d45e7-1831-4b09-86d1-86051be42d7a)
해당 뷰는 사용자의 닉네임을 변경하는 뷰로, 현재 닉네임을 보여주고 변경할 닉네임을 입력한 후 변경하기 버튼을 누르면 "닉네임이 변경되었습니다."라는 내용을 화면에 보여주는 기능을 추가해보겠습니다.

## Key-Value Observing을 위해 관찰할 프로퍼티 만들기

우선, Key-Value Observing을 하려면 관찰할 프로퍼티가 필요하겠죠?<br>
우리는 닉네임의 변경을 관찰할 것이기 때문에 아래와 같이 `nickname`이라는 프로퍼티를 갖는 `UserInfo`라는 클래스를 만들어 주겠습니다.

```swift title="UserInfo.swift"
class UserInfo {
    var nickname = "홍길동"
}
```

이 때, 프로퍼티를 관찰하기 위해 해주어야 하는 것이 있습니다.<br>
첫 번째로, Key-Value Observing은 `NSObject`를 상속하는 클래스에서만 사용할 수 있습니다.<br>
두 번째로, 관찰하려는 프로퍼티에 `@objc` attribute와 `dynamic` modifier를 추가해야만 합니다.

위의 클래스에 이 두 가지를 적용하면 아래의 코드와 같이 변경되겠네요.

```swift title="UserInfo.swift"
class UserInfo: NSObject {
    @objc dynamic var nickname = "홍길동"
}
```

## Observer 정의하기

관찰할 프로퍼티를 만들어주었으니, 이 프로퍼티를 관찰할 `Observer`를 정의해야 합니다.
이 예시에서는 위에서 구성했던 뷰의 뷰 컨트롤러를 `Observer` 클래스로 사용하겠습니다.

`Observer` 클래스의 인스턴스는 하나 이상의 프로퍼티의 변경 사항에 대한 정보를 관리합니다.
`Observer`를 만들 때는 관찰하려는 프로퍼티를 참조하는 `KeyPath`와 함께 `observe(\_:options:changeHandler:)` 메서드를 호출하여 관찰을 시작합니다.

```swift title="NicknameChangingViewController.swift"
import UIKit

class NicknameChangingViewController: UIViewController {

    ...

    @objc var userInfo: UserInfo
    var observation: NSKeyValueObservation?

    ...

    init(object: UserInfo) {
        userInfo = object
        super.init(nibName: nil, bundle: nil)

        observation = observe(\.userInfo.nickname, options: [.old, .new]) { object, change in
            let alertTitle = "닉네임 변경 " + (change.oldValue != change.newValue ? "완료" : "실패")
            let alertMessage = (change.oldValue != change.newValue ? "닉네임이 \(change.oldValue!)에서 \(change.newValue!)로 변경되었습니다." : "변경할 닉네임이 현재 닉네임과 같습니다.")

            ...

            let alert = UIAlertController(title: alertTitle, message: alertMessage, preferredStyle: .alert)
            alert.addAction(UIAlert(title: "확인", style: .default))
            self.present(alert, animated: true)
        }
    }

    ...

}
```

관찰 중인 프로퍼티에 대해 변경된 내용을 확인하려면 `NSKeyValueObservedChange` 인스턴스의 `oldValue`와 `newValue` 프로퍼티를 사용할 수 있습니다.<br>
`oldValue`와 `newValue`를 사용하기 위해서는 `options` 파라미터에 각각 `old`, `new`를 명시해야 합니다.

프로퍼티가 변경되었다는 것만 감지하고, 어떻게 변경되었는지까지는 알 필요가 없는 경우에는 `options` 파라미터를 생략할 수 있습니다.<br>
`options` 파라미터를 생략하면 프로퍼티의 변경된 값과 변경 이전의 값을 저장하지 않으므로, `oldValue`와 `newValue`가 `nil`이 됩니다.

`options`에는 `old`와 `new`뿐만 아니라 `initial`, `prior`도 사용할 수 있습니다.

## Observer와 관찰할 프로퍼티 연결하기

이렇게 관찰할 프로퍼티와 `Observer`를 만들어주었으면, 이 둘을 연결해주어야 하는데요.<br>
위의 예제 코드에서 뷰 컨트롤러의 initializer에 object로 `UserInfo` 클래스가 들어갔었죠?

그렇다면 뷰 컨트롤러의 상위 뷰 컨트롤러에서 아래와 같이 둘을 연결해 줄 수 있습니다.

```swift
...

let observed = UserInfo()
let observer = KVOViewController(object: observed)
navigationController?.pushViewController(observer, animate: true)

...
```

혹은 `SceneDelegate`에서 아래와 같이 연결해줄 수도 있습니다.

```swift title="SceneDelegate.swift"
class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    ...

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {

        ...

        let observed = UserInfo()
        let observer = KVOViewController(object: observed)

        window?.rootViewController = observer

        ...
    }

    ...

}
```

## 프로퍼티의 변경에 응답하기

Key-Value Observing을 사용하도록 설정된 객체는 `Observer`에게 프로퍼티의 변경에 대해 알립니다.
그렇다면 프로퍼티가 변경될 수 있어야겠죠?

처음에 작성했던 `UserInfo` 클래스에 `nickname` 프로퍼티를 변경하는 `updateNickname`이라는 메서드를 아래와 같이 만들어주겠습니다.

```swift title="UserInfo.swift"
class UserInfo: NSObject {
    @objc dynamic var nickname = "홍길동"

    func updateNickname(newNickname: String) {
        nickname = newNickname
    }
}
```

그 후에 뷰 컨트롤러의 버튼에 `userInfo.updateNickname(newNickname:)` 메서드를 클릭 이벤트로 설정하여 프로퍼티를 변경할 수 있도록 합니다.

## KVO 적용 결과

이제 닉네임을 변경해 볼까요?

아래와 같이 닉네임이 현재와 같다면 "닉네임 변경 실패"를, 다르다면 "닉네임 변경 완료"를 화면에 보여주는 것을 볼 수 있습니다.<br>
![닉네임 변경](https://github.com/user-attachments/assets/ac19caa3-3c98-4f81-9b3c-e4eb8bf3ff66)

# 마무리

이번 시간에는 `KVO` 패턴을 `iOS` 앱 예시와 함께 알아보았는데요.

특정 프로퍼티의 변경을 감지하고 이에 따라 다른 이벤트를 발생 시킨다는 점에서 프로퍼티 옵저버 `didSet`, `willSet`과 비슷하다고 느꼈는데, 프로퍼티 옵저버는 프로퍼티를 작성한 클래스의 내부에서만 사용할 수 있는 반면, `KVO`는 프로퍼티를 외부 클래스에서 사용할 수 있다는 점이 다른 것 같습니다.

`KVO`를 사용하면

1. 두 객체 사이의 정보를 맞춰주는 것이 간단해짐
2. 프로퍼티의 변경 전, 후 정보를 쉽게 얻을 수 있음
3. `KeyPath`로 Observing하기 때문에 `Nested Objects`(중첩된 객체; 객체 안에 있는 또 다른 객체)도 Observing 가능
   이라는 장점이 있습니다.

반면에 `KVO`를 사용하게 되면 `NSObject`를 상속해야 하고, `@objc` attribute의 사용이 필수이기 때문에 `Objective-C` 런타임에 의존하게 되고, 또 클래스의 사용을 강제한다는 단점 또한 가지고 있습니다.

`Objective-C` 런타임에 의존한다는 점 때문에 최신의 Swift 코드에서는 `KVO`보다는 다른 방법들을 사용하는 것 같습니다.

위에서 사용한 예제 코드는 [KVO 예제 링크](https://github.com/taek0622/iOS-UIKit-Dev-Note/blob/main/iOS_UIKit_Dev_Note/KVOPattern/KVOViewController.swift)에서 확인하실 수 있습니다.

## 후기

뮤직 플레이어 앱을 위해서 공부하던 `AVPlayer`에서 잠깐 언급되어서 공부하기 시작한 내용인데, `Delegate` 패턴 같은 것들을 공부할 때보다 내용이 더 간단해서 개인적으로는 공부할 때 더 편했던 것 같네요.

다만, `Objective-C` 런타임에 의존된다는 점 때문에 현 시점에서 순수 Swift 코드에서는 잘 사용되지 않는 것 같은데, 그래도 이러한 내용을 공부해본 것과 안 해본 것에는 차이가 있을 것이라고 생각해서 좋은 경험이었던 것 같습니다.

# 레퍼런스

- [Apple Developer Documentation/Swift/Cocoa Design Patterns/Using Key-Value Observing in Swift](https://developer.apple.com/documentation/swift/using-key-value-observing-in-swift)

### 히스토리

- 2023.07.02 22:58 최초 발행
- 2023.07.03 20:37 누락된 이미지 추가
- 2023.07.08 22:12 코드 오타 수정
