const fs = require('fs');

module.exports = function (app) {

    app.get('/users', function (req, res) {
        fs.readFile('./users.json', (err, data) => {
            if (err) throw err;
            res.send(data);
        });
    });

    app.post('/users', function (req, res) {
        fs.writeFile('./users.json', JSON.stringify(req.body), function (err) {
            if (err) return console.log(err);
            res.send('OK');
        });
    });
}
