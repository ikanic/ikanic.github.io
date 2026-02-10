---
title: "리액트 개발 환경 설치하기"
thumbnail: "https://github.com/user-attachments/assets/9e28e063-21ec-49db-b7ca-d2d97a0f3244"
created-date: "2022-01-12"
modified-date: "2022-01-12"
category: "React"
tags: ["React"]
description: "Windows 운영체제에서 리액트 개발 환경을 설치하는 방법"
---

# 리액트 개발 환경 설치하기

## NVM(node version manager)으로 node.js 설치

### NVM 설치

react를 설치하기에 앞서 node.js를 설치해야 하는데, NVM은 node version manager의 약자로 node.js의 설치나 버전 관리를 도와주는 프로그램이다.

아래의 주소에서 nvm-setup.zip을 내려받아 압축을 해제한 뒤, 설치 파일을 실행하여 NVM을 설치한다.

```markdown
https://github.com/coreybutler/nvm-windows/releases
```

### NVM 버전 확인

NVM이 설치되면 명령 프롬프트를 열어 nvm -v 명령어 입력하여 NVM의 정상 설치 및 버전을 확인한다.

```powershell
> nvm -v

Running version 1.1.9.

Usage:

  nvm arch                     : Show if node is running in 32 or 64 bit mode.
  nvm current                  : Display active version.
  nvm install <version> [arch] : The version can be a specific version, "latest" for the latest current version, or "lts" for the
                                 most recent LTS version. Optionally specify whether to install the 32 or 64 bit version (defaults
                                 to system arch). Set [arch] to "all" to install 32 AND 64 bit versions.
                                 Add --insecure to the end of this command to bypass SSL validation of the remote download server.
  nvm list [available]         : List the node.js installations. Type "available" at the end to see what can be installed. Aliased as ls.
  nvm on                       : Enable node.js version management.
  nvm off                      : Disable node.js version management.
  nvm proxy [url]              : Set a proxy to use for downloads. Leave [url] blank to see the current proxy.
                                 Set [url] to "none" to remove the proxy.
  nvm node_mirror [url]        : Set the node mirror. Defaults to https://nodejs.org/dist/. Leave [url] blank to use default url.
  nvm npm_mirror [url]         : Set the npm mirror. Defaults to https://github.com/npm/cli/archive/. Leave [url] blank to default url.
  nvm uninstall <version>      : The version must be a specific version.
  nvm use [version] [arch]     : Switch to use the specified version. Optionally use "latest", "lts", or "newest".
                                 "newest" is the latest installed version. Optionally specify 32/64bit architecture.
                                 nvm use <arch> will continue using the selected version, but switch to 32/64 bit mode.
  nvm root [path]              : Set the directory where nvm should store different versions of node.js.
                                 If <path> is not set, the current root will be displayed.
  nvm version                  : Displays the current running version of nvm for Windows. Aliased as v.

```

### NVM으로 node.js 설치

nvm install 버전 명령어를 사용하여 node.js 설치를 설치한다. nvm install 뒤의 버전에는 자신이 사용할 버전을 기입한다. 작성일(2022년 1월 12일) 기준 현재 최신 LTS 버전이 16.13.2 버전이므로 16.13.2를 기입했다.

```powershell
> nvm install 16.13.2
```

### NVM에서 node.js 사용 설정

nvm use 버전 명령어를 사용하여 설치한 node.js를 사용하도록 설정한다.

```powershell
> nvm use 16.13.2
Now using node v16.13.2 (64-bit)
```

**<span style="color:red">만약 status 1: ~~ 등의 에러가 발생한다면 명령 프롬프트나 powershell을 관리자 모드로 실행한 후에 nvm use 버전 명령어를 사용한다.</span>**

nvm에서 node.js를 사용하도록 설정했다면 node -v와 npm -v로 정상 설치와 버전을 확인한다.

```powershell
> node -v
v16.13.2
> npm -v
8.1.2
```

## yarn과 create-react-app 설치

### yarn 설치

yarn은 npm과 비슷한 기능을 하는데, npm보다 속도가 빠르고 보안성이 강화되어 있기 때문에 아래의 명령어를 통해 yarn을 설치하여 사용할 것이다.

```powershell
> npm install -g yarn
```

### create-react-app 설치

create-react-app은 리액트 프로젝트에 필요한 패키지들을 묶어서 편리하게 리액트 앱을 생성할 수 있게 해주는 도구이다.

create-react-app이 없다면 리액트 프로젝트에 필요한 패키지를 일일이 찾아서 package.json에 추가해야만 하기 때문에 create-react-app을 사용하기 위해 yarn을 이용해 create-react-app을 설치한다.

```powershell
> yarn global add create-react-app
```

**<span style="color:red">만약 yarn을 이용하여 create-react-app을 설치할 수 없거나, yarn을 이용하여 설치한 create-react-app이 정상 동작하지 않는다면 npm을 이용해 create-react-app을 설치한다.</span>**

```powershell
> npm install -g create-react-app
```

### 리액트 앱 생성

리액트 앱을 만들 경로에서 create-react-app 프로젝트이름 명령어를 사용하여 리액트 앱을 생성한다.

프로젝트이름에는 자신이 사용할 프로젝트의 이름을 기입한다.

```powershell
> create-react-app 프로젝트이름
```

### 리액트 앱 구동

리액트 앱이 생성되면 생성된 프로젝트로 경로를 변경한 후에 프로젝트를 구동한다.

```powershell
> cd 프로젝트이름
> yarn start
```

아래 그림과 같은 화면이 나오면 react 프로젝트가 정상적으로 구동된 것이다.

![react-app-start](https://github.com/user-attachments/assets/278d9c60-8097-4536-980b-2f5c834eab27)
