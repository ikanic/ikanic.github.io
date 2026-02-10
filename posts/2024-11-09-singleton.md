---
title: "[Cocoa Design Patterns] Singleton - 싱글톤을 사용해 공유 리소스 관리하기"
thumbnail: "https://github.com/user-attachments/assets/789e6dee-77e8-4ba0-894f-da2ba700e690"
created-date: "2024-11-09 00:53"
modified-date: "2024-11-09 00:53"
category: "Swift"
tags:
    [
        "Singleton",
        "Cocoa Design Patterns",
        "GoF Design Patterns",
        "Software Design Patterns",
        "글또 10기",
    ]
description: "Cocoa 환경에서 사용되는 Design Pattern 중 Singleton에 대해 알아보자"
---

프로그래밍을 하다보면 다양한 소프트웨어 디자인 패턴을 접하게 됩니다.<br>
소프트웨어 디자인 패턴은 프로그램 개발에서 자주 발생하는 문제를 해결하기 위한 방법의 하나로, 1995년 GoF라 불리는 4명의 유명한 개발자가 구체화한 GoF 디자인 패턴이 가장 많이 사용되고 있습니다.

Apple에서는 디자인 패턴을 Cocoa 환경에서 사용하기 위한 Cocoa Design Patterns을 제시하고 있는데, 이번에는 이 중 GoF 디자인 패턴에서도 많이 사용되는 `Singleton`(이하 '싱글톤')에 대해 알아보겠습니다.

# Singleton(싱글톤)이란?

싱글톤은 GoF 디자인 패턴 중 생성(Creational) 디자인 패턴에 해당하는 디자인 패턴으로, 프로그램이 시작될 때 객체의 인스턴스를 처음 한 번만 생성하여 사용하는 디자인 패턴입니다.

즉, 해당 객체를 여러 번 호출하더라도 인스턴스를 여러 번 생성하지 않고, 최초 호출 시에 만들었던 인스턴스를 재활용하는 패턴입니다.

그렇다면 이러한 싱글톤 패턴을 사용하는 이유는 무엇일까요?

## 싱글톤 패턴을 사용하는 이유

1. **메모리와 성능 측면에서의 효율**
   싱글톤을 사용하지 않는다면, 사용자가 특정 객체를 반복해서 호출할 때, 해당 객체가 호출될 때마다 인스턴스의 생성 및 소멸을 반복하게 됩니다.<br>
   이렇게 인스턴스의 생성 및 소멸을 반복하게 되면 메모리 낭비의 문제가 발생하게 되며, 생성 및 소멸 시간 등의 이유로 성능 측면에서도 효율이 좋지 않습니다.<br><br>
   하지만, 싱글톤을 사용하게 되면 객체의 인스턴스를 단 1개만 생성하고, 그 이후 처음에 만든 인스턴스를 재활용하기 때문에 생성 및 소멸을 반복할 일이 없어지고, 이 때문에 메모리 및 성능 측면에서 효율이 좋습니다.

2. **클래스 간 데이터 공유의 용이**
   싱글톤을 사용하면 해당 싱글톤 객체의 인스턴스에 대한 전역 접근 지점을 제공하게 됩니다.<br>
   이 특성을 활용해 사운드 재생을 담당하는 사운드 관리자, HTTP 요청을 하는 네트워크 관리자 등을 만들어 앱 전역에서 사용할 데이터를 쉽게 공유할 수 있게 됩니다.<br><br>
   예를 들면 아래와 같이 iOS 앱 전역에서 음악 재생을 관리하는 음악 관리자를 만들어서, 화면에 바뀌더라도 음악의 재생을 지속할 수 있습니다.<br>

