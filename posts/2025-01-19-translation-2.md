---
title: "[Translation] iOS 앱에서 네트워크 상의 텍스트 다국어 지원하기 2️⃣ / 커스텀 환경에서의 번역 준비하기"
thumbnail: "https://github.com/user-attachments/assets/34726f12-bfdc-4795-8a3f-97e12283c67b"
created-date: "2025-01-19 15:13"
modified-date: "2025-01-19 15:13"
category: "Swift"
tags: ["Translation", "Framework", "iOS", "SwiftUI", "글또 10기"]
series: "Translation"
seriesOrder: 2
description: "iOS 앱에서 네트워크 상의 텍스트에 다국어를 지원해보자 - 커스텀 환경 개요"
---

지난 시간에는 iOS 앱에서 네트워크 상의 텍스트를 번역하는 방법 중 하나인 `Translation`의 개요와 시스템 내장 UI 환경에서 번역을 제공하는 방법을 알아봤습니다.<br>
`Translation`은 시스템 내장 UI뿐만 아니라 커스텀 환경에서 번역을 지원하는 방법 또한 제공하고 있는데, 이번 시간부터는 커스텀 환경에서 번역을 제공하는 방법을 알아보겠습니다.

특히, 이번 2부에서는 커스텀 환경에서 번역을 제공하기 위한 방법인 `TranslationSession`의 개요와 커스텀 환경에서 번역을 제공하기 위한 준비, 그리고 `Translation`에서 지원하는 언어 및 상태에 대해 알아보겠습니다.

# TranslationSession

iOS 기본 앱 중에는 iMessage, Safari 등 이미 시스템 UI를 사용하여 번역을 제공하는 좋은 예시들이 있습니다.<br>
이렇게 시스템 UI를 사용해도 좋은 앱 경험을 만들 수 있지만, 더 자연스럽고 효과적인 번역 환경 및 앱 경험을 제공하기 위해 `Translation`은 시스템 UI 환경이 아닌 커스텀 번역 환경 또한 제공합니다.

앱 내에서 커스텀 번역 환경을 제공하기 위해서는 `TranslationSession` 객체와 관련 번역 기능을 사용해야 합니다.

`TranslationSession`은 번역하려는 콘텐츠의 언어와 번역될 대상 언어로 이루어진 한 쌍의 언어 간 번역을 수행하는 클래스입니다.

이 클래스는 개발자가 직접 인스턴스화해서 사용할 수 없습니다. 그 대신 `translationTask(\_:action:)` 또는 `translationTask(source:target:action:)` 모디파이어의 클로저가 제공하는 `TranslationSession` 인스턴스를 사용할 수 있습니다.

이 모디파이어들을 사용하면 모디파이어가 적용된 뷰가 화면에 표시되면 실행되는 액션 클로저에 `TranslationSession`의 인스턴스를 전달하며, 이 인스턴스를 받은 후 번역 함수 중 하나를 사용하여 하나 이상의 텍스트 문자열을 번역할 수 있습니다.

## TranslationSession 인스턴스를 제공하는 모디파이어

위에서 설명했듯 `TranslationSession` 인스턴스를 제공하는 모디파이어에는 `translationTask(source:target:action:)`과 `translationTask(\_:action:)`이 있습니다.

그럼 이제부터 이 두 가지 모디파이어에 대해 알아보겠습니다.

### 1. translationTask(source:target:action:)

```swift
nonisolated func translationTask(source: Locale.Language? = nil, target: Locale.Language? = nil, action: @escaping (TranslationSession) async -> Void) -> some View
```

