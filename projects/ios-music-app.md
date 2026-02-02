---
title: "iOS 음악 플레이어 앱"
description: "Swift와 SwiftUI를 사용하여 개발한 음악 스트리밍 앱입니다. AVFoundation을 활용한 고품질 오디오 재생과 CoreData를 이용한 플레이리스트 관리를 구현했습니다."
category: "iOS"
tags: ["Swift", "SwiftUI", "AVFoundation", "CoreData"]
thumbnail: "https://example.com/thumbnail.png"
period: "2023.06 - 2023.12"
team: "1인 개발"
role: "iOS Developer"
links:
    - type: "appstore"
      url: "https://apps.apple.com/example"
      label: "App Store"
    - type: "github"
      url: "https://github.com/example"
      label: "GitHub"
    - type: "video"
      url: "https://youtube.com/example"
      label: "Demo Video"
---

# 프로젝트 소개

iOS 음악 플레이어 앱은 사용자가 자신만의 음악 라이브러리를 관리하고, 고품질 오디오를 스트리밍할 수 있는 앱입니다.

## 주요 기능

### 1. 음악 재생

AVFoundation 프레임워크를 활용하여 고품질 오디오 재생을 구현했습니다.

```swift
import AVFoundation

class AudioPlayer: ObservableObject {
    @Published var isPlaying = false
    private var player: AVAudioPlayer?

    func play(url: URL) {
        do {
            player = try AVAudioPlayer(contentsOf: url)
            player?.play()
            isPlaying = true
        } catch {
            print("재생 실패: \(error)")
        }
    }

    func pause() {
        player?.pause()
        isPlaying = false
    }
}
```

### 2. 플레이리스트 관리

CoreData를 사용하여 사용자의 플레이리스트를 로컬에 저장하고 관리합니다.

```swift
import CoreData

class PlaylistManager {
    let container: NSPersistentContainer

    init() {
        container = NSPersistentContainer(name: "MusicApp")
        container.loadPersistentStores { _, error in
            if let error = error {
                print("CoreData 로드 실패: \(error)")
            }
        }
    }

    func createPlaylist(name: String) {
        let playlist = Playlist(context: container.viewContext)
        playlist.name = name
        playlist.createdAt = Date()

        try? container.viewContext.save()
    }
}
```

### 3. UI/UX 디자인

SwiftUI를 활용하여 직관적이고 아름다운 사용자 인터페이스를 구현했습니다.

## 기술적 도전

### 백그라운드 재생

iOS의 백그라운드 오디오 재생을 구현하기 위해 여러 시행착오를 겪었습니다.

```swift
// Info.plist 설정
<key>UIBackgroundModes</key>
<array>
    <string>audio</string>
</array>

// Audio Session 설정
let audioSession = AVAudioSession.sharedInstance()
try? audioSession.setCategory(.playback, mode: .default)
try? audioSession.setActive(true)
```

### 성능 최적화

- 이미지 캐싱을 통한 스크롤 성능 개선
- Lazy Loading으로 메모리 사용량 감소
- Combine을 활용한 비동기 데이터 처리

## 배운 점

이 프로젝트를 통해 다음과 같은 것들을 배웠습니다:

1. **AVFoundation 심화**: 오디오 재생의 세밀한 제어 방법
2. **CoreData 최적화**: 대용량 데이터 처리 방법
3. **SwiftUI 상태 관리**: @StateObject, @ObservedObject의 차이
4. **앱 아키텍처**: MVVM 패턴의 실전 적용

## 향후 계획

- [ ] 음악 추천 알고리즘 추가
- [ ] 소셜 기능 (플레이리스트 공유)
- [ ] Apple Music API 연동
- [ ] iPad 최적화

## 스크린샷

![메인 화면](https://example.com/screen1.png)
![플레이어 화면](https://example.com/screen2.png)
![플레이리스트](https://example.com/screen3.png)

## 마무리

첫 iOS 개인 프로젝트로 많은 것을 배울 수 있었습니다. 특히 실제 앱 스토어에 배포하면서 겪은 심사 과정과 사용자 피드백을 통해 성장할 수 있었습니다.
