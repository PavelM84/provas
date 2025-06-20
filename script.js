const sheetId = "1QboKxJA_rkU6HMy-L8Fm399O5qLNWgTNa_0VpP1slgM";
const range = "A1:F100"; // Судья, Фото судьи, Подсудимый, Фото подсудимого, Прокурор, Фото прокурора

async function loadData() {
  const response = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: range,
  });

  const rows = response.result.values;
  if (!rows || rows.length === 0) return;

  const container = document.getElementById("tree-container");
  const [header, ...data] = rows;

  const judges = [...new Set(data.map(r => r[0]))];
  const defendants = [...new Set(data.map(r => r[2]))];

  fillFilter("judgeFilter", judges);
  fillFilter("defendantFilter", defendants);

  renderTree(data);
}

function fillFilter(id, items) {
  const select = document.getElementById(id);
  select.innerHTML = `<option value="">Все</option>` + items.map(name =>
    `<option>${name}</option>`).join("");
  select.onchange = () => {
    gapi.client.init().then(loadData);
  };
}

function renderTree(data) {
  const container = document.getElementById("tree-container");
  container.innerHTML = "";

  const judgeFilter = document.getElementById("judgeFilter").value;
  const defFilter = document.getElementById("defendantFilter").value;

  data.filter(r => (!judgeFilter || r[0] === judgeFilter) && (!defFilter || r[2] === defFilter))
      .forEach(row => {
    const [judge, judgePhoto, defendant, defPhoto, prosecutor, prosPhoto] = row;

    const node = document.createElement("div");
    node.className = "node";
    node.innerHTML = `
      <div><img src="${judgePhoto}" title="${judge}"><br>${judge}</div>
      <div class="connector"></div>
      <div><img src="${defPhoto}" title="${defendant}"><br>${defendant}</div>
      <div class="connector"></div>
      <div><img src="${prosPhoto}" title="${prosecutor}"><br>${prosecutor}</div>
    `;
    container.appendChild(node);
  });
}
