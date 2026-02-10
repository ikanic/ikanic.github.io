---
title: "[UIKit] UISlider / 미디어 플레이어의 재생바는 어떻게 구현할 수 있을까? 2️⃣"
thumbnail: "https://github.com/user-attachments/assets/01b9ec9e-5a46-48f9-9c3c-b13f3ab418b9"
created-date: "2024-01-07 23:35"
modified-date: "2024-01-07 23:35"
category: "Swift"
tags: ["UISlider", "UIAction", "UIControl", "iOS", "글또 9기", "Swift", "UIKit"]
series: "미디어 플레이어의 재생바는 어떻게 구현할 수 있을까?"
seriesOrder: 2
description: "UISlider를 이용한 미디어 플레이어 재생바 구현"
---

저번 시간에 이어 이번 시간에도 미디어 플레이어에서 현재 재생 중인 구간을 보여주고, 다른 구간으로 넘어갈 수 있게 하는 재생바 부분을 어떻게 구현하면 좋을지 고민하며 공부한 내용을 정리해 보려 합니다.

이번 시간에는 `UISlider`에 대해서 알아보겠습니다.

# UISlider

앞서 본 `UIProgressView`는 미디어 플레이어에서 재생바의 현재 진행 중인 부분을 표시할 수는 있지만, 기본적으로 제공하는 방법으로는 내가 원하는 구간으로 넘어가는 기능을 구현할 수 없어 `UIResponder`의 touch event 관련 메서드를 재정의하여 구현해야 했습니다.<br>
`UIKit`에서는 특정 동작 등을 전달하기 위한 `UIControl`들이 존재하는데요. 이러한 `UIControl` 중에는 `UIProgressView`와 유사하게 생겼지만, 값을 변경할 수 있는 `UISlider`라는 컨트롤이 존재합니다.

