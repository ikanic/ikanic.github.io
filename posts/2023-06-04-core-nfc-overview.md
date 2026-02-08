---
title: "[Core NFC] Core NFC 훑어보기"
created-date: "2023-06-04 16:52"
modified-date: "2023-06-04 16:52"
category: "Swift"
tags: ["iOS", "Swift", "글또 8기", "Core NFC", "Framework", "NFC", "훑어보기"]
description: "iOS에서 NFC를 사용하기 위한 Core NFC에 대해 알아보자"
---

이번 시간에는 `Core NFC`에 대해 알아보겠습니다.

# NFC

우선 Core NFC에 대해 알아보기 전에, NFC 기술에 대해 간단하게 알아볼까요?

_NFC(Near Field Communication)_ 은 이름에서 알 수 있듯 가까운 거리에 있는 장치 간에 정보를 교환할 수 있도록 하는 근거리 무선 통신 기술입니다.<br>
13.56MHz의 주파수를 사용하여 약 10cm 내외의 거리에서 두 전자기기가 서로 통신할 수 있도록 합니다.

## NFC와 RFID

흔히 NFC를 RFID와 구분하지 못하고 혼동하곤 하는데, 둘은 사실 서로 엄연히 다른 규격입니다.<br>
NFC를 RFID의 완전한 서브셋으로 생각하는 경우도 꽤 많은데요. 사실 이 둘은 완벽하게 슈퍼셋 서브셋 관계보다는 서로 교집합 관계에 더 가깝다고 볼 수 있습니다.<br>
다만, NFC가 RF에 기반하다보니 서브셋이라고 보는 것도 무리는 아니겠네요.

RFID와 NFC의 차이를 간단하게 보자면 아래와 같습니다.

|              |                       RFID                        |                NFC                |
| :----------: | :-----------------------------------------------: | :-------------------------------: |
| 사용 주파수  |                 125KHz ~ 2.45GHz                  |             13.56MHz              |
|   연결범위   |                     최대 100m                     |             10cm 내외             |
|     통신     |         단방향 통신<br>(태그 / 리더 별도)         | 양방향 통신<br>(태그 / 리더 통합) |
| 주 사용 범위 | 개인뿐만 아니라 물류 등 각종 산업에서 활발히 이용 |     모바일 기기 등 개인 단말      |
|     장점     |                 장거리 인식 가능                  |            높은 보안성            |

# Core NFC

이제 Core NFC에 대해 본격적으로 알아보겠습니다.

아이폰에서는 아이폰 6부터 애플 페이를 위해 NFC 모듈을 장착하기 시작했으나, 이 때는 NFC를 오직 애플 페이만을 위해 사용할 수 있었고, 그 외의 다른 방식으로는 사용할 수 없었습니다.

iOS 11부터 시작된 Core NFC는 아이폰 7 시리즈 이상의 기종에서 애플 페이 이외의 용도로 NFC 기능을 사용할 수 있게 하기 위해 WWDC 2017에서 애플이 공개한 프레임워크입니다.<br>
이 때는 NFCReaderSession이라는 클래스를 통해 NFC 정보를 오직 읽는 것만 가능했습니다.

