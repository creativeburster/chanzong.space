import json, os, urllib.request

cookie_file = 'tools/backlinks/.browser_profile/zhihu_cookie.json'
with open(cookie_file, 'r', encoding='utf-8') as f:
    cd = json.load(f)
c_str = '; '.join([f'{k}={v}' for k,v in cd.items()])

q_list = [
    ('达摩血脉论', '1920463062604940234'),
    ('楞严经核心', '1936384195430687530'),
    ('八识规矩颂', '1962834109404542124'),
    ('信心铭', '459168425'),
    ('永嘉证道歌', '1967165225909335858'),
]

for name, qid in q_list:
    url = f'https://www.zhihu.com/api/v4/questions/{qid}?include=has_publishing_draft%2Crelationship'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Cookie': c_str})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            rel = data.get('relationship', {})
            my_ans = rel.get('my_answer')
            title = data.get('title', '')
            print(f'[{name}] QID {qid}: title={title[:25]}, my_answer={my_ans}')
    except Exception as e:
        print(f'[{name}] QID {qid} error: {e}')