먼저, `translationTask(source:target:action:)` 모디파이어는 연결된 뷰가 표시되기 전, 혹은 `source` 파라미터나 `target` 파라미터가 변경될 때 `action` 클로저의 동작을 실행합니다.<br>
`action` 클로저는 하나 이상의 번역을 수행할 수 있는 `TranslationSession` 인스턴스를 제공하는데, 만약 연결된 뷰가 사라진 후에 인스턴스를 사용하거나, `source` 혹은 `target` 파라미터를 변경한 후에 사용하면 클로저가 새 `TranslationSession` 인스턴스를 제공하게 되므로 시스템에서 `fatalError`를 발생시킵니다.

아래의 코드는 `translationTask(source:target:action:)` 모디파이어를 사용하여 번역하는 예시 코드입니다.

```swift title="CommentView.swift"
struct CommentView: View {
    var userName: String
    var originalText: String
    var date: String
    var sourceLanguage: Locale.Language?
    var targetLanguage: Locale.Language?

    @State private var translatedText: String?

    var body: some View {
        VStack(alignment: .leading) {
            HStack {
                Image(systemName: "person.crop.circle")
                Text(userName)
                Spacer()
                Text(date)
                    .font(.footnote)
            }
            Divider()
            Text(originalText)
                .translationTask(source: sourceLanguage, target: targetLanguage) { session in
                    Task { @MainActor in
                        do {
                            // 번역 코드
                        } catch {
                            // 오류 처리 코드
                        }
                    }
                }

            if translatedText != nil {
                Divider()
                Text("번역된 텍스트")
                    .font(.footnote)
                Text(translatedText!)
            }
        }
        .padding()
        .background {
            RoundedRectangle(cornerRadius: 16)
                .foregroundStyle(Color(uiColor: .systemGray6))
        }
    }
}
```

`translationTask(source:target:action:)` 모디파이어는 간단한 번역 작업을 수행 하기에는 좋지만, 버튼을 이용해 번역을 트리거한다거나, 혹은 번역할 콘텐츠의 언어는 그대로인데 콘텐츠의 내용만 변경된 경우 등의 상황에는 대처하기 어렵습니다.

이렇게 버튼을 이용해 번역을 트리거하거나, 동일한 `source` 및 `target`으로 새 번역을 다시 수행해야하는 경우 아래의 `translationTask(\_:action:)`을 사용한 후, `TranslationSession.Configuration`의 `invalidate()`를 호출하는 것이 더 좋습니다.

### 2. translationTask(\_:action:)

```swift
nonisolated func translationTask(\_ configuration: TranslationSession.Configuration?, action: @escaping (TranslationSession) async -> Void) -> some View
```

`translationTask(\_:action:)` 모디파이어는 연결된 뷰가 표시되기 전, 혹은 `configuration` 파라미터가 변경될 때 `action` 클로저의 동작을 실행합니다.<br>
`action` 클로저는 `translation(source:target:action:)`과 마찬가지로 하나 이상의 번역을 수행할 수 있는 `TranslationSession` 인스턴스를 제공합니다.<br>
마찬가지로, 만약 연결된 뷰가 사라진 후 인스턴스를 사용하거나, `configuration` 파라미터를 변경한 후에 사용하면 클로저가 새 `TranslationSession` 인스턴스를 제공하게 되므로 시스템에서 `fatalError`를 발생시킵니다.

아래의 코드는 `translationTask(\_:action:)` 모디파이어를 사용하여 번역하는 예시 코드입니다.

```swift title="CommentView.swift"
struct CommentView: View {
    var userName: String
    var date: String
    var sourceLanguage: Locale.Language?
    var targetLanguage: Locale.Language?

    @State private var originalText: String = ""
    @State private var translatedText: String?
    @State private var configuration: TranslationSession.Configuration?

    var body: some View {
        VStack(alignment: .leading) {
            HStack {
                Image(systemName: "person.crop.circle")
                Text(userName)
                Spacer()
                Text(date)
                    .font(.footnote)
                Button {
                    guard configuration == nil else {
                        configuration?.invalidate()
                        return
                    }

                    configuration = TranslationSession.Configuration(source: sourceLanguage, target: targetLanguage)
                } label: {
                    Image(systemName: "translate")
                }
                .translationTask(configuration) { session in
                    Task { @MainActor in
                        do {
                            // 번역 코드
                        } catch {
                            // 오류 처리 코드
                        }
                    }
                }
            }
            Divider()
            Text(originalText)

            if translatedText != nil {
                Divider()
                Text("번역된 텍스트")
                    .font(.footnote)
                Text(translatedText!)
            }
        }
        .padding()
        .background {
            RoundedRectangle(cornerRadius: 16)
                .foregroundStyle(Color(uiColor: .systemGray6))
        }
    }
}
```

