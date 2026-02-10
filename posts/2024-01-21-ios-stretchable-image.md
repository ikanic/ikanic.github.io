---
title: "[iOS] Stretchable Image (a.k.a iOS 9-Patch)"
thumbnail: "https://github.com/user-attachments/assets/f2a36ed5-1181-47db-9e2e-09d53b35ee9e"
created-date: "2024-01-21 06:51"
modified-date: "2024-01-21 06:51"
category: "Swift"
tags:
    [
        "StretchableImage",
        "9-Patch",
        "나인패치",
        "iOS",
        "글또 9기",
        "Swift",
        "UIKit",
        "SwiftUI",
    ]
description: "iOS에서 자연스럽게 늘어나는 이미지를 사용해보자"
---

지난 시간에 `UISlider`를 다루면서 슬라이더의 트랙 이미지에는 이미지의 너비를 자연스럽게 늘리거나 줄이기 위해 `Stretchable Image`를 사용할 수 있다고 했는데요.<br>
`Stretchable Image`라는 이름을 웹이나 안드로이드 앱 분야에서는 들어본 적이 없는 것 같아서 이게 무엇인지 찾아보았습니다.<br>
이번 시간에는 이 `Stretchable Image`에 대해 공부한 내용을 정리해 보려 합니다.

# Stretchable Image

우선 이 `Stretchable Image`가 무엇인지 알아보기 위해 공식 문서를 살펴보기로 했습니다만, `Stretchable Image`만 별도로 다룬 문서는 따로 없는 것 같고, 그 대신 `stretchableImage(withLeftCapWidth:topCapHeight:)`라는 Deprecated된 메서드를 찾을 수 있었습니다.<br>
현재는 이 메서드 대신 `resizableImage(withCapInsets:)`를 사용할 수 있다고 합니다.

