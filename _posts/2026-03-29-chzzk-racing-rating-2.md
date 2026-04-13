---
layout: post
title: "치레동 레이팅 설계해보기 (수식)"
latex_needed: true
comment: true

excerpt: "진짜로 수식이 궁금하신가요"
topic: "레이팅"
keyword:
  - "치지직 레이싱 동아리"
  - "치레동"
  - "TrueSkill"
  - "Rating"

modified_date:
---

<style>
  .tier1 {
    color: #731d1d;
    font-weight: bold;
  }
  .tier1_ {
    color: #731d1d;
    font-weight: bold;
    text-decoration: underline;
  }
  .tier2 {
    color: #868686;
    font-weight: bold;
  }
  .tier3 {
    color: #997316;
    font-weight: bold;
  }
  .tier3_ {
    color: #997316;
    font-weight: bold;
    text-decoration: underline;
  }
  .tier4 {
    color: #0059b3;
    font-weight: bold;
  }
  .tier4_ {
    color: #0059b3;
    font-weight: bold;
    text-decoration: underline;
  }
  .tier5 {
    color: #00b300;
    font-weight: bold;
  }
  .tier6 {
    color: #df0000;
    font-weight: bold;
  }
</style>

### 들어가기에 앞서

> 주의: 아직 이 레이팅 시스템이 충분히 사용할 가치가 있는지, 신뢰성이 있는지 판단되지 않은 상태입니다.

> 주의: 작성자는 아직 아래 내용을 충분히 이해하지 못한 상태에서 작성한 글입니다. 혹시라도 이 글에 대해 잘 아시는 분이 있다면 조언 부탁드립니다.

이 포스트는 [이전 포스트](/chzzk-racing-rating-1)에서 설명하지 못한 수학적인 내용을 다룬다. 혹시라도 수식에 알러지가 있는 분들은 이전 포스트로 이동해주시길 바란다. 또한 이 포스트의 구성은 해당 포스트와 비슷하나 이전 포스트에서 언급한 내용은 건너뛸 확률이 높으니 이전 포스트를 먼저 읽고나서 이 포스트를 읽는 것을 추천한다.

### 티어 지수와 랭킹 지수, 티어의 문제점