`translationTask(\_:action:)`을 사용하면 동일한 언어 구성이어도, 콘텐츠가 변경된다면 다시 번역을 수행할 수 있으며, 버튼을 이용해서 새 번역을 표시할 수도 있습니다.

## TranslationSession.Configuration

위의 `translationTask(\_:action:)` 모디파이어를 보면서 `configuration` 파라미터의 타입으로 `TranslationSession.Configuration`이 사용된 것을 확인할 수 있습니다.

그렇다면 이 `TranslationSession.Configuration` 타입은 무엇일까요?

```swift
struct Configuration
```

`translationTask(\_:action:)` 모디파이어에서는 `translationTask(source:target:action:)` 모디파이어에서 사용된 `source`, `target` 파라미터를 대신해서 `TranslationSession.Configuration` 타입의 `configuration` 파라미터를 사용하여 `TranslationSession`에 사용할 `source` 및 `target` 언어를 지정할 수 있습니다.

`TranslationSession.Configuration` 타입은 `init(source:target:)` 생성자를 이용하여 생성할 수 있습니다.

### 생성자

```swift
init(source: Locale.Language? = nil, target: Locale.Language? = nil)
```

`source` 파라미터는 원본 콘텐츠의 언어로, 개발자가 직접 원본 콘텐츠의 언어를 지정할 수도 있지만, `nil`로 설정하면 세션이 스스로 언어를 식별하려고 시도합니다.<br>
만약, 언어가 명확하지 않다면 사용자에게 원본 언어를 선택하라는 메시지를 표시합니다.<br>
이 때, 하나의 세션으로 번역된 모든 텍스트는 동일한 원본 언어로 작성되어야 합니다.<br>
즉, 일본어 콘텐츠와 영어 콘텐츠를 하나의 세션으로 번역할 수는 없다는 의미로, 여러 언어를 번역하려면 여러 세션을 사용해야 합니다.

`target` 파라미터는 콘텐츠를 번역할 언어로, 만약 `nil`이라면 세션은 사용자 디바이스의 `Locale.preferredLanguages` 및 `source`에 따라 대상 언어를 선택하려고 시도합니다.

참고로, `TranslationSession.Configuration`을 만들 때는 `LanguageAvailability.supportedLanguages`에서 반환되는 `Locale.Language` 값을 사용하는 것이 가장 좋습니다. 만약 다른 `Locale.Language` 값을 전달하면 프레임워크는 지원되는 언어 중 하나에 일치시키려고 합니다.

### 새 번역 실행하기

`translationTask(\_:action:)` 모디파이어 코드 예시에서 `configuration`이 `nil`이 아닐 때, `invalidate()`라는 메서드를 사용했습니다.

```swift
mutating func invalidate()
```

`invalidate()` 메서드는 현재의 `TranslationSession`을 무효화하여 새 콘텐츠로 세션을 다시 실행하는 메서드로, 동일한 `source` 및 `target`을 사용하여 새 콘텐츠를 번역하기 위해서는 이 메서드를 사용해야만 합니다.<br>
이렇게 하면 `translationTask(\_:action:)` 메서드가 해당 액션 클로저를 호출하고 콘텐츠를 다시 번역하게 됩니다.

# Translation에서 사용 가능한 언어

