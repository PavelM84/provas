import csv
import json
import requests

CSV_URL = "https://docs.google.com/spreadsheets/d/1QboKxJA_rkU6HMy-L8Fm399O5qLNWgTNa_0VpP1slgM/export?format=csv"

response = requests.get(CSV_URL)
response.raise_for_status()

lines = response.text.splitlines()

reader = csv.DictReader(lines)

data = []

for row in reader:

    data.append({
        "judge": row.get("Судья", "").strip(),
        "article": row.get("Статья", "").strip(),
        "city": row.get("Город", "").strip(),
        "region": row.get("Регион", "").strip(),
        "defendant": row.get("Подсудимый", "").strip(),
        "prosecutor": row.get("Прокурор", "").strip(),
        "judgePhoto": row.get("Фото судьи URL", "").strip(),
        "defendantPhoto": row.get("Фото подсудимого URL", "").strip(),
        "prosecutorPhoto": row.get("Фото прокурора URL", "").strip()
    })

with open("data.json", "w", encoding="utf-8") as f:
    json.dump(
        data,
        f,
        ensure_ascii=False,
        indent=2
    )

print(f"Выгружено {len(data)} записей")