위의 내용이 무엇인지는 이전 포스트의 [티어 지수와 랭킹 지수, 그리고 티어](/chzzk-racing-rating-1#s-2.2) 항목과 [티어 지수와 랭킹 지수의 한게점](/chzzk-racing-rating-1#s-2.3) 항목을 참고하길 바란다. 여기서는 수식과 함께 조금 더 자세히 설명하겠다.

이전 포스트의 내용을 요약하면 아래와 같다.

1. 팀전 결과도 같이 반영되는 레이팅
1. 꾸준한 퍼포먼스를 반영하는 레이팅
1. 대결한 선수의 실력에 따른 레이팅 보정

또한 주석으로 언급하기는 했으나 랭킹 지수 자체에도 약간 수학적 결함이 있다. 다만 사소한 내용이니 궁금하다면 클릭해서 펼쳐보면 좋을 것 같다.

<p><details>
<summary><u>랭킹 지수의 (사소한) 수학적 결함</u></summary>

티어 지수와 랭킹 지수의 정의를 다시 살펴보자.

$$
\begin{aligned}
\text{랭킹 지수}&=\frac{10}{\left|I_A\right|} \sum_{j \in I_A}\frac{T_j^A}{P_j}\\
\text{티어 지수}(T)&=\frac{1}{n}\sum_{i=1}^n \left(0.3Q_i+0.7R_i\right)
\end{aligned}
$$

여기서 랭킹 지수에 문제가 있다. 치레동 1회에서 만약 압도적인 실력으로 티어 지수 1을 기록했다면, 랭킹 지수가 어떻게 될까? $\frac{10}{1}\times\frac{1}{12}=0.8333...$이 되어 랭킹 지수가 1보다 낮아진다. 이는 <b>10명이 참가하는 대회에서 대략적으로 획득할 것으로 기대하는 순위인데, 이것이 1보다 작아지는 것</b>이다. 따라서 개인적으로는 아래와 같은 정의가 더 낫지 않았을까 하는 생각도 있다. 항상 <b>1 이상</b>의 값이 보장되고 상한값은 기존과 같이 10이다.

$$
\begin{aligned}
\text{랭킹 지수}&=\color{blue}{1 +}\frac{10}{\left|I_A\right|} \sum_{j \in I_A}\frac{T_j^A\color{blue}{-1}}{P_j\color{blue}{-1}}\\
\text{티어 지수}(T)&=\frac{1}{n}\sum_{i=1}^n \left(0.3Q_i+0.7R_i\right)
\end{aligned}
$$

</details></p>

### TrueSkill 활용

위에서 언급한 티어의 3가지 문제를 해결하기 위해 TrueSkill을 도입하였다는 내용은 이전 포스트에 언급되어있다. 이제 왜 그것을 사용했는지 수학적으로 알아보도록 하자. 이 내용은 [논문](https://www.microsoft.com/en-us/research/wp-content/uploads/2006/01/TR-2006-80.pdf)이나 [공식 페이지](https://www.microsoft.com/en-us/research/publication/trueskill-rating-system/)에 더 자세히 설명되어있으니, 만약 궁금하다면 해당 자료를 참고하길 바란다.

#### 소개

먼저 TrueSkill에 대한 간단한 소개이다. TrueSkill은 마이크로소프트에서 만든 매치메이킹 시스템으로, 베이즈 정리를 기반으로 하는 레이팅 시스템이다. 다른 레이팅 시스템과 다른 점이라면, 플레이어의 실력을 특정한 값이 아닌 정규분포로 나타낸다. 수식으로 나타내자면 $s_i\sim\mathcal{N}(\mu_i, \sigma_i^2)$이다. 여기서 $s_i$는 플레이어 $i$의 실력, $\mu_i$는 플레이어 $i$의 실력의 평균, $\sigma_i$는 플레이어 $i$의 실력의 표준편차이다. 즉, 이 시스템에서는 플레이어의 실력을 예측할 때 $s_i$가 존재할 범위와 확률을 보는 것이다. 아래의 그래프를 보면 이해가 더 쉬울 것이다.

![시스템에서 생각하는 플레이어의 실력의 그래프](/images/chzzk-racing-rating/skill-interval.png)

위 그래프는 3개의 정규분포 그래프로 이루어져있는데, 노란색 그래프와 파란색 그래프는 평균은 같으나 표준편차가 다른 그래프이고 세 그래프 모두 다른 표준편차 값을 가지고 있다. TrueSkill에서는 이러한 식으로 각각의 플레이어의 실력이 모두 다른 평균과 표준편차 값을 가지는 정규분포로 간주한다.

#### 예측과 보정

이전 포스트에서는 따로 언급하지는 않았지만, 이 레이팅 시스템을 이용해서 특정 경기의 승률을 예측할 수 있고, 이를 기반으로 경기에 참여한 선수들의 레이팅을 보정한다. 아래의 이미지를 보며 설명하겠다.

![TrueSkill에서의 Factor Graph](/images/chzzk-racing-rating/factor-graph.png)

위 그래프에 대해 설명하자면, 먼저 플레이어의 실력 $s_i\sim\mathcal{N}(\mu_i,\sigma_i^2)$에 대해서 해당 경기에서의 플레이어의 퍼포먼스 $p_i\sim\mathcal{N}(s_i,\beta)$가 정해진다. 여기서 $\beta$는 시스템에서 임의로 정하는 퍼포먼스의 불확실도이다. 이를 기반으로 팀 전체의 퍼포먼스를 결정하는데, 이 때에는 단순히 팀원의 퍼포먼스를 더한다. 즉, $t_A=\sum_{i\in A} p_i$이다. 이제 마지막으로 팀 간의 대결 결과를 결정하는데, 이 때에는 각 팀의 퍼포먼스에 대한 차이를 구해서 $d=t_A-t_B$로 나타낸다. 만약 $d>\epsilon$이라면 팀 A가 이기고, $d<-\epsilon$이라면 팀 B가 이기는 것으로 예측한다. 그리고 $\left\|d\right\|<\epsilon$이라면 비기는 것으로 예측한다.

이제 위의 세 경우에 대한 예측 확률 $P(d>\epsilon)$, $P(d<-\epsilon)$, $P(\left\|d\right\|<\epsilon)$과 실제 경기 결과를 바탕으로 다시 플레이어의 레이팅을 업데이트한다. 위의 순서와는 역순으로 변수를 업데이트해가면서 결과적으로는 각 선수의 실력에서의 $\mu_i$와 $\sigma_i$가 업데이트되는 것이다. 정확히 어떤 값으로 보정되는지는 논문이나 웹페이지를 참고하길 바란다.

#### 대표값과 레이팅

TrueSkill에는 대표값을 따로 정의하기도 한다. 이 값은 주어진 플레이어의 실력 $s\sim\mathcal{N}(\mu, \sigma^2)$에 대해서 주로 $\mu-3\sigma$로 사용한다. 즉, 평균에서 표준편차의 3배를 뺀 값을 사용하는 것이다. 수식으로 표현해보자면 $P(s>\mu-3\sigma)\approx0.9987$이므로, 이 값을 레이팅으로 사용한다면 **플레이어의 실력이 레이팅 값보다 높을 확률이 약 99.87%**가 된다. 따라서 이 값을 레이팅으로 사용하는 것은 플레이어의 실력에 대한 보수적인 추정값을 대표값으로 사용하겠다는 의미이기도 하다. 아래의 그래프를 참조하면 더 이해하기 쉬울 것이다.

![μ±3σ 범위의 신뢰구간](/images/chzzk-racing-rating/mu-3sigma.png)

위 그래프에 대해 간단히 설명하자면, $P(\left\|s-\mu\right\|<3\sigma)=0.997$이므로 대략 99.7%의 확률로 플레이어의 실력이 $\mu-3\sigma$와 $\mu+3\sigma$ 사이에 존재한다는 것을 나타낸다. 반대로 생각해보면, 플레이어의 실력이 해당 범위의 바깥에 있을 확률은 0.3%밖에 되지 않는다는 것을 나타낸다. 그 중 절반인 대략 0.15%는 $\mu-3\sigma$보다 낮은 범위에 존재할 확률이므로, 플레이어의 실력이 $\mu-3\sigma$보다 높을 확률이 대략 99.85%가 되는 것이다.[^2]

#### 커스텀 설정

TrueSkill에서 설정할 수 있는 것은 아래와 같고, 기본적으로 설정되어있는 값도 같이 작성했다.

- 초기 실력값 $\mu_0=25$, $\sigma_0=\frac{25}{3}$
- 퍼포먼스의 불확실도 $\beta=\frac{25}{6}$
- 실력값의 변동 정도 $\tau=\frac{25}{300}$
- 무승부 허용 범위 $\epsilon=0.1$
- 레이팅의 최소 변동값 $\delta=0.0001$

TrueSkill에서 추천하는 것은 $\mu_0$, $\sigma_0$, $\beta$, $\tau$의 비율을 각각 3:1:0.5:0.01으로 설정하는 것이다. 따라서 위의 값들은 모두 이 비율을 만족하도록 설정된 값들이다. 다만 이 값들은 시스템에서 권장하는 값들이므로, 필요에 따라 조정할 수 있다. 이번 치레동 레이팅에서는 조금 다른 값을 사용했는데, 시작할 때 레이팅이 0이 되고 평균이 50이 되게 하는 값으로 설정했다. 그렇게 하면 처음 시작하는 사람은 $P(0<r<100)=0.997$인, 100점 만점의 레이팅 시스템과 유사하게 사용할 수 있기 때문이다.[^3] 따라서 아래와 같은 값으로 변경했다.

- 초기 실력값 $\mu_0=50$, $\sigma_0=\frac{50}{3}$
- 퍼포먼스의 불확실도 $\beta=\frac{50}{6}$
- 실력값의 변동 정도 $\tau=\frac{50}{300}$

또한 한 가지 더 설정을 진행했는데, 바로 무승부 허용 범위이다. 치레동에서는 무승부가 없기 때문에, 무승부 허용 범위의 값을 0으로 설정했다[^1].

### 가중치 시스템

> 본 항목은 베이즈 정리와 관련한 기초적인 내용을 알고 있다는 가정 하에 작성한 내용입니다. 만약 베이즈 정리에 대해 잘 모르신다면, [베이즈 정리](https://ko.wikipedia.org/wiki/%EB%B2%A0%EC%9D%B4%EC%A6%88_%EC%A0%95%EB%A6%AC) 항목을 참고하시길 바랍니다.

이전 포스트에서 언급했듯이, TrueSkill을 그대로 사용한다면 개인 실력을 중시하는 치레동에서 팀 결과만을 가지고 레이팅을 계산한다거나 경기의 중요성을 다르게 레이팅을 적용할 수 없다. 따라서 이를 가능하게 하기 위해 두 레이팅을 "섞는" 알고리즘을 추가했다. 여러 LLM에게 물어봤을 때 **precision blending**(아마 한국어로 하면 정확도 기반 합성이 될 것이다)이라고 부른 방법을 먼저 소개한다. 그리고 이를 활용하여 어떻게 레이팅을 업데이트했는지 설명하겠다.

#### 정확도 기반 정규분포 합성

먼저 두 개의 정규분포를 합성하는 방법에 대해 알아보겠다. 보통 두 개의 정규분포를 합성한다고 하면, 아래와 같은 방법을 사용한다.

$$
\begin{aligned}
X&\sim\mathcal{N}(\mu_X, \sigma_X^2)\\
Y&\sim\mathcal{N}(\mu_Y, \sigma_Y^2)\\
Z&\sim\mathcal{N}(\mu_X+\mu_Y, \sigma_X^2+\sigma_Y^2)
\end{aligned}
$$

위를 글로 설명하자면, 어떤 두 양(quantity)에 대한 분포가 있을 때 그 합을 나타내는 분포를 예측하는 과정이다. [^4] 하지만 여기서 하려고 하는 정규분포의 합성은 방향성이 조금 다르다. 같은 목표 변수에 대한 서로 다른 두 관측값을 기반으로 해당 변수의 더 정확한 분포를 예측하는 것이다. 그림으로 설명하자면 아래와 같다.

![정확도 기반 정규분포 합성](/images/chzzk-racing-rating/precision-blending.png)

합성하려는 두 정규분포는 점선으로 된 두 그래프이다. 하나는 평균 -1, 표준편차 1의 정규분포를 가지고 나머지 하나는 평균 2, 표준편차 1.5의 정규분포를 가졌다. 이 때 단순히 두 분포의 합에 대한 분포를 나타낸 것은 초록색 그래프, 그리고 우리가 원하는 **두 관측값으로부터 추론한 더 정확한 분포**로서 찾고자 하는 분포는 보라색이다. 조금 더 높은 정확도로 평균이 -1임을 관측했고 그보다는 낮은 정확도로 평균이 2임을 관측했다면, 아무래도 합성한 분포의 평균은 정확도가 더 높은 -1쪽에 가깝게 위치하는 것이 의미상 더 적절해보인다.

수식으로 표현하자면, 관측하려는 변수 $X$에 대한 관측값 $A$와 $B$가 있을 때, $P(X)$는 아래와 같은 식처럼 추정할 수 있다.

$$
P(X)\propto P(A)P(B)\\
$$

이제 위 식을 확률밀도함수로 다시 써보겠다.

$$
\begin{aligned}
f_{X}(x)&\propto f_A(x)\cdot f_B(x)\\
&=\frac{1}{\sqrt{2\pi\sigma_A^2}}\exp\left(-\frac{(x-\mu_A)^2}{2\sigma_A^2}\right)\cdot\frac{1}{\sqrt{2\pi\sigma_B^2}}\exp\left(-\frac{(x-\mu_B)^2}{2\sigma_B^2}\right)\\
&=\frac{1}{\sqrt{2\pi\sigma_A^2}\sqrt{2\pi\sigma_B^2}}\exp\left(-\frac{1}{2}\left(\frac{(x-\mu_A)^2}{\sigma_A^2}+\frac{(x-\mu_B)^2}{\sigma_B^2}\right)\right)\\
&\propto\exp\left(-\frac{1}{2}\left(\frac{(x-\mu_A)^2}{\sigma_A^2}+\frac{(x-\mu_B)^2}{\sigma_B^2}\right)\right)
\end{aligned}
$$

여기서 $\tau$, 또는 정확도(precision)라는 것을 분산의 역수로 정의하겠다. 즉, $\tau_A=\frac{1}{\sigma_A^2}$, $\tau_B=\frac{1}{\sigma_B^2}$이다. 그러면 위 식은 아래와 같이 표현할 수 있다.

$$
\begin{aligned}
f_{X}(x)&\propto\exp\left(-\frac{1}{2}\left(\tau_A\left(x-\mu_A\right)^2+\tau_B\left(x-\mu_B\right)^2\right)\right)\\
&=\exp\left(-\frac{1}{2}\left((\tau_A+\tau_B)x^2-2(\tau_A\mu_A+\tau_B\mu_B)x+(\tau_A\mu_A^2+\tau_B\mu_B^2)\right)\right)\\
&=\exp\left(-\frac{1}{2}\left((\tau_A+\tau_B)\left(x-\frac{\tau_A\mu_A+\tau_B\mu_B}{\tau_A+\tau_B}\right)^2+\frac{\tau_A\tau_B}{\tau_A+\tau_B}(\mu_A-\mu_B)^2\right)\right)\\
&=\exp\left(-\frac{1}{2}\cdot\frac{\tau_A\tau_B}{\tau_A+\tau_B}(\mu_A-\mu_B)^2\right)\cdot\exp\left(-\frac{1}{2}(\tau_A+\tau_B)\left(x-\frac{\tau_A\mu_A+\tau_B\mu_B}{\tau_A+\tau_B}\right)^2\right)\\
&\propto\exp\left(-\frac{1}{2}\frac{\left(x-\frac{\tau_A\mu_A+\tau_B\mu_B}{\tau_A+\tau_B}\right)^2}{\frac{1}{\tau_A+\tau_B}}\right)
\end{aligned}
$$

$X$이 정규분포라면, 위 식으로부터 다음과 같은 값을 가진다는 것을 볼 수 있다.

$$
\begin{aligned}
X&\sim\mathcal{N}\left(\mu_X',\sigma_X'\right)\\
\mu_X'&=\frac{\tau_A\mu_A+\tau_B\mu_B}{\tau_A+\tau_B}=\frac{\sigma_B^2\mu_A+\sigma_A^2\mu_B}{\sigma_B^2+\sigma_A^2}\\
\sigma_X'^2&=\frac{1}{\tau_A+\tau_B}\text{　or　}\frac{1}{\sigma_X'^2}=\frac{1}{\sigma_A^2}+\frac{1}{\sigma_B^2}
\end{aligned}
$$

#### 두 가지의 관측값

먼저 TrueSkill 레이팅에서 핵심으로 사용되는 베이즈 정리를 보자.

$$
P(S|R)\propto P(R|S)P(S)
$$

앞에서와 같이 두 관측값을 곱해서 새로운 분포를 사용하는 형태이고, 같은 방법을 통해서 계산할 수 있다. 다만, 위 식은 앞 식에서 의미가 더 부여된 것이라고 볼 수도 있다. $S$라는 **지금까지의 관측값**이 있고, $R$이라는 **새로운 관측값**이 있을 때, 새로운 분포를 찾는 수식이다. 말로 풀어쓰자면, 사후(事後)확률은 사전(事前)확률과 그에 기반하여 발생한 사건의 확률을 곱한 것에 비례한다는 것이다.

하지만 치레동에 맞는 레이팅 로직을 고민하면서 마주한 문제는 새로운 관측값 $R$이 하나가 아니라는 것이었다. 개인전 결과 $R_{Ind}$도 있고, 팀전 결과 $R_{Team}$도 있는 상황에서 어떻게 하면 이 두 관측값을 잘 버무려서 새로운 관측값 $R^\*$를 만들고, 이를 기반으로 최종 실력 $S\|R^\*$을 구할 수 있을까 하는 문제였다.

여기서 앞에서의 정규분포 합성을 이용해보자. 우선 두 결과를 단순히 곱해보겠다.

$$
\begin{aligned}
f_{S|R_{Ind}}(x)\cdot f_{S|R_{Team}}(x)&\propto\left(f_{R_{Ind}|S}(x)f_S(x)\right)\cdot\left(f_{R_{Team}|S}(x)f_S(x)\right)\\
&=f_{R_{Ind}|S}(x)\cdot f_{R_{Team}|S}(x)\cdot f_S(x)^2\\
&=\left(f_{R_{Ind}|S}(x)\cdot f_{R_{Team}|S}(x)\cdot f_S(x)\right)\cdot f_S(x)\\
\end{aligned}
$$

위 식은 사전확률이 두 번 적용된 형태로 볼 수도 있고, 우도에 사전확률이 반영되는 형태로도 볼 수 있기 때문에 이를 사후확률로서 사용하기에는 조금 이상해보인다. 그래서 사전확률의 차수가 1이 되도록 거듭제곱을 한 뒤 곱해보았다.

$$
a+b=1\text{인 실수 }a,b\text{에 대해서,}\\
\begin{aligned}
f_{S|R_{Ind}}(x)^{a}\cdot f_{S|R_{Team}}(x)^{b}&\propto\left(f_{R_{Ind}|S}(x)f_S(x)\right)^{a}\cdot\left(f_{R_{Team}|S}(x)f_S(x)\right)^{b}\\
&=f_{R_{Ind}|S}(x)^{a}\cdot f_{R_{Team}|S}(x)^{b}\cdot f_S(x)^{a+b}\\
&=\left(f_{R_{Ind}|S}(x)^{a}\cdot f_{R_{Team}|S}(x)^{b}\right)\cdot f_S(x)
\end{aligned}
$$

이렇게 하니 베이즈 정리의 꼴과 상당히 비슷한 형태가 된다. 우리가 이미 알고있는 사전확률 $f_S(x)$가 있고, 두 우도의 조합이 우도에 해당하는 항에 위치한다. 이제 여기서 앞의 괄호로 묶은 항을 $f_{R^\*\|S}(x)$로 정의하고 식을 다시 써보겠다.

$$
\begin{aligned}
f_{R^*|S}(x)&:= f_{R_{Ind}|S}(x)^{a}\cdot f_{R_{Team}|S}(x)^{b}\\
f_{S|R^*}(x)&\propto f_{R^*|S}(x)\cdot f_S(x)\\
&=\left(f_{R_{Ind}|S}(x)^{a}\cdot f_{R_{Team}|S}(x)^{b}\right)\cdot f_S(x)
\end{aligned}
$$

이렇게 하면 우도의 조합을 새로운 우도 $f_{R^\*\|S}$로 가지는, $S\|R^\*$에 대한 베이즈 정리와 완전히 같은 형태로 볼 수 있다. 이제 실제 $S\|R^\*$에 대한 수식을 구해보자. 지금까지 진행했던 전개를 다시 되돌아가면 된다.

$$
\begin{aligned}
f_{S|R^*}(x)&\propto f_{R^*|S}(x)\cdot f_S(x)\\
&=\left(f_{R_{Ind}|S}(x)^{a}\cdot f_{R_{Team}|S}(x)^{b}\right)\cdot f_S(x)\\
&=\left(f_{R_{Ind}|S}(x)\cdot f_S(x)\right)^{a}\cdot\left(f_{R_{Team}|S}(x)\cdot f_S(x)\right)^{b}\\
&\propto f_{S|R_{Ind}}(x)^{a}\cdot f_{S|R_{Team}}(x)^{b}
\end{aligned}
$$

편의상 $f_{S\|R_{Ind}}(x)\sim\mathcal{N}(\mu_I,\sigma_I^2)$와 $f_{S\|R_{Team}}(x)\sim\mathcal{N}(\mu_T,\sigma_T^2)$로 나타내겠다. 새로 정의한 변수와 앞에서 유도한 두 정규분포의 합성 식을 사용한다면, 최종적으로 정규분포 $f_{S\|R^*}(x)$는 아래와 같이 된다.

$$
\begin{aligned}
S|R^*&\sim\mathcal{N}(\mu^*, {\sigma^*}^2)\\
\mu^*&=\frac{a\tau_I\mu_I+b\tau_T\mu_T}{a\tau_I+b\tau_T}\\
\frac{1}{ {\sigma^*}^2}=\tau^*&=a\tau_I+b\tau_T
\end{aligned}
$$

이제 치레동 레이팅으로서의 목표를 되돌아보면, 개인전과 팀전 결과를 7:3 정도의 비율로 반영하는 레이팅 시스템을 만들고 싶었다. 따라서 $a=0.7$과 $b=0.3$으로 설정했다. 그렇게 하면 아래의 이미지의 빨간색 그래프와 같은 결과를 얻을 수 있다.

![개인전과 팀전 결과를 7:3으로 반영한 레이팅 시스템](/images/chzzk-racing-rating/weighted-precision-blending.png)

단순히 두 관측값을 곱한 그래프였던 보라색 그래프와 비교해보면, 전반적으로 빨간색 그래프가 파란색 그래프에 더 가까이 위치하는 것을 볼 수 있다. 이는 개인전 결과가 팀전 결과보다 더 높은 정확도로 관측되었기 때문인데, 실제로도 개인전 결과가 팀전 결과보다 더 높은 정확도로 관측된다고 가정했기 때문에 우리가 원하는 형태의 레이팅 시스템이 만들어졌다고 볼 수 있다. 또한, 그래프의 너비를 비교해보면,

### 결론

**이 레이팅이 어떤 의미를 가질 수 있는지, 어떻게 활용할 수 있는지에 대해서는 이 포스트에서 확인하지는 않았다**. 그래서 지금까지의 내용으로는 "그래서 이거 쓰면 뭐가 좋은데?"에 대한 질문에 대답을 할 수 없다. 지금까지는 그냥 "괜찮은 시스템 가져다가 대회 데이터에 도입해봤다" 정도이다. 사실 이 포스트를 작성하는 시점에서도 아직 확인해보지 않은 상태다. 따라서 다음 포스트는 이 레이팅이 얼마나 많은 의미나 활용처가 있을지 확인해보는 것이 될 것 같다.

사실 이러한 레이팅 시스템을 설계하고 정리를 하는 와중에 치레동 티어 회의가 있었다. 이번부터는 티어를 대회 결과뿐만 아니라 연습 태도, 성장 가능성 등도 고려해서 결정했다고 한다. 방송을 보지는 못했지만 회의를 진행하면서 티어메이커에 한 명씩 올려가면서 결정했던 것 같다(...). 원래는 이번에도 같은 방식으로 결정한다면 혹시라도 이 레이팅을 활용할 수 있었을까 싶은데 방식이 조금 바뀌어버린 것이 개인적으로는 아쉽다.

아무튼 결론을 내자면, 지수나 레이팅은 과거를 나타내는 값이다. 이번부터는 티어 결정이 미래 또한 고려하는 정성적인 요인을 반영하므로, 그러한 값들은 티어 결정에 있어서 이전보다는 상대적으로 큰 영향을 미치지 못할 것이다. 다만 티어 결정에 참고 자료로 활용될 수 있는 부분인만큼, 과거의 데이터를 조금 더 수학적으로 체계적인 시스템으로 다뤄보고 그 결과가 이전에 사용했던 수치와 어떠한 차이가 있는지 살펴보는 것에 의의를 두고 있다.

### 참조

- TrueSkill 공식 자료
  - 웹사이트: [Microsoft Research: TrueSkill™](https://www.microsoft.com/en-us/research/project/trueskill-ranking-system/)
  - 논문: [TrueSkill™: A Bayesian Skill Rating System](https://www.microsoft.com/en-us/research/wp-content/uploads/2006/01/TR-2006-80.pdf)
- Python TrueSkill 라이브러리
  - [웹페이지](https://trueskill.org/)
  - [깃허브](https://github.com/sublee/trueskill)

---

[^1]: 대회에서 무승부가 없기 때문에 해당 변수를 0으로 설정한다는 것은 확실하지는 않다. 혹시라도 이에 대해 잘 아신다면 알려주길 바란다. 하지만 일단 그렇게 해버렸으니 넘어가겠다.

[^2]: 흔히 통계학에서 사용하는 값인 0.997을 가져와서 사용하다보니 위에서 언급한 값과 약간의 차이가 발생했는데, 더 정확한 값인 0.9973을 사용해보면 거의 유사한 값이 나온다.

[^3]: 다만 실제로 100점 만점인 것은 아니고, 압도적인 실력을 계속 보여준다면 100점이 넘는 레이팅도 충분히 나올 수 있다.

[^4]: $X$와 $Y$가 서로 독립이어야 한다는 조건 등이 붙을 수 있지만 여기서 자세히 다루지는 않겠다.