우선 `UISlider`의 모양부터 살펴보겠습니다.<br>
![UISlider 1](https://github.com/user-attachments/assets/6b3321b4-4ca4-43d9-8fb8-f510ccdefc7b)
중간에 동그란 컨트롤이 달린 것만 제외하면 `UIProgressView`와 상당히 비슷하게 생겼네요.

`UISlider`의 정의를 보면 연속된 값 범위에서 단일 값을 선택하기 위한 컨트롤이라고 합니다. 여기까지 봤을 때는 아직 어떤 역할을 할 수 있을지 잘 모르겠죠? 설명을 조금 더 읽어보겠습니다.<br>
**"슬라이더의 thumb를 움직이면 업데이트된 값이 슬라이더에 연결된 모든 액션에 전달된다"** 중간에 달린 동그란 친구를 `thumb`라고 부르는데, 이 `thumb`를 움직여서 슬라이드의 값을 업데이트하고, 그 값을 슬라이더의 액션에 전달한다는 내용인 것 같네요.<br>
그렇다면 재생바의 원하는 구간으로 넘어가는 기능을 구현하기 좋겠죠?

## UISlider의 값 관리

`UISlider`는 기본적으로 진행률이 아닌 값을 관리합니다. 그렇기 때문에 `UIProgressView`처럼 `progress`를 사용하는 것이 아니라, `value`를 사용하는데요.<br>
이 `value`를 관리하기 위해 아래의 두 가지 방법을 사용할 수 있습니다.

- `var value: Float { get set }`
- `func setValue(\_ value: Float: animated: Bool)`

1. **value**
   먼저 `value`는 `UISlider`의 현재 값을 가져오거나 설정할 수 있습니다.<br>
   `UISlider`는 이 `value`의 최솟값 및 최댓값 범위가 존재하는데요. 만약 `value`를 최솟값보다 낮거나, 최댓값보다 높게 설정하려고 하는 경우 최솟값, 혹은 최댓값으로 대신 설정됩니다.<br>
   별도로 `value`를 설정하지 않을 경우 기본값은 0으로 설정됩니다.

2. **setValue(\_:animated:)**
   `setValue`는 `value`를 설정하는 메서드로, `value` 파라미터를 이용해 `value` 값을 설정하고, `animated` 파라미터를 이용해 변경 사항을 애니메이션으로 표시할지 여부를 결정할 수 있습니다.<br>
   `animated` 파라미터의 값이 `true`이면 value의 변화에 애니메이션을 적용하고, `false`라면 애니메이션을 적용하지 않고 슬라이더의 모양을 즉시 업데이트합니다.<br>
   이 애니메이션은 비동기적으로 수행되며 calling thread를 차단하지 않습니다.

앞에서 `value`를 설명할 때, `UISlider`에는 `value`의 최솟값 및 최댓값 범위가 존재한다고 했는데요. 이 슬라이더의 범위는 아래의 두 프로퍼티를 사용하여 관리할 수 있습니다.

- `var minimumValue: Float { get set }`
- `var maximumValue: Float { get set }`

이름에서 알 수 있듯 `minimumValue`는 슬라이더의 최솟값, `maximumValue`는 슬라이더의 최댓값을 설정합니다.<br>
슬라이더는 앞쪽 끝(일반적으로 왼쪽)을 최솟값, 뒤쪽 끝(일반적으로 오른쪽)을 최댓값으로 표현하는데요. 최솟값, 최댓값의 기본값은 각각 0.0, 1.0입니다.

## UISlider의 구성

![UISlider 2](https://github.com/user-attachments/assets/5d84828d-0b45-46d0-9c04-31f1369ab99a)
`UISlider`는 위와 같이 생겼는데요. 이 `UISlider`의 각각의 구성 요소에 대한 명칭은 다음과 같습니다.<br>
![UISlider의 구성 요소](https://github.com/user-attachments/assets/1e163090-acc4-49c6-b3b1-e4a6d8836f1b)
슬라이더에는 앞쪽과 뒤쪽이 존재하는데, 보편적으로 많이 사용되는 왼쪽에서 오른쪽으로 이동하는 슬라이더에서는 왼쪽이 앞, 오른쪽이 뒤쪽이지만, 오른쪽에서 왼쪽으로 이동하는 슬라이더의 경우 자동으로 오른쪽이 앞, 왼쪽이 뒤쪽이 됩니다.

`UISlider`는 각각의 구성 요소에 대해 모양을 관리할 수 있는 많은 방법을 가지고 있는데요.<br>
아래의 14가지 프로퍼티 및 메서드를 제공하고 있습니다.

- `var minimumValueImage: UIImage? { get set }`
- `var maximumValueImage: UIImage? { get set }`
- `var minimumTrackTintColor: UIColor? { get set }`
- `var currentMinimumTrackImage: UIImage { get }`
- `func minimumTrackImage(for state: UIControl.State) -> UIImage?`
- `func setMinimumTrackImage(_ image: UIImage?, for state: UIControl.State)`
- `var maximumTrackTintColor: UIColor? { get set }`
- `var currentMaximumTrackImage: UIImage? { get }`
- `func maximumTrackImage(for state: UIControl.State) -> UIImage?`
- `func setMaximumTrackImage(_ image: UIImage?, for state: UIControl.State)`
- `var thumbTintColor: UIColor? { get set }`
- `var currentThumbImage: UIImage? { get }`
- `func thumbImage(for state: UIControl.State) -> UIImage?`
- `func setThumbImage(\_ image: UIImage?, for state: UIControl.State)`

1. **minimumValueImage, maximumValueImage**
   `minimumValueImage`와 `maximumValueImage` 프로퍼티는 각각 슬라이더의 최솟값, 최댓값을 나타내는 이미지를 가져오거나 설정할 수 있습니다.<br>
   슬라이더에서 최솟값은 앞쪽, 최댓값은 뒤쪽 끝을 말합니다.

2. **minimumTrackTintColor, maximumTrackTintColor, thumbTintColor**
   `minimumTrackTintColor`, `maximumTrackTintColor`, `thumbTintColor` 프로퍼티는 각각 기본 최소, 최대 track과 thumb 이미지의 색상을 가져오거나 설정할 수 있습니다.<br>
   이 속성을 설정할 경우 각각 최소, 최대 트랙과 thumb의 이미지가 슬라이더의 기본 이미지로 재설정되며, 슬라이더는 모든 사용자 지정 이미지를 해제하게 됩니다.<br>
   이는 속성을 nil로 설정했을 때도 동일하게 적용되어, nil로 설정하게 될 경우 색상이 기본값으로 재설정되며, 사용자 지정 이미지를 해제합니다.

3. **currentMinimumTrackImage, currentMaximumTrackImage, currentThumbImage**
   `currentMinimumTrackImage`, `currentMaximumTrackImage`, `currentThumbImage`는 각각 현재 슬라이더 렌더링에 사용되고 있는 최소, 최대 트랙과 thumb 이미지를 가져옵니다.<br>
   이 프로퍼티의 값은 현재 슬라이더의 제어 상태에 따라 서로 다른 트랙 이미지를 가질 수 있습니다.<br>
   예를 들어 슬라이더가 선택되지 않았을 때는 a라는 이미지를, 슬라이더가 선택되어 값이 변경되고 있을 때는 b라는 이미지를 가질 수도 있습니다.<br>
   <br>
   현재 제어 상태가 아닌 다른 제어 상태에 대한 이미지를 가져오려면 각각 `minimumTrackImage(for:)`, `maximumTrackImage(for:)`, `thumbImage(for:)` 메서드를 사용할 수 있습니다.<br>
   set 메서드를 사용하여 설정된 이미지가 없는 경우 nil 값을 가질 수도 있습니다. 이런 경우, 슬라이더는 기본 이미지를 사용합니다.

4. **minimumTrackImage(for:), maximumTrackImage(for:), thumbImage(for:)**
   `minimumTrackImage(for:)`, `maximumTrackImage(for:)`, `thumbImage(for:)` 메서드는 각각 지정된 제어 상태에 연관된 최소, 최대 트랙 및 thumb 이미지를 반환합니다.<br>
   여기에서 `for`라는 레이블로 지정된 파라미터는 `state` 파라미터로, 제어 상태를 의미하며 지정된 상태와 연관된 이미지를 반환하고, 이미지가 설정되지 않은 경우 nil을 반환합니다.

5. **setMinimumTrackImage(\_:for:), setMaximumTrackImage(\_:for:), setThumbImage(\_:for:)**
   `setMinimumTrackImage(\_:for:)`, `setMaximumTrackImage(\_:for:)`, `setThumbImage(\_:for:)` 메서드는 각각 지정된 상태에 최소, 최대 트랙 및 thumb 이미지를 설정합니다.<br>
   앞의 `\_` 레이블로 지정된 파라미터는 `image` 파라미터로 지정된 상태에 보여줄 최소, 최대 트랙 및 thumb 이미지를 의미합니다.<br>
   뒤의 `for` 레이블로 지정된 파라미터는 `state` 파라미터로 설정된 이미지를 보여줄 제어 상태를 의미합니다.<br>
   최소, 최대 트랙 이미지의 경우 슬라이더의 thumb가 움직이면 트랙이 차지하는 영역의 너비가 변경되므로 이미지의 너비도 그에 따라 변경됩니다.<br>
   이미지의 너비를 자연스럽게 늘리거나 줄이기 위해서는 stretchable 이미지를 사용할 수 있습니다.<br>
   이 메서드를 사용하면 슬라이더의 tint color가 별도로 설정된 경우 이를 무시하게 됩니다.

### UISlider 사용시 주의사항

이렇게 `UISlider`는 다양한 메서드를 사용하여 관리할 수 있는데, 이때 주의해야 할 사항이 몇 가지 있습니다.

첫 번째로, **최소, 최대 트랙 및 thumb 각각에 대해 사용자 지정 색상이나 이미지 중 하나만을 사용**해야 합니다.<br>
만약 하나의 요소에 대해 두 개 이상의 설정이 존재해 충돌하게 되는 경우 가장 최근에 설정한 값을 우선시하게 됩니다.

두 번째로, **슬라이더의 현재 값은 최솟값과 최댓값의 사이**에 있어야 합니다.<br>
만약, 프로그래밍 방식으로 슬라이더의 현재값을 최솟값보다 낮거나 최댓값보다 높게 설정하려고 하면 슬라이더가 최솟값, 또는 최댓값으로 대신 설정됩니다.<br>
다만, storyboard 등의 인터페이스 빌더에서 범위를 초과하는 값을 설정하면 최솟값 또는 최댓값이 새로운 값으로 업데이트됩니다.

세 번째로, **사용자 지정 이미지를 설정할 경우 되도록 모든 제어 상태에 대해 이미지를 설정**해야 합니다.<br>
슬라이더의 최소, 최대 트랙 및 thumb에 사용자 지정 이미지를 사용하는 경우 가능한 모든 `UIControl.State`에 대해 이미지를 설정해야 합니다.<br>
해당 이미지가 설정되지 않은 경우 기본값이 대신 사용됩니다.

## UISlider의 이벤트 관리

앞에서 `UISlider`를 **"슬라이더의 thumb를 움직이면 업데이트된 값이 슬라이더에 연결된 모든 액션에 전달된다"** 라고 설명한 것처럼, 슬라이더는 thumb를 움직임에 따라 이벤트를 설정할 수 있습니다.

- `var isContinuous: Bool { get set }`

`UISlider`의 값은 사용자가 thumb를 움직이는 동안 업데이트하거나, thumb에서 손을 뗐을 때 업데이트할 수 있는데, 이를 관리하는 프로퍼티가 `isContinous`입니다.<br>
기본적으로 `UISlider`는 사용자가 thumb를 움직이는 동안 값을 연속적으로 업데이트하기 때문에 `isContinuous`의 기본값은 `true`이며, 만약 `false`로 값을 지정하게 되면, 사용자가 슬라이더의 thumb에서 손을 뗄 때 값이 업데이트됩니다.

`UISlider`는 다른 `UIControl`과 마찬가지로 `addTarget(\_:action:for:)` 메서드, 혹은 인터페이스 빌더에서 연결을 생성하여 슬라이더를 액션 메서드에 연결할 수 있습니다.

아래에서는 slider의 thumb를 움직일 때마다 label의 값을 업데이트하는 것을 볼 수 있습니다.
![thumb로 label 업데이트](https://github.com/user-attachments/assets/352c164e-3ef0-4225-b59c-ff6f8df7b64d)

```swift title="ViewController.swift" {35, 38-40}
import UIKit

class ViewController: UIViewController {
    let slider: UISlider = {
        $0.value = 0.5
        $0.minimumValueImage = UIImage(systemName: "heart")
        $0.maximumValueImage = UIImage(systemName: "heart.fill")
        $0.translatesAutoresizingMaskIntoConstraints = false
        return $0
    }(UISlider())

    let sliderValue: UILabel = {
        $0.text = "0"
        $0.translatesAutoresizingMaskIntoConstraints = false
        return $0
    }(UILabel())

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white
        view.addSubview(slider)
        NSLayoutConstraint.activate([
            slider.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 16),
            slider.leftAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leftAnchor, constant: 16),
            slider.rightAnchor.constraint(equalTo: view.safeAreaLayoutGuide.rightAnchor, constant: -16)
        ])

        view.addSubview(sliderValue)
        NSLayoutConstraint.activate([
            sliderValue.topAnchor.constraint(equalTo: slider.bottomAnchor, constant: 16),
            sliderValue.centerXAnchor.constraint(equalTo: view.safeAreaLayoutGuide.centerXAnchor)
        ])

        sliderValue.text = "\(slider.value)"
        slider.addTarget(self, action: #selector(changeSliderValueLabel), for: .valueChanged)
    }

    @objc func changeSliderValueLabel() {
        sliderValue.text = "\(slider.value)"
    }
}
```

`addTarget(\_:action:for:)`의 경우 `@objc` 메서드의 사용이 강제적이었는데요.<br>
iOS 14부터 `UIControl`에서 `UIAction`을 사용할 수 있게 되며 기존의 방식이 아닌 새로운 방식으로 `UISlider`에도 이벤트를 줄 수 있게 되었습니다.

다음은 같은 동작을 `addTarget(\_:action:for:)` 메서드를 대신해 `addAction(\_:for:)` 메서드를 사용한 코드입니다.

```swift title="ViewController.swift" {35}
import UIKit

class ViewController: UIViewController {
    let slider: UISlider = {
        $0.value = 0.5
        $0.minimumValueImage = UIImage(systemName: "heart")
        $0.maximumValueImage = UIImage(systemName: "heart.fill")
        $0.translatesAutoresizingMaskIntoConstraints = false
        return $0
    }(UISlider())

    let sliderValue: UILabel = {
        $0.text = "0"
        $0.translatesAutoresizingMaskIntoConstraints = false
        return $0
    }(UILabel())

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white
        view.addSubview(slider)
        NSLayoutConstraint.activate([
            slider.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 16),
            slider.leftAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leftAnchor, constant: 16),
            slider.rightAnchor.constraint(equalTo: view.safeAreaLayoutGuide.rightAnchor, constant: -16)
        ])

        view.addSubview(sliderValue)
        NSLayoutConstraint.activate([
            sliderValue.topAnchor.constraint(equalTo: slider.bottomAnchor, constant: 16),
            sliderValue.centerXAnchor.constraint(equalTo: view.safeAreaLayoutGuide.centerXAnchor)
        ])

        sliderValue.text = "\(slider.value)"
        slider.addAction(UIAction { _ in self.sliderValue.text = "\(self.slider.value)" }, for: .valueChanged)
    }

}
```

`addAction(\_:for:)` 메서드를 사용할 경우, `@objc` 메서드의 사용에서 벗어날 뿐만 아니라 반복 사용되는 함수가 아닐 경우 익명 함수를 사용할 수도 있습니다.

## UISlider의 주요 용도

`UISlider`는 `UIProgressView`와는 달리 슬라이드 이벤트를 기본적으로 지원합니다.<br>
이것으로 보아 `UISlider`는 **특정 태스크의 값을 조정하는 것**이 주요 목표라고 볼 수 있습니다.<br>
이 목적으로 사용되는 가장 쉽게 접할 수 있는 예로는 음량이나 밝기 조절 등이 있습니다.<br>
아이폰의 설정에서도 사운드 및 햅틱 등에서 쉽게 볼 수 있죠.

# 미디어 플레이어의 재생 바 구현에는 UIProgressView와 UISlider 중 무엇을 사용하는 것이 좋을까?

네, 가장 중요한 이번 시간의 핵심!<br>
그래서 미디어 플레이어의 재생 바 구현에는 `UIProgressView`와 `UISlider` 중 무엇을 사용하는 것이 더 좋을까요?

우선 `UIProgressView`는 지난 시간에 보았듯이 특정 터치 이벤트를 기본 지원하지 않아 터치 이벤트부터 직접 구현해야 하는 불편이 있습니다.<br>
그에 비해 `UISlider`는 슬라이드 이벤트를 기본 지원하기 때문에 **슬라이드 이벤트가 발생했을 때, 추가적인 동작만 구현하면 된다는 점에서 `UISlider`를 사용하는 것이 더 쉽게 구현할 수 있는 방법**이겠죠?

하지만, 일부 앱에서는 `UISlider`의 thumb를 볼 수 없습니다.<br>
이 경우 `UISlider`의 `thumbTintColor`를 `.clear`로 설정하는 등의 방법으로 thumb의 모습을 보이지 않게 할 수는 있지만, 이렇게 할 경우 현재 값이 최솟값, 또는 최댓값일 때 트랙에 약간의 여백이 남게 됩니다.
![clear color thumb](https://github.com/user-attachments/assets/f1f0c2f8-2c4a-4a59-b23e-348356c9efc4)
그러므로 **thumb가 없는 재생 바를 구현하기 위해서는 `UIProgressView`를 사용하는 것이 더 좋은 방법**이 되겠네요.

이처럼 미디어 플레이어의 재생 바를 구현할 때, **원하는 기능 및 디자인에 따라 `UIProgressView`와 `UISlider`를 적당히 선택**하는 것이 좋을 것 같습니다.

# 마무리

이렇게 이번 시간에는 `UISlider`에 대해 알아보았습니다.<br>
개인적으로는 thumb가 없는 재생바를 만들어보기 위해 `UISlider`를 이렇게 저렇게 만져보고 있는데, 다 전부 애매해서 그냥 `UIProgressView`를 사용하거나 thumb가 있는 재생바를 사용하거나 해야 할 것 같네요.

# 참고자료

- [Apple Developr Documentation/UIKit/UISlider](https://developer.apple.com/documentation/uikit/uislider)
- [Apple Developr Documentation/UIKit/UIControl](https://developer.apple.com/documentation/uikit/uicontrol)
- [Apple Developr Documentation/UIKit/UIControl/addAction(\_:for:)](<https://developer.apple.com/documentation/uikit/uicontrol/addaction(_:for:)>)
