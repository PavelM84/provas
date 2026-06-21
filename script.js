const CSV_URL =
  "https://docs.google.com/spreadsheets/d/1QboKxJA_rkU6HMy-L8Fm399O5qLNWgTNa_0VpP1slgM/gviz/tq?tqx=out:csv";

let allData = [];

window.addEventListener("load", loadData);

async function loadData() {
  try {
    const response = await fetch(CSV_URL);

    const text = await response.text();

    const rows = text
      .trim()
      .split("\n")
      .slice(1)
      .map(row => {
        return row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
          ?.map(x => x.replace(/^"|"$/g, "")) || [];
      });

    allData = rows;

    console.log("Загружено строк:", allData.length);

    setupAutocomplete(allData);

    document.getElementById("submitBtn").disabled = false;
    document.getElementById("topBtn").disabled = false;

  } catch (err) {
    console.error(err);
    alert("Не удалось загрузить данные из Google Sheets");
  }
}