!![싱글톤 데이터 공유 예시 - 뮤직 플레이어](https://github.com/user-attachments/assets/1dd439a5-5fe3-4474-9d81-24ee227fca99)

## 싱글톤 패턴을 사용할 때 주의점

위와 같은 이유로 싱글톤 패턴을 많이 사용하지만, 싱글톤을 사용할 때는 위와 같은 이점만 있는 것이 아니라 다음과 같은 주의해야 할 점도 있습니다.

1. **단일 책임 원칙 위반의 가능성**
   싱글톤 패턴은 객체의 인스턴스가 하나만 있도록 해야 한다는 문제와 해당 인스턴스에 대한 전역 접근 지점을 제공하는 문제 두 가지를 동시에 해결해야 하므로 단일 책임 원칙에 위배됩니다.<br><br>
   다만, 최근에는 싱글톤 패턴이 대중화되며 위의 두 가지 문제 중 하나만 해결하더라도 싱글톤이라고 부르는 경우도 있다고 합니다. 이 경우 단일 책임 원칙을 위반하지 않게 됩니다.

2. **개방 폐쇄 원칙 위반의 가능성**
   싱글톤 인스턴스가 너무 많은 일을 하거나 많은 데이터를 공유시킬 경우 다른 클래스의 인스턴스 간에 결합도가 높아져 개방-폐쇄 원칙(OCP, Open-Closed Principle)을 위반할 수 있습니다.<br>
   또한, 이에 따라 수정과 테스트도 어려워질 수 있습니다.

3. **싱글톤을 위한 코드 구현**
   멀티 스레드 환경에서 여러 스레드가 동시에 싱글톤을 생성하려고 하는 경우 인스턴스가 2개 이상 생성될 수 있습니다.<br>
   싱글톤은 이러한 경우를 막고, 오직 1개의 인스턴스만 생성되도록 특별한 처리가 필요합니다.

# Swift Cocoa 환경에서 싱글톤 사용하기

지금까지 일반적인 GoF의 싱글톤 패턴에 대해 알아보았습니다.<br>
이번에는 Swift Cocoa 환경에서 싱글톤을 사용하는 방법에 대해 알아보겠습니다.

우선 Swift 환경에서 싱글톤을 생성하는 가장 기본적인 방법은 아래와 같습니다.

```swift title="Singleton.swift"
class Singleton {
    static let shared = Singleton()
}
```

여러 스레드에서 어떤 객체에 동시에 접근하더라도 프로그램의 동작에 이상이 없는 것을 `Thread Safe`하다고 합니다.<br>
Swift에서는 `static let`으로 선언하는 것만으로도 싱글톤 객체가 1회만 생성되는 것을 보장하여 `Thread Safe`하게 됩니다.

[The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/)의 [Properties](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/properties) 문서의 [Global and Local Variables](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/properties#Global-and-Local-Variables) 단락에 따르면 전역 상수와 변수는 항상 느리게(lazily) 계산된다고 합니다. 즉, `lazy` 키워드 없이도 `lazy` 저장 프로퍼티의 동작 방식과 같게 됩니다.

`static` 키워드는 항상 전역으로 선언되는데, 전역은 항상 `lazy`로 생성되기 때문에 `static` 또한 `lazy`로 생성됩니다.

즉, Swift에서 `static` 변수는 lazy 저장 프로퍼티와 변수가 처음 사용되기 전까지는 계산되지 않고, 변수가 처음 사용될 때 계산됩니다.<br>
이에 따라 Swift에서 Singleton은 인스턴스가 1개라는 것을 보장받게 되어 `Thread Safe`하게 됩니다.

초기화 외에 추가 설정을 수행해야 하는 경우 아래와 같이 클로저 호출 결과를 전역 상수에 할당할 수 있습니다.

```swift title="Singleton.swift"
class Singleton {
    static let shared: Singleton = {
        let instance = Singleton()

        // 추가 설정 코드

        return instance
    }()
}
```

Swift에서 싱글톤 클래스를 작성할 때 아래와 같이 생성자에 `private` 키워드를 자주 붙입니다.

```swift
class Singleton {
    static let shared = Singleton()

    private init() {}
}
```

이는 `private` 키워드로 외부에서 생성자에 접근하는 것을 막아, 인스턴스가 추가로 생성되는 것을 방지하기 위하여 사용됩니다.

이처럼 Swift에서 싱글톤은 `Thread Safe`하다는 장점을 갖게 되어 싱글톤을 위한 복잡한 코드를 작성해야 하는 것을 방지할 수 있으며, 또한 이에 따라 단일 책임 원칙의 위배 가능성을 없앨 수 있습니다.

## Apple의 라이브러리에서 싱글톤 패턴이 사용되는 곳

Apple에서 제공하는 라이브러리에서도 다양한 곳에 싱글톤 패턴이 사용되고 있는데, 대표적으로 아래와 같은 곳에서 사용되고 있습니다.

```swift
let userDefaults = UserDefaults.standard
let notification = NotificationCenter.default
let urlSession = URLSession.shared
let dispatchQueue = DispatchQueue.main
let fileManager = FileManager.default
```

# 마무리

이번 시간에는 디자인 패턴 중 하나인 싱글톤 패턴에 대해 알아보았습니다.<br>
여러 프로젝트에서 싱글톤을 사용하면서도 사용법을 안다는 이유로 어떤 이유에서 어떤 원리로 싱글톤을 이용하는지까지는 공부하지 않았었는데, 이번 기회에 싱글톤에 `private` 키워드를 붙이는 이유나 Swift에서 싱글톤이 `Thread Safe`할 수 있는 이유에 대해 제대로 공부할 수 있었던 것 같습니다.

Swift Cocoa Design Patterns에 대해서도 `KVO` 이후로 공부해야겠다고 생각만 하고 멈춰있었는데, 이렇게 다시 한번 Swift Cocoa Design Patterns를 들여다보게 되네요.

# 참고자료

- [Apple Developer Documentation/Swift/Cocoa Design Patterns/Managing a Shared Resource Using a Singleton](https://developer.apple.com/documentation/swift/managing-a-shared-resource-using-a-singleton)
- [The Swift Programming Language/Properties#Global and Local Variables](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/properties#Global-and-Local-Variables)
- [Refactoring.Guru/디자인 패턴들/생성 패턴/싱글턴 패턴](https://refactoring.guru/ko/design-patterns/singleton)
