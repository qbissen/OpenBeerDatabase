const mongo = require("mongodb");
const MongoClient = mongo.MongoClient;
const dbURL = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "BeerDB";
const Grid = require("gridfs-stream");

const router = app => {
  /*
  GET findRecipeByName
  - Case-insensitive search to name value of Recipes collection
  =========================
  Parameters:
  name (Required): term to search for in name field of Recipes collection
  rpp (Default: 5): Results per page
  page (Default: 1): Page of results - 1 indexed
  */
  app.get("/findRecipeByName", (req, res) => {
    // Check if name parameter is given
    if (!req.query.name) {
      return res.status(400).json({ error: "name parameter is required" });
    }

    // Local variables from parameters
    const { name } = req.query;
    const rpp = parseInt(req.query.rpp) || 5;
    const page = parseInt(req.query.page) || 1;

    // Connect to database
    MongoClient.connect(dbURL, (err, database) => {
      if (err) throw err;
      // Get database object
      const dbObject = database.db(dbName);

      // Create regex pattern
      const regexString = `.\\b${name}.`;

      // Search recipes collections
      dbObject
        .collection("Recipes")
        .find({ Name: { $regex: regexString, $options: "i" } }, {})
        .skip(rpp * (page - 1))
        .limit(rpp)
        .toArray((err2, result) => {
          if (err2) throw err2;

          res.status(200).send(result);
        });
    });
  });

  /*
  GET image
  - Return image of beer baed on the color parameter passed in
  ==========================
  Parameters:
  color (Default: 0): Color number of the beer from its recipe
  */
  app.get("/image", (req, res) => {
    const color = parseInt(req.query.color) || 0;

    // Connect to database
    MongoClient.connect(dbURL, (err, database) => {
      if (err) throw err;
      // Get database object
      const dbObject = database.db(dbName);
      const gfs = Grid(dbObject, mongo);
      let readStream;

      switch (true) {
        case color <= 10:
          readStream = gfs.createReadStream({
            filename: "10.jpg"
          });
          readStream.pipe(res);
          break;
        case color <= 20:
          readStream = gfs.createReadStream({
            filename: "20.jpg"
          });
          readStream.pipe(res);
          break;
        case color <= 30:
          readStream = gfs.createReadStream({
            filename: "30.jpg"
          });
          readStream.pipe(res);
          break;
        case color <= 40:
          readStream = gfs.createReadStream({
            filename: "40.jpg"
          });
          readStream.pipe(res);
          break;
        default:
          readStream = gfs.createReadStream({
            filename: "50.jpg"
          });
          readStream.pipe(res);
          break;
      }
    });
  });

  /*
  GET comments
  - Return comments for a beer document with matching beer id
  ==================
  Parameters:
  beerID (Required): ID of beer to retrieve comments for
  rpp (Default: 5): Results per page
  page (Default: 1): Page of results - 1 indexed
  */
  app.get("/comments", (req, res) => {
    // Check if beerID parameter is given
    if (!req.query.beerID) {
      return res.status(400).json({ error: "beerID parameter is required" });
    }

    // Local variables from parameters
    const { beerID } = req.query;
    const rpp = parseInt(req.query.rpp) || 5;
    const page = parseInt(req.query.page) || 1;

    // Connect to database
    MongoClient.connect(dbURL, (err, database) => {
      if (err) throw err;
      // Get database object
      const dbObject = database.db(dbName);

      // Search Comments collection
      dbObject
        .collection("Comments")
        .find({ beerID }, {})
        .sort({ _id: -1 })
        .skip(rpp * (page - 1))
        .limit(rpp)
        .toArray((err2, result) => {
          if (err2) throw err2;

          res.status(200).send(result);
        });
    });
  });

  /**
   POST comment 
   - Create comment for a beer document with given beerID
   ==================
   Parameters:
   beerID (Required): ID of beer to associate with comment
   comment (Required): Comment to associate with beerID
   */
  app.post("/comment", (req, res) => {
    // Check if beerID and comment parameters are given
    if (!req.query.beerID || !req.query.comment) {
      return res
        .status(400)
        .json({ error: "beerID and comment parameters are required" });
    }

    const { beerID, comment } = req.query;

    // Connect to database
    MongoClient.connect(dbURL, (err, database) => {
      if (err) throw err;
      // Get database object
      const dbObject = database.db(dbName);

      // Post comment to Comments collection
      dbObject
        .collection("Comments")
        .insertOne({ beerID, comment }, (err2, result) => {
          if (err2) throw err2;

          res
            .status(200)
            .send(`Comment for beerID: ${beerID} was successfully saved`);
        });
    });
  });
};

module.exports = router;
