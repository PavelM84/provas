const sheetCSV = "https://docs.google.com/spreadsheets/d/1QboKxJA_rkU6HMy-L8Fm399O5qLNWgTNa_0VpP1slgM/export?format=csv&gid=0";

document.addEventListener("DOMContentLoaded", () => {
  fetch(sheetCSV)
    .then(res => res.text())
    .then(csv => {
      const rows = Papa.parse(csv, { header: true }).data;
      renderJudgeTree(rows);
    });
});

function renderJudgeTree(rows) {
  const judges = {};

  rows.forEach(r => {
    const name = r["Судья"];
    const photo = r["Фото судьи URL"];
    if (!name) return;

    if (!judges[name]) {
      judges[name] = { count: 0, photo };
    }
    judges[name].count += 1;
  });

  const container = document.getElementById("tree-container");
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.flexWrap = "wrap";
  wrapper.style.justifyContent = "center";
  wrapper.style.gap = "20px";

  Object.entries(judges).forEach(([name, { count, photo }]) => {
    const card = document.createElement("div");
    card.style.border = "1px solid #ccc";
    card.style.borderRadius = "10px";
    card.style.padding = "10px";
    card.style.width = "150px";
    card.style.textAlign = "center";
    card.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
    card.style.background = "#fff";

    const img = document.createElement("img");
    img.src = photo || "https://via.placeholder.com/100x100?text=Фото";
    img.alt = name;
    img.style.width = "100px";
    img.style.height = "100px";
    img.style.borderRadius = "50%";
    img.style.objectFit = "cover";

    const h3 = document.createElement("h3");
    h3.textContent = name;
    h3.style.fontSize = "16px";
    h3.style.margin = "10px 0 5px";

    const p = document.createElement("p");
    p.textContent = `Дел: ${count}`;
    p.style.margin = 0;
    p.style.fontSize = "14px";
    p.style.color = "#555";

    card.appendChild(img);
    card.appendChild(h3);
    card.appendChild(p);
    wrapper.appendChild(card);
  });

  container.appendChild(wrapper);
}
