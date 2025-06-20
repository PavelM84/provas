function initClient() {
  gapi.client.init({
    apiKey: "AKfycbxvnspyYJZu7v4-e3vFpn9EkdCtwmL2F8bnkN_9aA1-ABfSEtaieroDckoUoRVjqFnv",
    discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"]
  }).then(loadData);
}

gapi.load("client", initClient);
