---
title: "[UIKit] UIProgressView / 미디어 플레이어의 재생바는 어떻게 구현할 수 있을까? 1️⃣"
thumbnail: "https://github.com/user-attachments/assets/9bdfe303-3623-4118-9180-f5c209944193"
created-date: "2023-12-24 08:08"
modified-date: "2023-12-24 08:08"
category: "Swift"
tags:
    [
        "UIProgressView",
        "UIResponder",
        "UIKit Touch Event",
        "iOS",
        "글또 9기",
        "Swift",
        "UIKit",
    ]
series: "미디어 플레이어의 재생바는 어떻게 구현할 수 있을까?"
seriesOrder: 1
description: "UIProgressView를 이용한 미디어 플레이어 재생바 구현"
---

개인적으로 미디어 플레이에 관심이 많아서 개인 프로젝트로 뮤직 플레이어나 비디오 플레이어 등을 몇 번 만들어봤는데요.<br>
미디어 플레이어에서 현재 재생 중인 구간을 보여주고, 또 다른 구간으로 넘어갈 수 있게 하는 재생바 부분을 어떻게 구현하면 좋을지 고민하며 공부한 내용들을 정리해 보려 합니다.

그중에서도 이번 시간에는 처음에 찾아봤던 `UIProgressView`에 대해서 알아보겠습니다.

# UIProgressView

