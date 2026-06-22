const CSV_URL =
  "https://docs.google.com/spreadsheets/d/1QboKxJA_rkU6HMy-L8Fm399O5qLNWgTNa_0VpP1slgM/gviz/tq?tqx=out:csv";

let allData = [];

window.addEventListener("load", loadData);

async function loadData() {
  try {
    const response = await fetch(CSV_URL);
    const csvText = await response.text();

    const rows = parseCSV(csvText);

    // убираем заголовок
    allData = rows.slice(1);

    console.log("Загружено строк:", allData.length);

    setupAutocomplete(allData);

    document.getElementById("submitBtn").disabled = false;
    document.getElementById("topBtn").disabled = false;

  } catch (err) {
    console.error(err);
    alert("Ошибка загрузки данных");
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

function setupAutocomplete(data) {
  const judgeInput = document.getElementById("judgeInput");
  const defendantInput = document.getElementById("defendantInput");
  const suggestions = document.getElementById("suggestions");

  function setup(input, index) {
    input.addEventListener("input", () => {
      const value = input.value.toLowerCase();

      if (!value) {
        suggestions.innerHTML = "";
        suggestions.style.display = "none";
        return;
      }

      const list = [...new Set(data.map(row => row[index]))]
        .filter(name => name && name.toLowerCase().includes(value))
        .slice(0, 10);

      suggestions.innerHTML = list
        .map(name => `<div class="suggestion-item">${name}</div>`)
        .join("");

      suggestions.style.display = "block";

      suggestions.querySelectorAll(".suggestion-item").forEach(div => {
        div.onclick = () => {
          input.value = div.textContent;
          suggestions.innerHTML = "";
          suggestions.style.display = "none";
        };
      });
    });
  }

  setup(judgeInput, 0);
  setup(defendantInput, 2);
}

function renderGraph(filteredData) {
  const container = document.getElementById("tree-container");
  container.innerHTML = "";

  const judgeMap = {};

  filteredData.forEach(
    ([judge, judgePhoto, defendant, defPhoto, prosecutor, prosPhoto]) => {
      if (!judgeMap[judge]) {
        judgeMap[judge] = {
          photo: judgePhoto,
          cases: []
        };
      }

      judgeMap[judge].cases.push({
        defendant,
        defPhoto,
        prosecutor,
        prosPhoto
      });
    }
  );

  Object.entries(judgeMap).forEach(([judge, data]) => {
    const judgeBlock = document.createElement("div");
    judgeBlock.className = "tree-block";

    judgeBlock.innerHTML = `
      <div class="tree-node">
        <img src="${data.photo}" onerror="this.src='https://placehold.co/120x120'">
        <div class="label">${judge}</div>
        <div class="count">${data.cases.length} дел</div>
      </div>
      <div class="connect-line"></div>
    `;

    const subtree = document.createElement("div");
    subtree.className = "subtree";

    data.cases.forEach(item => {
      const block = document.createElement("div");
      block.className = "tree-block";

      block.innerHTML = `
        <div class="tree-node">
          <img src="${item.defPhoto}" onerror="this.src='https://placehold.co/120x120'">
          <div class="label">${item.defendant}</div>
        </div>

        <div class="connect-line"></div>

        <div class="tree-node">
          <img src="${item.prosPhoto}" onerror="this.src='https://placehold.co/120x120'">
          <div class="label">${item.prosecutor}</div>
        </div>
      `;

      subtree.appendChild(block);
    });

    judgeBlock.appendChild(subtree);
    container.appendChild(judgeBlock);
  });
}

document.getElementById("submitBtn").onclick = () => {
  const judge = document.getElementById("judgeInput").value.trim();
  const defendant = document.getElementById("defendantInput").value.trim();

  let filtered = [];

  if (judge) {
    filtered = allData.filter(row => row[0] === judge);
  } else if (defendant) {
    const match = allData.find(row => row[2] === defendant);

    if (match) {
      const judgeName = match[0];
      filtered = allData.filter(row => row[0] === judgeName);
    }
  }

  renderGraph(filtered);
};

document.getElementById("topBtn").onclick = () => {
  const counts = {};

  allData.forEach(row => {
    const judge = row[0];
    counts[judge] = (counts[judge] || 0) + 1;
  });

  const top5 = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(item => item[0]);

  const filtered = allData.filter(row => top5.includes(row[0]));

  renderGraph(filtered);
};
