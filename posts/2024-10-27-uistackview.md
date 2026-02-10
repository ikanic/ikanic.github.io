---
title: "[UIKit] UIStackView - 오토 레이아웃으로 다양한 뷰 감싸기"
thumbnail: "https://github.com/user-attachments/assets/9f8aead3-8971-41c5-837f-50bdbe2556e5"
created-date: "2024-10-27 14:49"
modified-date: "2024-10-27 14:49"
category: "Swift"
tags: ["iOS", "글또 10기", "Swift", "UIKit", "UIStackView"]
description: "UIKit의 UIStackView에 대해 알아보자"
---

그동안 많은 프로젝트를 하면서 여러 뷰를 하나의 뷰로 감쌀 때 `UIView`를 사용해 왔는데요.<br>
뷰를 감싸기 위한 `UIStackView`가 있는 것을 알면서도 더 자유롭게 뷰를 배치하기 위해 사용하지 않았습니다.<br>
또, `UIStackView`를 사용하면서 여러 제약 조건에 충돌이 생기기도 했고, 이러한 충돌을 어떻게 해결해야 할 지 감이 오지 않아서 빠르게 프로젝트를 진행해야 한다는 핑계로 `UIStackView`의 사용을 더 피하기도 했습니다.

그러던 중 최근 새로운 프로젝트를 하면서 뷰 간의 일관된 간격을 위해 `UIStackView`를 사용하게 됐는데요.<br>
이번 시간에는 `UIStackView`를 사용하면서 공부한 내용을 기록하려 합니다.

# UIStackView

```swift
@MainActor
class UIStackView: UIView
```

우선 공식 문서부터 살펴보자면 `UIStackView`는 **열 또는 행에 뷰 컬렉션을 배치하기 위한 간소화된 인터페이스**라고 합니다. 조금 더 쉽게 풀어보자면 **여러 뷰를 가로 방향, 혹은 세로 방향으로 순서대로 배치하기 위한 UIView**라고 할 수 있겠네요.

여러 뷰를 순서대로 배치하는 것은 `UIView`와 제약 조건을 사용해서도 충분히 만들 수 있는데요.<br>
그렇다면 `UIStackView`가 왜 필요한 것일까요?

`UIStackView`는 오토 레이아웃의 강력한 기능을 활용하여 기기의 방향, 화면 크기 및 사용 가능한 공간의 변경 사항에 따라 동적으로 조정할 수 있는 사용자 인터페이스를 만들 수 있습니다.

`UIView` 안에 다른 여러 뷰를 배치할 때는 안에 배치하는 뷰 하나하나마다 일일이 제약 조건을 걸어야 했는데요. `UIStackView`를 사용한다면 **`UIStackView`의 프로퍼티를 사용해 뷰 하나하나에 제약 조건을 걸어야 하는 수고를 덜 수 있습니다.**

## UIStackView의 내부 뷰 관리

`UIStackView`는 내부에 여러 뷰를 정렬할 수 있는데요. `UIStackView`는 이러한 내부에 정렬된 뷰를 관리하기 위해 아래의 네 가지 방법을 사용할 수 있습니다.

- `var arrangedSubviews: [UIView] { get }`
- `func addArrangedSubview(_ view: UIView)`
- `func insertArrangedSubview(_ view: UIView, at stackIndex: Int)`
- `func removeArrangedSubview(\_ view: UIView)`

### 1. var arrangedSubviews: [UIView] { get }

`arrangedSubvies` 프로퍼티는 `UIStackView`의 내부에 정렬된 뷰의 목록입니다.<br>

