const express = require("express");
const morgan = require("morgan");

express()
  .use(morgan("tiny"))
  .use(express.json())

  .get("*", (req, res) => {
    // catch-all endpoint
    res.status(404).json({
      status: 404,
      message: "Nothing here - sorry!",
    });
  })

  .listen(8000, () => console.log(`Listening on port 8000`));
