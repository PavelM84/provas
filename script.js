const CSV_URL =
"https://docs.google.com/spreadsheets/d/1QboKxJA_rkU6HMy-L8Fm399O5qLNWgTNa_0VpP1slgM/gviz/tq?tqx=out:csv";

let allData = [];

window.addEventListener("load", loadData);

async function loadData() {

    try {

        const response = await fetch(CSV_URL);
        const csvText = await response.text();

        const rows = parseCSV(csvText);

        allData = rows.slice(1);

        console.log("Загружено строк:", allData.length);

        setupAutocomplete();
        fillArticleSelect();

        submitBtn.disabled = false;
        topBtn.disabled = false;

    } catch (err) {

        console.error(err);

        alert("Не удалось загрузить данные из Google Sheets");
    }
}

function parseCSV(text) {

    const rows = [];
    let row = [];
    let cell = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {

        const char = text[i];

        if (char === '"') {

            inQuotes = !inQuotes;

        } else if (char === "," && !inQuotes) {

            row.push(cell);
            cell = "";

        } else if ((char === "\n" || char === "\r") && !inQuotes) {

            if (cell || row.length) {

                row.push(cell);
                rows.push(row);

                row = [];
                cell = "";
            }

        } else {

            cell += char;
        }
    }

    if (cell || row.length) {

        row.push(cell);
        rows.push(row);
    }

    return rows;
}

function fillArticleSelect() {

    const select =
        document.getElementById("articleInput");

    select.innerHTML =
        '<option value="">Все статьи</option>';

    const articles =
        [...new Set(
            allData
                .map(row => row[1])
                .filter(Boolean)
        )]
        .sort();

    articles.forEach(article => {

        const option =
            document.createElement("option");

        option.value = article;
        option.textContent = article;

        select.appendChild(option);
    });
}

function setupAutocomplete() {

    const suggestions =
        document.getElementById("suggestions");

    function setup(inputId, columnIndex) {

        const input =
            document.getElementById(inputId);

        input.addEventListener("input", () => {

            const value =
                input.value.toLowerCase();

            if (!value) {

                suggestions.innerHTML = "";
                suggestions.style.display = "none";
                return;
            }

            const list =
                [...new Set(
                    allData.map(row => row[columnIndex])
                )]
                .filter(item =>
                    item &&
                    item.toLowerCase().includes(value))
                .slice(0, 10);

            suggestions.innerHTML =
                list.map(item =>
                    `<div class="suggestion-item">${item}</div>`
                ).join("");

            suggestions.style.display = "block";

            suggestions.querySelectorAll("div")
                .forEach(div => {

                    div.onclick = () => {

                        input.value =
                            div.textContent;

                        suggestions.innerHTML = "";
                        suggestions.style.display = "none";
                    };
                });
        });
    }

    setup("judgeInput", 0);
    setup("defendantInput", 4);
}

function renderGraph(data) {

    const container =
        document.getElementById("tree-container");

    container.innerHTML = "";

    const judges = {};

    data.forEach(row => {

        const judge = row[0];
        const article = row[1];
        const city = row[2];
        const region = row[3];
        const defendant = row[4];

        const judgePhoto = row[6];
        const defendantPhoto = row[7];

        if (!judges[judge]) {

            judges[judge] = {

                region,
                city,
                photo: judgePhoto,
                cases: []
            };
        }

        judges[judge].cases.push({

            defendant,
            article,
            photo: defendantPhoto
        });
    });

    const sortedJudges =
        Object.entries(judges)
        .sort(
            (a, b) =>
            b[1].cases.length -
            a[1].cases.length
        );

    sortedJudges.forEach(([judge, info]) => {

        const block =
            document.createElement("div");

        block.className =
            "judge-wrapper";

        block.innerHTML = `

            <div class="judge-card">

                <img
                    src="${info.photo || ''}"
                    onerror="this.src='https://placehold.co/150x150'">

                <h2>${judge}</h2>

                <div class="judge-region">
                    ${info.region || ""}
                </div>

                <div class="judge-count">
                    Дел: ${info.cases.length}
                </div>

            </div>

            <div class="defendants-grid"></div>

        `;

        const grid =
            block.querySelector(".defendants-grid");

        info.cases.forEach(item => {

            const card =
                document.createElement("div");

            card.className =
                "defendant-card";

            card.innerHTML = `

                <img
                    src="${item.photo || ''}"
                    onerror="this.src='https://placehold.co/120x120'">

                <div class="defendant-name">
                    ${item.defendant || ""}
                </div>

                <div class="defendant-article">
                    ${item.article || ""}
                </div>

            `;

            grid.appendChild(card);
        });

        container.appendChild(block);
    });
}

submitBtn.onclick = () => {

    const judge =
        judgeInput.value.trim().toLowerCase();

    const defendant =
        defendantInput.value.trim().toLowerCase();

    const article =
        articleInput.value.trim().toLowerCase();

    let filtered = [];

    if (judge) {

        filtered = allData.filter(row => {

            const articleOk =
                !article ||
                (row[1] || "")
                    .toLowerCase()
                    .includes(article);

            return (
                row[0] &&
                row[0].toLowerCase().includes(judge) &&
                articleOk
            );
        });
    }

    else if (defendant) {

        const judgesFound =
            [...new Set(
                allData
                    .filter(row =>
                        (row[4] || "")
                            .toLowerCase()
                            .includes(defendant)
                    )
                    .map(row => row[0])
            )];

        filtered =
            allData.filter(row => {

                const articleOk =
                    !article ||
                    (row[1] || "")
                        .toLowerCase()
                        .includes(article);

                return (
                    judgesFound.includes(row[0]) &&
                    articleOk
                );
            });
    }

    else if (article) {

        const articleRows =
            allData.filter(row =>
                (row[1] || "")
                    .toLowerCase()
                    .includes(article)
            );

        const judgeCounts = {};

        articleRows.forEach(row => {

            const judge = row[0];

            judgeCounts[judge] =
                (judgeCounts[judge] || 0) + 1;
        });

        const sortedJudges =
            Object.entries(judgeCounts)
            .sort((a, b) => b[1] - a[1])
            .map(item => item[0]);

        filtered = [];

        sortedJudges.forEach(judge => {

            filtered.push(
                ...articleRows.filter(
                    row => row[0] === judge
                )
            );
        });
    }

    renderGraph(filtered);
};

topBtn.onclick = () => {

    const counts = {};

    allData.forEach(row => {

        const judge = row[0];

        counts[judge] =
            (counts[judge] || 0) + 1;
    });

    const top5 =
        Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(item => item[0]);

    renderGraph(
        allData.filter(row =>
            top5.includes(row[0]))
    );
};
