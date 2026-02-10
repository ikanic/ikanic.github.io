---
title: "[UIKit] UIVisualEffect - UIView에 흐림(Blur) 효과 주기"
thumbnail: "https://github.com/user-attachments/assets/d28e4453-b194-4467-b929-64a97e950aa4"
created-date: "2024-03-03 03:46"
modified-date: "2024-03-03 03:46"
category: "Swift"
tags:
    [
        "UIVisualEffect",
        "Blur",
        "UIBlurEffect",
        "UIVibrancyEffect",
        "iOS",
        "글또 9기",
        "Swift",
        "UIKit",
    ]
description: "UIView에 흐림(Blur) 효과를 주자"
---

지난 시간에 `UIBarAppearance`에 대해 찾아보면서 시스템 바에 흐림 효과를 주는 방법에 대해서도 알아보았었는데요.<br>
이번 시간에는 시스템 바가 아닌 뷰에 흐림 효과를 주는 방법에 대해 알아보겠습니다.

# Apple Design Resource와 Material

우선 지난 시간에 잠시 참고 했던 [Apple Design Resource 피그마 파일](https://www.figma.com/community/file/1248375255495415511/apple-design-resources-ios-17-and-ipados-17)을 다시 한번 참고해보겠습니다.

Apple Design Resource 피그마에서는 다양한 Color 및 Material들을 컴포넌트에 사용할 수 있는데요.<br>
![메터리얼 크롬](https://github.com/user-attachments/assets/c2f7f53a-54ed-45b9-ba10-6b6ddbb666a5)<br>
지난 시간에 `UIBarAppearance`를 살펴보며 피그마에서 iOS의 시스템 바는 `chrome`으로 채워져 있는 것을 알 수 있었습니다.<br>
하지만, `UIColor`에는 `chrome`이라는 색이 존재하지 않는데요.<br>
![메터리얼](https://github.com/user-attachments/assets/e5638a48-372f-44c2-b402-5f1fbe8d808f)<br>
일반적으로 Apple Design Resource 피그마에서 `Colors`로 구분되어 있는 것은 `UIColor`에서 사용할 수 있었지만, `chrome`은 `Colors`가 아닌 `Materials`로 되어 있었습니다.<br>
![메터리얼 모록](https://github.com/user-attachments/assets/f1d934bc-a03a-483e-9120-4bc3d18e716a)<br>
그렇다면 이 `Materials`라는 것은 무엇일까하고 고민하던 차에 피그마에서 `Materials`라는 페이지를 발견했습니다.<br>
이 페이지에는 여러 `Materials`와 `Vibrant`를 보여주고 있었는데요.

여기에서 힌트를 얻어 애플 공식 문서를 찾아보다가 `UIBlurEffect.Style.systemChromeMaterial` 이라는 것을 발견했습니다.<br>
드디어 `Material` 이라는 용어가 나오는 문서를 찾았네요.<br>
그렇다면 이 내용이 뷰에 흐림 처리를 할 수 있는 내용인지 확인해봐야겠죠?

`UIBlurEffect.Style.systemChromeMaterial`의 설명을 보면 시스템 크롬처럼 보이게 하는 적응형 흐림(Blur) 효과라고 합니다.<br>
이 내용이 맞는 것 같네요!

그렇다면 이제부터 이 `UIBlurEffect`와 관련된 내용들에 대해서 알아봅시다.

# UIVisualEffect

우선 `UIBlurEffect`가 상속 받고 있는 `UIVisualEffect`에 대해서 먼저 알아보겠습니다.

`UIVisualEffect`는 visual effect view와 blur 및 vibrancy 효과를 주기 위한 이니셜라이저로, 그 자체로는 사용되지 않고 `UIVisualEffectView`에 효과를 주기 위해 사용되는 `UIBlurEffect`와 `UIVibrancyEffect`의 부모 클래스로만 사용됩니다.

## UIBlurEffect

`UIBlurEffect`는 Visual Effect View 뒤에 레이어된 콘텐츠(Visual Effect View의 contentView에 추가된 뷰)에 흐림 효과를 적용하는 개체입니다.<br>
Visual Effect View의 콘텐츠 뷰 뒤에 추가하는 뷰는 흐림 효과의 영향을 받지 않습니다.

`UIBlurEffect`는 `init(style: UIBlurEffect.Style)` 생성자로 생성할 수 있으며, `style` 파라미터에 지정된 스타일에 맞는 흐림 효과를 반환합니다.

`UIBlurEffect`에는 아래의 21가지 흐림 스타일을 적용할 수 있습니다.

```swift
enum Style: Int {
    // 적응형 스타일
    case systemUltraThinMaterial = 6
    case systemThinMaterial = 7
    case systemMaterial = 8
    case systemThickMaterial = 9
    case systemChromeMaterial = 10
    // 라이트 스타일
    case systemUltraThinMaterialLight = 11
    case systemThinMeterialLight = 12
    case systemMaterialLight = 13
    case systemThickMaterialLight = 14
    case systemChromeMaterialLight = 15
    // 다크 스타일
    case systemUltraThinMeterialDark = 16
    case systemThinMaterialDark = 17
    case systemMaterialDark = 18
    case systemThickMaterialDark = 19
    case systemChromeMaterialDark = 20
    // 추가 스타일
    case extraLight = 0
    case light = 1
    case dark = 2
    case extraDark = 3
    case regular = 4
    case prominent = 5
}
```

`UIBlurEffect`의 Style은 크게 적응형 스타일, 라이트 스타일, 다크 스타일, 추가 스타일의 4 종류로 나눌 수 있는데, 라이트 스타일과 다크 스타일은 각각의 스타일을 지정했을 때 항상 같은 흐림 효과를 볼 수 있지만, 적응형 스타일을 적용했을 때는 디바이스의 디스플레이 모드에 따라 라이트 모드일 때는 라이트 스타일, 다크 모드일 때는 다크 스타일의 모양을 보여줍니다.

추가 스타일은 `extraLight`, `light`, `dark`, `extraDark`를 적용한 경우 항상 같은 흐림 효과를 보여주지만, `regular`를 적용한 경우에는 디스플레이 모드에 따라 `light`와 `dark` 효과를, `prominent`를 적용한 경우에는 `extraLight`와 `extraDark` 효과를 보여줍니다.

단, `extraDark`의 경우 `tvOS`에서만 사용할 수 있으므로 디스플레이 모드가 다크 모드인 `tvOS`를 제외한 OS에서는 `regular`와 마찬가지로 `dark` 효과를 보여줍니다.

각각의 효과를 적용했을 경우 결과는 아래와 같습니다.

<table>
   <tr>
      <td><img src="https://github.com/user-attachments/assets/2e86ec29-016b-42de-892d-5b73e1c6ca26"></td>
      <td><img src="https://github.com/user-attachments/assets/cabf5d0b-7ca8-4fb1-bcfb-9696ccb6fe0f"></td>
      <td><img src="https://github.com/user-attachments/assets/c2fb318d-eefe-4256-8745-18becdee3f45"></td>
      <td><img src="https://github.com/user-attachments/assets/26c906ff-92cd-497d-b7d6-b8b17e4b184c"></td>
      <td></td>
   </tr>
   <tr>
      <td>Blur 효과 미적용 (원본)</td>
      <td>extraLight</td>
      <td>light</td>
      <td>dark</td>
      <td></td>
   </tr>
   <tr>
      <td><img src="https://github.com/user-attachments/assets/a767f5a4-433b-49ae-bd41-94923effc2af"></td>
      <td><img src="https://github.com/user-attachments/assets/fe3c5b07-0e05-48ba-a149-ab8b341c3c88"></td>
      <td><img src="https://github.com/user-attachments/assets/9dedcdee-b42f-4213-ac60-0073bb705c63"></td>
      <td><img src="https://github.com/user-attachments/assets/aa17f59a-36db-4c52-8054-d4c30a787e94"></td>
      <td><img src="https://github.com/user-attachments/assets/62d59eff-1e81-4b11-9af3-3d5fe9305666"></td>
   </tr>
   <tr>
      <td>systemUltraThinMaterialLight</td>
      <td>systemThinMaterialLight</td>
      <td>systemMaterialLight</td>
      <td>systemThickMaterialLight</td>
      <td>systemChromeMaterialLight</td>
   </tr>
   <tr>
      <td><img src="https://github.com/user-attachments/assets/ffe9147f-30e0-4958-a521-f86bb569d6ef"></td>
      <td><img src="https://github.com/user-attachments/assets/f0159fda-4f1f-4923-9d7c-147fadf33e8b"></td>
      <td><img src="https://github.com/user-attachments/assets/78ef9c59-c4c5-48f5-9aac-ea7712be60aa"></td>
      <td><img src="https://github.com/user-attachments/assets/4df9597e-deba-4e1d-ab6f-452f8881fa9a"></td>
      <td><img src="https://github.com/user-attachments/assets/46b79ac0-378b-4f76-bae6-badbdecf364e"></td>
   </tr>
   <tr>
      <td>systemUltraThinMaterialDark</td>
      <td>systemThinMaterialDark</td>
      <td>systemMaterialDark</td>
      <td>systemThickMaterialDark</td>
      <td>systemChromeMaterialDark</td>
   </tr>
</table>

## UIVibrancyEffect

`UIVibrancyEffect`는 Visual Effect View 뒤에 레이어된 콘텐츠의 색상을 증폭하고 조정하는 개체입니다.<br>
`UIBlurEffect`로 구성된 `UIVisualEffectView`의 하위 뷰로 사용하거나 그 위에 레이어드하기 위해 사용됩니다.

Vibrancy 효과를 사용하면 contentView 안에 배치된 콘텐츠가 더욱 생생하게(선명하게) 보일 수 있습니다. 이 효과는 색상에 따라 달라집니다.<br>
contentView에 추가하는 모든 하위 뷰는 `tintColorDidChange()` 메서드를 구현하고, 그에 따라 자체적으로 업데이트해야 합니다. 하지만 렌더링 모드가 `UIImage.RenderingMode.alwaysTemplate`인 이미지가 있는 `UIImageView` 객체와 `UILabel` 객체는 자동으로 업데이트 됩니다.

`UIVibrancyEffect`는 `init(blurEffect: UIBlurEffect, style: UIVibrancyEffectStyle)`과 `init(blurEffect: UIBlurEffect)`의 두 가지 생성자를 이용해 생성할 수 있습니다.

이 때 사용되는 `blurEffect` 파라미터는 특정 흐림 효과에 생동감 효과를 생성하기 위한 것으로, 생동감 효과가 적용되기 위한 흐림 효과가 적용된 뷰에 사용되는 `UIBlurEffect`입니다.<br>
이 때, 새로운 생동감 효과를 만들 기 위해 기존에 사용된 `UIBlurEffect`와 동일한 흐림 효과를 파라미터로 사용해야 합니다. 다른 `UIBlurEffect`를 사용한다면 원하지 않는 시각 효과 조합이 발생할 수 있습니다.

`style` 파라미터는 콘텐츠에 적용할 생동감의 종류를 결정합니다.

`UIVibrancyEffect`의 Style에는 아래의 8가지를 사용할 수 있습니다.

```swift
enum UIVibrancyEffectStyle: Int {
    // 레이블 스타일
    case label = 0
    case secondaryLabel = 1
    case tertiaryLabel = 2
    case quaternaryLabel = 3
    // fill 스타일
    case fill = 4
    case secondaryFill = 5
    case tertiaryFill = 6
    // separator 스타일
    case separator = 7
}
```

각각의 Style을 적용했을 경우 결과는 아래와 같습니다.

<table>
   <tr>
      <td><img src="https://github.com/user-attachments/assets/ef353aa7-cf2b-4598-92a9-19f4c5c04658"></td>
      <td><img src="https://github.com/user-attachments/assets/ba3393e2-8564-4cc0-abb4-e5c21ceae777"></td>
      <td><img src="https://github.com/user-attachments/assets/4cc71572-ff5f-4eaa-90e3-cd84138e4957"></td>
      <td></td>
   </tr>
   <tr>
      <td>Vibrancy 효과 미적용 (원본)</td>
      <td>Style 자동 적용<br>,,init(blurEffect:) 생성자를 사용한 경우,,</td>
      <td>separator</td>
      <td></td>
   </tr>
   <tr>
      <td><img src="https://github.com/user-attachments/assets/3a1d34c3-2f46-466b-bfa9-3f54e0fc63a7"></td>
      <td><img src="https://github.com/user-attachments/assets/900b17e0-ff7b-4b67-af86-b9fd7ed2ad43"></td>
      <td><img src="https://github.com/user-attachments/assets/8f9cb5e9-ae40-448b-96fe-6e313693e490"></td>
      <td><img src="https://github.com/user-attachments/assets/b146b125-7bfa-43f8-9ed8-2d5652e0b55b"></td>
   </tr>
   <tr>
      <td>label</td>
      <td>secondaryLabel</td>
      <td>tertiaryLabel</td>
      <td>quaternaryLabel</td>
   </tr>
   <tr>
      <td><img src="https://github.com/user-attachments/assets/f7817cdb-4ed4-4720-88fe-12e974672f8b"></td>
      <td><img src="https://github.com/user-attachments/assets/1a0a7c5b-b084-4493-a28a-4544376bae19"></td>
      <td><img src="https://github.com/user-attachments/assets/8fe8f621-5695-4aec-9874-dc42c995c52d"></td>
      <td></td>
   </tr>
   <tr>
      <td>fill</td>
      <td>secondaryFill</td>
      <td>tertiaryFill</td>
      <td></td>
   </tr>
</table>

## UIVisualEffectView

`UIVisualEffectView`는 복잡한 시각 효과를 구현하는 객체로, 원하는 효과에 따라 뷰 뒤에 레이어된 콘텐츠, 또는 Visual Effect View의 contentView에 추가된 콘텐츠에 영향을 줄 수 있습니다.<br>
`UIVisualEffectView`는 흐림(Blur) 처리를 위한 `UIBlurEffect`와 생동감(Vibrancy) 효과를 위한 `UIVibrancyEffect`를 적용할 수 있습니다.

Visual Effect를 적용하기 위해서는 `UIVisualEffectView`를 뷰 계층 구조에 추가해야 하는데, 이 때, Visual Effect를 적용할 뷰를 `UIVisualEffectView` 자체에 하위 뷰로 직접 추가하면 원하지 않는 결과가 발생할 수 있으므로, `UIVisualEffectView`의 `contentView` 속성에 하위 뷰를 추가해야 합니다.

### UIVisualEffectView의 생성

`UIVisualEffectView`는 `init(effect: UIVisualEffect?)`라는 생성자를 사용하여 생성할 수 있습니다.<br>
생성자의 `effect` 파라미터에 뷰에 제공할 흐림 또는 생동감 효과에 따라 `UIBlurEffect` 또는 `UIVibrancyEffect`의 `UIVisualEffect`를 사용하여, 지정된 시각 효과가 포함된 새 뷰를 생성합니다.

# 마무리

이번 시간에는 뷰에 흐림 효과 및 생동감 효과를 줄 수 있는 `UIVisualEffect`에 대해 알아보았습니다.<br>
아이폰의 잠금화면에서 알림 등을 볼 때, 단순히 알림 블록을 흐리게 보이게 하는 것 뿐만 아니라 글자가 뒷 배경과 비슷하게 보이는 효과는 어떻게 만들어 줄 수 있을까 궁금했는데, Vibrancy를 사용하면 비슷하게 만들 수 있을 것 같네요.

## 후기

개인적으로 이 내용을 공부하면서 꽤 많은 시행착오를 겪었고, 정리하기 위해 많은 시간을 썼는데, 결과적으론 거의 공식 문서 번역글이 된 것 같아 조금 아쉽습니다.

# 참고자료

- [Apple Design Resources - iOS 17 and iPadOS 17](https://www.figma.com/community/file/1248375255495415511/apple-design-resources-ios-17-and-ipados-17)
- [Apple Developer Documentation/UIKit/UIVisualEffect](https://developer.apple.com/documentation/uikit/uivisualeffect)
- [Apple Developer Documentation/UIKit/UIBlurEffect](https://developer.apple.com/documentation/uikit/uiblureffect)
- [Apple Developer Documentation/UIKit/UIVibrancyEffect](https://developer.apple.com/documentation/uikit/uivibrancyeffect)
- [Apple Developer Documentation/UIKit/UIVisualEffectView](https://developer.apple.com/documentation/uikit/uivisualeffectview)
