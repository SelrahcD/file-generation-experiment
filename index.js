// index.js
const fs = require('fs');
const express = require('express');
const app = express();
const port = 3000;

const filePath = './files/receipt.txt';

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

// tag::receipt[]
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
      <script>
        // Function to perform a GET request to the current page
       async function pollForFile() {
          const response = await fetch(window.location.href);
          
          const contentDisposition = response.headers.get('Content-Disposition');
          
          if(contentDisposition && contentDisposition.includes('attachment')) {
           console.log('The content is marked for attachment download.');

            // Extract filename (if any) from Content-Disposition
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
            const filename = filenameMatch ? filenameMatch[1] : 'default-filename';

            // Process the response as a Blob and initiate the download
            const data = await response.blob();
            const downloadUrl = window.URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
          }
      }
    
        // Set up an interval to call the function every 5 seconds (5000 ms)
        setInterval(pollForFile, 2000);
      </script>
    </html>
  `;
        res.send(htmlContent);
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