CoreNFC는 아래의 표준 및 기술을 사용할 수 있는데요.<br>
NFC는 하나의 표준이 아니라 여러 표준 및 기술의 집합인데요. Core NFC는 아래의 표준 및 기술을 사용할 수 있습니다.
![NFC 태그 타입](https://github.com/user-attachments/assets/e3e23f01-e41a-4f3b-a74e-fe0ccba8b146)
^^이미지 출처: WWDC 2017 CoreNFC^^

NFC 태그 타입과 기술의 특징을 모두 설명할 수 있다면 좋겠지만, 글이 너무 길어지는 관계로 대략적인 특징을 아래에 접어두겠습니다.<br>
조금 더 알고 싶으신 분들은 아래의 토글을 펼쳐서 확인하시면 좋을 것 같네요.

:::toggle NFC Tag Type
NFC 태그는 1~5까지의 유형이 있습니다.

<!-- prettier-ignore -->
| |NFC Type-1|NFC Type-2|NFC Type-3|NFC Type-4|NFC Type-5<br>(Mifare Classic Tag)|
|:-:|:-:|:-:|:-:|:-:|:-:|
|표준|<-2>ISO-14443A|ISO-18092,<br>JIS-X-6319-4|NXP DESFire Tag<br>(ISO-14443A)|ISO-14443A,<br>MF1 IC S50|
|메모리 사이즈|96 Bytes|48 / 144 Bytes|1 / 4 / 9 KB|4 / 32 KB|192 / 768 / 3584 Bytes|
|속도|<-2>106 Kbps|212 / 424 Kbps|106 / 212 / 424 Kbps|106 Kbps|
|데이터 접근|<-5> 읽기 / 쓰기 또는 읽기 전용|
|충돌 메커니즘|데이터 충돌 보호 기능 사용 불가|<-4> 충돌 방지 기능 사용 가능|
|제품|Innovision Topaz|NXP Mifare Ultralight,<br>NXP Mifare Ultralight C|Sony FeliCa|NXP DESFire,<br>NXP SmartMX-JCOP|NXP Mifare Classic 1K,<br>NXP Mifare Classic 4K,<br>NXP Mifare Classic Mini|
|가격|저렴|저렴|비쌈|보통 / 비쌈|저렴|

:::

:::toggle NFC RF
**NFC-A**는 ISO/IEC 14443 Type A를 발전 시킨 기술이고, **NFC-B**는 ISO/IEC 14443 Type B를 기반으로 발전하여, Type A와 상호 호환 가능한 보완적인 기술입니다.

**NFC-F**는 Sony가 개발한 FeliCa를 기반으로 하는 NFC 기술입니다.<br>
앞의 두 기술에 비해 대중적인 기술은 아니며, 주로 사용하는 지역은 일본, 홍콩, 싱가포르, 중국의 충칭/시안, 태국 방콕, 인도네시아 자카르타 등입니다.<br>
반응 속도나 기능이 14443 표준보다 압도적이지만, 실용화도 늦었고 라이센스 비용도 비싸 국제적인 입지는 낮은편이라고 합니다.

**NFC-V**는 ISO/IEC 15693을 기반으로 하는 NFC 기술로, 앞의 세 종류에 비해 널리 상용화되지는 않았습니다.
:::

이러한 기술과 표준들이 모여서 NFC를 구성하고 있으며, 애플도 업데이트 때마다 조금씩 이러한 기술과 표준들을 추가하고 있습니다.

## Core NFC를 사용하기 위한 요구사항

Core NFC를 사용하기 위해서는 몇가지 요구사항이 있습니다.<br>
우선, Core NFC는 Entitlement-protective 프레임워크입니다.<br>
그렇기 때문에 Xcode에서 근거리 통신 태그 읽기에 관한 entitlement를 켜줘야합니다.<br>
![NFC Entitlement](https://github.com/user-attachments/assets/128f4b8c-8f6e-4e58-bd26-c39e03c2605e)
또한, info.plist에 NFC 스캔을 시작할 때 사용자에게 표시될 텍스트를 설정해야만 합니다.<br>
![info.plist](https://github.com/user-attachments/assets/b75d9aab-a78c-4fb5-97b5-818e0986f497)

## Core NFC에 대한 추가 사항

Core NFC에 대한 몇가지 추가사항이 있는데, 아래와 같습니다.

**태그 읽기는 On-demand 프로세스입니다.**<br>
그렇기 때문에 애플리케이션이 세션을 사용하여 태그 읽기 활동에 대한 요청을 주어야만 태그 읽기 활동을 시작할 수 있습니다.

**태그 읽기 활동을 시작하려면 애플리케이션이 Foreground에 있어야 합니다.**<br>
애플리케이션이 Background에 있거나, 혹은 실행되고 있지 않다면 태그 읽기 세션이 종료됩니다.<br>
하지만, 이는 **WWDC 2018에서 Background에서 NFC 읽기 기능이 추가**되면서 애플리케이션이 반드시 Foreground에 있을 필요가 없어졌습니다.<br>
WWDC 2018에서 추가된 Background 읽기를 통해 NFC 태그를 읽고 적절한 앱에 정보를 전달할 수 있으며, 필요한 앱을 실행하거나 Background에 있는 앱을 Foreground 상태로 가져올 수 있습니다.<br>
Background 읽기 기능은 아이폰 XR | XS | XS Max 시리즈 부터 사용 가능합니다.

**각 태그 읽기 활동은 한 번에 60초로 제한됩니다.**<br>
세션 시간이 초과되거나 무효화된 경우 애플리케이션은 다른 태그 읽기 활동을 시작하기 위해 새 세션을 생성해야만 합니다.

**단일 태그 또는 여러 태그를 읽도록 세션 구성이 가능합니다.**<br>
단일 태그 읽기 모드에서는 태그를 1개 읽은 후 세션이 자동으로 종료됩니다.<br>
반면, 다중 태그 읽기 모드에서는 태그를 1개 읽었다고 세션이 종료되지 않고, 사용자가 세션을 직접 취소하거나, 60초 제한 시간에 도달할 때까지 태그 읽기 모드가 활성 상태로 유지되어 읽기 모드가 활성 상태일 동안 태그를 1개씩 계속 읽을 수 있습니다.

태그 읽기 활동이 진행되는 동안 `info.plist`에 정의된 NFC 사용 문자열이 사용자에게 표시됩니다.

WWDC 2019에서는 CoreNFC의 기능 향상이 있었는데요.<br>
드디어 **Core NFC를 이용하여 NFC 태그에 쓰기를 지원**하게 되었습니다.<br>
이로인해 Core NFC를 이용한 앱이 NFC 태그를 읽고, 쓰거나 포맷할 수 있으며, 기본 프로토콜을 사용하여 태그와 상호작용할 수 있게 되었습니다.

iOS 13부터는 NFCTagReaderSession을 사용하여 다양한 형식의 NFC 태그를 읽을 수 있게 되었습니다.<br>
하지만, 여전히 읽지 못하는 태그도 많은 것 같네요.

그 외에도 WWDC 2020에서는 ISO15693 프로토콜이 업데이트 되었습니다.

# 마무리

오늘은 이렇게 Core NFC에 대해 가볍게 훑어보았습니다.<br>
기회가 된다면 Core NFC도 자세하게 볼 수 있다면 좋겠네요.

## 후기

NFC 기술 자체에 관심이 있어서 시작한 Core NFC였는데, 생각보다 Core NFC가 범위가 넓은 편이네요.

공부한 내용을 지난 주에 스터디에서 발표하기도 했는데, 발표 내용을 블로그로 옮기려다보니 구성이나 순서가 달라져서 사실상 글을 새로 쓴 것과 같이 되어버려서 시간도 너무 오래 걸려버렸어요.

테스트 해보고 싶어서 NFC 태그도 구매해서 이렇게 저렇게 가지고 놀아봤는데, 아직까지는 코드를 설명할 만큼은 안되는 것 같아서 코드에 대한 부분을 못 넣은게 많이 아쉽네요.<br>
조만간 Core NFC 코드에 대해서도 더 공부해서 작성할 수 있었으면 좋겠습니다.

# 레퍼런스

- [Apple Developer Documentation/Core NFC](https://developer.apple.com/documentation/corenfc)
- [WWDC2017 - Introducing Core NFC](https://developer.apple.com/videos/play/wwdc2017/718)
- [Apple Tech Talks - What's New in Core NFC](https://developer.apple.com/videos/play/tech-talks/702)
- [WWDC2019 - Core NFC Enhancements](https://developer.apple.com/videos/play/wwdc2019/715)
- [WWDC2020 - What's new in Core NFC](https://developer.apple.com/videos/play/wwdc2020/10209)
