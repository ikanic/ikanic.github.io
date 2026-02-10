---
title: "Swift로 URLSession 사용해서 HTTP 통신하기"
created-date: "2022-06-12 19:06"
modified-date: "2022-06-12 19:06"
category: "Swift"
tags: ["URLSession", "http", "Swift", "글또 7기"]
description: "URLSession을 사용해 http 통신을 해보자"
---

Apple Developer Academy @POSTECH에 들어온지 어느덧 3달이 되었다.<br>
아카데미에서 첫 번째 팀 프로젝트와 개인 프로젝트를 마친 후에 개인적으로 사이드 프로젝트를 진행하고, 또 아카데미의 두 번째 팀 프로젝트에 들어오면서 개인적으로 느낀 점은 어떤 서비스에서 API 등으로 통신을 하지 않는다면 한정된 정보와 기능만을 가지게 될 것이고, 그렇기 때문에 서비스에서 API를 호출하고, 데이터를 주고 받는 것이 매우 중요한 것 같다는 것이었다.<br>
그래서 Swift에서 HTTP로 통신하는 방법을 찾아보았고, 그 중에서 URLSession을 사용하여 HTTP로 통신하는 방법에 대해 공부해보려한다.

# URLSession

우선 URLSession이 무엇인지에 대해 설명하자면, URLSession이란 HTTP/HTTPS 기반의 URL로부터 데이터를 주고받기 위한 API를 제공하는 클래스이다.<br>
URLSession은 다른 HTTP 통신과 마찬가지로 Request와 Response를 기본 구조로 갖고 있는데, Request는 URL 객체와 직접 통신하는 형태와 URLRequest 객체를 만들어서 옵션을 설정해서 통신하는 형태가 있다.<br>
다음으로 Response는 설정된 Task의 Completion Handler를 통해서 응답을 받거나, URLSessionDelegate의 메소드를 통해 응답 받는 방식이 있다.

## URLSession Life Cycle

URLSession은 기본적으로 아래와 같은 순서로 진행된다.

1. Session configuration을 결정하고 Session 생성
2. 통신할 URL과 Request 객체 설정
3. 사용할 Task를 결정하고, 그에 맞는 Completion Handler나 Delegate 메소드 작성
4. 해당 Task 실행
5. Task 완료 후 Completion Handler 실행

## URLSession 유형

URLSession은 기본 요청에 대한 싱글톤 Shared Session(공유 세션)이 있다.<br>
공유 세션은 사용자 정의가 불가하지만, 요구 사항이 매우 제한적인 경우 좋은 출발점 역할을 한다. shared class method를 호출하여 이 세션에 엑세스한다.<br>
다른 종류의 세션은 아래의 세 가지 구성 중 하나로 생성한다.<br>
첫 번째로 Default Session(기본 세션)은 기본적인 Session으로, 디스크가 포함된 글로벌 캐시, 자격증 및 쿠키 저장소 개체를 사용하는 개체를 생성한다.<br>
두 번째로 Emphmeral Session(임시 세션)은 캐시, 쿠키 또는 credential과 같이 영구 저장소를 사용하지 않는 세션 구성 개체를 생성한다.<br>
세 번째로 Background Session(백그라운드 세션)은 HTTPS 업로드 또는 다운로드를 백그라운드에서 수행할 수 있는 세션 구성 개체를 생성한다.

## URLSession 작업 유형

세션 내에서 선택적으로 데이터를 서버에 업로드하고, 디스크의 파일이나 메모리의 하나 이상의 NSData 개체로 서버에서 데이터를 검색하는 작업을 만든다. URLSession API는 아래의 네 가지 유형의 작업을 제공한다.<br>
URLSessionDataTask는 응답을 받아 Data 형태의 객체를 받아오는 작업을 한다.<br>
URLSessionUploadTask는 Data 객체나 파일 형태의 데이터를 서버로 업로드하는 작업을 한다.<br>
URLSessionDownloadTask는 파일 형태의 데이터를 다운로드하는 작업을 하며, 일시 정지하거나 재개하고, 또 취소할 수 있다.<br>
WebSocket 작업은 WebSocket 프로토콜을 사용하여 TCP 및 TLS를 통해 메시지를 교환한다.

# URLSession 실습

