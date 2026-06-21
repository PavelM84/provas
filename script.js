const CSV_URL =
'https://docs.google.com/spreadsheets/d/1QboKxJA_rkU6HMy-L8Fm399O5qLNWgTNa_0VpP1slgM/gviz/tq?tqx=out:csv';

let allData = [];
let judges = {};
let judgeCases = new Map();

window.addEventListener('load', loadData);

async function loadData() {
    try {
        const response = await fetch(CSV_URL);
        const csvText = await response.text();

        const parsed = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: false
        });

        allData = parsed.data;

        console.log('Загружено строк:', allData.length);

        buildData();
        buildArticleList();
        updateTop5();

    } catch (err) {
        console.error(err);
        alert('Не удалось загрузить таблицу');
    }
}

function buildData() {
    judges = {};
    judgeCases.clear();

    for (const row of allData) {
        const judge =
            (row['Судья'] || '').trim();

        const defendant =
            (row['Подсудимый'] || '').trim();

        const article =
            (row['Статья'] || '').trim();

        const city =
            (row['Город'] || '').trim();

        const region =
            (row['Регион'] || '').trim();

        // строки без судьи пропускаем
        if (!judge) {
            continue;
        }

        // считаем количество дел
        judgeCases.set(
            judge,
            (judgeCases.get(judge) || 0) + 1
        );

        // создаём судью
        if (!judges[judge]) {
            judges[judge] = {
                name: judge,
                cases: [],
                defendants: new Set()
            };
        }

        judges[judge].cases.push({
            defendant,
            article,
            city,
            region
        });

        if (defendant) {
            judges[judge]
                .defendants
                .add(defendant);
        }
    }

    console.log(
        'Количество судей:',
        Object.keys(judges).length
    );
}

function getTopJudges(limit = 5) {
    return [...judgeCases.entries()]
        .sort((a, b) => {
            // сначала по количеству дел
            if (b[1] !== a[1]) {
                return b[1] - a[1];
            }

            // потом по алфавиту
            return a[0].localeCompare(
                b[0],
                'ru'
            );
        })
        .slice(0, limit);
}

function updateTop5() {
    const top5 = getTopJudges();

    console.log('ТОП-5 судей');

    top5.forEach(([judge, count]) => {
        console.log(
            `${judge}: ${count}`
        );
    });
}

function buildArticleList() {
    const select =
        document.getElementById('articleInput');

    if (!select) return;

    const articles =
        [...new Set(
            allData
                .map(
                    row =>
                        (row['Статья'] || '')
                            .trim()
                )
                .filter(Boolean)
        )]
        .sort((a, b) =>
            a.localeCompare(b, 'ru')
        );

    select.innerHTML =
        '<option value="">Все статьи</option>';

    articles.forEach(article => {
        const option =
            document.createElement('option');

        option.value = article;
        option.textContent = article;

        select.appendChild(option);
    });
}

function findJudge(name) {
    return judges[name] || null;
}

function searchJudge(name) {
    const judge = findJudge(name);

    if (!judge) {
        console.log('Не найден');
        return;
    }

    console.log(judge);
}

function searchDefendant(name) {
    const result = [];

    for (const judgeName in judges) {
        const judge = judges[judgeName];

        for (const c of judge.cases) {
            if (
                c.defendant &&
                c.defendant
                    .toLowerCase()
                    .includes(name.toLowerCase())
            ) {
                result.push({
                    judge: judgeName,
                    ...c
                });
            }
        }
    }

    return result;
}