`Translation`은 다양한 언어를 지원하지만, 모든 언어를 지원하지는 않습니다. 이러한 언어 지원 및 상태를 확인하기 위해 `LanguageAvailability`를 사용할 수 있습니다.

```swift
class LanguageAvailability
```

`LangugageAvailability`는 `Translation` 프레임워크가 지원하는 언어, 또는 언어 쌍을 지원하는지 확인할 수 있는 클래스로 사용자의 디바이스가 번역을 지원하는지 확인하기 위해서 아래와 같은 코드를 사용할 수 있습니다.

```swift
func checkTranslationSupportLanguage(source: Locale.Language, target: Locale.Language) async {
    let availability = LanguageAvailability()
    let status = await availability.status(from: source, to: target)

    switch status {
        case .installed:
            print("언어가 디바이스에 설치되어 있음")
        case .supported:
            print("프레임워크에서 지원하는 언어임")
        case .unsupported:
            print("프레임워크에서 지원하지 않는 언어임")
    }
}
```

## 프레임워크에서 지원하는 언어 알아보기

```swift
var supportedLanguages: [Locale.Language] { get async }
```

`supportedLanguages`는 `Translation` 프레임워크에서 지원하는 언어 배열을 반환하는 프로퍼티로, 이 배열을 참고하여 `TranslationSession.Configuration`을 구성하는 것이 가장 좋습니다.<br>
만약 이 배열에 포함되지 않는 언어를 사용하여 구성한다면, `Configuration`에 사용된 언어와 가장 비슷한 언어를 해당 배열에서 찾아서 번역을 시도합니다.

## 번역 언어 상태 확인하기

번역할 언어의 상태를 확인하는 데에는 `status(from:to:)`와 `status(for:to:)`의 두 가지 메서드를 사용할 수 있습니다.<br>
이 두 가지 메서드는 번역에 필요한 언어가 사용자의 디바이스에 다운로드되어 있는지 확인할 수 있습니다.

### 1. status(from:to:)

```swift
func status(from source: Locale.Language, to target: Locale.Language?) async -> LanguageAvailability.Status
```

먼저, `status(from:to:)` 메서드는 특정 언어 쌍이 설치되어 번역할 준비가 되었는지를 확인하는 메서드입니다.<br>
`source` 파라미터는 원본 콘텐츠의 언어를 의미하며, `target`은 번역할 대상 언어입니다.<br>
`target`이 `nil`이라면 시스템이 사용자가 선호하는 언어에 따라 적절한 언어를 선택하여 해당 언어의 상태를 반환합니다.

### 2. status(for:to:)

```swift
func status(for text: String, to target: Locale.Language?) async throws -> LanguageAvailability.Status
```

`status(for:to:)` 메서드는 `text` 파라미터에 사용된 샘플 텍스트 문자열을 기반으로 `target` 파라미터의 언어와 언어 쌍이 지원되는 지 확인하는 메서드로, `target` 파라미터가 `nil`이라면 `status(from:to:)`와 마찬가지로 시스템이 사용자가 선호하는 언어에 따라 적절한 언어를 선택하여 해당 언어의 상태를 반환합니다.

이 메서드는 `source` 언어를 모르고 프레임워크가 사용자의 샘플 텍스트를 기반으로 번역을 시도하려할 때 사용하면 좋습니다.<br>
시스템은 `text`에 전달된 텍스트의 언어를 감지하여 번역을 시도하고, 만약 언어를 감지하지 못했다면 `TranslationError`를 발생시킵니다.<br>
이 때, 자동 언어 감지에서 최상의 결과를 얻으려면 최소 20자 이상의 샘플 문자열을 전달하는 것이 좋습니다.

### 번역 언어의 상태

```swift
enum Status {
    case installed
    case supported
    case unsupported
}
```

`Status` 열거형은 언어 또는 언어 쌍의 사용 가능 상태를 의미합니다.