이번에는 위와 같은 내용으로 공부한 URLSession을 직접 사용해 볼 것이다.<br>
URLSession 실습에 사용될 API는 네이버 검색 API로 그 중에서도 [책 검색 API](https://developers.naver.com/docs/serviceapi/search/book/book.md#%EC%B1%85)를 사용해 볼 것이다.<br>
![책 검색 API 페이지](https://github.com/user-attachments/assets/21da28ca-cba4-4a2f-b2ed-5efe2ec35e38)
검색 API를 사용하기 위해 오픈 API 이용 신청을 해야하며, 애플리케이션 등록 시 발급받는 client id 값과 client secret 값이 통신에 요구된다.

## Model 파일 생성

우선 API로부터 가져올 JSON 데이터를 사용할 데이터 모델을 만들어야한다.<br>
데이터 모델을 만들기 위해서는 API를 호출했을 때, 어떤 형태의 JSON 데이터가 불러와지는 지 알아야하는데, 이것을 알아보기 위해 Postman을 사용할 것이다.<br>
Postman에 api url과 검색할 parameter를 넣어야 하는데, 네이버 책 검색 API는 아래와 같은 형태의 URL로 API를 사용할 수 있다.<br>
![책 검색 API 정보](https://github.com/user-attachments/assets/499148a4-40e8-4f3c-a23e-3db378fd956e)

**API 기본 정보**
|메서드|인증|요청 URL|출력 포맷|설명|
|:-:|:-:|:-:|:-:|:-:|
|GET|-|https://openapi.naver.com/v1/search/book.xml|XML|책 기본 검색|
|GET|-|https://openapi.naver.com/v1/search/book_adv.xml|XML|책 상세 검색|
|GET|-|https://openapi.naver.com/v1/search/book.json|JSON|책 기본 검색|

**요청 변수**
|요청 변수명|타입|필수 여부|기본값|설명|비고|
|:-:|:-:|:-:|:-:|:-:|:-:|
|query|string|-|-|검색을 원하는 문자열로서 UTF-8로 인코딩한다.|상세검색시 생략가능|

또한 네이버 API를 호출하기 위해서는 아래와 같은 값을 필요로 한다.

```bash title="호출 예시"
curl "https://openapi.naver.com/v1/search/book.xml?query=%EC%A3%BC%EC%8B%9D&display=10&start=1" \
    -H "X-Naver-Client-Id: {애플리케이션 등록 시 발급받은 클라이언트 아이디 값}" \
    -H "X-Naver-Client-Secret: {애플리케이션 등록 시 발급받은 클라이언트 시크릿 값}" -v
```

Postman에 query와 Header를 넣어주고 GET 요청을 하면 JSON 형식의 데이터가 불러와진다.<br>
![Postman 호출 예시](https://github.com/user-attachments/assets/656ac095-f413-4063-8cd6-ca42b43cf0af)
불러온 데이터를 기반으로 직접 데이터 모델을 작성할 수도 있지만, 이 데이터를 복사하여 [퀵타입(quicktype)](https://app.quicktype.io)에 넣어주면 알맞은 형태의 데이터 모델을 만들어준다.

```swift title="Model.swift"
import Foundation

// MARK: - BookModel
struct BookModel: Codable {
    let items: [Book]?
}

// MARK: - Book
struct Book: Codable {
    let title: String?
    let link: String?
    let image: String?
    let author, price, discount, publisher: String?
    let pubdate, isbn, description: String?
}
```

## NetworkManager 클래스 생성

다음으로는 위의 URLSession 통신 단계를 이용해 NetworkManager 클래스를 생성한다.

```swift title="NetworkManager.swift"
class NetworkManager: ObservableObject {
    @Published var bookList = [Book]()

    let urlString = "https://openapi.naver.com/v1/search/book.json?query=swift" // 네이버 API URL
    let clientID = "네이버 api client id"
    let clientSecret = "네이버 api client secret"

    init() {
        guard let url = URL(string: urlString) else {
            return
        }

        var requestURL = URLRequest(url: url)
        requestURL.addValue(clientID, forHTTPHeaderField: "X-Naver-Client-Id")
        requestURL.addValue(clientSecret, forHTTPHeaderField: "X-Naver-Client-Secret")
        URLSession.shared.dataTask(with: requestURL) { data, _, _ in
            guard let data = data else {
                return
            }

            do {
                let result = try JSONDecoder().decode(BookModel.self, from: data)

                DispatchQueue.main.async {
                    self.bookList = result.items ?? [Book]()
                }
            } catch {
                print("\(error.localizedDescription)\n\(error)")
            }
        }.resume()
    }
}
```

코드에 `@Published`라는 프로퍼티 래퍼가 나오는데, `@Published`와 뒤에 나올 `@ObservedObject`, `@ObservableObject` 등에 대해서는 다음에 다시 소개하고, 지금은 간단하게 RxSwift의 기능 중 Combine에 속해있고, 뷰 밖의 클래스에서 사용 가능한 프로퍼티 래퍼라고만 설명하겠다.

```swift
class NetworkManager: ObservableObject {
    @Published var bookList = [Book]()
```

우선, `@Published` 프로퍼티 래퍼를 사용하기 위해 `NetworkManager` 클래스에 `ObservableObject` 프로토콜을 채택한다.<br>
`@Published` 프로퍼티 래퍼를 이용하여 다른 뷰에서 이 프로퍼티를 사용하고, 값이 변경되는 것을 알려줄 수 있다.

```swift
let urlString = "https://openapi.naver.com/v1/search/book.json?query=swift" // 네이버 API URL
let clientID = "네이버 api client id"
let clientSecret = "네이버 api client secret"
```

urlString에 네이버 API URL을 저장하고, clientID와 clientSecret이라는 변수에 네이버 API 사용 신청 후 애플리케이션 등록시 발급받은 client id와 client secret을 저장했다.

```swift
var requestURL = URLRequest(url: url)
requestURL.addValue(clientID, forHTTPHeaderField: "X-Naver-Client-Id")
requestURL.addValue(clientSecret, forHTTPHeaderField: "X-Naver-Client-Secret")
```

그 후에 통신할 Request 객체에 addValue를 이용해 clientId와 clientSecret 값을 Header에 추가한다.

```swift
let result = try JSONDecoder().decode(BookModel.self, from: data)
```

JSONDecoder를 이용해 JSON 구조를 struct로 변경하고,

```swift
DispatchQueue.main.async {
    self.bookList = result.items ?? [Book]()
}
```

DispatchQueue 부분에서 통신에 성공한 데이터를 @Published 프로퍼티 래퍼로 지정되어 있는 bookList 프로퍼티에 담는다.

## BookItem 생성

다음으로는 불러온 데이터를 입힐 BookItem이라는 View를 만들 것이다.

```swift title="BookItem.swift"

import SwiftUI

struct BookItem: View {
    var book: Book

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(book.title ?? "제목")
                    .bold()
                    .font(.system(size: 24))
                Spacer()
                Text(book.author ?? "저자")
                    .foregroundColor(Color.gray)
            }
            Text(book.description ?? "설명")
        }
        .padding()
    }
}
```

## ContentView에서 불러오기

마지막으로 BookItem을 ContentView에서 불러온다.

```swift title="ContentView.swift"
import SwiftUI

struct ContentView: View {
    @ObservedObject var networkManager = NetworkManager()
    var body: some View {
        NavigationView {
            List(networkManager.bookList, id: \.title) { book in
                Group {
                    BookItem(book: book)
                }
            }
        }
    }
}
```

```swift
@ObservedObject var networkManager = NetworkManager()
```

위 코드를 보면 ObservableObject를 채택한 NetworkManager 인스턴스가 @ObservedObject 프로퍼티 래퍼로 지정되어 있는 것을 알 수 있다.<br>
NetworkManager의 생성자에서 URLSession을 이용해 api 통신을 수행하고 성공적으로 JSON이 struct로 변경되어 bookList의 값을 변경하면 ContentView에서 값이 변경된 것을 알 수 있다.

```swift
List(networkManager.bookList, id: \.title) { book in
    Group {
        BookItem(book: book)
    }
}
```

위 코드에서 networkManager의 bookList로 List를 그려주고, 셀은 이전에 만든 BookItem으로 지정한다.

그 후에 시뮬레이터를 돌려보면 다음과 같은 형태로 책 정보를 정상적으로 불러온 것을 알 수 있다.<br>
![시뮬레이터](https://github.com/user-attachments/assets/c151b1ba-aa26-4c48-973e-670db18ee67f)

# 후기

이렇게 Swift로 URLSession을 사용해 통신하는 방법을 정리해봤는데, 아직 이해가 가지 않는 부분도 많고 정리가 덜 된 부분도 많아서 더 공부해보며 다시 정리해봐야겠다.

# 참고자료

- [Apple Developer Documentation/Foundation/URLSession](https://developer.apple.com/documentation/foundation/urlsession)
- [HCN DEV - iOS URLSession 이해하기](https://hcn1519.github.io/articles/2017-07/iOS_URLSession)
- [NB#log - Swift로 API Request를 전송하기](https://velog.io/@altmshfkgudtjr/Swift%EB%A1%9C-API-Request%EB%A5%BC-%EC%A0%84%EC%86%A1%ED%95%98%EA%B8%B0)
- [후리스콜링개발 - [iOS] URLSession 사용해서 서버 통신해보기 (feat. 네이버 Movie API)](https://roniruny.tistory.com/163)
- [김종권의 iOS 앱 개발 알아가기 - [iOS - swift] URLSession 네트워크 통신 기본 (URLSessionConfiguration, URLSession, URLComponents, URLSessionTask)](https://ios-development.tistory.com/651)
- [슈프림 블로그 - [iOS/Swift] HTTP/HTTPS 통신의 기본, URLSession](https://tngusmiso.tistory.com/50)
