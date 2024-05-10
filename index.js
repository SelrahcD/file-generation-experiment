// index.js
const express = require('express');
const app = express();
const port = 3000;

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
        <a href="/download">Get your receipt</a>
      </body>
    </html>
  `;
    res.send(htmlContent);
})

app.get('/download', (req, res) => {
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
        <a href="/download">Download</a>
      </body>
    </html>
  `;
    res.send(htmlContent);
});

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});