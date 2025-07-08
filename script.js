
const sheetId = "1QboKxJA_rkU6HMy-L8Fm399O5qLNWgTNa_0VpP1slgM";
const range = "A2:F100";
let allData = [];

window.onload = () => {
  gapi.load("client", async () => {
    await gapi.client.init({
      apiKey: "AIzaSyD6RZZxVCFv0WzRuBQqmgZZKjD7H8tPydE",
      discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    });
    loadData();
  });
};

async function loadData() {
  const response = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: range
  });
  allData = response.result.values || [];
  document.getElementById("submitBtn").disabled = false;
  document.getElementById("topBtn").disabled = false;
}

function renderTree(judgeName) {
  const container = document.getElementById("tree-container");
  container.innerHTML = "";

  const judgeCases = allData.filter(([j]) => j === judgeName);
  if (judgeCases.length === 0) return;

  const [_, judgePhoto] = judgeCases[0];
  const judgeNode = document.createElement("div");
  judgeNode.className = "tree-node judge";
  judgeNode.innerHTML = `<img src="\${judgePhoto}" alt="\${judgeName}"><br><strong>\${judgeName}</strong><br>\${judgeCases.length} дел`;
  container.appendChild(judgeNode);

  const subtree = document.createElement("div");
  subtree.className = "subtree";

  judgeCases.forEach(([_, __, defendant, defPhoto, pros, prosPhoto]) => {
    const def = document.createElement("div");
    def.className = "tree-node";
    def.innerHTML = `<img src="\${defPhoto}" alt="\${defendant}"><br><span>\${defendant}</span>`;

    const prosNode = document.createElement("div");
    prosNode.className = "tree-node";
    prosNode.innerHTML = `<img src="\${prosPhoto}" alt="\${pros}"><br><span>\${pros}</span>`;

    const caseBlock = document.createElement("div");
    caseBlock.className = "case-block";
    caseBlock.appendChild(def);
    caseBlock.appendChild(prosNode);
    subtree.appendChild(caseBlock);
  });

  container.appendChild(subtree);
}

document.getElementById("submitBtn").onclick = () => {
  const judge = document.getElementById("judgeInput").value.trim();
  renderTree(judge);
};

document.getElementById("topBtn").onclick = () => {
  const counts = {};
  for (const [j] of allData) {
    counts[j] = (counts[j] || 0) + 1;
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (top) renderTree(top[0]);
};
