const express = require('express');
const bodyParser = require('body-parser');
const variables = require('./variables');

const app = express();
app.use(bodyParser.json());

app.use(express.static('web'));

require('./user-mapping')(app);
require('./sender')(app);

app.listen(variables.port);
console.log('Notifier server started at port ' + variables.port);