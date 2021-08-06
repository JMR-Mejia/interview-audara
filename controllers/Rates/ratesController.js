const pool = require("../../config/db");
const validateForm = require("../../validations/validator");
const { rateValidations } = require("./ratesValidations");

const successCode = "2501";
const errorCode = "2504";

const serverError = {
  code: errorCode,
  msg: {
    error: "serverError",
  },
};

exports.handleCode = async (apiCode, req, res) => {
  try {
    switch (apiCode) {
      // Show callRate
      case "2500":
        return await showCallRate(req, res);

      case "2510":
        return await createRate(req, res);
      case "2511":
        return await rateList(req, res);
    }
  } catch (err) {
    return res.status(500).json(serverError);
  }
};

// -- API METHODS -- //

// Show callRate (2500)
const showCallRate = async (req, res) => {
  try {
    const rateId = parseInt(req.query.id) || "";

    // If id is empty
    if (rateId === "") {
      return res.status(200).json({
        code: errorCode,
        msg: {
          error: "id is empty",
        },
      });
    }

    //Gets rate data
    const result = await pool.query(`SELECT * FROM rates WHERE id = ?`, [
      rateId,
    ]);

    //Not found
    if (!result) {
      return res.status(200).json({
        code: errorCode,
        msg: {
          error: "notFoundError",
        },
      });
    }

    return res.status(200).json({
      code: successCode,
      msg: {
        data: result,
      },
    });
  } catch (error) {
    return res.status(500).json(serverError);
  }
};

// Create rate
const createRate = async (req, res) => {
  try {
    const dataRate = req.body;

    //validate form
    const formErrors = validateForm(dataRate, rateValidations);

    if (formErrors) {
      return res.status(200).json({
        code: errorCode,
        msg: {
          error: formErrors,
        },
      });
    }

    const saveRate = await pool.query(
      `
    INSERT INTO rates (${Object.keys(dataRate).join(",")})
    VALUES ?
    `,
      [Object.keys(dataRate).map((key) => dataRate[key])]
    );

    const getRate = await pool.query(
      `
      SELECT * FROM rates WHERE id= ?`,
      [saveRate["insertId"]]
    );
    delete getRate["meta"];
    return res.status(200).json({
      code: "2501",
      msg: {
        data: {
          ...getRate,
        },
      },
    });
  } catch (error) {
    return res.status(500).json(serverError);
  }
};

// Rate List
const rateList = async (req, res) => {
  const filters = req.query.filter || "";
  const perpage = req.query.perpage || 5;
  const page = req.query.page || 1;
  const order = req.query.order || "asc";
  const orderField = req.query.orderField || "name";

  try {
    console.log(`SELECT * FROM rates ${
      filters === "" ? "" : "WHERE name iLIKE " + filters
    } ORDER BY '${orderField}' ${order.toUpperCase()}
    LIMIT ? OFFSET ?;`);

    const getRate = await pool.query(
      `
      SELECT * FROM rates ${filters === "" ? "" : "WHERE name iLIKE " + filters}
      ORDER BY '${orderField}' ${order.toUpperCase()}
      LIMIT ${perpage} OFFSET ${page * perpage};
      `,
    );
    const countRate = await pool.query(
      `
      SELECT COUNT(*) FROM rates ${
        filters === "" ? "" : "WHERE name iLIKE " + filters
      }
      `
    );

    return res.status(200).json({
      code: "2501",
      msg: {
        data: [...getRate],
        from: 1,
        to: perpage,
        per_page: perpage,
        totalhits: countRate / perpage,
        current_page: page,
      },
    });
  } catch (error) {
    return res.status(500).json(serverError);
  }
};
