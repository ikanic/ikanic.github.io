---
title: "[iOS] String Catalog - Xcode 15 이후의 iOS 앱에서 다국어 지원하기 (feat. Localization)"
thumbnail: "https://github.com/user-attachments/assets/7411e438-f60c-4170-b764-42eb04a9c8c6"
created-date: "2024-03-31 02:13"
modified-date: "2024-03-31 02:13"
category: "Swift"
tags:
    [
        "iOS",
        "글또 9기",
        "Swift",
        "Localization",
        "LocalizedStringKey",
        "NSLocalizedString",
        "String",
        "String Catalog",
        "Xcode",
        "다국어 지원",
    ]
description: "Xcode 15 이후의 버전에서 앱에 다국어를 지원해보자"
---

최근 개인 앱을 하나 출시 했는데요. 이제 막 출시 해서 얼마 되지 않겠지만, 국가별 다운로드 수가 궁금해서 확인해 보니 한국보다는 해외에서 다운받은 경우가 더 많았습니다.<br>
하지만, 제가 출시한 앱은 해외 유저를 전혀 생각하지 않은 앱이기 때문에 외국어를 지원하지 않고 있었는데요. 그래서 "최소한 영어라도 지원을 해보자" 하고 급하게 부랴부랴 언어에 영어를 추가했습니다.

그런데, 영어를 지원하기 위해 이전에 사용하던 `Strings File`을 사용하려고 보니 이름이 `Strings File (Legacy)`로 바뀌어 있었습니다.<br>
이때, 뭔가 이상함을 감지하고 찾아보니 Xcode 15부터는 `String Catalog`라는 새로운 파일 형식이 생겨 `Localization`에 이 형식을 사용하게 된 것이었습니다.

그래서 이번 시간에는 이 `String Catalog`와 함께 Xcode 15버전 이후의 iOS 앱에서 다국어 지원을 하는 방법에 대해서 알아보려고 합니다.

사실 제 블로그에는 약 1년 9개월 전에 작성했던 [SwiftUI로 작성한 iOS 앱에서 다국어 지원하기 / Localization](./2022-06-26-supporting-multiple-languages-in-ios-app)이라는 글이 있어서 해당 글을 수정하려고 했었습니다만, 새로 생긴 `String Catalog`와 방식이 많이 다르기도 하고, 혹시 기존의 방식을 사용하게 될지도 모른다는 생각에 새로운 글을 작성하기로 했습니다.

# Localization

