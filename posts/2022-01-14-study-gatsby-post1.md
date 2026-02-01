---
title: "Gatsby 개발 환경 설정"
thumbnail: "https://github.com/user-attachments/assets/d9c49910-b2fd-4f9d-bfb8-830babb485c9"
created-date: "2022-01-14"
modified-date: "2022-01-14"
category: "react"
tags: ["react", "gatsby"]
description: "Windows 운영체제에서 Gatsby 개발 환경을 설치하는 방법"
---

# Gatsby 개발 환경 설정

- Table of Contents
{:toc .large-only}

## node.js 설치

gatsby를 설치하기 전에 node.js를 설치해야 한다.

node.js는 [Node.js 공식 웹사이트](https://nodejs.org/) 혹은 npm을 이용하여 설치할 수 있다.

또는 NVM을 사용하여 설치할 수도 있는데, 해당 내용은 본 블로그의 [리액트 개발 환경 설치하기](/study/react/2022-01-12-study-react-post1/#nvmnode-version-manager%EC%9C%BC%EB%A1%9C-nodejs-%EC%84%A4%EC%B9%98) 포스트에서 확인할 수 있다.

## Git 설치

Git을 사용하면 새 사이트에 필요한 파일을 다운로드하거나 코드를 클라우드에 푸시하여 다른 사람들이 볼 수 있도록 인터넷 사이트를 배포할 수 있다.

## Gatsby CLI

Gatsby CLI는 새로운 Gatsby 기반 사이트를 빠르게 생성하고 Gatsby 사이트 개발을 위한 명령을 실행할 수 있도록 하는 도구이다.

CLI는 npm 패키지이므로 npm을 사용하여 설치할 수 있다.

```powershell
> npm install -g gatsby-cli
```

설치 후에 아래의 명령을 실행하여 올바른 버전이 설치되었는지 확인한다.

```powershell
> gatsby --version
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   Gatsby collects anonymous usage analytics                            ║
║   to help improve Gatsby for all users.                                ║
║                                                                        ║
║   If you'd like to opt-out, you can use `gatsby telemetry --disable`   ║
║   To learn more, checkout https://gatsby.dev/telemetry                 ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
Gatsby CLI version: 4.5.1
```

--help 명령어를 사용하면 사용 가능한 명령을 확인할 수 있다.

```powershell
gatsby --help
Usage: gatsby <command> [options]

Commands:
  gatsby develop                      Start development server. Watches files, rebuilds, and hot reloads if something
                                      changes
  gatsby build                        Build a Gatsby project.
  gatsby serve                        Serve previously built Gatsby site.
  gatsby info                         Get environment information for debugging and issue reporting
  gatsby clean                        Wipe the local gatsby environment including built assets and cache
  gatsby repl                         Get a node repl with context of Gatsby environment, see
                                      (https://www.gatsbyjs.com/docs/gatsby-repl/)
  gatsby plugin <cmd> [plugins...]    Useful commands relating to Gatsby plugins
  gatsby new [rootPath] [starter]     Create new Gatsby project.
  gatsby telemetry                    Enable or disable Gatsby anonymous analytics collection.
  gatsby options [cmd] [key] [value]  View or set your gatsby-cli configuration settings.

Options:
  --verbose                Turn on verbose output                                             [boolean] [default: false]
  --no-color, --no-colors  Turn off the color in output                                       [boolean] [default: false]
  --json                   Turn on the JSON logger                                            [boolean] [default: false]
  -h, --help               Show help                                                                           [boolean]
  -v, --version            Show the version of the Gatsby CLI and the Gatsby package in the current project    [boolean]
```