`UIStackView`는 `UIView`를 상속하고 있기 때문에 `subviews` 배열을 갖는데, `arrangedSuviews` 배열은 이러한 `subviews` 배열의 하위 집합입니다.<br>
따라서 `arrangedSubviews` 배열에 새로운 뷰가 추가되면 `subviews` 배열에도 해당 뷰가 추가됩니다.<br>
하지만 `subviews` 배열에 새로운 뷰가 추가된다고 해서 `arrangedSubviews에` 해당 뷰가 추가되는 것은 아닙니다.<br>
또, `arrangedSubviews` 배열에서 뷰가 제거된다면 `subviews` 배열에서는 해당 뷰가 함께 제거되지 않습니다. 하지만 `subviews` 배열에서 뷰가 제거된다면 `arrangedSubviews`에서도 해당 뷰는 함께 제거됩니다.

### 2. func addArrangedSubview(\_ view: UIView)

`addArrangedSubview` 메서드는 `arrangedSubviews` 배열의 끝과 subviews 배열의 끝에 view 파라미터의 뷰를 추가하는 메서드입니다.<br>

만약, `view` 파라미터의 뷰가 `arrangedSubviews` 배열에 이미 존재한다면 새로운 뷰를 추가하지 않고 기존에 있던 뷰의 순서를 배열의 끝으로 옮깁니다.<br>
하지만, `subviews` 배열에 `view` 파라미터의 뷰가 이미 존재한다면 `subviews` 배열의 순서는 변경되지 않습니다.

### 3. func insertArrangedSubview(\_ view: UIView, at stackIndex: Int)

`insertArrangedSubview` 메서드는 `arrangedSubviews` 배열의 `startIndex` 파라미터 인덱스에 `view` 파라미터의 뷰를 추가하는 메서드입니다.<br>

`startIndex`의 인덱스가 이미 사용 중인 경우 `UIStackView`는 `arrangedSubviews` 배열의 크기를 늘리고 인덱스 값 이상의 모든 콘텐츠를 다음 칸으로 이동시킵니다. 그 후에 `view` 파라미터의 뷰를 `startIndex` 파라미터의 인덱스에 해당하는 칸에 저장합니다.<br>

이 때, `startIndex` 파라미터의 값은 현재 `arrangedSubviews` 배열의 크기보다 크지 않아야 합니다. 만약, **인덱스가 범위를 벗어난 경우 `insertArrangedSubview`는 `internalInconsistencyException` 예외를 발생**시킵니다.<br>

`insertArrangedSubview` 메서드로 `arrangedSubviews` 배열에 `view` 파라미터의 뷰가 추가될 때, `subviews` 배열에도 뷰가 함께 추가되는데, `subviews` 배열에 추가될 때는 특정 인덱스에 삽입되는 것이 아니라, `subviews` 배열의 끝에 추가됩니다.<br>
즉, **`startIndex`는 `arrangedSubviews` 배열의 순서에만 영향을 주고, `subviews` 배열의 순서에는 영향을 미치지 않습니다.**

### 4. func removeArrangedSubview(\_ view: UIView)

`removeArrangedSubview` 메서드는 `arrangedSubviews` 배열에서 `view` 파라미터의 뷰를 제거하는 메서드입니다.<br>

`removeArrangedSubview` 메서드로 제거된 뷰는 `UIStackView`가 더 이상 위치와 크기를 관리하지 않습니다.<br>
하지만, `removeArrangedSubview` 메서드로 제거된 뷰는 **`arrangedSubviews` 배열에서만 제거될 뿐, `subviews` 배열에서는 제거되지 않습니다.** 따라서 해당 뷰는 여전히 뷰 계층구조의 일부로 표시됩니다.<br>

만약, `removeArrangedSubview`로 제거된 뷰가 화면에 표시되지 않도록 하려면 뷰의 `removeFromSuperview()` 메서드를 호출하여 하위 뷰 배열에서 뷰를 명시적으로 제거하거나, 뷰의 `isHidden` 프로퍼티를 `true`로 설정해 뷰를 더 이상 보이지 않게 하는 방법을 사용할 수 있습니다.

# UIStackView의 위치 및 크기 조정

`UIStackView`를 사용하면 오토 레이아웃을 사용하지 않고도 콘텐츠를 정렬할 수 있지만, `UIStackView` 자체의 위치를 지정하려면 반드시 오토 레이아웃을 사용해야 합니다.<br>
일반적으로 `UIStackView`의 두 개 이상의 인접한 가장자리를 고정하여 위치를 정의합니다.