우선 `Localization`에 대해서 가볍게 훑어보고 가겠습니다.<br>
[Apple 공식 문서](https://developer.apple.com/documentation/xcode/localization)에 따르면 Localization은 앱을 여러 언어와 지역에 맞게 번역하고 조정하는 프로세스이며, 이를 통해 다양한 언어를 사용하거나 다른 App Stroe 지역에서 다운로드하는 사용자에게 액세스 권한을 제공할 수 있다고 합니다.

Xcode 15버전이 출시 되기 전까지는 `Localization`을 위해 `Strings File` 혹은 `Stringsdict File`을 사용했었는데요. Xcode 15부터는 `String Catalog`를 권장한다고 합니다.

# String Catalog

자 이제 본격적으로 `String Catalog`에 대해 알아보겠습니다.<br>
`String Catalog`는 Xcode 15부터 추가된 새로운 파일 형식으로 OS버전이 아닌 Xcode 버전에 종속된 기능이기 때문에 Xcode 버전만 15 이상이라면 최신 OS, 즉 iOS 17, iPadOS 17, macOS 14 이상 등이 아니더라도 사용할 수 있습니다.

아마 빌드할 때, Xcode 내부에서 알맞은 형식으로 변환해 주는 것으로 보이네요.

## 프로젝트에 사용할 언어 추가하기

프로젝트에 String Catalog를 추가하기 전에, 우선 다국어 지원을 위해 프로젝트에 사용할 언어를 추가해 보겠습니다.<br>
물론, 프로젝트에 String Catalog를 먼저 추가한 후, 언어를 추가해도 무방합니다.<br>
![언어 추가](https://github.com/user-attachments/assets/a905f7b2-2e09-4653-b321-3f2a1aa6af9c)<br>
Xcode에서 프로젝트를 생성한 후, 프로젝트 파일의 Info 탭에 들어가면 Localizations 섹션에 기본적으로 Base와 English가 추가된 것을 확인하실 수 있습니다.<br>

<table>
    <tr>
        <td><img src="https://github.com/user-attachments/assets/c29080f4-40cf-4648-86d8-a9a64b1e2c3a"></td>
        <td><img src="https://github.com/user-attachments/assets/88f30fcc-1fcc-4b63-a3d4-0b6dcd27590e"></td>
    </tr>
</table>
Localizations 섹션 아래에 +버튼을 클릭한 후, 팝업 메뉴에서 언어 및 지역을 선택합니다.<br>
팝업 메뉴에는 언어 이름 뒤의 괄호 안에 언어 ID가 표시됩니다.<br>

![언어 추가 완료](https://github.com/user-attachments/assets/139f03b4-97c5-4c0c-b7e8-d1fad0097277)<br>
선택한 언어가 Localizations에 추가 되었다면 사용할 언어가 추가된 것입니다.

언어 ID에 대한 자세한 내용은 하위 섹션에서 확인하실 수 있습니다만, 이 글에서 크게 중요한 부분은 아니므로 이러한 개념이 있구나 하고, 읽지 않고 넘어가도 무방합니다.

:::toggle **언어 ID**
언어 ID는 크게 3가지 형식으로 구분되는데, **언어 코드**만 있는 방식, **언어 코드와 지역 코드가** 있는 방식, **언어 코드와 스크립트 코드**가 있는 방식으로 구분됩니다.

**언어 코드만 있는 방식**은 여러 지역에서 사용되는 언어의 경우 사용할 수 있습니다. 영어는 `en`, 한국어는 `ko`, 일본어는 `ja` 등 일반적으로 2~3글자의 알파벳으로 된 언어 코드로 이루어져 있습니다.

**언어 코드와 지역 코드가 있는 방식**은 같은 언어에서도 여러 지형의 변형을 구분하려고 하는 경우 사용할 수 있습니다.<br>
한국어의 경우 대한민국에서 사용되는 한국어는 `ko-KR`, 북한에서 사용되는 한국어는 `ko-KP`, 중국에서 사용되는 중국조선어의 경우 `ko-CN`을 사용하는 등 `언어코드-지역코드`의 형식으로 사용합니다.<br>
일반적으로 지역코드는 알파벳을 사용하지만, 세계에서 사용하는 영어는 `en-001`로 구분하는 등 특수한 경우 숫자도 혼용하고 있습니다.

**언어 코드와 스크립트 코드가 있는 방식**은 위에서 나눈 방식 이외에 구분하려고 하는 경우 사용할 수 있습니다.<br>
예를 들어 중국어의 경우 간체는 `zh-Hans`, 번체는 `zh-Hant`을 사용하는 등 일반적으로 `언어코드-스크립트코드`의 형식으로 사용합니다.<br>
스크립트 코드는 언어 코드와 지역 코드, 그리고 스크립트 코드의 요소가 모두 사용된 것처럼 보이는 형태이면서 언어 코드와 스크립트 코드로만 구성된 것으로 구분되는 특별한 경우가 있는데요.

예를 들어 중국어의 경우 지역과 간체/번체를 모두 나누게 될 경우 `zh-Hans-HK`와 같이 `언어코드-스크립트코드-지역코드`처럼 보이는 형태를 사용합니다.<br>
하지만, 컴퓨터 시스템에 사용되는 미국 영어의 경우 `en-US-POSIX`와 같이 `언어코드-지역코드-스크립트코드`처럼 보이는 형태를 사용하고 있어서 이 경우는 약간 불규칙해 보이네요.
:::

## 프로젝트에 String Catalog 추가하기

자 이제 프로젝트에 String Catalog를 추가해 보겠습니다.<br>
![String Catalog 추가](https://github.com/user-attachments/assets/043768d1-5332-4ea2-a317-b4c896f2b6c3)<br>
Xcode의 프로젝트 내비게이터에서 좌측 하단의 +버튼을 누른 후, 팝업 메뉴에서 File을 선택합니다.<br>
![템플릿 선택](https://github.com/user-attachments/assets/b41ae144-8ae0-476a-bfdb-e066c68ad68e)<br>
그 후, 나오는 템플릿 선택 창에서 Resource 섹션의 `String Catalog`를 찾거나, 우측 상단의 Filter에 `String Catalog`를 검색해서 `String Catalog`를 선택합니다.<br>
![String Catalog 생성](https://github.com/user-attachments/assets/1083cc8e-bc0a-48fa-9b09-6d8f577cef5b)<br>
그 후에 적절한 이름으로 파일을 생성합니다.<br>
![파일 추가 완료](https://github.com/user-attachments/assets/9cb7554e-32a7-4740-8221-1eb4a2cde751)<br>
그러면 프로젝트 내비게이터에 방금 만든 파일이 추가된 것을 확인하실 수 있습니다.<br>
이 파일의 내용을 확인해 보면, 지금은 `Empty String Catalog`라며 아직 아무 텍스트가 없다고 나오네요.

## String Catalog 사용하기

자 이제, 본격적으로 `String Catalog`를 사용하는 방법을 알아볼까요?<br>
`String Catalog`는 `SwiftUI`와 `UIKit`에서의 사용 방식이 조금 다른데요.<br>
우선 `SwiftUI`와 함께 사용하는 방법을 알아본 후, `SwiftUI`와 차이를 `UIKit`과 함께 사용하는 방법에서 알아보겠습니다.

### SwiftUI에서 String Catalog 사용하기

기본적으로 `String Catalog`는 공식 문서 예제도 `SwiftUI` 위주로 작성되어 있는 등, `SwiftUI` 지원 및 호환성이 정말 좋습니다.

우선, 실습을 위해 [예전 글](./2022-06-26-supporting-multiple-languages-in-ios-app)에서 사용하던 예제 뷰를 다시 한번, 추억 속에서 꺼내 아래와 같이 약간 수정해 보겠습니다.

```swift title="Language.swift"
enum Language {
    static let language = "한국어"
    static let nationalNumber = 82
}
```

```swift title="LocalizationView.swift
import SwiftUI

struct LocalizationView: View {
    var body: some View {
        ZStack {
            Color.black
                .ignoresSafeArea()

            VStack {
                Text("현재 언어")
                    .font(.title2)
                    .foregroundStyle(.white)

                Text(Language.language)
                    .font(.largeTitle)
                    .foregroundStyle(.white)

                Image("National Flag")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .padding(40)

                Text("국가 번호: +\(Language.nationalNumber)")
                    .font(.title2)
                    .foregroundStyle(.white)
            }
        }
    }
}
```

![시뮬레이터 이미지](https://github.com/user-attachments/assets/bbe08ba9-6eb0-488b-a6ec-46f96b87b5df)<br>
SwiftUI에서는 `String Catalog` 파일이 생성된 상태에서 프로젝트를 빌드하면 Xcode에서 프로젝트의 텍스트들을 인식해서 키값을 자동으로 생성해 줍니다.<br>
![String Catalog 자동 생성](https://github.com/user-attachments/assets/0bc20e5f-ab6c-4602-b40c-74ed885676a3)<br>
심지어 숫자 등 다른 포맷이 함께 사용된 경우에는 해당 포맷에 맞는 서식 지정자까지 추가해 주는 것을 볼 수 있습니다.

그런데, 유심히 보다 보면 뭔가 이상한 점을 눈치채실 수 있는데요.<br>
네, 바로 모든 문자열이 자동으로 추가된 것은 아니라는 것입니다.<br>
"현재 언어"나 "국가 번호" 등 Text에 추가된 문자열은 자동으로 추가되었지만, enum에서 따로 선언해 준 문자열을 추가되지 않았죠?<br>
그렇다면 이 차이는 무엇일까요?<br>
![Quick Help](https://github.com/user-attachments/assets/5018d041-6b1c-4a0a-a063-f10734317b7e)<br>
이 차이는 Quick Help 기능을 통해 `Text` 뷰의 Declaration 부분을 확인해 봄으로써 알 수 있었습니다.<br>
바로, Text에서 받는 타입이 `String`이 아니라 `LocalizedStringKey`라는 점이었는데요.<br>
그렇다면 enum 안에 있는 "한국어"라는 문자열을 `LocalizedStringKey` 타입으로 변경하고, 다시 한번 빌드해 보겠습니다.

```swift title="Language.swift"
enum Language {
    static let language: LocalizedStringKey = "한국어"
    static let nationalNumber = 82
}
```

![LocalizedStringKey](https://github.com/user-attachments/assets/25b0439f-2947-4914-9e55-5f79bda10225)<br>
네, "한국어"라는 키가 자동으로 추가된 것을 확인할 수 있습니다.<br>
이 외에도 필요한 키가 있다면 `String Catalog` 파일 상단의 +버튼을 통해 키를 수동으로 추가할 수도 있습니다.<br>
![String Catalog 키 값](https://github.com/user-attachments/assets/12c1e4bf-c796-4b7d-8cc1-609dce1cd94a)<br>
기본적으로 `String Catalog`는 값을 키와 같은 문자열로 지정해 주는데요.<br>
이 문자열을 각 언어에 맞게 편집해 주면 다국어 지원이 완료됩니다.

개인적으로는 Key 값 한국어, 번역 English와 같이 Key 값이 애매하다고 생각되는 경우에는 Key 값을 언어로 바꾸는 등, 변수 이름처럼 공통되는 특징으로 수정해서 사용하고 있습니다.

참고로, `LocalizedStringKey`로 타입이 선정되어 자동으로 추가된 키는 `LocalizedStringKey`가 아닌 다른 타입으로 문자열의 타입을 변경하기 전까지는 `String Catalog`에서 변경 및 삭제할 수 없습니다.

### UIKit에서 String Catalog 사용하기

UIKit의 경우 `LocalizedStringKey`를 사용할 수 없는데요. 그렇다면 UIKit에서는 `String Catalog`를 사용하지 못하는 것일까요?<br>
결론은 그렇지 않습니다!<br>
UIKit에서도 `String Catalog`를 사용할 수 있습니다.

하지만, 단순히 앱에 사용된 문자열을 Key에 똑같이 추가하는 것만으로는 `String Catalog`를 사용할 수 없는데요. UIKit에서는 아래의 두 가지 방법으로 `String Catalog`를 사용할 수 있습니다.

1. **NSLocalizedString 함수 사용하기**
   `Foundation` 프레임워크에 포함된 `NSLocalizedString` 함수는 문자열로 된 키를 매개변수로 받아 그 키에 맞는 Localization 된 String을 반환합니다.<br>
   만약 아래와 같은 Key가 있다면 `NSLocalizedString("메테리얼")`처럼 사용하여 한국어일 때는 "메테리얼"이, 영어일 때는 "Material"이 반환되게 할 수 있습니다.<br>
   ![UIKit String Catalog](https://github.com/user-attachments/assets/132c1f43-84c8-41d8-a735-f87c470780f9)<br>
   이를 Extension으로 따로 빼서 아래와 같이 사용하기도 합니다.

```swift
// Extension 선언부

extension String {
    func localized() -> String {
        return NSLocalizedString(self, comment: "")
    }
}

// 사용

"메테리얼".localized()
```

2. **String의 localized initializer 사용하기**
   iOS 15, iPadOS15, macOS 12, Mac Catalyst 15, tvOS 15, watchOS 8, visionOS 1 이상의 환경이라면 `String`의 이니셜라이저 중에서 `String.LocalizationValue` 타입을 매개변수로 받는 `String(localized:table:bundle:locale:comment:)` 이니셜라이저를 사용할 수 있습니다.<br>
   `NSLocalizedString`에서 사용한 것과 같은 문자열이 있을 때, `String(localized:table:bundle:locale:comment:)` 이니셜라이저에서는 아래와 같이 사용할 수 있습니다.
    ```swift
    String(localized: "메테리얼")
    ```
    `String(localized:table:bundle:locale:comment:)` 이니셜라이저를 사용한 문자열은 `SwiftUI`의 `LocalizedStringKey`를 사용한 것처럼 프로젝트 빌드시 `String Catalog`에 자동으로 키가 추가됩니다.

### 기기 및 단/복수형 String Catalog 문자열 적용하기

`String Catalog`는 이렇게 `Localization` 기능만 제공하는 것이 아니라 더 다양한 기능을 제공하고 있는데요.

그중 하나가 기기별로 다른 문자열을 보여주는 기능입니다.<br>
기기별로 문자열이 다르게 필요한 경우에는 어떤 경우가 있을까요?

예를 들면 iOS와 macOS를 모두 지원하는 앱의 경우, 버튼을 선택할 때 아이폰에서는 버튼을 손가락으로 탭 하지만, mac에서는 버튼을 마우스로 클릭한다고 하죠?<br>
![기기 통합 String Catalog](https://github.com/user-attachments/assets/24a71282-7e0b-4d0c-a92d-c29079deae51)<br>
이런 경우 "버튼을 탭/클릭해 주세요"라고 문자열을 작성할 수도 있지만, 아이폰에서는 "버튼을 탭 해주세요"를, mac에서는 "버튼을 클릭해 주세요"를 보여주는 것이 사용자에게 더 좋은 경험일 것입니다.<br>
![Vary by Device](https://github.com/user-attachments/assets/be27c918-edb9-46d4-be86-95c623d35e13)<br>
이렇게 기기별로 다른 문자열을 보여줘야 할 때, `String Catalog`에서 해당하는 문자열을 선택한 후, 마우스 우클릭합니다.<br>
이때 나오는 팝업에서 `Vary by Device`를 선택한 후, 서로 다르게 보여줄 기기를 선택해 적절하게 문자열을 변경하면 다음과 같이 각각의 기기에 맞는 문자열을 보여줄 수 있습니다.<br>
![기기별 String Catalog](https://github.com/user-attachments/assets/418dc515-d991-4a11-9310-962476a39252)<br>
`String Catalog`는 기기별로 다른 문자열을 보여주는 것뿐만 아니라, 키에 숫자가 포함되어 있는 경우에는 문자열의 단/복수형에 따라 서로 다른 문자열을 보여주는 기능 또한 제공하고 있습니다.<br>
![단복수 공통 String Catalog](https://github.com/user-attachments/assets/ee13713f-c1de-4ccb-99da-c5228580bd05)<br>
예를 들어 "%lld 송이의 꽃이 있습니다"라는 문장이 있고, 1송이일 때는 "1송이의 꽃이 있습니다"를 2송이 이상일 때는 "2송이의 꽃들이 있습니다"를 출력하고 싶을 수 있겠죠?<br>
![Vary by Plural](https://github.com/user-attachments/assets/0d49e17a-6f4f-4f68-9f19-8adae32b336a)<br>
`String Catalog`에서 문자열을 선택한 후, 마우스 우클릭해서 나오는 팝업에서 `Vary by Plural`을 선택합니다.<br>
![단복수별 String Catalog](https://github.com/user-attachments/assets/2968a667-ad44-41fd-8470-041fc59cfee4)<br>
이제 적절하게 문자열을 변경하여 단/복수형을 구분할 수 있습니다.<br>
그런데 만약 꽃이 없는 경우에는 어떻게 할 수 있을까요?<br>
그냥 "0송이의 꽃이 있습니다"를 출력하는 방법도 있지만, "꽃이 없습니다"를 출력하는 것이 사용자 경험상 더 좋을 것입니다.<br>

<table>
    <tr>
        <td><img src="https://github.com/user-attachments/assets/34ec6888-a878-47a6-a21d-3b5e4670ef4d"></td>
        <td><img src="https://github.com/user-attachments/assets/0b7a07c4-6613-4703-9ede-c285f8f1c0c5"></td>
    </tr>
</table>

이 경우 `Vary by Plural`을 한 번 더 선택해, `zero`를 추가한 후 문자열을 적절하게 수정할 수 있습니다.

### Info.Plist의 문자열에 String Catalog 적용하기

위에서 `SwiftUI`와 `UIKit`에서 `String Catalog`를 적용하는 방법을 알아봤는데요.<br>
이때, 문제가 있습니다. 카메라 사용 권한이나 앱 제목 등, `Info.plist`에 작성된 문자열은 `LocalizedStringKey`로 타입을 지정할 수도, `NSLocalizedString`이나 `String(localized:)`를 사용할 수도 없다는 점인데요.

그렇다면 `Info.plist` 안의 문자열은 Localization을 할 수 없는 것일까요?<br>
만약 그렇다면 카메라 권한 등은 어떻게 Localization 할 수 있을까요?<br>
결론은 `Info.plist`의 문자열도 Localization을 할 수 있습니다.

`Info.plist`의 문자열들은 기존에 생성한 일반적인 `String Catalog`는 사용할 수 없습니다.<br>
대신, `Info.plist`의 문자열만 모아놓은 전용 `String Catalog`를 사용해야 하는데요.<br>
기본적으로 만드는 방법은 위에서 사용한 `String Catalog`를 만드는 방법과 같습니다.<br>
![InfoPlist Localization](https://github.com/user-attachments/assets/457388bf-5638-471b-a3b5-0cb99c6091ac)<br>
대신, `Info.plist` 전용 `String Catalog`를 만들 때는 파일 이름을 `InfoPlist`로 작성해야 합니다.

`InfoPlist`에서도 마찬가지로 프로젝트를 빌드하고 나면 자동으로 `String Catalog`에 `Info.plist`의 문자열이 추가됩니다.

:::warning
<b>이 때 주의할 점은 String Catalog를 모두 작성한 후에 앱의 기본 언어를 변경할 경우 다른 String Catalog 파일들은 Swap 기능을 이용하여 자동으로 언어 변환을 할 수 있지만, InfoPlist String Catalog는 Swap 기능을 사용할 경우 번역된 정보가 모두 초기화됩니다.<br>
만약 앱의 기본 언어를 변경해야만 하는 어쩔 수 없는 상황이라면 미리 InfoPlist의 번역 정보를 다른 곳에 백업해 두는 것을 추천합니다.</b>
:::

:::warning
<b>참고로, 앱의 언어를 추가해서 다국어 지원을 하게 될 경우, 이미 <span style="color: red;">출시한 앱이더라도 추가한 언어의 국가에 동일한 이름의 앱이 있다면 출시(업데이트 등)가 불가능</span>합니다. 어떻게 알았냐고요? 저도 알고 싶지 않았어요 😭<br>
언어 지원 하나 추가해서 앱 업데이트 출시가 안 되는 감동 실화 😢</b>
:::

# Assets에 Localization 적용하기

앱을 사용하다 보면 국가에 따라서 문자열만 바꾸는 것이 아니라, 이미지나 음악 등 리소스를 변경해야 하는 경우도 있습니다.<br>
Xcode는 이러한 경우도 쉽게 대응할 수 있는 기능을 제공하고 있는데요.<br>
![국기](https://github.com/user-attachments/assets/54a8708e-364e-45b1-b349-2e6a4646fcd3)<br>
다음과 같이 나라별 국기를 보여줄 "National Flag"라는 이미지가 Assets에 있습니다.<br>
![Localization inspector](https://github.com/user-attachments/assets/018de50c-7b80-4d04-9852-8de4e2460c7d)<br>
Localization 할 리소스를 에셋에서 선택한 뒤 우측의 attribute inspector에서 localization 섹션을 찾아 localize... 버튼을 클릭합니다.<br>
![Localization List](https://github.com/user-attachments/assets/6726231f-a299-4f92-964e-2710d8cfc7fb)<br>
그러면 다음과 같이 해당 앱에서 지원하는 언어의 목록이 나오는데요.<br>
여기서 리소스를 Localization 할 언어의 체크박스를 선택하면, 다음과 같이 언어별로 리소스를 대응시킬 수 있게 됩니다.<br>

<table>
    <tr>
        <td><img src="https://github.com/user-attachments/assets/daf5349d-35cc-4b41-a94a-5dc162445229"></td>
        <td><img src="https://github.com/user-attachments/assets/166f797b-2a30-4be3-bb6d-b7bcb8ff8541"></td>
    </tr>
</table>

이제 적절한 리소스를 언어별로 넣어주면 기기가 해당 언어로 선택되어 있을 때, 각각에 맞는 리소스를 제공하게 됩니다.

# 마무리

이번 시간에는 Xcode 15 이후의 `Localization` 및 `String Catalog`에 대해 알아보았습니다.

사실 `Localization`에서는 위에서 설명한 부분 말고도 국가별로 날짜, 숫자 표기법 등을 다르게 제공하는 방법이 있는데요.<br>
이미 글이 원래 생각했던 것보다 5배 이상 길어져서 더 이상의 정보를 담는 것은 읽는 데 좋지 못할 것 같아 이 글에서는 다루지 않겠습니다.<br>
(사실 이미 글이 너무 길어서 읽는 데 좋지 못할 것 같지만)

국가별 날짜, 통화, 숫자 표기법 제공 방법은 [여기](https://developer.apple.com/documentation/xcode/preparing-dates-numbers-with-formatters)를 참조하시면 좋을 것 같습니다.

## 후기

사실 처음 예상했던 글은 대략 2,000자 정도 되는 짧고 간단한 글이었는데 말입니다..<br>
**글이 복사가 된다고..? 저절로 글이 굴러 들어온다고 🤣**

# 참고자료

- [Apple Developer Documentation/Xcode/Localization](https://developer.apple.com/documentation/xcode/localization)
- [Apple Developer Documentation/SwiftUI/Text input and output/Preparing views for localization](https://developer.apple.com/documentation/swiftui/preparing-views-for-localization)
- [Apple Developer Documentation/SwiftUI/LocalizedStringKey](https://developer.apple.com/documentation/swiftui/localizedstringkey)
- [Apple Developer Documentation/Foundation/NSLocalizedString(\_:tableName:bundle:value:comment:)](https://developer.apple.com/documentation/foundation/1418095-nslocalizedstring)
- [Apple Developer Documentation/Swift/String/init(localized:table:bundle:locale:comment:)](<https://developer.apple.com/documentation/swift/string/init(localized:table:bundle:locale:comment:)>)

# 히스토리

- 2024.03.31 02:13 최초 발행
- 2024.04.11 05:57 앱의 기본 언어 변경시 주의사항 추가
- 2024.04.12 04:21 localized initializer 설명 수정
- 2024.04.13 04:29 Thumbnail 이미지 확장자 변경 (png to webp)
