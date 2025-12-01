---
layout: post
title: "crontab에서 Jekyll이 잘 안 돌아간다..."
latex_needed: true
comment: true

excerpt: "분명 shell에서는 잘 됐는데"
topic: "이것저것"
keyword:
  - "crontab"
  - "Jekyll"

modified_date: 
---

Jekyll로 만든 static site이지만 간단하게 서비스할 만한 사이트가 생겨서 이왕 하는거 조금 전문적으로 보이게(?) 빌드하기로 했다. 지금까지는 그냥 `bundle exec jekyll build`를 손으로 치거나 bash 파일을 만들어서 돌리곤 했는데, 이제는 주기적으로 build를 진행해야했기 때문에 crontab을 사용하기로 했다.

### crontab을 위한 스크립트 만들기

```
cd /home/****/kartrider-score
JEKYLL_ENV=nightly bundle exec jekyll build --destination=_nightly_site -b "/kart-solo-nightly"
echo "Building the nightly site ($(date '+%Y-%m-%d')) Done." >> /home/****/kartrider-score/_log/build-nightly.log
```

우선 만들어본 스크립트는 위와 같다. 우선 `bundle exec jekyll build`를 실행할 위치로 이동한 후, build를 원하는 위치에 진행시킨다. 그 다음 정상적으로 완료됐다면 별도의 로그 파일에 빌드가 완료되었다는 메시지를 출력하는 방식으로 만들었다.

### crontab 설정

아주 간단하게 매일 0시(인스턴스 기준)에 빌드하도록 만드는 것을 목표로 했다.

```
$ crontab -e
```

우선 crontab 편집창을 연 이후, 매일 0시 0분에 작동하도록 명령문을 작성했다.

```
0 0 * * * /home/****/kartrider-score/_script/build-nightly.sh
```

crontab이 잘 돌아가는지 확인하기 위해 시간을 바꿔가면서 crontab이 스크립트를 실행하게끔 만들어보았다. 또한 실제로 변경된 파일이 적용되는지 확인하기 위해 md 파일에 현재 시간을 표시하게 했다.

```
{% raw %}{{ "now" | date: '%Y-%m-%d %H:%M' }}{% endraw %}
```

그런데 뭔가 문제가 생겼는지 위 위치의 시간값이 갱신되지 않았다.

### 문제 해결

#### crontab 로그 보기

