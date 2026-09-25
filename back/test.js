const axios = require("axios");

axios
  .get("http://127.0.0.1:8000")
  .then((r) => console.log(r.data))
  .catch((e) => console.log(e));
