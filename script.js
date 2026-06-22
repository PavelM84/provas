const DATA_URL = "./data.json";

let allData = [];

window.addEventListener("load", loadData);

async function loadData() {

    try {

        const response = await fetch(DATA_URL);

        allData = await response.json();

        console.log("Загружено записей:", allData.length);

        setupAutocomplete();
        fillArticleSelect();

        submitBtn.disabled = false;
        topBtn.disabled = false;

    } catch (err) {

        console.error(err);

        alert("Не удалось загрузить data.json");
    }
}



function fillArticleSelect() {

    const select =
        document.getElementById("articleInput");

    select.innerHTML =
        '<option value="">Все статьи</option>';

    const articles =
        [...new Set(
            allData
                .map(row => row.article)
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

    function setup(inputId, fieldName) {

        const input =
            document.getElementById(inputId);

        input.addEventListener("input", () => {

            const value =
                input.value.trim().toLowerCase();

            if (!value) {

                suggestions.innerHTML = "";
                suggestions.style.display = "none";

                return;
            }

            const list =
                [...new Set(

                    allData
                        .map(row => row[fieldName])
                        .filter(Boolean)

                )]
                .filter(item =>
                    item.toLowerCase().includes(value)
                )
                .slice(0, 10);

            suggestions.innerHTML =
                list.map(item =>
                    `<div class="suggestion-item">${item}</div>`
                ).join("");

            suggestions.style.display =
                list.length ? "block" : "none";

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

    setup("judgeInput", "judge");
    setup("defendantInput", "defendant");
}

function renderGraph(data) {

    const container =
        document.getElementById("tree-container");

    container.innerHTML = "";

    const judges = {};

    data.forEach(row => {

    if (!row.judge) return;

    if (row.judge.length < 5) return;

        const judge = row.judge;
        const article = row.article;
        const city = row.city;
        const region = row.region;
        const defendant = row.defendant;

        const judgePhoto = row.judgePhoto;
        const defendantPhoto = row.defendantPhoto;

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

    Object.entries(judges)
    .sort(
    (a,b) =>
    b[1].cases.length -
    a[1].cases.length
)    
        .forEach(([judge, info]) => {

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

    // поиск по судье
    if (judge) {

        filtered = allData.filter(row => {

            const articleOk =
                !article ||
                (row.article || "")
                    .toLowerCase()
                    .includes(article);

            return (
                row.judge &&
                row.judge.toLowerCase().includes(judge) &&
                articleOk
            );
        });
    }

    // поиск по подсудимому
    else if (defendant) {

        const judgesFound =
            [...new Set(

                allData
                    .filter(row =>
                        (row.defendant || "")
                            .toLowerCase()
                            .includes(defendant)
                    )
                    .map(row => row.judge)

            )];

        filtered =
            allData.filter(row => {

                const articleOk =
                    !article ||
                    (row.article || "")
                        .toLowerCase()
                        .includes(article);

                return (
                    judgesFound.includes(row.judge) &&
                    articleOk
                );
            });
    }

    // только статья
    else if (article) {

        filtered =
            allData.filter(row =>
                (row.article || "")
                    .toLowerCase()
                    .includes(article)
            );
    }

    renderGraph(filtered);
};
topBtn.onclick = () => {

    const article =
        articleInput.value.trim().toLowerCase();

    let sourceData = allData;

    if (article) {

        sourceData =
            allData.filter(row =>
                (row.article || "")
                    .toLowerCase()
                    .includes(article)
            );
    }

    const counts = {};

    sourceData.forEach(row => {

        const judge = row.judge;

        if (!judge) return;

        counts[judge] =
            (counts[judge] || 0) + 1;
    });

    const top5 =
        Object.entries(counts)
        .sort((a,b) => b[1] - a[1])
        .slice(0,5)
        .map(x => x[0]);

    const result =
        sourceData.filter(row =>
            top5.includes(row.judge)
        );

    renderGraph(result);
};

    const top5 =
        Object.entries(counts)
        .sort((a,b) => b[1]-a[1])
        .slice(0,5)
        .map(x => x[0]);

    renderGraph(
        allData.filter(row =>
            top5.includes(row.judge))
    );
};
