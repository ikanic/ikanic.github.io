---
title: "[Translation] iOS 앱에서 네트워크 상의 텍스트 다국어 지원하기 3️⃣ / 커스텀 환경에서 번역 제공하기"
thumbnail: "https://github.com/user-attachments/assets/396c69c4-603f-429e-9e7a-53fb00d598ef"
created-date: "2025-02-02 23:45"
modified-date: "2025-02-02 23:45"
category: "Swift"
tags: ["Translation", "Framework", "iOS", "SwiftUI", "글또 10기"]
series: "Translation"
seriesOrder: 3
description: "iOS 앱에서 네트워크 상의 텍스트에 다국어를 지원해보자 - 커스텀 환경 실습"
---

지난 시간에는 커스텀 환경에서 번역을 제공하는 방법에 대해 알아보기 전, `TranslationSession`의 간략한 개요와 커스텀 환경에서 번역을 제공하기 위한 준비를 하는 방법을 알아보았습니다.<br>
이번, 마지막 3부에서는 지난 시간에 알아본 `TranslationSession`을 이용해 커스텀 환경에서 번역을 제공하는 방법에 대해 알아보겠습니다.

# 커스텀 번역 환경의 구성

번역할 문자열을 메서드로 보내기만 하면 알아서 화면에 보여줬던 시스템 내장 UI 환경과 다르게 커스텀 환경에서의 번역은 요청과 응답으로 이루어져, 문자열을 이용해 요청을 만들고 이를 메서드를 이용해 번역하고, 메서드에서 반환받은 응답을 직접 처리해야 합니다.

## 커스텀 번역 요청

커스텀 환경에서의 번역 요청은 직접 `String`을 요청하는 방법과 `Request`를 만드는 방법으로 이루어져 있습니다.

직접 `String`을 이용하는 방식은 단일 텍스트 문자열을 번역할 때 사용되며, 메서드에 직접 문자열을 넣기만 하면 되기 때문에 뒤에서 `translate(\_:)` 메서드를 설명할 때 간략히 알아보도록 하겠습니다.

```swift
class TranslationSession {
    struct Request {
        var sourceText: String
        var clientIdentifier: String? = nil
    }
}
```

`Reqeust`는 번역할 단일 텍스트 항목을 포함하고 있는 구조체로, 일반적으로 메서드의 파라미터에 `Request`의 배열 형태로 사용됩니다.<br>
`sourceText` 파라미터에는 번역하려는 문자열을 설정, `clientIdentifier` 파라미터에는 중복되지 않는 유일한 문자열을 설정하여 응답 식별이 필요할 때 사용할 수 있습니다.

## 커스텀 번역 응답

커스텀 환경에서의 번역 응답은 일반적인 응답을 반환하는 `Response`와 응답을 비동기적으로 반환하는 `BatchResponse`로 이루어져 있습니다.

```swift
class TranslationSession {
    struct Response {
        let sourceLanguage: Locale.Language
        let targetLanguage: Locale.Language
        let sourceText: String
        let targetText: String
        let clientIdentifier: String? = nil
    }
}
```

`Response`는 문자열을 번역한 후 또는 여러 번역 요청을 전달하는 일괄 번역 메서드 중 하나를 호출하면 얻게 되는 단일 응답 구조체입니다.<br>
번역이 완료되면 `Response` 인스턴스가 번역 결과와 함께 번역을 수행하는 데 사용된 프레임워크의 프로퍼티 `sourceText`, `clientIdentifier`, `sourceLanguage`, `targetLanguage`와 함께 반환됩니다.

`sourceText`와 `clientIdentifier`는 `Request`에서 입력받은 값을 그대로 반환하며, `sourceText`는 번역할 원본 텍스트를,` clientIdentifier`는 `Request`에서 설정된 문자열과 일치하는 고유 식별자로, 이 식별자를 사용하여 번역 요청과 응답을 연결합니다. 만약 `Request`에서 식별자를 설정하지 않았다면 이 값은 nil이 됩니다.

`sourceLanguage`는 `sourceText`의 언어이며, `targetLanguage`는 번역할 언어로 프레임워크에서 미리 설정된 언어가 있었다면 그 언어를, 그렇지 않다면 `sourceText`의 언어와 사용자의 디바이스 시스템 언어를 인식하여 가장 유사한 언어로 값을 설정합니다.

`targetText`는 `sourceText`를 `targetLanguage`의 언어로 번역한 결과물로, 실제 번역을 표시하는 데 사용됩니다.

