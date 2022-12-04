---
layout: post
title: "Dynamix의 보상 Frag를 구하는 공식이 있을까? - 2 (데이터 수집)"
latex_needed: true
comment: true

excerpt: "Selenium을 사용하여 분석에 필요한 이미지를 수집한다."
topic: "Dynamix Frag 공식 구하기"
keyword:
  - "Data Analysis"
  - "Dynamix"
  - "Image Crawler"
  - "Selenium"
  - "Python"
---

[← 이전 포스트: Dynamix의 보상 Frag를 구하는 공식이 있을까? - 1 (엑셀을 사용한 추론)]({{ site.baseurl }}/2021/12/21/dynamix-frag)

이전 포스트의 결론으로 Frag의 공식이 아래와 같은 형태를 띨 것이라는 추론을 했다.

> $F(s,l)=2\cdot\text{int}(\frac{\Sigma(s)\Lambda(l)}{2})+40$

이를 판단하기 위해서는 충분한 양의 데이터가 필요하기 때문에 트위터에서 데이터를 얻어오기로 했다. 하지만 Dynamix는 출시한 지 상당히 오래된 게임이기 때문에 데이터를 수동으로 수집하기에는 무리가 있었다. 그래서 자동으로 트위터의 Dynamix 결과 이미지를 가져오는 프로그램이 필요했다. 즉, 크롤러가 필요했다.

크롤러를 개발해본 적은 한 번도 없었고, 그나마 들어본 것이 다른 친구가 웹 크롤링을 할 때에 Selenium을 사용했다는 것밖에 없었다. 그래서 우선 Selenium을 사용해보는 것으로 하고, 언어는 Python을 사용하기로 했다. 아는 것이 없으므로 우선 간단한 것부터 알아보기로 했다.

### Selenium

#### 참조한 사이트

