# -*- coding: utf-8 -*-
"""Add huangbo_wanlinglu entries to taxonomy.ts using JSON data file"""
import json

content = open('lib/taxonomy.ts', 'r', encoding='utf-8').read()
data = json.load(open('taxonomy_data.json', 'r', encoding='utf-8'))

# === 1. Add CONCEPTS ===
concepts_marker = "  }\n]\n;"
concepts_pos = content.rfind(concepts_marker)
if concepts_pos == -1:
    concepts_marker = "  }\n];"
    concepts_pos = content.rfind(concepts_marker)

concepts_ts = []
for c in data['concepts']:
    rc = ", ".join('"' + x + '"' for x in c['relatedConcepts'])
    rp = ", ".join('"' + x + '"' for x in c['relatedPersons'])
    rb = ", ".join('"' + x + '"' for x in c['relatedBooks'])
    concepts_ts.append('  },\n  {\n    "id": "' + c['id'] + '",\n    "title": "' + c['title'] + '",\n    "category": "' + c['category'] + '",\n    "summary": "' + c['summary'] + '",\n    "classicRef": "' + c['classicRef'] + '",\n    "relatedConcepts": [' + rc + '],\n    "relatedPersons": [' + rp + '],\n    "relatedBooks": [' + rb + ']\n  }')

content = content[:concepts_pos] + "\n".join(concepts_ts) + "\n]" + content[concepts_pos + len(concepts_marker):]

# === 2. Add METHODS ===
methods_marker = "  }\n]\n;"
methods_pos = content.rfind(methods_marker)
if methods_pos == -1 or methods_pos <= concepts_pos + 100:
    methods_marker = "  }\n];"
    methods_pos = content.rfind(methods_marker)

methods_ts = []
for m in data['methods']:
    rc = ", ".join('"' + x + '"' for x in m['relatedConcepts'])
    rp = ", ".join('"' + x + '"' for x in m['relatedPersons'])
    rb = ", ".join('"' + x + '"' for x in m['relatedBooks'])
    methods_ts.append('  },\n  {\n    "id": "' + m['id'] + '",\n    "title": "' + m['title'] + '",\n    "category": "' + m['category'] + '",\n    "summary": "' + m['summary'] + '",\n    "classicRef": "' + m['classicRef'] + '",\n    "relatedConcepts": [' + rc + '],\n    "relatedPersons": [' + rp + '],\n    "relatedBooks": [' + rb + ']\n  }')

content = content[:methods_pos] + "\n".join(methods_ts) + "\n]" + content[methods_pos + len(methods_marker):]

# === 3. Add KOANS ===
koans_marker = "  }\n];"
koans_pos = content.rfind(koans_marker)

koans_ts = []
for k in data['koans']:
    rc = ", ".join('"' + x + '"' for x in k['relatedConcepts'])
    rp = ", ".join('"' + x + '"' for x in k['relatedPersons'])
    rb = ", ".join('"' + x + '"' for x in k['relatedBooks'])
    koans_ts.append('  },\n  {\n    "id": "' + k['id'] + '",\n    "case": "' + k['case'] + '",\n    "question": "' + k['question'] + '",\n    "answer": "' + k['answer'] + '",\n    "interpretation": "' + k['interpretation'] + '",\n    "master": "' + k['master'] + '",\n    "source": "' + k['source'] + '",\n    "relatedConcepts": [' + rc + '],\n    "relatedPersons": [' + rp + '],\n    "relatedBooks": [' + rb + ']\n  }')

content = content[:koans_pos] + "\n".join(koans_ts) + "\n];" + content[koans_pos + len(koans_marker):]

# === 4. Add FAQs ===
faqs_marker = "  }\n];"
faqs_pos = content.rfind(faqs_marker)

faq_lines = []
for f in data['faqs']:
    rb = ", ".join("'" + x + "'" for x in f['relatedBooks'])
    q = f['question'].replace("'", "\\'")
    a = f['answer'].replace("'", "\\'")
    faq_lines.append("  },\n  {\n    id: '" + f['id'] + "',\n    question: '" + q + "',\n    answer: '" + a + "',\n    relatedBooks: [" + rb + "]")

content = content[:faqs_pos] + "\n".join(faq_lines) + "\n  }\n];" + content[faqs_pos + len(faqs_marker):]

open('lib/taxonomy.ts', 'w', encoding='utf-8').write(content)
print("Done: " + str(len(data['concepts'])) + " concepts, " + str(len(data['methods'])) + " methods, " + str(len(data['koans'])) + " koans, " + str(len(data['faqs'])) + " FAQs added")
