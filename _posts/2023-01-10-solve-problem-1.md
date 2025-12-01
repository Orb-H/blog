---
layout: post
title: "문제 해결 시도 - nginx와 jekyll의 permission 문제"
latex_needed: false
comment: true

excerpt: "nginx의 root 폴더와 jekyll의 build destination을 하나로 사용 시 발생할 수 있는 permission 문제를 내 방식으로 해결"
topic: "문제 해결"
keyword:
  - "nginx"
  - "jekyll"

modified_date: 2023-05-31
---

### 상황

jekyll을 사용하여 static page를 빌드하고 nginx로 호스팅하는 상황이다. jekyll로 빌드할 때에는 `/home` 디렉토리 밑의 특정 디렉토리로 빌드한다. 빌드가 끝나면 그 결과물을 `/var/www/...`로 복사하여 nginx가 호스팅할 수 있도록 한다.

빌드할 때마다 그 결과물을 복사하는 것이 귀찮고(bash script로 짜면 두 줄이긴 하지만), 무거운 사이트의 경우 차지하는 디스크 용량이 2배가 되기 때문에 부담스러운 부분이 있다. 따라서 하나의 폴더가 nginx의 root 폴더와 jekyll의 destination 폴더로서 동시에 사용되게 하고 싶은 상황이다.

#### 알려진 해결법

이를 풀 수 있을 것 같은 해결법은 크게 2가지가 있는데,

1. nginx의 root 디렉토리를 `/home` 디렉토리 밑의 특정 디렉토리로 설정하기
1. jekyll의 빌드 결과물을 `/var/www/...`에 생성하기

#### nginx의 root 디렉토리 변경

nginx의 설정 파일(`.conf` 파일)에서는 root 디렉토리를 설정할 수 있다. 이를 바탕으로 'nginx의 root 디렉토리를 빌드의 결과물이 생성되는 디렉토리로 설정하면 되지 않을까?'라는 아이디어를 떠올렸다.

```nginx
# root /var/www/...
root /home/...
```

위와 같이 `.conf` 파일을 수정하면 nginx가 `/home` 디렉토리 밑의 특정 디렉토리를 root로서 사용할 수 있을 것으로 기대할 수 있다. 이 상태로 `nginx -t`를 실행해보면 문제가 없음을 확인할 수 있다. 하지만 사이트에 접속해보면 원하는 내용이 보이지 않고 `500 Internal Server Error`라는 문자열이 페이지에 나온다. error log를 찾아보면 "13: permission denied" 문자열을 찾아볼 수 있다. 이는 root 폴더로 사용할 디렉토리의 permission 문제로 인하여 nginx가 파일을 읽어들이지 못해서 생기는 오류다.