그런데, 이 메서드가 아니라 저는 `Stretchable Image`가 무엇인지 개념부터 알고 싶었는데요!<br>
이에 대한 내용은 `UIImage` 문서의 [Define a stretchable image](https://developer.apple.com/documentation/uikit/uiimage#Define-a-stretchable-image) 단락에서 찾아볼 수 있었습니다.

`Stretchable Image`는 기본 이미지 데이터를 미적으로 보기 좋은 방식으로 복제할 수 있는 영역을 정의하는 이미지라고 합니다.<br>
일반적으로 공간을 채우기 위해 늘리거나 줄일 수 있는 배경을 만드는 데 사용된다고 하네요.<br>
설명만으로는 잘 감이 오지 않으니, `Stretchable Image`가 적용된 이미지와 적용되지 않은 이미지의 차이를 직접 눈으로 확인해 볼까요?

차이를 더 직관적으로 확인하기 위해 사용할 이미지를 다음과 같이 9개의 부분으로 나뉜 이미지로 사용했습니다.<br>
![Stretchable Image가 적용된 이미지와 적용되지 않은 이미지의 차이](https://github.com/user-attachments/assets/b3dfc3d1-92f3-4e01-bd2e-f22c33996999)<br>
^^Stretchable Image가 적용된 이미지와 적용되지 않은 이미지의 차이^^<br>
네, 예시를 보니 어떤 느낌인지 감이 오시나요?

일반적으로 이미지 뷰에 이미지를 넣을 때, 이미지 뷰의 크기와 실제 이미지의 크기가 다른 경우에는 이미지를 늘리거나 줄여서 이미지 뷰의 크기에 이미지를 맞추게 되는데요.<br>
`Stretchable Image`를 사용하면 이렇게 이미지를 늘리거나 줄일 때, 이미지의 모양이 망가지는 경우를 방지할 수 있습니다.

즉, `Stretchable Image`는 이미지의 크기가 변경될 때 이미지의 모양이 망가지는 것을 방지하기 위해 이미지를 변형이 불가능한 부분과 변형이 가능한 부분으로 나누어 처리하기 위한 방법이라고 할 수 있습니다.

참고로, 안드로이드에는 비슷한 역할을 하기 위한 요소로 **9-Patch(나인 패치)**가 있습니다.

`Stretchable Image`는 인셋을 이용해 이미지의 변형이 일어나는 부분(인셋이 적용된 부분)과 일어나지 않는 부분(인셋이 적용되지 않은 부분)을 나누는데요.<br>
top, left, bottom, right의 각 인셋에 0이 아닌 값을 지정하면 다음과 같이 이미지가 최대 9개의 부분으로 나뉘게 됩니다.<br>
![Stretchable Image의 구성](https://github.com/user-attachments/assets/87ac72b0-50e4-4c63-8744-191d2d056a12)<br>
^^Stretchable Image의 구성^^<br>
각 인셋은 지정된 크기만큼 이미지에서 변형이 일어나지 않는 부분을 정의하는데요.<br>
이미지의 top과 bottom 인셋은 고정된 높이를, left와 right 인셋은 고정된 너비를 유지합니다.

일반적으로 `Stretchable Image`가 적용된 이미지는 인셋이 적용된 부분을 이미지의 최소 사이즈로 남겨두어 슬라이더 등으로 크기를 더 줄이려 해도 줄어들지 않습니다.<br>
하지만, 코드를 이용하여 억지로 인셋이 적용된 사이즈보다 이미지를 더 작게 만들 수도 있는데요.<br>
이 경우 인셋이 적용된 부분에 변형 방지가 보장되지 않고, 변형이 일어나게 됩니다.

iOS는 이미지에서 변형이 일어나는 영역의 크기에 따라 성능 특성이 다른 다음과 같은 다양한 렌더링 모드를 사용합니다.

1. **변형할 수 있는 영역이 1픽셀인 경우**
   변형할 수 있는 영역의 너비 또는 높이가 1픽셀이거나, 너비와 높이 모두 1픽셀인 경우, 즉 가로 혹은 세로의 변형이 일어나는 영역의 크기가 1픽셀인 경우 iOS는 변형이 가능한 1픽셀의 영역을 늘려서 이미지를 그립니다.<br>
   만약 인셋이 0이 아니라면 이 모드는 가장 빠른 성능을 제공합니다.

2. **변형할 수 있는 영역의 너비 또는 높이가 1픽셀보다 큰 경우**
   변형할 수 있는 영역의 너비 또는 높이가 1픽셀보다 큰 경우 iOS는 해당 영역을 타일링하여 이미지를 그립니다.<br>
   이 모드를 사용하는 경우 성능이 저하되지만, 변형할 수 있는 영역에 단색이 아닌 텍스처(패턴)가 있는 이미지를 사용하는 경우 유용할 수 있습니다.<br>
   ![Stretchable Image - 패턴이 있는 이미지 모드 비교](https://github.com/user-attachments/assets/8b0c8eb2-41da-42ad-a201-23721c6c0140)<br>
   ^^Stretchable Image - 패턴이 있는 이미지 모드 비교^^

3. **전체 이미지의 크기를 조정할 수 있는 경우**
   전체 이미지의 크기를 조정할 수 있는 경우, 즉 인셋이 0이면서 이미지의 크기가 1x1보다 큰 경우 iOS는 전체 이미지를 타일링하여 이미지를 그립니다.<br>
   이 모드는 인셋이 0이 아닌 경우의 타일링 모드(2번째 모드)보다 빠릅니다.<br>
   ![Stretchable Image - 2, 3번 렌더링 모드 비교](https://github.com/user-attachments/assets/a2729b64-45a8-4778-b6d1-1f81ccab7d5f)<br>
   ^^Stretchable Image - 2, 3번 렌더링 모드 비교^^

## Stretchable Image 적용하기

그렇다면 이 `Stretchable Image`를 사용하기 위해서는 어떻게 해야 할까요?
Apple에서는 친절하게 `Stretchable Image`를 적용하기 위해 **Xcode의 기능을 이용한 방법**과 **코드를 이용한 방법**, 두 가지를 제공하고 있습니다.

### Xcode의 기능을 이용해 처리하기

안드로이드 스튜디오에 9-Patch 이미지를 만들기 위해 사용하는 Draw 9-Patch라는 도구가 있다면, Xcode에도 이와 비슷하게 UI를 이용해 `Stretchable Image`를 만들 수 있는 기능이 있습니다.

바로 **Asset**의 **Slicing** 기능인데요. 아래와 같은 방법으로 쉽게 `Stretchable Image`를 적용할 수 있습니다.
![si1](https://github.com/user-attachments/assets/76696895-3d3d-49b7-bc28-2bfcac1da341)<br>

1. 먼저, Slicing 할 항목을 선택한 뒤 Xcode 화면 우측 상단에 위치한 **Adjust Editor Options**(원 안에 점 세 개가 있는 모양)를 클릭합니다.

![si2](https://github.com/user-attachments/assets/f79bf801-a450-4ee1-81cd-dd8370667d2d)<br>

2. Adjust Editor Options에는 Xcode 15 기준으로 Show Overview와 Show Slicing, Invert Appearance라는 메뉴가 나오는데요. 여기서 **Show Slicing**을 클릭합니다.

![si3](https://github.com/user-attachments/assets/bdbbda2f-de22-448d-a64c-231c89223746)<br>

3. 그 후 위와 같은 화면에서 **Start Slicing**을 클릭합니다.

![si4](https://github.com/user-attachments/assets/e366a43b-5f8f-4edd-8d8a-294e015d0770)<br>

4. 위와 같은 화면에서 가장 왼쪽의 **양옆을 가리키는 화살표**를 선택하면 **이미지의 넓이**를, 가운데에 있는 **사방으로 퍼지는 화살표**를 선택하면 **이미지의 넓이와 높이**를, 가장 오른쪽의 **위아래를 가리키는 화살표**를 선택하면 **이미지의 높이**를 변경했을 때 변형이 일어나는 부분과 일어나지 않는 부분이 자동으로 적용됩니다.

![si5](https://github.com/user-attachments/assets/319c0469-31d8-41be-85c8-fc13971c79fd)<br>

5. 변형이 일어나는 부분과 일어나지 않는 부분을 원하는 대로 설정하고 싶다면 자동 적용된 부분을 드래그해 변경할 수 있습니다.

<table>
    <tr>
        <td><img src="https://github.com/user-attachments/assets/cf5fa112-ac7a-45b2-babf-3d2b40b62e4e"></td>
        <td><img src="https://github.com/user-attachments/assets/e4fb78af-b896-4ba8-878c-008331bb033c"></td>
        <td><img src="https://github.com/user-attachments/assets/75562705-b9c1-4797-bc90-679d5bcb5405"></td>
    </tr>
</table>

6. 또한 Xcode의 우측에 표시되는 **Attribute Inspector**의 최하단에 위치한 **Slicing** 섹션을 이용하여 상하, 좌우, 혹은 상하좌우 모두를 Slice 하거나 Slice 하지 않을지, 또 얼마나 Slice 할 지, 변형이 일어나는 부분은 tile과 stretch 중 어떤 모드로 처리할 것인지, 또 몇 픽셀을 변형에 사용할 것인지 설정할 수 있습니다.

### 코드로 구현하기

#### UIKit에서 코드로 구현하기

UIKit에서는 `resizableImage(withCapInsets:)` 메서드를 사용하여 `Stretchable Image`를 적용할 수 있습니다.
메서드의 `capInsets` 파라미터에 인셋으로 사용할 값을 넣으면 이미지에 새 인셋을 추가하거나, 기존의 인셋을 변경한 새 이미지가 반환됩니다.

```swift
UIImage(named: "manycolorbubble").resizableImage(withCapInsets: .init(top: 16, left: 16, bottom: 16, right: 16))
```

이 메서드를 사용해도 기존의 원본 이미지는 그대로 유지됩니다.

위에서 iOS는 이미지에서 변형이 일어나는 영역의 크기에 따라 성능 특성이 다른 다양한 렌더링 모드를 사용한다고 설명했는데요.<br>
일반적으로 이 렌더링 모드는 이미지에 따라 자동으로 적절한 모드가 적용되지만 직접 이 모드를 변경할 수 있습니다.

이러한 모드를 직접 제어하려면 `resizableImage(withCapInsets:resizingMode:)` 메서드 사용할 수 있습니다. 단, 이 메서드는 `resizingMode`를 직접 제어할 때만 호출해야 합니다.

`resizingMode` 파라미터에는 이미지 내부의 크기를 조정하는 모드를 넣을 수 있는데, 이미지를 복사 붙여넣기 하듯 반복해서 이미지의 내부 영역을 채우는 `tile`과 이미지의 크기를 조정해서 이미지의 내부 영역을 채우는 `stretch` 중 하나를 적용할 수 있습니다.

```swift
UIImage(named: "manycolorbubble")?.resizableImage(withCapInsets: .init(top: 16, left: 16, bottom: 16, right: 16), resizingMode: .stretch)
```

#### SwiftUI에서 코드로 구현하기

SwiftUI에서는 `resizable(capInsets:resizingMode:)`라는 메서드를 사용하여 `Stretchable Image`를 적용할 수 있습니다.<br>
UIKit의 `resizableImage` 메서드와 마찬가지로 `capInset` 파라미터에 변형이 일어나지 않는 부분을 설정할 값을 넣으면 인셋이 적용된 새 이미지가 반환됩니다.

```swift
Image("manycolorbubble")
    .resizable(capInsets: .init(top: 16, leading: 16, bottom: 16, trailing: 16))
```

`resizingMode` 파라미터 또한 이미지 내부의 크기를 조정하는 모드로 `stretch`와 `tile`을 사용할 수 있습니다.

```swift
Image("manycolorbubble")
    .resizable(capInsets: .init(top: 16, leading: 16, bottom: 16, trailing: 16), resizingMode: .tile)
```

## Stretchable Image는 어디에 사용할 수 있을까?

지금까지 `Stretchable Image`를 적용하는 방법을 알았습니다.<br>
그렇다면 이러한 `Stretchable Image`는 어디에 사용할 수 있을까요?

많은 채팅 앱에서 상대방과 나의 대화를 보여주는 채팅 버블은 버블 안에 얼마나 많은 글자가 있는지에 따라 그 크기가 결정되는데요. 이러한 **채팅 버블**에 `Stretchable Image`를 사용할 수 있습니다.

또, 전에 알아보았던 **UISlider의 트랙 이미지**에도 `Stretchable Image`를 적용할 수 있습니다.

그 외에도 **버튼의 배경 이미지**로 사용하여 버튼 내부의 콘텐츠에 따라 자연스럽게 크기가 바뀌는 버튼을 구성할 수도 있겠네요.

# 마무리

이번 시간에는 `Stretchable Image`에 대해 알아보았는데요.<br>
개인적으로 내부 콘텐츠의 크기에 따라 배경의 모양을 유지하면서 크기가 자연스럽게 늘거나 줄어드는 것을 어떻게 구현하면 좋을까 고민하던 차에 좋은 방법을 하나 알아가는 것 같습니다.<br>
후에 실제로 사용할 일이 있다면 좋겠네요.

# 참고자료

- [Apple Developer Documentation/UIKit/UIImage](https://developer.apple.com/documentation/uikit/uiimage#1658362)
- [Apple Developer Documentation/UIKit/UIImage/resizableImage(withCapInsets:)](https://developer.apple.com/documentation/uikit/uiimage/1624102-resizableimage)
- [Apple Developer Documentation/UIKit/UIImage/resizableImage(withCapInsets:resizingMode:)](https://developer.apple.com/documentation/uikit/uiimage/1624127-resizableimage)
- [Apple Developer Documentation/SwiftUI/Image/resizable(capInsets:resizingMode:)](<https://developer.apple.com/documentation/swiftui/image/resizable(capinsets:resizingmode:)>)
