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

      async function retryWithDelay(taskFn, maxRetries = 5, delayMs = 2000) {
        let attempt = 0;
    
        while (attempt < maxRetries) {
            console.log('Attempt');
            // Attempt to run the task function
            const result = await taskFn();
            
            if(result) {
                 return result;
            }

            attempt++;
            if (attempt >= maxRetries) {
                throw new Error('Max attempts')
            }

            // Log the failure and delay before the next attempt
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    
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
            return true;
          }
          
          return false;
      }
    
    retryWithDelay(pollForFile, 10, 5000)
        .then(result => console.log(result))
        .catch(error => console.error(error.message));
       
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