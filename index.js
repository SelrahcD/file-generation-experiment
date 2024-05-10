// index.js
const fs = require('fs');
const express = require('express');
const app = express();
const port = 3000;

const filePath = './files/receipt.txt';

// tag::alllogic[]
app.get('/', (req, res) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Form submitted</title>
      </head>
      <body>
        <h1>Your form was submitted !</h1>
        <p>Thank you for your information.</p>
        <a href="/receipt">Get your receipt</a>
      </body>
    </html>
  `;
    res.send(htmlContent);
})

app.get('/receipt', (req, res) => {

    fs.access(filePath, fs.constants.F_OK, (err) => {

        if (!err) { // File exists
            res.redirect('/download');
            return;
        }

        // File doesn't exist yet
        const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>File Download</title>
      </head>
      <body>
        <h1>File download</h1>
        <p>We are creating your file.</p>
        <p>Please wait 5 seconds and click the download link below:</p>
        <a href="/receipt">Download</a>
      </body>
    </html>
  `;
        res.send(htmlContent);
    });
});

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
// end::alllogic[]

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});