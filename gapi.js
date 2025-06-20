function initClient() {
  gapi.client.init({
    apiKey: "AIzaSyDWZGfiG3f55Zpe0K3kkjoTcZzvMAONKb4",
    discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"]
  }).then(loadData);
}

gapi.load("client", initClient);