추가 제약 조건이 없다면 시스템은 `UIStackView` 내부의 콘텐츠를 기반으로 스택의 크기를 자동으로 계산합니다.<br>
즉, **`UIStackView`의 축 방향의 스택 크기는 스택 내부에 정렬된 모든 뷰의 크기와 뷰 사이의 공간을 더한 값의 합과 같고, 축에 수직인 스택 크기는 정렬된 뷰 중 가장 큰 정렬된 뷰의 크기와 같습니다.**

추가 제약 조건을 설정한다면 `UIStackView`의 높이, 너비 도는 둘 모두를 지정할 수 있습니다. 이 경우, `UIStackView`는 지정된 영역을 채우도록 정렬된 뷰의 레이아웃과 크기를 조정하게 됩니다.

## UIStackView의 레이아웃 구성

`UIStackView`는 오토 레이아웃을 사용하여 정렬된 뷰의 위치와 크기를 지정하는데, 정렬된 첫 번째 및 마지막 뷰를 `UIStackView`의 축을 따라 가장자리에 정렬합니다.

이러한 `UIStackView`의 정확한 레이아웃은 다양한 프로퍼티에 의해 달라집니다.<br>
아래의 6가지 프로퍼티는 `UIStackView`의 레이아웃을 구성할 수 있습니다.

- `var axis: NSLayoutConstraint.Axis { get set }`
- `var alignment: UIStackView.Alignment { get set }`
- `var distribution: UIStackView.Distribution { get set }`
- `var spacing: CGFloat { get set }`
- `var isBaselineRelativeArrangment: Bool { get set }`
- `var isLayoutMarginsRelativeArrangement: Bool { get set }`

### 1. var axis: NSLayoutConstraint.Axis { get set }

`axis` 프로퍼티는 `UIStackView`에 정렬된 뷰가 배치되는 축입니다.<br>
`axis` 프로퍼티에 따라 정렬된 뷰의 방향을 결정하게 되며, `NSLayoutConstraint.Axis.vertical` 값을 할당하면 세로 방향으로, `NSLayoutConstraint.Axis.horizontal` 값을 할당하면 가로 방향으로 뷰를 정렬하게 됩니다.<br>
기본값은 `NSLayoutConstraint.Axis.horizontal` 입니다.

### 2. var alignment: UIStackView.Alignment { get set }

`alignment` 프로퍼티는 `UIStackView`의 축에 수직으로 정렬된 뷰의 정렬 방식을 결정합니다.<br>
`alignment` 프로퍼티의 값은 `UIStackView.Alignmnet` enum에 속하는 8가지의 값으로 설정할 수 있으며, 기본값은 `UIStackView.Alignment.fill`입니다.

```swift
enum UIStackView.Alignment: Int, @unchecked Sendable {
    static var top: UIStackView.Alignment { get }
    static var bottom: UIStackView.Alignment { get }

    case fill = 0
    case leading = 1
    case firstBaseline = 2
    case center = 3
    case lastBaseline = 5
    case trailing = 4
}
```

#### 2-1. case fill