이에 대한 해결법으로는 [이 링크](https://rnokhs.tistory.com/entry/Nginx-403-13-Permission-denied-%ED%95%B4%EA%B2%B0%ED%95%98%EA%B8%B0)와 같이 `/home` 디렉토리 밑의 특정 디렉토리의 소유자를 root으로 변경하는 방법이 있다.

#### jekyll의 build destination 변경

bundler를 사용한 jekyll build 구문은 아래와 같다.

```bash
bundle exec jekyll build
```

여기에 `--destination` 옵션을 사용하면 원하는 위치에 사이트를 빌드할 수 있다. 따라서 `/var/www/...`에 빌드된 사이트를 넣고 싶다면 아래와 같은 구문을 쓰면 될 것이다.

```bash
bundle exec jekyll build --destination=/var/www/...
```

하지만 이 또한 permission 문제에서 벗어날 수는 없다. 위 구문을 실행하는 유저가 root 유저가 아니라면 jekyll에서 permission denied 오류가 뜨며 사이트가 빌드되지 않는다. 이는 /var/www/의 하위 디렉토리의 소유자가 root인데 jekyll을 실행하는 사용자는 일반 유저이기 때문이다. 이는 sudo를 사용하여 해결할 수 있을 것처럼 보이나, 해결되지 않을 수 있다. 만약 jekyll을 설치했을 때 [이 페이지](https://jekyllrb.com/docs/installation/ubuntu/)대로 설치했다면 gem이 유저의 홈 디렉토리에 설치된다. 여기서 sudo를 사용하면 유저가 root로 바뀌게 되면서 환경변수가 전부 바뀌어버리고 bundler, jekyll을 포함한 모든 gem의 위치를 찾을 수 없게 된다.

이 방식으로 문제를 해결하려면 미리 `sudo -s`를 통해 사용자를 root로 변경한 다음에 ruby와 gem을 설치하고 jekyll을 사용하면 된다.

#### 아직 만족하지 못했다...

물론 위 두 가지 방법 모두 충분한 해결책이 될 수 있다. 하지만 `bundle exec jekyll build`를 키보드로 치는 맛을 잊을 수 없는(???) 나는 뒤의 귀찮은 `--destination` 옵션을 일일이 타이핑하지도 않고 nginx 설정 파일도 고치지 않는 방법이 있지 않을까 하는 생각이 들었다. 그래서 문제를 새로 정의하고 다시 답을 찾으러 가보겠다.

### 상황2

symbolic link를 사용하여

1. jekyll의 destination 폴더 옵션을 사용하지 않고
1. nginx 설정 파일을 고치지 않고

jekyll은 Gemfile이 있는 디렉토리에 build하고 nginx는 build된 폴더를 root로 사용하게 하고 싶은 상황이다.

#### 생각해낸 해결법

생각보다 답은 가까운 곳에 있었다. nginx의 root 폴더를 고쳐서 다른 폴더를 가리키는 것이 아니라 nginx의 root 폴더가 다른 폴더를 가리키면 되는 것이다. 반대로 생각해보면, jekyll의 destination 옵션을 설정하여 다른 폴더를 가리키는 것이 아니라 destination 폴더가 다른 폴더를 가리키면 되는 것이다. 이를 가능하게 할 수 있는 것으로 symbolic link를 떠올렸다.

사이트 build와 nginx가 파일을 탐색하는 횟수를 비교해본다. 사이트 build야 한 번 정상적으로 build되기 시작하면 그 뒤로 얼마 사용하지 않는다. 그에 비해 nginx는 사이트에 접속하는 사람들의 수에 따라 매우 빈번하게 파일을 탐색할 것이다. 따라서 /var/www/...를 실제 폴더로 사용하고 jekyll이 build되는 폴더는 symbolic link를 사용하여 /var/www/...를 가리키게 만드는 것이 나을 것 같다.

jekyll의 사이트가 build되는 폴더는 기본값이 `_site`이므로 먼저 해당 폴더가 /var/www/...를 가리키도록 symbolic link로 만들어준다.

```bash
ln -s /var/www/... /home/.../_site
```

그 다음 jekyll이 해당 위치의 폴더를 정상적으로 수정할 수 있도록 permission을 변경해준다.

```bash
chmod 777 /var/www/...
```

혹시나 `jekyll build`가 폴더를 통째로 overwrite하는 것인지 싶어서 테스트를 해보았으나 symbolic link가 사라지지 않고 그대로 남아있었다.(정말 다행이다) permission은 어떤 방법을 선택하든 변경해야했지만 가장 쉬운 방법을 찾아낸 것 같다. 어려운 문제라고 생각하지는 않지만 해답을 찾아가는 과정이 중요한 것 같다고 생각하여 포스트로 남겼다.

### 결과(추가)

**이것저것 해본 결과 `www-data` 사용자를 내 사용자 그룹에 추가시키는게 제일 확실했다...**

### 요약

#### 문제 상황

nginx의 root 폴더와 jekyll의 build destination을 일치시키고 싶다.

#### 알려진 방법

1. nginx의 root 디렉토리를 `/home` 디렉토리 밑의 특정 디렉토리로 설정하기
1. jekyll의 빌드 결과물을 `/var/www/...`에 생성하기

#### 추가하고 싶은 디테일

1. jekyll의 destination 폴더 옵션을 사용하지 않고
1. nginx 설정 파일을 고치지 않고

nginx의 root과 jekyll의 build destination을 일치시키기

#### 내가 생각해낸 방법

symbolic link를 사용하여 nginx의 build destination 폴더(`.../_site`)가 사실은 nginx의 root 폴더를 가리키는 symbolic link가 되도록 만들면 된다.