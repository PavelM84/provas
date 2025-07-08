const sheetId = "1QboKxJA_rkU6HMy-L8Fm399O5qLNWgTNa_0VpP1slgM";
const range = "A2:F100";
let allData = [];

window.loadData = async function() {
  const response = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: range
  });

  allData = response.result.values || [];
  setupAutocomplete(allData);

  document.getElementById("submitBtn").disabled = false;
  document.getElementById("topBtn").disabled = false;
};

function setupAutocomplete(data) {
  const judgeInput = document.getElementById("judgeInput");
  const defendantInput = document.getElementById("defendantInput");
  const suggestions = document.getElementById("suggestions");

  function setup(input, index) {
    input.addEventListener("input", () => {
      const value = input.value.toLowerCase();
      if (!value) return suggestions.innerHTML = "";

      const list = [...new Set(data.map(row => row[index]))]
        .filter(name => name.toLowerCase().includes(value))
        .slice(0, 5);

      suggestions.innerHTML = list.map(name => `<div>${name}</div>`).join("");
      suggestions.style.display = "block";
      suggestions.style.position = "absolute";
      suggestions.style.top = (input.offsetTop + input.offsetHeight) + "px";
      suggestions.style.left = input.offsetLeft + "px";

      suggestions.querySelectorAll("div").forEach(div =>
        div.onclick = () => {
          input.value = div.textContent;
          suggestions.innerHTML = "";
        }
      );
    });
  }

  setup(judgeInput, 0);
  setup(defendantInput, 2);
}

function renderTree(data) {
  const counts = {};
  data.forEach(({ Judge }) => {
    counts[Judge] = (counts[Judge] || 0) + 1;
  });

  const byJudge = data.reduce((acc, { Judge, Court, Defendant, Articles }) => {
    if (!acc[Judge]) acc[Judge] = { Court, defendantSet: new Set() };
    acc[Judge].defendantSet.add(Defendant);
    return acc;
  }, {});

  const container = document.getElementById("tree-container");
  container.innerHTML = '';
  container.className = 'tree';

  Object.entries(byJudge).forEach(([judge, info]) => {
    const node = document.createElement('div');
    node.className = 'judge-node';
    node.innerHTML = `
      <img src="https://via.placeholder.com/80" alt="${judge}">
      <div class="label">
        <div class="name">${judge}</div>
        <div class="count">${counts[judge]} дел</div>
      </div>
      <div class="children">
        ${[...info.defendantSet].map(d => `<div class="child-node">${d}</div>`).join('')}
      </div>
    `;
    container.appendChild(node);
  });
}

document.getElementById("submitBtn").onclick = () => {
  const judge = document.getElementById("judgeInput").value.trim();
  const def = document.getElementById("defendantInput").value.trim();

  const filtered = allData.filter(([j, , d]) =>
    (!judge || j === judge) && (!def || d === def)
  );

  renderGraph(filtered);
};

document.getElementById("topBtn").onclick = () => {
  const counts = {};

  for (const [judge] of allData) {
    counts[judge] = (counts[judge] || 0) + 1;
  }

  const top5 = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([judge]) => judge);

  const filtered = allData.filter(([j]) => top5.includes(j));
  renderGraph(filtered);
};
