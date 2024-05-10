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

      async function fetchWithRetryAfter(taskFn, maxRetries = 5) {
        let attempt = 0;
        let delayMs = 0;
    
        while (attempt < maxRetries) {
            // Attempt to run the task function
            const result = await taskFn();
            
            attempt++;
            if (attempt >= maxRetries) {
                throw new Error('Max attempts')
            }
            
            if(result.type !== 'retry-after') {
               return result.value;
            }
            
            delayMs = result.value * 1000;
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    
        // Function to perform a GET request to the current page
       async function pollForFile(url) {
          const response = await fetch(url);
          
          if(response.headers.get('Retry-After')) {
              return {
                type: 'retry-after',
                value: response.headers.get('Retry-After')
              };
          }
          
          const contentDisposition = response.headers.get('Content-Disposition');
          
          if(contentDisposition && contentDisposition.includes('attachment')) {
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
          
          return {
                type: 'success',
                value: true
              };
      }
    
    fetchWithRetryAfter(() => pollForFile(window.location.href), 10)
        .then(result => console.log(result))
        .catch(error => console.error(error.message));
       
      </script>
    </html>
  `;
        res.header('Retry-After', 5);
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