- [파이썬 Selenium 사용하기](http://pythonstudy.xyz/python/article/404-%ED%8C%8C%EC%9D%B4%EC%8D%AC-Selenium-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0)
- [Selenium API](https://selenium-python.readthedocs.io/api.html)

#### 필요했던 내용

창 띄우기

```python
from selenium import webdriver # 라이브러리 import

browser = webdriver.Firefox() # Firefox 창 띄우기

browser.get('http://python.org') # 특정 페이지로 이동
```

WebElement 찾기

- 이전 버전(```find_element_by_*(val)```) *Deprecated*

```python
browser.find_element_by_tag_name('div') # div 검색
browser.find_element_by_css_selector('span#name') # id가 name인 span 검색
browser.find_elements_by_xpath('./div') # direct children인 div를 모두 검색
```

- 신버전(```find_element(by, val)```)

```python
from selenium.webdriver.common.by import By

browser.find_element(By.TAG_NAME, 'div') # div 검색
browser.find_element(By.CSS_SELECTOR, 'span#name') # id가 name인 span 검색
browser.find_elements(By.XPATH, './div') # direct children인 div를 모두 검색
```

WebElement 함수

|함수|내용|
|-|-|
|`clear()`|`input[type=text]`인 경우 텍스트 입력 창을 비운다.|
|`click()`|element를 클릭한다.|
|`find_element(by, val)`|조건에 맞는 element를 찾는다.|
|`find_elements(by, val)`|조건에 맞는 모든 element를 찾는다.|
|`find_element_by_*(val)`|*에 해당하는 값이 val인 element를 찾는다.|
|`find_elements_by_*(val)`|*에 해당하는 값이 val인 모든 element를 찾는다.|
|`get_attribute(name)`|`name` attribute나 property의 값을 가져온다.|
|`get_property(name)`|`name` property의 값을 가져온다.|
|`is_displayed()`|사용자에게 보이는지 여부를 반환한다.|
|`is_enabled()`|활성화된 상태인지 반환한다.|
|`is_selected()`|선택된 상태인지 반환한다.|
|`screenshot(filename)`|`filename`의 이름으로 스크린샷을 저장한다.|
|`send_keys(*value)`|`*value`에 해당하는 키 입력을 준다.|
|`submit()`|`form`을 제출한다.|
|`value_of_css_property(property_name)`|`property_name`에 해당하는 CSS 값을 반환한다.|

WebElement 변수

|변수|내용|
|-|-|
|`id`|element의 ID|
|`location`|element의 위치|
|`parent`|element를 포함하는 WebDriver 객체|
|`rect`|element의 `size`와 `location`을 포함하는 `dict`|
|`screenshot_as_base64`|스크린샷을 base64 형태로 반환|
|`screenshot_as_png`|스크린샷을 binary 형태로 반환|
|`size`|element의 크기|
|`tag_name`|element의 `tagName`에 해당하는 속성, 태그 이름|
|`text`|element의 `text`에 해당하는 속성|

### 사전 조사

#### 트위터 검색 쿼리

우선 크롤링을 진행할 사이트는 트위터 검색창이고, <span style="color:#09f">#dynamix</span> 해시태그를 사용하여 검색해야 Dynamix 결과 이미지들이 나왔다. 하지만 해당 해시태그를 사용하더라도 결과 이미지만이 아닌 다른 다양한 결과가 나왔다. 예를 들면, Dynamix 채보에 대해 푸념하는 트윗이라거나, 결과 공유 버튼으로 공유하지만 이미지는 지우고 올리는 트윗, 암호화폐 Dynamix에 관련된 트윗(!) 등 필요없는 트윗들이 상당수 있었다. 그래서 트위터 검색 필터를 사용하여 필요한 트윗만 나오게 해야 했다.

다양한 쿼리를 사용하여 검색해본 결과, 가장 확실하게 이미지를 얻을 수 있는 쿼리를 찾았는데, 이는 `(GIGA OR MEGA OR HARD OR NORMAL OR CASUAL) #dynamix until:20xx-xx-xx since:20xx-xx-xx filter:twimg`였다. 쿼리를 분석해보면 아래와 같다.

- `#dynamix`: 트위터로 공유하면 반드시 따라붙게되는 해시태그이다. 하지만 암호화폐 Dynamix에 관련된 트윗에도 붙기 때문에 더 많은 필터가 필요하다.
- `(GIGA OR MEGA OR HARD OR NORMAL OR CASUAL)`: 트위터에 공유 버튼을 진행하면 `곡 이름[난이도]`의 형태가 언어에 상관없이 포함되기 때문에 관련없는 내용을 걸러내기 위하여 포함했다.
- `filter:twimg`: 트위터에 직접 게시한 이미지만 걸러내는 필터다. 확실하게 이미지가 포함된 트윗만을 검색하기 위함이며, 크롤러의 작동에도 영향을 미칠 수 있다고 판단하여 포함했다.
- `since:20xx-xx-xx` / `until:20xx-xx-xx`: 특정 기간의 트윗만 검색하는 필터이다. `since`에 해당하는 날짜는 포함, `until`에 해당하는 날짜는 제외이다. 수만 개에 해당하는 트윗을 한 번에 크롤링하는 것도 상당히 오래 걸릴 뿐더러 도중에 중단될 경우 재개할 지점을 정할 수 있다는 이득도 있기 때문에 포함했다.

이 쿼리를 사용한 트위터 검색 페이지로 즉시 이동하는 주소는 `https://twitter.com/search?q=(GIGA%20OR%20MEGA%20OR%20HARD%20OR%20NORMAL%20OR%20CASUAL)%20%23dynamix%20until%3A20xx-xx-xx%20since%3A20xx-xx-xx%20filter%3Atwimg&src=typed_query&f=live`이다. `f=live`는 최신 트윗을 검색하는 것으로, 시간 순서로 정렬해서 보여주는 옵션이다.

#### 트위터 검색 페이지의 HTML 구조

크롤링하기 전에 페이지의 구조를 파악해서 원하는 element의 위치나 특징(attribute같은 것들)을 잡아놓으면 편하게 크롤링을 진행할 수 있다고 하여 트위터 검색 페이지의 구조를 알아보기로 했다. 개발자 도구를 사용하여 분석해본 결과 아래와 같았다.

<p align=center>
<img src="{{ site.baseurl }}/images/dynamix-frag/crawl_tweet_structure.png" style="width:300px"><br />&lt;트위터 검색 페이지 구조&gt;
</p>

태그의 상하관계로만 설명하자면 아래와 같다.

> 트윗 검색 페이지
> > \<section\> - 트윗 검색 결과
> > > \<article data-testid="tweet"\> - 트윗
> > > > \<time\> - 트윗 게시 시간 정보
> > >
> > > > \<div data-testid="tweetPhoto"\> - 트윗의 이미지 컨테이너
> > > > > \<img\> - 트윗의 이미지
> > >
> > > \<article data-testid="tweet"\>
> > > > \<time\
> > >
> > > > \<div data-testid="tweetPhoto"\>
> > > > > \<img\>
> > >
> > > \<article data-testid="tweet"\>
> > >
> > > ...

#### 스크롤을 통한 검색 결과 탐색 시 웹페이지의 반응

보통 트위터에서 검색을 하면 아주 많은 양의 결과가 나온다. 검색 결과 페이지에서 스크롤하여 페이지를 아래로 내리면 아직 보지 못한 트윗을 볼 수 있다. 이 과정을 개발자 도구를 통해 지켜보던 중 신기한 점을 발견했다. 스크롤을 아무리 내린 상태더라도 트윗 검색 결과를 나타내는 부분인 `<section>`의 children 갯수가 항상 5~6개였던 것이다. 어떻게 되는 것인지 궁금하여 스크롤하면서 개발자 도구를 지켜보았더니 현재의 스크롤 위치로부터 특정 범위 이내의 트윗만 보이게 해놓았다. 스크롤 과정 중 범위가 넘어간 트윗은 해당 `<article>`을 제거, 범위에 들어오는 트윗은 새 `<article>`을 추가하는 방식으로 작동했다. 또한 각 `<article>`은 `position:relative`로 설정되어 위의 트윗이 사라지더라도 위치를 유지하게끔 되어있으며, 페이지의 세로 길이와 스크롤 위치는 `<section>`의 `min-height` 값을 조정하여 유지했다.

위와 같은 이유 때문에 검색 결과 전체를 한 번에 가져올 수 없고 스크롤을 통해 새로운 트윗을 계속 받아와서 데이터를 가져와야 한다. 원래는 한 번에 결과 전체를 가져오려 했으나 트윗을 하나씩 크롤링하는 것으로 구상을 변경했다.

### 크롤러 개발

#### 대략적인 알고리즘

1. 검색 페이지 띄우기
1. 검색 페이지에 트윗이 나올 때까지 대기
1. 현재 로딩된 모든 트윗 중 방문하지 않은 첫 트윗 탐색
1. 해당 트윗에서 이미지 주소를 가져와 다운로드하기
1. 적당한 위치로 스크롤하기
1. 3~5 반복, 로딩된 모든 트윗을 모두 방문했다면 프로그램 종료

#### 코드 작성

기간을 계속 바꿔가면서 프로그램을 돌려야 하기 때문에 기간을 매개변수로 하는 클래스를 만들어서 크롤러를 실행시키는 방법을 사용했다.

**기간 설정 및 쿼리 생성**

```python
from datetime import datetime

class ImageCrawler:
    def __init__(self, start_date: datetime, end_date: datetime):
        self.query_address = "https://twitter.com/search?q=(GIGA%20OR%20MEGA%20OR%20HARD%20OR%20NORMAL%20OR%20CASUAL)%20(%23dynamix)%20until%3A" + end_date.strftime("%Y-%m-%d") + "%20since%3A" + start_date.strftime("%Y-%m-%d") + "%20filter:twimg&src=typed_query&f=live"
```

**브라우저 생성 및 검색 페이지 이동**

가장 무난한 FireFox를 사용한다.

```python
from selenium import webdriver

class ImageCrawler:
    def get_image(self):
        browser = webdriver.FireFox()
        browser.get(self.query_address)
```

**검색 결과가 나올 때까지 대기**

`<section>` 태그에 트윗이 존재할 때까지 대기하는 방법을 사용한다.

```python
import time

class ImageCrawler:
    def get_image(self):
        # ...
        current = 0
        while True:
            try:
                section = browser.find_element(By.TAG_NAME, "section")
                assert len(section.find_elements(By.CSS_SELECTOR, 'article[data-testid="tweet"]')) > 0
                break
            except:
                time.sleep(1)
```

**검색 결과 크롤링**

```python
from selenium.webdriver.common.by import By
import urllib.request

class ImageCrawler:
    def get_image(self):
        # ...
        # ...
        last = -1 # 마지막으로 이동한 스크롤 위치
        is_last = False # 마지막 결과 여부

        while not is_last:
            is_last = True
            content = section.find_elements(By.CSS_SELECTOR, 'article[data-testid="tweet"]') # get visible tweets
            for tweet in content:
                loc = int(tweet.rect['y'])
                if loc > last: # unvisited tweet
                    try:
                        images = tweet.find_elements(By.CSS_SELECTOR, 'div[data-testid="tweetPhoto"]')
                        assert len(images) > 0
                    except: # if images are blocked, reveal them
                        reveal = tweet.find_element(By.CSS_SELECTOR, 'div[role="button"] span')
                        browser.execute_script('arguments[0].click()', reveal) # allows touch even if covered by other elements
                        time.sleep(interval)
                        images = tweet.find_elements(By.CSS_SELECTOR, 'div[data-testid="tweetPhoto"]')
                    finally:
                        datetime = tweet.find_element(By.CSS_SELECTOR, 'time').get_attribute('datetime')
                        datetime = datetime.replace(':', '').replace('-', '').replace('.', '')[:-4]
                        date = datetime[:8]
                        datetime = datetime[9:]
                        if not os.path.exists('./images/' + date):
                            os.mkdir('./images/' + date)

                        for image in images:
                            try:
                                real_img = image.find_element(By.CSS_SELECTOR, 'img')
                                src = real_img.get_attribute('src') # find src of image

                                urllib.request.urlretrieve(src, "./images/" + date + "/" + datetime + "-" + src.split("/")[-1].split("?")[0] + ".jpg") # download image
                            except:
                                pass

                    print(loc, len(images)) # scroll position, count of images
                    browser.execute_script("document.documentElement.scrollTop=" + str(loc)) # scroll to next position
                    last = loc
                    is_last = False
                    break
            time.sleep(interval)
```

---

위의 그림에서 이미지가 숨겨져있는 경우는 사용자가 임의로 본인의 트윗을 민감할 수 있는 내용을 포함한 트윗으로 간주하게끔 설정해놓았거나 트위터 검열 알고리즘에 의해 그렇게 표시되는 경우가 있다. 이 경우 '보기' 버튼을 누르면 이미지가 보이게 되는데, 이 과정은 크롤링을 진행함에 있어서 나올 수 밖에 없는 과정이므로 이것도 크롤링에서 구현해야 할 것이다.