어디서 문제가 생겼는지부터 찾는게 역시 중요하다. 그래서 에러 메시지나 실행 내역같은 것을 찾기 위해 crontab의 로그를 뒤져보기로 했다. crontab에 아무것도 설정하지 않았다면 쓰기 편한 명령어를 [StackExchange](https://askubuntu.com/questions/56683/where-is-the-cron-crontab-log)에서 얻었다.

```
$ grep CRON /var/log/syslog
```

보다보니 아래와 같은 이상한 메시지를 발견했다.

```
Aug 28 03:02:02 **** CRON[2238467]: (CRON) info (No MTA installed, discarding output)
```

구글링을 해보니 cron task가 정상적으로 완료되지 않으면 생성되는 메시지라고 한다. 하지만 이것만을 가지고는 어떤 것이 문제인지 알 수 없다고 하고, postfix라는 패키지를 설치하라고 한다. 그래서 [How to fix No MTA installed errors](https://cronitor.io/guides/no-mta-installed-discarding-output) 페이지를 따라 postfix를 설치했다.

```
$ sudo apt-get install postfix
```

이제 이 다음부터는 해당 cron의 소유자에게 메일이 보내진다고 한다. 이는 텍스트 에디터나 출력 명령어를 활용하면 볼 수 있다. 위 링크에 따르면 아래 명령어를 활용하여 메일 내용을 확인할 수 있다고 한다.

```
$ sudo tail -f /var/mail/****
```

메일을 확인해보니 아래와 같은 오류 메시지를 뿜으며 cron이 중간에 종료된 것을 확인했다.

```
From: ****@***.*** (Cron Daemon)
To: ****@***.***
...

bundler: command not found: jekyll
Install missing gem executables with `bundle install`
```

cron은 task를 추가한 사용자의 계정으로 명령어를 실행한다고 알고 있는데, 이상하게 jekyll이 없다고 한다. 사이트가 잘 돌아가는지 `bundle exec jekyll serve`로 확인할 때도 멀쩡히 잘 됐는데 갑자기 저런 오류가 뜨다니 적잖이 당황했다.

#### shell 문제인가?

위에서 생략한 메일 내용 중 아래와 같은 내용이 있었다.

```
...
X-Cron-Env: <SHELL=/bin/sh>
...
```

sh 환경에서 스크립트가 실행되었다는 뜻인데, 아무래도 쉘 종류가 영향을 끼쳤을 수도 있을거라 생각해서 cron 명령어를 아래와 같이 바꾸었다.

```
0 0 * * * /bin/bash /home/****/kartrider-score/_script/build-nightly.sh
```

하지만 그래도 똑같은 오류가 그대로 남아있었다.

#### 뭔가 세팅이 덜 됐나?

조금 더 구글링을 하다 [이 StackOverflow 글](https://stackoverflow.com/questions/19831878/bundle-exec-not-working-with-crontab)을 발견했다. 여기에 따르면 bash를 호출할 때 `-l` 옵션을 사용해서 기존 터미널 환경과 같은 환경을 세팅할 수 있다고 한다. 그래서 cron 명령어를 아래와 같이 바꾸었다.

```
0 0 * * * /bin/bash -l /home/****/kartrider-score/_script/build-nightly.sh
```

그렇지만 두 번째 시도도 문제를 해결하지는 못했다. 분명 Jekyll을 잘만 쓰고 있었는데 안되는 것을 이해하지 못해 구글링을 조금 더 해보았다. 그러다가 [이 StackOverflow 글](https://stackoverflow.com/questions/57722071/bundle-command-not-found-on-bash-script)을 발견했다. 가장 위의 답변에서 환경 변수를 세팅하라는 이야기를 하면서 cron은 환경 변수를 전부 초기화한 상태로 명령어를 실행한다고 첨언했다. 그래서 `$PATH` 변수를 수동으로 설정해보기로 했다.

```
$ echo $PATH
...
```

우선 위 명령어를 통해 현재 내 터미널의 `$PATH` 값을 가져오고, 이를 스크립트 파일에 아래와 같이 설정해주었다.

```bash
export PATH=...
```

그렇게 실행해본 결과 아직도 같은 오류가 났다. 하지만 환경 변수를 해결해야 한다는 내용에서 아이디어가 떠오른 것 같았다.

#### gem이 설치된 위치 지정

아무래도 gem이 설치된 곳이 내 터미널에서 실행했을 때와 cron에서 실행했을 때가 다른 것 같은 느낌이 들었다. 그래서 bundle을 실행할 때 gem의 설치 위치를 지정할 수 있는지에 대해 찾아보았다. [Bundler 공식 사이트](https://bundler.io/v1.12/man/bundle-config.1.html#LIST-OF-AVAILABLE-KEYS)에서 bundle의 config가 가능한 항목 중 path가 있고, 이는 `$GEM_HOME`이나 `$GEM_PATH` 환경 변수에 상관없이 적용된다는 내용이 있었다. 반대로 말하면 따로 config 되어있지 않으면 `$GEM_HOME`이나 `$GEM_PATH`에 따라 그 위치가 결정된다는 것이 아닌가! 이는 cron에서 환경 변수가 모두 제거된 상태로 작동한다는 이야기와도 맞아떨어지는 이야기다. 그래서 바로 아래 명령어를 실행시켜보았다.

```
$ echo $GEM_HOME
/home/****/gems
$ echo $GEM_PATH

```

`$GEM_HOME` 환경 변수는 내 환경에서 gem이 설치된 장소를 출력하고 있었다. 이 점을 이용해서 `$GEM_HOME` 또한 아래와 같이 스크립트에서 설정했다.

```bash
export GEM_HOME=/home/****/gems
```

그리고 마침내 스크립트가 잘 돌아가기 시작했다...!

### 결론

여러 번의 실험을 진행해본 결과, **gem이 설치된 위치**와 **쉘의 종류**만 잘 설정해주면 되는 것이었다. 결론적으로 아래와 같은 cron 명령어와 스크립트를 사용하면 잘 작동했다.

```
0 0 * * * /bin/bash /home/****/kartrider-score/_script/build-nightly.sh
```

```bash
#!/bin/bash

export GEM_HOME="/home/****/gems" # 이게 중요합니다

cd /home/****/kartrider-score
JEKYLL_ENV=nightly bundle exec jekyll build --destination=_nightly_site -b "/kart-solo-nightly"
echo "Building the nightly site ($(date '+%Y-%m-%d')) Done." >> /home/****/kartrider-score/_log/build-nightly.log
```

### 추가

나중에 cron을 아래와 같이 조금 수정하였다.

```
SHELL=/bin/bash
0 0 * * * /home/****/kartrider-score/_script/build-nightly.sh
```