```swift
class TranslationSession {
    struct BatchResponse {
        typealias Element = TranslationSession.Response

        struct AsyncIterator {
            typealias Element = TranslationSession.BatchResponse.Element
            func next() async throws -> Element?
        }

        func makeAsyncIterator() -> AsyncIterator
    }
}
```

`BatchResponse`는 번역 응답에 대한 비동기 액세스를 제공하는 타입으로, `TranslationSession.Response`의 인스턴스를 비동기적으로 반환하고 문제가 발생하면 오류를 발생시킵니다.

`AsyncIterator`는 비동기 시퀀스의 요소를 생성하는 비동기 이터레이터 타입으로, 비동기적으로 다음 요소를 반환하며 계속 진행하거나 다음 요소가 없는 경우 `nil`을 반환해 시퀀스를 종료하는 `next` 메서드를 포함하고 있습니다.<br>
`makeAsyncIterator` 메서드는 비동기 시퀀스의 요소를 생성하는 비동기 이터레이터를 생성합니다.

간단하게 말해, `BatchResponse`는 여러 요청이 들어왔을 때, 이 요청을 비동기로 처리하는 구조체입니다.

# 커스텀 환경에서 번역하기

커스텀 환경에서 번역은 시스템 내장 UI 번역과는 다르게 번역에 필요한 언어가 반드시 미리 다운로드되어 있어야 합니다.<br>
만약, 번역에 필요한 언어가 사전에 다운로드 되어 있지 않다면 언어 다운로드 UI를 통해 사용자에게 언어를 다운로드할 권한을 요청합니다.<br>
이를 통해 언어의 다운로드가 완료되면 프레임워크는 번역을 수행하게 됩니다.<br>
이 때, 언어가 다운로드되는 동안 몇 분 정도의 시간이 걸릴 수 있습니다.

커스텀 번역 환경에서는 `sourceLanguage` 및 번역할 텍스트를 통해서 번역해야 할 언어를 감지하는데, 만약 `sourceLanguage`가 `nil`이고, 번역할 텍스트를 통해 정확한 언어를 감지할 수 없는 경우 프레임워크는 사용자에게 소스 언어를 선택하라는 메시지를 표시합니다.

또한, 여러 문자열을 동시에 번역할 때, `Translation`은 동일한 언어의 문자열 번역만 지원하기 때문에 문자열이 `Configuration`에서 설정한 `sourceLanguage`와 일치하거나, `sourceLanguage`가 `nil`인 경우 번역할 텍스트가 모두 같은 언어여야만 합니다.

커스텀 환경에서의 번역 함수들은 경우에 따라 오류를 발생시킬 수 있는데, 다음과 같은 경우 오류를 발생시킵니다.

- 사용자가 언어 다운로드에 동의하지 않는 경우
- 언어가 다운로드되는 동안 사용자가 진행률 UI를 닫은 경우
- `TranslationSession`의 유효성을 검사하지 못한 경우
- 그 외에 번역을 수행하는 동안 문제가 발생한 경우

언어가 다운로드되는 동안 누군가 진행률 UI를 닫으면 시스템에서 `CocoaError/userCancelled` 오류가 발생하고 언어가 백그라운드에서 계속 다운로드 됩니다.

## 단일 텍스트 문자열 번역

```swift
func translate(\_ string: String) async throws -> TranslationSession.Response
```

`translate(\_:)` 메서드는 단일 텍스트 문자열을 번역하는 메서드로, 앞으로 설명할 3가지 메서드 중 유일하게 `Request`가 아닌 `String`을 통해 번역을 요청하는 메서드입니다.

`string` 파라미터에 입력된 원본 텍스트를 온디바이스에서 번역하여 `Response` 인스턴스의 형태로 반환합니다.

단순하고 짧은 문자열을 번역할 때 사용하기 좋으며, 아래 코드와 같이 사용할 수 있습니다.

```swift title="CommentView.swift"
struct CommentView: View {
    let originalText: String
    @State private var targetText = ""
    @State private var configuration: TranslationSession.Configuration?

    var body: some View {
        VStack {
            Text("번역할 텍스트: \(originalText)")
            Button("번역") {
                guard configuration == nil else {
                    configuration?.invalidate()
                    return
                }

                configuration = .init()
            }
            Text("번역된 텍스트: \(targetText)")
        }
        .translationTask(configuration) { session in
            do {
                let response = try await session.translate(sourceText)
                targetText = response.targetText
            } catch {
                // 오류 처리
            }
        }
    }
}
```

