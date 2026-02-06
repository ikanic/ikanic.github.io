---
title: "SwiftUI로 작성한 iOS 앱에서 다국어 지원하기 / Localization"
created-date: "2022-06-26 13:12"
modified-date: "2022-06-26 13:12"
category: "Swift"
tags: ["Swift", "SwiftUI", "iOS", "Localization", "글또 7기"]
description: "SwiftUI로 작성한 iOS 앱에서 다국어를 지원해보자"
---

> (2024.03.31)<br>
> 이 글은 과거 버전의 Localization 지원 방식을 설명하고 있습니다.<br>
> Xcode 15 이후의 환경에서 Localization을 다루는 방법을 알아보고자 하신다면<br>
> [[iOS] String Catalog - Xcode 15 이후의 iOS 앱에서 다국어 지원하기 (feat. Localization)](https://meenu.tistory.com/33)를 참조하시길 추천합니다.

Apple Developer Academy @POSTECH에서 두 번째 공식 팀 프로젝트(이하 MC2)가 끝났다.
이번에 우리 팀은 초등학생 저학년을 대상으로 한 환경 관련 앱을 만들었는데, 한국 초등학생 뿐만 아니라 글로벌한 초등학생들을 대상으로하자 하여 다국어를 지원하는 앱을 만들게 되었다.
이번에는 하나의 고정된 언어가 아닌 다국어를 지원하는 방법에 대해 공부한 내용을 적어보려한다.

# Localization

Apple 공식 문서에 따르면 Localization은 앱을 여러 언어 및 지역에 맞게 번역하고 조정하는 프로세스라고 한다.
대략적인 프로세스를 보자면 작성자가 문자열 파일을 작성하면 Xcode 내부적으로 언어 설정에 맞게 번역해서 앱에 보여준다는 내용인 것 같다.

# Localization 실습

이제부터 Localization을 실습해 볼 것인데, 이번 실습을 위해 아래와 같은 구조 간단한 프로젝트를 생성해보았다.

```swift title="ContentView.swift"
struct ContentView: View {
    var body: some View {
        ZStack {
            Color.black
                .ignoresSafeArea()
            VStack {
                Text("현재 언어")
                    .font(.largeTitle)
                    .bold()
                    .foregroundColor(Color.white)

                Image("Flag")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .cornerRadius(10)
                    .padding(40)

                Text("한국어 (대한민국)")
                    .font(.title)
                    .foregroundColor(Color.white)
            }
        }
    }
}
```

![현재 언어 한국어](https://github.com/user-attachments/assets/b48dc3d6-48bd-45ea-8abc-3d8b0feba6a0)
현재는 한국어만 지원되지만, 이제 이 프로젝트에 영어도 지원될 수 있도록 추가해볼 것이다.
우선 프로젝트에서 String File을 하나 추가해준다.
![String File 선택](https://github.com/user-attachments/assets/f11cc7f0-87be-4257-949b-69b4501690cf)
파일의 이름은 Localizable로 해야한다.
![파일 이름 결정](https://github.com/user-attachments/assets/7b07e195-1e07-498b-a211-9c9998e45fc9)
그 이후에 Localizable.strings 파일에서 오른쪽 inspector에서 Localize... 버튼을 클릭한다.
![Localize 버튼 클릭](https://github.com/user-attachments/assets/c3bdfed6-714e-4900-9f66-dd9b599464ed)
그러면 inspector의 localization 부분이 아래와 같이 바뀌는 것을 볼 수 있다.
![Inspector Localization](https://github.com/user-attachments/assets/e1b78900-2b33-45be-9f89-eda5b6e2c59f)
그 후에 PROJECT의 Localization으로 간 후, + 버튼을 클릭한다.
![PROJECT Localization](https://github.com/user-attachments/assets/7c60f60a-c46c-4078-8a4d-4124dcb8475c)
그러면 다음과 같이 여러 언어들이 나오게 되는데 여기서 Korean을 클릭한다.
![Korean 선택](https://github.com/user-attachments/assets/4426c37b-8ff7-4966-887f-e0ee252b5473)
그러면 아래와 같은 화면이 나오는데 체크박스가 체크되어 있는지 확인한 후, Finish 버튼을 누른다.
![체크박스 확인](https://github.com/user-attachments/assets/c13e1ec5-a214-430f-8880-a6e53c0ab95b)
그러면 아래와 같이 Localizable에 Korean이 추가된 것을 확인할 수 있다.
![Localizable 추가 완료](https://github.com/user-attachments/assets/6541fb9c-5926-484d-b4d0-ae53e632a41c)
위와 같은 작업을 모두 끝내면 Localization을 위한 기본적인 준비가 거의 끝났다.
이제 마지막으로 현재 코드의 구조를 조금 변경해 볼 것이다.
처음에 만들었던 ContentView의 텍스트들을 모두 번역할 것인데, 이를 위해 우선 String 타입의 문자열들을 하나의 struct에 모아서 관리할 것이다.

```swift title="StringData.swift"
struct StringData {
    let currentLanguageTitle = "현재 언어"
    let currentLanguageContents = "한국어 (대한민국)"
}
```

```swift title="ContentView.swift"
struct ContentView: View {
    var body: some View {
        ZStack {
            Color.black
                .ignoresSafeArea()
            VStack {
                Text(StringData().currentLanguageTitle)
                    .font(.largeTitle)
                    .bold()
                    .foregroundColor(Color.white)

                Image("Flag")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .cornerRadius(10)
                    .padding(40)

                Text(StringData().currentLanguageContents)
                    .font(.title)
                    .foregroundColor(Color.white)
            }
        }
    }
}
```

위와 같이 구조를 변경했다.
이제 본격적으로 Localization을 해보겠다.
Localization에서 Localizable.strings 파일은 `key=value;`의 형식으로 사용된다. `;`을 빼먹으면 빌드 에러가 나니 주의하자.
SwiftUI에서 Localization을 사용하기 위해서는 LocalizedStringKey 타입을 사용한다.
그러므로, StringData struct의 String들을 LocalizedStringKey 타입으로 변경한다.

```swift title="StringData.swift"
struct StringData {
    let currentLanguageTitle: LocalizedStringKey = "현재 언어"
    let currentLanguageContents: LocalizedStringKey = "한국어 (대한민국)"
}
```

이제 Localizable 파일을 수정할 것이다.

```text
// Localizable (English)
"현재 언어" = "Current Language";
"한국어 (대한민국)" = "English (USA)";

// Localizable (Korean)
"현재 언어" = "현재 언어";
"한국어 (대한민국)" = "한국어 (대한민국)";
```

다음과 같이 수정한 후, 시뮬레이터를 실행하고 언어를 영어로 바꾸면 아래와 같이 텍스트들이 영어로 변경되는 것을 확인할 수 있다.
![시뮬레이터 언어 변경](https://github.com/user-attachments/assets/7642cca7-a459-4353-a1b5-2d40cf8b50f4)
지금까지는 도중에 변수가 들어가지 않는 String만 바꿔봤는데, 이번에는 도중에 변수가 들어가는 String을 변환해보겠다.
만약 변수 `테스트: 3`과 같은 텍스트를 출력하기 위해 `let number = 3`, `Text("변수 테스트 \(number)")`와 같이 쓰고 싶다면 `"변수 테스트: %lld"`와 같이 쓸 수 있다. Integer 타입에는 `%lld`를, String 타입에는 `%@`를 사용한다.

```swift title="StringData.swift"
struct StringData {
    let currentLanguageTitle: LocalizedStringKey = "현재 언어"
    let currentLanguageContents: LocalizedStringKey = "한국어 (대한민국)"
    let number = 3
}
```

```swift title="ContentView.swift"
import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack {
            Color.black
                .ignoresSafeArea()
            VStack {
                Text(StringData().currentLanguageTitle)
                    .font(.largeTitle)
                    .bold()
                    .foregroundColor(Color.white)

                Image("Flag")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .cornerRadius(10)
                    .padding(40)

                Text(StringData().currentLanguageContents)
                    .font(.title)
                    .foregroundColor(Color.white)

                Text("변수 테스트: \(StringData().number)")
                    .font(.body)
                    .foregroundColor(Color.white)
            }
        }
    }
}
```

![변수 변경](https://github.com/user-attachments/assets/34943cfc-336a-462e-928b-b779a89cc870)
마지막으로, 국가 및 언어 설정이 바뀌었을 때, 이미지도 같이 바뀔 수 있도록 해보겠다.
현재는 언어가 영어로 바뀌었지만, 국기가 여전히 태극기인 것을 볼 수 있다. 이 태극기를 성조기로 바꿔보겠다.
먼저, 프로젝트의 Assets으로 들어가서 설정이 바뀌었을 때 함께 바뀔 이미지를 선택하고, 오른쪽의 inspector 하단에 있는 Localize 버튼을 클릭한다.
![이미지 변경](https://github.com/user-attachments/assets/846e2743-8851-4a08-bcab-dd7d34c4986b)
그럼 아래와 같이 언어를 선택할 수 있는데, 필요한 언어를 선택한다.
![이미지 언어 선택](https://github.com/user-attachments/assets/c1764d62-3157-44ce-8456-21edc7e6366a)
그러면 아래와 같이 언어별로 이미지를 설정할 수 있게 된다.
![언어별 이미지](https://github.com/user-attachments/assets/895f9434-3d5b-487a-b7ba-76b5131b43ab)
그 후에 언어별로 알맞은 이미지를 넣어준다.
![언어별 이미지 삽입](https://github.com/user-attachments/assets/02536051-3b99-48c1-89c0-bb51b595c823)
그 후에 시뮬레이터를 돌려보면 아래와 같이 언어별로 이미지가 변경된 것을 확인할 수 있다.
![최종 시뮬레이터](https://github.com/user-attachments/assets/5720b0a2-978d-4399-abb9-af430cee0ce1)

# 후기

이렇게 SwiftUI로 Localization을 하는 방법을 배워봤는데, 아직 아는 것이 부족해서 그런지 뭔가 비효율적이라는 느낌이 많이 드는 것 같다. 조금 더 간단하게 Localization을 하는 방법이 있을 것 같은데, 조금 더 조사해봐야겠다.