`installed`는 프레임워크에서 해당 언어, 혹은 언어 쌍을 지원하며, 디바이스에 해당 언어가 설치되어 있어 번역에 사용할 수 있음을 의미합니다.<br>
`supported`는 프레임워크에서 해당 언어를 지원하지만, 디바이스에는 설치되어 있지 않아 사용할 수 없음을 의미합니다. 해당 언어를 번역에 사용하려면 먼저 디바이스에 언어를 설치해야 합니다.<br>
`unsupported`는 프레임워크에서 해당 언어를 지원하지 않음을 의미하며, 번역에 해당 언어를 사용할 수 없습니다.

참고로, `Translation` 프레임워크는 영국 영어(en-GB)에서 미국 영어(en-US)로의 번역 등 동일한 언어 간의 번역은 지원하지 않습니다.

# 번역 준비하기

```swift
class TranslationSession {
    func prepareTranslation() async throws
}
```

`TranslationSession`의 `prepareTranslation()` 메서드는 번역을 직접 수행하지는 않지만, 후에 번역을 수행하기 위해 번역 언어를 다운로드할 수 있는 권한을 사용자에게 요청합니다.

사용자가 번역해야하는 언어를 미리 알고 있는 경우, 이 메서드를 호출하여 해당 언어를 미리 다운로드하라는 메시지를 표시할 수 있습니다.<br>
이 메서드를 호출하면 `TranslationSession.Configuration`에서 사용된 `sourceLanguage` 및 `targetLanguage`를 다운로드할 수 있는 권한을 요청합니다. 언어가 미리 설치되었거나 다운로드 중이면 사용자에게 메시지를 표시하지 않고 함수가 반환됩니다.<br>
`sourceLanguage`가 `nil`일 때 이 함수를 호출하면 번역에 사용할 `source` 언어를 식별할 샘플 텍스트가 없으므로 `unableToIdentifyLanguage` 에러가 발생합니다.

아래의 코드는 언어 쌍을 다운로드하기 위해 사용자에게 권한을 묻는 시트를 표시하는 예제 코드입니다.

```swift title="ExampleView.swift"
struct ExampleView: View {
    @State private var configuration = TrnaslationSession.Configuration(source: Locale.Language(identifier: "ja_JP"), target: Locale.Language(identifier: "ko_KR"))
    ...

    var body: some View {
        ...
        Text("")
            .translationTask(configuration) { session in
                do {
                    try await session.prepareTranslation()
                } catch {
                    // 오류 처리
                }
            }
        ...
    }
}
```

# 마무리

이번 시간에는 `TranslationSession`의 개요와 `TranslationSession.Configuration`, `LanguageAvailability` 등 본격적인 커스텀 환경에서의 번역에 앞서, 사용가능한 언어를 확인하고 번역을 준비하는 방법을 알아보았습니다.<br>
다음 시간에는 커스텀 환경에서 실제로 번역을 하는 방법에 대해 알아보겠습니다.

참고자료

<!-- prettier-ignore -->
- [Apple Developer Documentation/SwiftUI/View/translationTask(\_:action:)](https://developer.apple.com/documentation/swiftui/view/translationtask(_:action:))
- [Apple Developer Documentation/SwiftUI/View/translationTask(source:target:action:)](https://developer.apple.com/documentation/swiftui/view/translationtask(source:target:action:))
- [Apple Developer Documentation/Translation/TranslationSession](https://developer.apple.com/documentation/translation/translationsession)
- [Apple Developer Documentation/Translation/TranslationSession/TranslationSession.Configuration](https://developer.apple.com/documentation/translation/translationsession/configuration)
- [Apple Developer Documentation/Translation/TranslationSession/prepareTranslation()](https://developer.apple.com/documentation/translation/translationsession/preparetranslation())
- [Apple Developer Documentation/Translation/LanguageAvailability](https://developer.apple.com/documentation/translation/languageavailability)