많은 미디어 플레이어에서 현재 재생 구간을 보여주는 재생바는 단순히 재생 구간을 보여주는 것만이 아니라 내가 원하는 구간으로 재생 구간을 변경하는 기능도 함께 하는 경우가 많습니다.<br>
이러한 재생바를 영어권에서는 주로 `Progress Bar`라는 명칭으로 부르는데요. `UIKit`에도 비슷한 명칭의 `UIProgressView`라는 뷰를 제공하고 있습니다.<br>
![UIProgressView](https://github.com/user-attachments/assets/2d1a97d9-4aa6-4173-8d35-13189f8a96bc)
먼저 Apple의 공식 문서에 소개된 `UIProgressView`의 설명을 보면, `UIProgressView`는 **시간 경과에 따른 작업 진행 상황을 표시하는 뷰**라고 합니다. "시간 경과에 따른 작업 진행 상황을 표시하는 뷰"라고 하면 재생바에 필요한 현재 재생 구간을 알려주는 기능에 사용하기에 딱 좋겠죠?<br>
`UIProgressView`는 Progress Bar의 스타일을 관리하고, 작업의 진행률에 고정된 값을 가져오고 설정하기 위한 프로퍼티를 제공한다고 하네요.

## UIProgressView의 진행률 관리

`UIProgressView`는 진행률을 관리하기 위해 아래의 세 가지 방법을 사용할 수 있습니다.

- `var progress: Float { get set }`
- `func setProgress(\_ progress: Float, animated: Bool)`
- `var observedProgress: Progress? { get set }`

1. **progress**
   먼저 `progress` 프로퍼티는 `UIProgressView`의 현재 진행률을 가져오거나 설정할 수 있는데요.<br>
   진행률은 0.0~1.0 사이의 부동 소수점 값으로 표시되며 1.0은 작업이 완료되었음을 나타내고, 기본값은 0.0입니다.<br>
   일반적으로 진행률을 설정하거나, 진행률 값을 가져오기 위해 사용할 수 있겠네요.

2. **setProgress(\_:animated:)**
   `setProgress` 메서드는 현재 진행률을 조정하는 메서드인데요. `animated`라는 파라미터를 이용해 progress의 변경 사항을 애니메이션으로 표시할지 여부를 결정할 수 있습니다.<br>
   progress는 앞의 `progress` 프로퍼티처럼 0.0~1.0 사이의 부동 소수점 값으로 표시되며 1.0은 작업이 완료되었음을 나타내고, 기본값은 0.0입니다.<br>
   `animated` 파라미터는 애니메이션을 적용해야 하는 경우 true로, 그렇지 않고 변경 사항이 즉시 반영되기를 원한다면 false로 설정할 수 있습니다.

3. **observedProgress**
   `observedProgress` 프로퍼티는 `UIProgressView`를 업데이트하는 데 사용될 `Progress` 객체를 설정할 수 있는데요. 이 프로퍼티를 설정하면 `UIProgressView`는 설정된 객체에서 수신한 정보를 사용하여 진행률을 애니메이션과 함께 자동으로 업데이트합니다.<br>
   진행률을 수동으로 업데이트하려면 이 프로퍼티를 `nil`로 설정하며, 기본값은 `nil`입니다.

## UIProgressView 구성

`UIProgressView`는 현재 진행률(프로그레스 바에서 채워진 부분)을 보여주는 progress와 전체 진행률(프로그레스 바에서 채워지지 않은 부분)을 보여주는 track의 두 부분으로 나눌 수 있는데요.
해당 부분의 색상이나 이미지를 변경할 수 있는 다음과 같은 4가지 프로퍼티를 제공합니다.

- `progressTintColor: UIColor? { get set }`
- `progressImage: UIImage? { get set }`
- `trackTintColor: UIColor? { get set }`
- `trackImage: UIImage? { get set }`

프로퍼티의 이름에서 알 수 있듯 `progressTintColor`와 `progressImage`는 각각 현재 진행률의 색상과 이미지를, `trackTintColor`와 `trackImage`는 전체 진행률의 색상과 이미지를 지정하거나 가져올 수 있습니다.<br>
그 외에 `UIProgressView`의 현재 스타일을 지정하거나 가져오는 `progressViewStyle`이라는 프로퍼티도 있는데, `UIProgressView`에 지정할 수 있는 스타일은 `default`와 `bar`가 있습니다.<br>
![default Style UIProgressView](https://github.com/user-attachments/assets/2d1a97d9-4aa6-4173-8d35-13189f8a96bc)
`default`는 일반적인 표준 프로그레스 뷰 스타일로 둥근 모양을 띠고 있으며 현재 진행률과 전체 진행률을 모두 쉽게 확인할 수 있습니다.<br>
![bar Style UIProgressView](https://github.com/user-attachments/assets/83d5c116-dbc0-4c61-9c6e-91560fe0a901)
`bar`는 툴바에서 사용되는 프로그레스 뷰 스타일로 각진 모양을 띠고 있으며 현재 진행률을 쉽게 확인할 수 있지만, 전체 진행률의 트랙은 보이지 않네요.<br>
다만, `trackTintColor`나 `trackImage`를 지정했다면, `bar` 스타일에서도 전체 진행률을 확인할 수 있습니다.<br>
`bar` 타입을 사용하는 가장 대표적인 예로는 iOS Safari 앱의 검색 창을 이용해 검색했을 때를 들 수 있겠네요.

## UIProgressView에 재생바 구간 변경 기능 추가하기

기본적으로 `UIProgressView`는 터치 이벤트를 통해 진행률을 변경하는 기능을 지원하지 않습니다.<br>
하지만, `UIProgressView`는 뭘 상속받고 있다? 바로 `UIView`를 상속받고 있다.<br>
그렇다면 `UIView`는 무엇을 상속받고 있다? `UIResponder`를 상속받고 있다!

그럼, `UIResponder`는 무엇을 할 수 있다? **이벤트에 응답 및 처리**를 할 수 있다!<br>
네, `UIResponder`의 touch event 관련 메서드들을 오버라이드해서 원하는 동작을 만들어낼 수 있습니다.

우선 `UIResponder`의 기능들을 오버라이드하기 위해서 `UIProgressView`를 상속받는 `CustomProgressView`라는 클래스를 만들어 주겠습니다.

```swift title="CustomProgressView.swift"
import UIKit

class CustomProgressView: UIProgressView {
}
```

가장 먼저 구현해 볼 동작은 특정 지점을 터치했을 때, 해당 지점으로 진행률을 변경하는 기능입니다.<br>
먼저 현재 터치된 지점을 저장할 current라는 Double형의 변수를 만들어주겠습니다.

```swift title="CustomProgressView.swift" {4}
import UIKit

class CustomProgressView: UIProgressView {
    private var current: Double?
}
```

그 후에 터치의 시작을 감지하는 `touchesBegan(\_:with:)` 메서드를 오버라이드해서 터치된 지점의 x좌표를 감지해 current 변수에 저장합니다.

```swift title="CustomProgressView.swift" {6-9}
import UIKit

class CustomProgressView: UIProgressView {
    private var current: Double?

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesBegan(touches, with: event)
        current = touches.first!.location(in: self).x
    }
}
```

current의 값은 변경되었지만, progress의 값을 변경하는 코드를 작성하지 않았죠?<br>
progress 값의 변경은 터치 이벤트가 끝나는 시점에 변경해야하기 때문에 `touchesEnded(\_:with:)` 메서드를 오버라이드해서 사용하겠습니다.

progress는 0.0~1.0 사이의 범위를 갖기 때문에 current의 값을 냅다 progress에 집어넣으면 최댓값인 1.0으로 고정되어 버리는데요.<br>
그렇기 때문에 ProgressView의 전체 크기에서 현재 터치된 지점의 x 좌푯값을 나눈 값을 progress에 넣어 줍니다.

```swift title="CustomProgressView.swift" {11-14}
import UIKit

class CustomProgressView: UIProgressView {
    private var current: Double?

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesBegan(touches, with: event)
        current = touches.first!.location(in: self).x
    }

    override func touchesEnded(_  toches: Set<UITouch>, with event: UIEvent?) {
        super.touchesEnded(touches, with: event)
        progress = Float(current! / self.bounds.width)
    }
}
```

![터치형 프로그레스바](https://github.com/user-attachments/assets/3f31ffcd-9a06-42bc-90ec-21aa1b638245)
그럼, 이제 터치한 지점으로 ProgressView의 진행률이 변경되는 것을 확인할 수 있습니다.

그 다음으로는 터치 이후 드래그 제스처를 했을 때, 드래그 되고있는 지점을 따라 진행률이 계속 변경되는 기능을 구현해 보겠습니다.<br>
드래그에 따라 변경되는 좌표를 계속 감지하기 위해 `touchesMoved(\_:with:)` 메서드를 오버라이드합니다.

```swift title="CustomProgressView.swift" {5-7}
import UIKit

class CustomProgressView: UIProgressView {
    ...
    override func touchesMoved(\_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesMoved(touches, with: event)
    }
    ...
}
```

드래그에 따라 변경되는 좌표를 감지하고 그에 따라 진행률을 변경하기 위해서는 새로 변경된 터치 이벤트 좌표를 구해 전체 ProgressView의 크기와 비교해야 하는데요.<br>
새 값을 current에 다시 저장해 progress에 반영하는 코드를 작성합니다.

```swift title="CustomProgressView.swift" {10-11}
import UIKit

class CustomProgressView: UIProgressView {
    private var current: Double?

    ...

    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesMoved(touches, with: event)
        current = touches.first!.location(in: self).x
        progress = Float(current! / self.bounds.width)
    }

    ...

}
```

자 그러면 이제 터치했을 때뿐만 아니라 드래그했을 때도 진행률이 연속적으로 변경되는 것을 확인할 수 있습니다.<br>
![드래그형 프로그레스바](https://github.com/user-attachments/assets/6a71afa1-f2eb-4162-957d-6793bdd70db0)
완성된 코드는 아래와 같습니다.

```swift title="CustomProgressView.swift"
import UIKit

class CustomProgressView: UIProgressView {
    private var current: Double?

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesBegan(touches, with: event)
        current = touches.first!.location(in: self).x
    }

    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesMoved(touches, with: event)
        current = touches.first!.location(in: self).x
        progress = Float(current! / self.bounds.width)
    }

    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesEnded(touches, with: event)
        progress = Float(current! / self.bounds.width)
    }

}
```

# UIProgressView의 주요 용도

기본적으로 UIProgressView는 특정 터치 이벤트 등을 지원하지 않습니다.<br>
이것으로 보아 UIProgressView는 단순히 **특정 태스크에 대한 현재 진행률을 보여주는 것**이 주요 목표라고 볼 수 있습니다.<br>
그렇다면 이런 뷰가 필요한 경우는 어떤 경우가 있을까요?<br>
이런 목적으로 사용되는 가장 쉽게 접할 수 있는 경우로는 게임 앱을 예로 들 수 있습니다.<br>
일부 게임 앱들은 단순히 앱 스토어에서 설치하는 것 뿐만 아니라, 최초 접속시 추가 리소스를 다운로드하는 경우가 있습니다.<br>
이런 경우 추가 리소스가 얼마나 설치되었는 지를 보여주는 목적으로 사용할 수 있습니다.<br>
혹은 게임에서 다른 화면으로 넘어갈 때 로딩 시간이 있다면 로딩이 얼마나 진행되었는지를 보여주는 용도로도 사용할 수 있습니다.<br>
다만, 실제 게임 앱들의 경우 iOS 네이티브로 작성되기보단 Unity나 Unreal 등의 엔진 위에서 개발되기 때문에 실제로 게임 앱에서는 UIProgressView가 사용되는 경우가 거의 없을 것으로 보입니다.<br>
하지만, 게임 앱 외에 앱이라면 **특정 컨텐츠의 다운로드 진행률이나 로딩 진행률 등을 보여주는 용도**로 UIProgressView를 사용할 수 있겠네요.

# 마무리

이렇게 이번 시간에는 `UIProgressView`를 이용하여 미디어 플레이어의 재생 바에 필요한 재생 구간 표시, 구간 선택 및 이동 기능을 구현하는 방법에 대해 알아보았는데요.<br>
실제 미디어 플레이어의 재생 바에는 progress뿐만 아니라, 영상의 재생 시간 자체를 변경하는 코드가 추가로 필요합니다.<br>
`UIProgressView` 자체는 사실 다른 동작보다는 현재의 진행률을 보여주는 것 자체만이 목적이기 때문에 용도를 생각한다면 미디어 플레이어의 재생 바에는 `UIProgressView`가 적절해 보이진 않네요.<br>
다음 시간에는 미디어 플레이어의 재생 바는 어떻게 구현할 수 있을까? 제2편 `UISlider`를 이용한 구현 방법에 대해 알아보겠습니다.

## 후기

`UIProgressView`와 `UISlider`를 한 편에 다 싣는 것이 목표였는데, `UIProgressView`만으로도 분량이 너무 넘쳐서 읽기 부담스럽다는 느낌이 들어 글을 두 개로 나누게 되었습니다.<br>
`UISlider`를 정리한 내용은 `UIProgressView`보다 더 많은데 큰일이네요.

# 참고자료

- [Apple Developer Documentation/UIKit/UIProgressView](https://developer.apple.com/documentation/uikit/uiprogressview)
- [Apple Developer Documentation/UIKit/UIResponder](https://developer.apple.com/documentation/uikit/uiresponder)

### 히스토리

- 2023.12.24 최초 발행
- 2024.01.02 "UIProgressView의 주요 용도" 섹션 추가
