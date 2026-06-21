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
        console.log(allData[0]);

        setupAutocomplete(allData);
        fillArticleSelect(allData);

        document.getElementById("submitBtn").disabled = false;
        document.getElementById("topBtn").disabled = false;

    } catch (error) {

        console.error(error);
        alert("Не удалось загрузить данные из Google Sheets");
    }
}

function parseCSV(text) {

    const rows = [];

    const lines = text.split(/\r?\n/);

    for (const line of lines) {

        if (!line.trim()) continue;

        rows.push(line.split(","));
    }

    return rows;
}

function fillArticleSelect(data) {

    const select =
        document.getElementById("articleInput");

    const articles =
        [...new Set(
            data
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

function setupAutocomplete(data) {

    const judgeInput =
        document.getElementById("judgeInput");

    const defendantInput =
        document.getElementById("defendantInput");

    const suggestions =
        document.getElementById("suggestions");

    function setup(input, index) {

        input.addEventListener("input", () => {

            const value =
                input.value.toLowerCase();

            if (!value) {

                suggestions.innerHTML = "";
                suggestions.style.display = "none";

                return;
            }

            const list =
                [...new Set(data.map(row => row[index]))]
                .filter(name =>
                    name &&
                    name.toLowerCase().includes(value))
                .slice(0, 10);

            suggestions.innerHTML =
                list.map(name =>
                    `<div class="suggestion-item">${name}</div>`
                ).join("");

            suggestions.style.display = "block";

            suggestions.querySelectorAll(".suggestion-item")
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

    setup(judgeInput, 0);
    setup(defendantInput, 4);
}

function renderGraph(filteredData) {

    const container =
        document.getElementById("tree-container");

    container.innerHTML = "";

    const judgeMap = {};

    filteredData.forEach(row => {

        const judge = row[0];
        const article = row[1];
        const city = row[2];
        const region = row[3];
        const defendant = row[4];
        const prosecutor = row[5];

        const judgePhoto = row[6];
        const defendantPhoto = row[7];
        const prosecutorPhoto = row[8];

        if (!judgeMap[judge]) {

            judgeMap[judge] = {

                photo: judgePhoto,
                city,
                region,
                cases: []
            };
        }

        judgeMap[judge].cases.push({

            article,
            defendant,
            prosecutor,

            defendantPhoto,
            prosecutorPhoto
        });
    });

    Object.entries(judgeMap)
        .forEach(([judge, data]) => {

            const judgeBlock =
                document.createElement("div");

            judgeBlock.className =
                "tree-block";

            judgeBlock.innerHTML = `

                <div class="tree-node">

                    <img
                        src="${data.photo || ''}"
                        onerror="this.src='https://placehold.co/120x120'">

                    <div class="label">
                        ${judge}
                    </div>

                    <div class="count">
                        ${data.cases.length} дел
                    </div>

                    <div class="region">
                        ${data.region || ''}
                    </div>

                </div>

                <div class="connect-line"></div>
            `;

            const subtree =
                document.createElement("div");

            subtree.className =
                "subtree";

            data.cases.forEach(item => {

                const block =
                    document.createElement("div");

                block.className =
                    "tree-block";

                block.innerHTML = `

                    <div class="tree-node">

                        <img
                            src="${item.defendantPhoto || ''}"
                            onerror="this.src='https://placehold.co/120x120'">

                        <div class="label">
                            ${item.defendant}
                        </div>

                        <div class="article">
                            ${item.article}
                        </div>

                    </div>

                    <div class="connect-line"></div>

                    <div class="tree-node">

                        <img
                            src="${item.prosecutorPhoto || ''}"
                            onerror="this.src='https://placehold.co/120x120'">

                        <div class="label">
                            ${item.prosecutor || "—"}
                        </div>

                    </div>
                `;

                subtree.appendChild(block);
            });

            judgeBlock.appendChild(subtree);

            container.appendChild(judgeBlock);
        });
}

document.getElementById("submitBtn").onclick = () => {

    const judge =
        document.getElementById("judgeInput")
        .value
        .trim()
        .toLowerCase();

    const defendant =
        document.getElementById("defendantInput")
        .value
        .trim()
        .toLowerCase();

    const article =
        document.getElementById("articleInput")
        .value
        .trim()
        .toLowerCase();

    const filtered =
        allData.filter(row => {

            const judgeOk =
                !judge ||
                (row[0] || "")
                .toLowerCase()
                .includes(judge);

            const defendantOk =
                !defendant ||
                (row[4] || "")
                .toLowerCase()
                .includes(defendant);

            const articleOk =
                !article ||
                (row[1] || "")
                .toLowerCase()
                .includes(article);

            return (
                judgeOk &&
                defendantOk &&
                articleOk
            );
        });

    renderGraph(filtered);
};

document.getElementById("topBtn").onclick = () => {

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

    const filtered =
        allData.filter(row =>
            top5.includes(row[0]));

    renderGraph(filtered);
};
