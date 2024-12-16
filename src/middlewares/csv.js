const { Parser } = require('json2csv');

const convertJsonToCsv = (req, res, next) => {
  res.jsonToCsv = (data, filename) => {
    try {
      const csv = new Parser().parse(data);

      res.header('Content-Type', 'text/csv');
      res.attachment(filename || 'data.csv'); // Use the filename passed or default to 'data.csv'
      res.send(csv);
    } catch (error) {
      next(error);
    }
  };
  next();
};

module.exports = convertJsonToCsv;
