const fs = require('fs');
const path = require('path');

module.exports = function (app) {

    app.get('/users', function (req, res) {
        fs.readFile(path.join(__dirname, './users.json'), (err, data) => {
            if (err) throw err;
            res.send(data);
        });
    });

    app.post('/users', function (req, res) {
        fs.writeFile(path.join(__dirname, './users.json'), JSON.stringify(req.body), function (err) {
            if (err) return console.log(err);
            res.send('OK');
        });
    });
}