## 여러 텍스트 문자열을 한 번에 번역

```swift
func translations(from batch: [TranslationSession.Request]) async throws -> [TranslationSession.Response]
```

`translations(from:)` 메서드는 동일한 언어의 여러 텍스트 문자열을 번역하여 완료되면 결과를 한 번에 반환하는 메서드입니다.

번역하려는 텍스트 문자열을 `Request` 타입의 배열로 `from` 파라미터에 전달하며, 배열의 모든 요청을 처리한 후에 한 번에 결과를 반환하기 때문에 아래에서 설명할 `translate(batch:)`보다는 반환하는 데 시간이 오래 걸리지만 전송된 요청의 순서와 동일한 순서로 응답을 반환하기 때문에 요청과 응답을 매핑할 필요가 없다는 장점이 있습니다.

동일한 언어 간의 여러 문자열을 번역할 때 가장 효율적으로 사용할 수 있으며, 아래와 같이 사용할 수 있습니다.

```swift title="ContentView.swift"
struct ContentView: View {
    @Environment(CommentService.self) var commentService
    @State private var configuration: TranslationSession.Configuration?

    var body: some View {
        NavigationStack {
            VStack {
                ForEach(commentService.comments, id: \.self) { comment in
                    CommentView(comment: comment)
                }
            }
            .toolbar(content: {
                Button {
                    guard configuration == nil else {
                        configuration?.invalidate()
                        return
                    }

                    configuration = .init()
                } label: {
                    Image(systemName: "translate")
                }
                .translationTask(configuration) { session in
                    Task { @MainActor in
                        let requests: [TranslationSession.Request] = commentService.comments.map { TranslationSession.Request(sourceText: $0.originalText) }

                          do {
                                let responses = try await session.translations(from: requests)

                                for idx in responses.indices {
                                    commentService.comments[idx].translatedText = responses[idx].targetText
                                }
                          } catch {
                              // 오류 처리 코드
                          }
                    }
                }
            })
        }
    }
}
```

## 여러 텍스트 문자열의 번역 결과가 도착하는 대로 표시

```swift
func translate(batch: [TranslationSession.Request]) -> TranslationSession.BatchResponse
```

`translate(batch:)` 메서드는 `translations(from:)`과 같이 동일한 언어의 여러 텍스트 문자열을 번역하는 데 사용할 수 있습니다.

번역할 텍스트 문자열을 `Request`로 전달하면 `BatchResponse` 타입으로 값을 반환하는데, `Response`와 달리 `BatchResponse`는 응답의 순서를 요청의 순서와 같게 보장해 주지 않고, 먼저 처리되는 데로 결과를 처리하기 때문에 응답과 요청을 일치시킬 수 있도록 반드시 요청에 `clientIdentifier`를 설정해야 합니다.

일반적으로 `clientIdentifier`에는 식별하기 좋은 고유 문자열 식별자를 사용하거나, 배열에서 번역할 항목의 인덱스 숫자를 할당하는 경우가 많습니다.

# 마무리

이번 시간으로 `Translation` 3부작이 모두 끝났습니다.<br>
이번 시간에는 드디어 마지막으로 커스텀 환경에서 번역을 제공하는 방법을 알아보았는데요.<br>
이 프레임워크를 통해 더 자연스러운 UI로 번역을 제공하는 앱이 많아지면 좋겠습니다.

# 참고자료

- [Apple Developer Documentation/Translation/TranslationSession/TranslationSession.Request](https://developer.apple.com/documentation/translation/translationsession/request)
- [Apple Developer Documentation/Translation/TranslationSession/TranslationSession.Response](https://developer.apple.com/documentation/translation/translationsession/response)
- [Apple Developer Documentation/Translation/TranslationSession/TranslationSession.BatchResponse](https://developer.apple.com/documentation/translation/translationsession/batchresponse)
- [Apple Developer Documentation/Translation/TranslationSession/translate(\_:)](<https://developer.apple.com/documentation/translation/translationsession/translate(_:)>)
- [Apple Developer Documentation/Translation/TranslationSession/translate(batch:)](<https://developer.apple.com/documentation/translation/translationsession/translate(batch:)>)
- [Apple Developer Documentation/Translation/TranslationSession/translations(from:)](<https://developer.apple.com/documentation/translation/translationsession/translations(from:)>)
