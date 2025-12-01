---
layout: post
title: "certbot SSL 인증서에 도메인 추가/삭제/수정"
latex_needed: false
comment: true

excerpt: "계속 까먹어서 적어놓는 한심함;;(?)"
topic: "이것저것"
keyword:
  - "certbot"

modified_date: 
---

서브도메인을 추가하거나 삭제할 때마다 SSL 인증서 갱신을 위해서 구글링을 하는 내가 너무 한심한 나머지(?) 메모를 겸한 목적으로 포스트를 작성하기로 했다.

### 인증서 이름과 도메인 찾기

인증서의 도메인 목록을 수정하기 전에 먼저 어떤 인증서를 건드릴지, 그 인증서에는 어떤 도메인이 포함되어있는지 확인해야 한다.

```
# certbot certificates
```

위 커맨드를 사용하면 certbot을 통해 발급받은 인증서 목록을 볼 수 있다.

```
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Found the following certs:
  Certificate Name: <인증서 이름>
    Serial Number: <16진수 난수>
    Key Type: RSA
    Domains: domain.tld aaa.domain.tld ...
    Expiry Date: 2023-04-22 03:59:00+00:00 (VALID: 73 days)
    Certificate Path: /etc/letsencrypt/***.pem
    Private Key Path: /etc/letsencrypt/***.pem
  Certificate Name: <인증서 이름>
    Serial Number: <16진수 난수>
    ...
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

인증서 중에서 도메인을 바꾸고 싶은 인증서의 이름(`Certificate Name`)과 도메인 목록(`Domains`)을 확인하고 다음 단계로 넘어간다.

### 인증서 도메인 수정

인증서를 수정할 때 사용하는 커맨드는 아래와 같다. 인증서를 발급받거나 갱신할 때에도 사용할 수 있는 커맨드이다.

```
# certbot certonly --cert-name <인증서 이름> -d <도메인1> -d <도메인2> ...
```

`certbot certificates`를 통해서 인증서 이름과 도메인 목록을 알아내었다면, 위 커맨드를 사용하여 도메인 목록을 수정한다. 원래 있던 도메인 목록 외에 추가하고 싶은 도메인이 있으면 `-d <원하는 도메인>`으로 추가하고 제외하고 싶은 도메인이 있으면 해당 도메인은 커맨드에 쓰지 않으면 된다.

#### 예시

`orbit.hv`라는 도메인이 있고 서브 도메인으로 `aaa.orbit.hv`, `bbb.orbit.hv`, `ccc.orbit.hv`가 있는 상태로 인증서를 발급받은 상태라고 가정하겠다. 발급받을 때 별다른 옵션을 설정하지 않았다면 `certbot certificates` 커맨드를 실행했을 때 아래와 같이 출력될 것이다.

```
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Found the following certs:
  Certificate Name: orbit.hv
    Serial Number: 0123456789abcdef0123456789abcdef012
    Key Type: RSA
    Domains: orbit.hv aaa.orbit.hv bbb.orbit.hv ccc.orbit.hv
    Expiry Date: 2023-01-01 00:00:00+00:00 (VALID: 90 days)
    Certificate Path: /etc/letsencrypt/live/orbit.hv/fullchain.pem
    Private Key Path: /etc/letsencrypt/live/orbit.hv/privkey.pem
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

이제 여기서 `ccc.orbit.hv`를 제외하고 `ddd.orbit.hv`를 추가하고 싶은 상황이다. 위에서 인증서 이름이 orbit.hv라는 것을 알아냈고, 도메인 목록에 4개가 있는 것과 그 도메인 목록에 `ccc.orbit.hv`가 있는 것은 확인했다. 그러면 내가 입력해야 할 커맨드는 아래와 같이 된다.

```
# certbot certonly --cert-name orbit.hv -d orbit.hv -d aaa.orbit.hv -d bbb.orbit.hv -d ddd.orbit.hv
```

위 커맨드를 입력하면 인증서를 처음 발급받을 때와 같이 아래의 메시지가 나온다.

```
How would you like to authenticate with the ACME CA?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
1: Nginx Web Server plugin (nginx)
2: Spin up a temporary webserver (standalone)
3: Place files in webroot directory (webroot)
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Select the appropriate number [1-3] then [enter] (press 'c' to cancel):
```

나는 nginx를 사용하기 때문에 1을 선택했다. 그 뒤로 아래와 같이 도메인을 추가하거나 삭제하는 것이 맞는지 확인하는 메시지가 나온다.

```
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
You are updating certificate orbit.hv to include new domain(s):
+ ddd.orbit.hv

You are also removing previously included domain(s):
- ccc.orbit.hv

Did you intend to make this change?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(U)pdate certificate/(C)ancel:
```

위 메시지를 보면 도메인 목록에 `ddd.orbit.hv`를 추가하고 `ccc.orbit.hv`를 삭제하는 것이 맞냐고 물어보는 것이다. 그 의도가 맞으므로 u를 입력한다.

```
Renewing an existing certificate for orbit.hv and 3 more domains

Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/orbit.hv/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/orbit.hv/privkey.pem
This certificate expires on 2023-01-01.
These files will be updated when the certificate renews.
Certbot has set up a scheduled task to automatically renew this certificate in the background.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
If you like Certbot, please consider supporting our work by:
 * Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
 * Donating to EFF:                    https://eff.org/donate-le
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

그러면 위와 같이 인증서를 발급받았다는 메시지가 뜨고, `ddd.orbit.hv`에 https로 접속했을 때 문제없이 연결되는 것을 확인할 수 있다.