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

        if (!csvText.includes('Судья')) {
            throw new Error('Google Sheets вернул не CSV');
        }

        const parsed = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true
        });

        allData = parsed.data;

        console.log('Загружено строк:', allData.length);

        buildData();
        buildArticleList();

        document.getElementById('submitBtn').disabled = false;
        document.getElementById('topBtn').disabled = false;

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

        if (!judge && !defendant) {
            continue;
        }

        const judgeName =
            judge || 'Неизвестный судья';

        judgeCases.set(
            judgeName,
            (judgeCases.get(judgeName) || 0) + 1
        );

        if (!judges[judgeName]) {
            judges[judgeName] = {
                name: judgeName,
                cases: [],
                defendants: new Set()
            };
        }

        const defendants = defendant
            ? defendant
                .split(',')
                .map(x => x.trim())
                .filter(Boolean)
            : [];

        judges[judgeName].cases.push({
            defendants,
            article,
            city,
            region
        });

        defendants.forEach(d => {
            judges[judgeName]
                .defendants
                .add(d);
        });
    }

    console.log(
        'Количество судей:',
        Object.keys(judges).length
    );
}

function buildArticleList() {
    const select =
        document.getElementById('articleInput');

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

function getTopJudges(limit = 5) {
    return [...judgeCases.entries()]
        .sort((a, b) => {
            if (b[1] !== a[1]) {
                return b[1] - a[1];
            }

            return a[0]
                .localeCompare(
                    b[0],
                    'ru'
                );
        })
        .slice(0, limit);
}

document
    .getElementById('topBtn')
    .addEventListener('click', () => {

        const top5 =
            getTopJudges();

        const text =
            top5
                .map(
                    ([judge, count], i) =>
                        `${i + 1}. ${judge} — ${count}`
                )
                .join('\n');

        alert(text);
    });

document
    .getElementById('submitBtn')
    .addEventListener('click', () => {

        const judgeName =
            document
                .getElementById('judgeInput')
                .value
                .trim();

        if (!judgeName) {
            return;
        }

        const judge =
            judges[judgeName];

        if (!judge) {
            alert('Судья не найден');
            return;
        }

        renderJudge(judge);
    });

function renderJudge(judge) {
    const container =
        document.getElementById(
            'tree-container'
        );

    container.innerHTML = '';

    const title =
        document.createElement('h2');

    title.textContent =
        `${judge.name} (${judge.cases.length} дел)`;

    container.appendChild(title);

    judge.cases.forEach(c => {
        const div =
            document.createElement('div');

        div.className = 'case';

        div.innerHTML = `
            <div>
                <b>Подсудимые:</b>
                ${c.defendants.join(', ') || 'Не указаны'}
            </div>

            <div>
                <b>Статья:</b>
                ${c.article}
            </div>

            <div>
                <b>Город:</b>
                ${c.city}
            </div>

            <div>
                <b>Регион:</b>
                ${c.region}
            </div>
            <hr>
        `;

        container.appendChild(div);
    });
}