`fill`은 `UIStackView`가 정렬된 뷰의 크기를 조정하여 축에 수직인 사용 가능한 공간을 채우는 레이아웃입니다.<br>
가로 스택 뷰에서는 뷰의 높이를 조정하며, 세로 스택 뷰에서는 뷰의 너비를 조정하여 스택 뷰의 빈 공간을 채웁니다.<br>
![가로 스택 뷰 fill Alignment|caption=이미지 출처: [Apple Developer Documentation/UIKit/UIStackView/UIStackView.Alignment/UIStackView.Alignment.fill](https://developer.apple.com/documentation/uikit/uistackview/alignment-swift.enum/fill)](https://github.com/user-attachments/assets/892da988-8d9d-41bb-8231-8461165f3c3c)

#### 2-2. case center

`center`는 `UIStackView`가 정렬된 뷰의 중심을 축의 중심에 맞게 정렬하는 레이아웃입니다.<br>
![가로 스택 뷰 center Alignment|caption=이미지 출처: [Apple Developer Documentation/UIKit/UIStackView/UIStackView.Alignment/UIStackView.Alignment.center](https://developer.apple.com/documentation/uikit/uistackview/alignment-swift.enum/center)](https://github.com/user-attachments/assets/086b9b7e-7904-42d1-a541-5f9af711c769)

#### 2-3. case leading, case trailing

`leading`은 정렬된 뷰의 앞쪽 가장자리를, `trailing`은 뒤쪽 가장자리를 각각 `UIStackView`의 앞, 뒤쪽 가장자리에 맞게 정렬하는 세로 스택용 레이아웃입니다.<br>
일반적으로 많이 사용되는 왼쪽에서 오른쪽으로 정렬되는 스택 뷰에서는 왼쪽이 앞쪽, 오른쪽이 뒤쪽이 되지만, 오른쪽에서 왼쪽으로 정렬되는 스택 뷰에서는 오른쪽이 앞쪽, 왼쪽이 뒤쪽이 됩니다.<br>

<table>
    <tr>
        <td><b>leading Alignment</b></td>
        <td><b>trailing Alignment</b></td>
    </tr>
    <tr>
        <td><img alt="세로 스택 뷰 leading Alignment" src="https://github.com/user-attachments/assets/142ca00a-6d44-471e-b27a-101904086f5c"></td>
        <td><img alt="세로 스택 뷰 trailing Alignment" src="https://github.com/user-attachments/assets/00c50a20-b368-4b9e-a57e-bc367cce3e6a"></td>
    </tr>
    <tr>
        <td><i>이미지 출처: <a href="https://developer.apple.com/documentation/uikit/uistackview/alignment-swift.enum/leading" target="_blank">Apple Developer Documentation/UIKit/UIStackView/UIStackView.Alignment/UIStackView.Alignment.leading</a></i></td>
        <td><i>이미지 출처: <a href="https://developer.apple.com/documentation/uikit/uistackview/alignment-swift.enum/trailing" target="_blank">Apple Developer Documentation/UIKit/UIStackView/UIStackView.Alignment/UIStackView.Alignment.trailing</a></i></td>
    </tr>
</table>

#### 2-4. static var top, static var bottom

`top`은 정렬된 뷰의 위쪽 가장자리를, `bottom`은 정렬된 뷰의 아래쪽 가장자리를 각각 `UIStackView`의 위, 아래쪽 가장자리에 맞게 정렬하는 가로 스택용 레이아웃입니다.<br>

<table>
    <tr>
        <td><b>top Alignment</b></td>
        <td><b>ottom Alignment</b></td>
    </tr>
    <tr>
        <td><img alt="가로 스택 뷰 top Alignment" src="https://github.com/user-attachments/assets/40a8a74b-45e9-4ec0-a085-ed39f2391a3d"></td>
        <td><img alt="가로 스택 뷰 bottom Alignment" src="https://github.com/user-attachments/assets/0a9dfc6b-a98c-444b-8b0b-87e1f8ee55e7"></td>
    </tr>
    <tr>
        <td><i>이미지 출처: <a href="https://developer.apple.com/documentation/uikit/uistackview/alignment-swift.enum/top" target="_blank">Apple Developer Documentation/UIKit/UIStackView/UIStackView.Alignment/top</a></i></td>
        <td><i>이미지 출처: <a href="https://developer.apple.com/documentation/uikit/uistackview/alignment-swift.enum/bottom" target="_blank">Apple Developer Documentation/UIKit/UIStackView/UIStackView.Alignment/bottom</a></i></td>
    </tr>
</table>

#### 2-5. case firstBaseline, lastBaseline

`firstBaseline`은 `UIStackView`가 정렬된 뷰의 첫 번째 행의 아래쪽을 기준으로, `lastBaseline`은 정렬된 뷰의 마지막 행의 아래쪽을 기준으로 뷰를 정렬하는 가로 스택용 레이아웃입니다.<br>

<table>
    <tr>
        <td><b>firstBaseline Alignment</b></td>
        <td><b>lastBaseline Alignment</b></td>
    </tr>
    <tr>
        <td><img alt="가로 스택 뷰 firstBaseline Alignment" src="https://github.com/user-attachments/assets/e8b89c16-fb50-4b4a-8f7b-25a9e457df88"></td>
        <td><img alt="가로 스택 뷰 lastBaseline Alignment" src="https://github.com/user-attachments/assets/e3fc7182-e239-4fa9-ace4-a930b403ea34"></td>
    </tr>
    <tr>
        <td><i>이미지 출처: <a href="https://developer.apple.com/documentation/uikit/uistackview/alignment-swift.enum/firstbaseline" target="_blank">Apple Developer Documentation/UIKit/UIStackView/UIStackView.Alignment/UIStackView.Alignment.firstBaseline</a></i></td>
        <td><i>이미지 출처: <a href="https://developer.apple.com/documentation/uikit/uistackview/alignment-swift.enum/lastbaseline" target="_blank">Apple Developer Documentation/UIKit/UIStackView/UIStackView.Alignment/UIStackView.Alignment.lastBaseline</a></i></td>
    </tr>
</table>

### 3. var distribution: UIStackView.Distribution { get set }

`distribution` 프로퍼티는 `UIStackView`의 축을 따라 정렬된 뷰를 배치하는 방식을 결정합니다.<br>
`distribution` 프로퍼티의 값은 `UIStackView.Distribution` enum에 속하는 5가지의 값으로 설정할 수 있으며, 기본값은 `UIStackView.Distribution.fill`입니다.

```swift
enum UIStackView.Distribution: Int, @unchecked Sendable {
    case fill = 0
    case fillEqually = 1
    case fillProportionally = 2
    case equalSpacing = 3
    case equalCentering = 4
}
```

#### 3-1. case fill

`fill`은 `UIStackView`가 정렬된 뷰의 크기를 조정하여 스택의 축을 따라 사용 가능한 공간을 채우는 레이아웃입니다.<br>
정렬된 뷰가 스택 뷰의 축의 크기보다 크다면 compression resistance priority에 따라 뷰의 크기를 줄이고, 정렬된 뷰가 스택 뷰의 축의 크기보다 작다면 hugging priority에 따라 뷰의 크기를 늘립니다.<br>
모호한 부분이 있는 경우 `UIStackView`는 `arrangedSubviews` 배열의 인덱스에 따라 정렬된 뷰의 크기를 적절하게 조정합니다.<br>
![가로 스택 뷰 fill Distribution|caption=이미지 출처: [Apple Developer Documentation/UIStackView/UIStackView.Distribution/UIStackView.Distribution.fill](https://developer.apple.com/documentation/uikit/uistackview/distribution-swift.enum/fill)](https://github.com/user-attachments/assets/7e891180-1ab8-44ba-baf7-b2af3ef3883f)

#### 3-2. case fillEqually

`fillEqually`도 `fill`과 마찬가지로 `UIStackView`가 정렬된 뷰의 크기를 조정하여 스택의 축을 따라 사용 가능한 공간을 채우는 레이아웃입니다.<br>
하지만, `fill`이 compression resistance, huggin priority에 따라 각각의 뷰의 크기를 적절하게 조정하는 것과 달리 `fillEqually`는 스택 내부의 모든 정렬된 뷰의 크기를 같도록 조정합니다.<br>
![가로 스택 뷰 fillEqually Distribution|caption=이미지 출처: [Apple Developer Documentation/UIStackView/UIStackView.Distribution/UIStackView.Distribution.fillEqually](https://developer.apple.com/documentation/uikit/uistackview/distribution-swift.enum/fillequally)](https://github.com/user-attachments/assets/7804ca36-4328-4257-8ce3-d9276e5a206b)

#### 3-3. case fillProportionally

`fillProportionally` 또한 `fill`, `fillEqually`와 마찬가지로 `UIStackView`에 정렬된 뷰의 크기를 조정하여 스택의 축을 따라 사용 가능한 공간을 채우는 레이아웃입니다.<br>
`fillProportionally`를 사용하는 경우 스택의 축을 기준으로 각각의 정렬된 뷰의 크기에 따라 비례적으로 크기를 조정합니다.<br>
![가로 스택 뷰 fillProportionally Distribution|caption=이미지 출처: [Apple Developer Documentation/UIStackView/UIStackView.Distribution/UIStackView.Distribution.fillProportionally](https://developer.apple.com/documentation/uikit/uistackview/distribution-swift.enum/fillproportionally)](https://github.com/user-attachments/assets/aa758ee0-e25f-458f-8f67-aeb90ab787de)

#### 3-4. case equalSpacing

`equalSpacing`도 `UIStackView`에 정렬된 뷰의 크기를 조정하여 스택의 축을 따라 사용 가능한 공간을 채우는 레이아웃이지만, `equalSpacing`을 사용하는 경우 정렬된 뷰가 스택의 크기를 채우지 못하면 뷰 사이의 간격을 균등하게 조정하여 스택을 채웁니다.<br>
정렬된 뷰가 스택의 크기보다 크다면 `fill`과 마찬가지로 compression resistance priority에 따라 뷰를 줄이고, 모호한 부분이 있는 경우 `arrangedSubviews` 배열의 인덱스에 따라 정렬된 뷰의 크기를 줄입니다.<br>
![가로 스택 뷰 equalSpacing Distribution|caption=이미지 출처: [Apple Developer Documentation/UIStackView/UIStackView.Distribution/UIStackView.Distribution.equalSpacing](https://developer.apple.com/documentation/uikit/uistackview/distribution-swift.enum/equalspacing)](https://github.com/user-attachments/assets/b9218985-00b4-4a47-9f1a-ea2169259a1a)

#### 3-5. case equalCentering

`equalCentering`은 `UIStackView`의 축을 따라 정렬된 뷰 간 가운데 간격을 동일하게 맞춰 배치하는 레이아웃으로, 뷰 간 `spacing` 프로퍼티의 거리를 유지하면서 배치합니다.<br>
정렬된 뷰가 스택의 크기보다 크다면 `spacing` 프로퍼티에 정의된 최소 간격에 도달할 때까지 간격을 축소하며, 최소 간격에 도달했지만, 여전히 정렬된 뷰가 더 크다면 compression resistance priority에 따라 정렬된 뷰의 크기를 줄이고, 모호한 부분이 있는 경우 `arrangedSubview` 배열의 인덱스에 따라 뷰의 크기를 줄입니다.<br>
![가로 스택 뷰 equalCentering Distribution|caption=이미지 출처: [Apple Developer Documentation/UIStackView/UIStackView.Distribution/UIStackView.Distribution.equalCentering](https://developer.apple.com/documentation/uikit/uistackview/distribution-swift.enum/equalcentering)](https://github.com/user-attachments/assets/cfef853f-33fd-46b0-91e6-7b9fd4ba6984)

### 4. var spacing: CGFloat { get set }

`spacing` 프로퍼티는 `UIStackView`에 정렬된 뷰의 인접한 가장자리 사이의 포인트 단위 거리입니다.

`spacing` 프로퍼티는 `UIStackView.Distribution.fillProportionally`에서 정렬된 뷰 사이의 정확한 간격을 정의하며, `UIStackView.Distribution.equalSpacing`과 `UIStackView.Distribution.equalCentering`에서는 정렬된 뷰 사이의 최소 간격을 나타냅니다.

뷰끼리 겹치는 것을 허용하려면 음수 값을 사용하며, 기본값은 0.0입니다.

### 5. var isBaselineRelativeArrangment: Bool { get set }

`isBaselineRelativeArrangement`는 뷰 사이의 세로 간격을 기준선에서부터 측정할지 여부를 결정하는 불 값으로, 기본값은 `false`입니다.<br>
`true`로 설정하면 뷰 간의 세로 간격을 텍스트 기반 뷰의 마지막 기준선에서 그 아래 뷰의 첫 번째 기준선까지로 측정합니다. 상단 및 하단 뷰도 가장 가까운 기준선이 스택 뷰의 가장자리에서 지정된 거리만큼 떨어져있도록 배치됩니다.<br>
`isBaselineRelativeArrangement`는 세로 스택 뷰에서만 사용되며, 가로 스택 뷰에서 뷰의 기준선을 정렬하기 위해서는 `alignment` 프로퍼티를 사용할 수 있습니다.

### 6. var isLayoutMarginsRelativeArrangement: Bool { get set }

`isLayoutMarginsRelativeArrangement`는 `UIStackView`가 레이아웃 margins을 기준으로 정렬된 뷰를 배치할지 여부를 결정하는 불 값으로, 기본값은 `false`입니다.<br>
`true`로 설정하면 `UIStackView`는 레이아웃 `margins`을 기준으로 정렬된 뷰를 레이아웃하며, `false`로 설정하면 bounds를 기준으로 정렬된 뷰를 배치합니다.

## UIStackView 내부 뷰 개별 간격 조정

`UIStackView`는 일반적으로 스택 내부에 정렬된 뷰 간의 간격을 동일하게 설정하지만, UI를 구성하다 보면 스택 내부의 일부 뷰의 간격을 다르게 해야 할 때도 있습니다.<br>
`UIStackView`는 이러한 경우 일부 뷰의 간격을 별도로 조정하기 위한 아래의 4가지 메서드를 지원합니다.

- `func customSpacing(after arrangedSubview: UIView) -> CGFloat`
- `func setCustomSpacing(\_ spacing: CGFloat, after arrangedSubview: UIView)`
- `class let spacingUseDefault: CGFloat`
- `class let spacingUseSystem: CGFloat`

### 1. func customSpacing(after arrangedSubview: UIView) -> CGFloat

`customSpacing(after:)` 메서드는 `arrangedSubview` 파라미터에서 지정된 뷰 뒤의 사용자 지정 간격을 반환합니다.

### 2. func setCustomSpacing(\_ spacing: CGFloat, after arrangedSubview: UIView)

`setCustomSpacing(\_:after:)` 메서드는 `arrangedSubview` 파라미터에서 지정된 뷰 뒤에 spacing 파라미터에서 지정된 사용자 지정 간격을 적용합니다.<br>
일부 뷰 간의 간격을 지정하기 위해 사용할 수 있습니다.

### 3. class let spacingUseDefault: CGFloat

`spacingUseDefault` 프로퍼티는 `UIStackView` 내부의 정렬된 뷰의 기본 간격을 의미하는 프로퍼티입니다.

### 4. class let spacingUseSystem: CGFloat

`spacingUseSystem` 프로퍼티는 인접한 뷰에 대한 시스템 정의 간격을 의미합니다.

# 마무리

이번 시간에는 `UIStackView`에 대해 알아보았습니다.<br>
그동안은 `UIStackView` 내부의 간격을 커스텀하는 방법을 알지 못해서 `UIView`를 사용했었는데, 이번 기회에 `setCustomSpacing` 등의 새로운 메서드를 알게 되어서 앞으로는 `UIStackView`를 활용해서 레이아웃을 구성하는 데 잘 사용할 수 있을 것 같습니다.

iOS의 모든 컴포넌트에는 각각에 맞는 용도와 사용법이 있다는 걸 다시 한번 느낄 수 있었던 것 같습니다.

# 참고자료

- [Apple Developer Documentation/UIKit/UIStackView](https://developer.apple.com/documentation/uikit/uistackview)
