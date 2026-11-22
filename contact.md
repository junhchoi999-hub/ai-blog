---
layout: page
title: 문의
permalink: /contact/
description: "AI 써먹기 블로그에 오류 제보나 주제 제안을 보내는 방법입니다."
---

글의 오류 제보, 다뤄 줬으면 하는 주제 제안, 그 밖의 문의를 환영합니다.

{% if site.contact_email != "" %}
- **이메일**: [{{ site.contact_email }}](mailto:{{ site.contact_email }})
{% endif %}
{% if site.github.repository_url %}
- **GitHub**: [이슈 남기기]({{ site.github.repository_url }}/issues)
{% endif %}

오류 제보를 보내실 때는 해당 글의 주소와 틀린 부분을 함께 알려 주시면 빠르게 확인해 수정하겠습니다.
