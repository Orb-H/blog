---
layout: page
title: Series
permalink: /series/
---

포스트를 소재 별로 모아볼 수 있는 페이지입니다.

{% assign series = site.posts | group_by: "topic" %}
{%- for topic in series -%}
<h3>{{ topic.name }}</h3>
<ul>
{%- assign items = topic.items | sort: "date" -%}
{%- for post in topic.items reversed -%}
    <li><a href="{{ post.url }}">{{ post.title }}</a></li>
{%- endfor -%}
</ul>
{%- endfor -%}
