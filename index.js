// index.js
const fs = require('fs');
const express = require('express');
const { engine } = require('express-handlebars');
const app = express();
const port = 3000;

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

const filePath = './files/receipt.txt';
// tag::confirmation[]
app.get('/', (req, res) => {
    res.render('formsubmitted', { title: 'Form submitted!' });
})
// end::confirmation[]

// tag::receipt[]
app.get('/receipt', (req, res) => {

    fs.access(filePath, fs.constants.F_OK, (err) => {

        if (!err) { // File exists
            res.redirect('/download');
            return;
        }

        // File doesn't exist yet
        res.header('Retry-After', 1);
        res.render('receipt', { title: 'Receipt is being created' });

    });
});
// end::receipt[]

app.get('/download', (req, res) => {

    res.download(filePath, (err) => {
        if (err) {
            console.error(`Error during download: ${err}`);
            res.status(500).send('Error downloading the file.');
        } else {
            console.log(`File downloaded: ${filePath}`);
        }
    });
});

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});