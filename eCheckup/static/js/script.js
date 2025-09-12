function displayDocument(url) {
    console.log(url);
    const viewer = document.getElementById('document-viewer');
    
    // const downloadLink = document.getElementById('viewDocumentModalDownloadBtn');
    // downloadLink.href = url;
    // downloadLink.download = "Report.pdf";
    


    const viewerElement = document.getElementById("document-viewer");
    const existingDownloadBtn = document.getElementById("viewDocumentModalDownloadBtn");
    if (existingDownloadBtn) {
        const modalFooter = viewerElement.closest(".modal-body").nextElementSibling; // get the sibling footer
        
        if (modalFooter && modalFooter.classList.contains("modal-footer")) {
            // Create <a> element
            const downloadBtn = document.createElement("a");
            downloadBtn.className = "btn btn-primary";
            downloadBtn.id = "viewDocumentModalDownloadBtn";
            downloadBtn.innerHTML = "<b>Download Doc</b>";

            // Example: set href dynamically (if you know file URL)
            downloadBtn.href = url;
            downloadBtn.download = "document.pdf";

            // Append inside footer
            modalFooter.appendChild(downloadBtn);
        }
    }

    viewer.innerHTML = ''; // Clear previous content

    // Get the file extension
    const extension = url.split('.').pop().toLowerCase();

    // Create the appropriate element based on the file type
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
        // Image
        const img = document.createElement('img');
        img.src = url;
        img.alt = "Image document";
        img.className = 'img-fluid';
        viewer.appendChild(img);
    }
    else if (extension === 'pdf') {
        // Custom PDF Viewer
        console.log('Rendering PDF:', url);

        // Create navigation controls
        const controls = document.createElement('div');
        controls.id = 'pdf-controls';
        controls.innerHTML = `
            <button id="prev-page" class="btn btn-primary eh-btn-blue-primary-no-hover"><i class="fa fa-circle-chevron-left"></i></button>
            <span id="page-info">Page <span id="current-page">1</span> of <span id="total-pages">1</span></span>
            <button id="next-page" class="btn btn-primary eh-btn-blue-primary-no-hover"><i class="fa fa-circle-chevron-right"></i></button>
        `;
        viewer.appendChild(controls);

        // Create canvas for rendering the PDF
        const canvas = document.createElement('canvas');
        canvas.id = 'pdf-render';
        viewer.appendChild(canvas);

        // Initialize PDF.js
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        const pdfRender = canvas;
        const ctx = pdfRender.getContext('2d');
        let pdfDoc = null;
        let currentPage = 1;
        let totalPages = 0;

        // Render the current page
        function renderPage(pageNum) {
            pdfDoc.getPage(pageNum).then((page) => {
                const viewport = page.getViewport({ scale: 1.5 });
                pdfRender.width = viewport.width;
                pdfRender.height = viewport.height;

                const renderContext = {
                    canvasContext: ctx,
                    viewport: viewport,
                };
                page.render(renderContext);
                document.getElementById('current-page').textContent = pageNum;
            });
        }

        // Load the PDF and initialize the viewer
        pdfjsLib.getDocument(url).promise.then((pdf) => {
            pdfDoc = pdf;
            totalPages = pdf.numPages;
            document.getElementById('total-pages').textContent = totalPages;
            renderPage(currentPage);
        });

        // Add event listeners for navigation
        document.getElementById('prev-page').addEventListener('click', () => {
            if (currentPage <= 1) return;
            currentPage--;
            renderPage(currentPage);
        });

        document.getElementById('next-page').addEventListener('click', () => {
            if (currentPage >= totalPages) return;
            currentPage++;
            renderPage(currentPage);
        });
    }
    else if (['mp4', 'webm', 'ogg'].includes(extension)) {
        // Video
        const video = document.createElement('video');
        video.src = url;
        video.controls = true;
        video.style.width = "100%";
        video.style.maxHeight = '500px';
        viewer.appendChild(video);
    }
    else if (['mp3', 'wav', 'ogg'].includes(extension)) {
        // Audio
        const audio = document.createElement('audio');
        audio.src = url;
        audio.controls = true;
        audio.style.width = "100%";
        audio.style.maxHeight = '500px';
        viewer.appendChild(audio);
    }
    else {
        // Unsupported file type
        viewer.innerHTML = `<p>Unsupported document type: ${extension}, Please download to view!</p>`;
    }
}
