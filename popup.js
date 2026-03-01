document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('downloadBtn');
    const statusDiv = document.getElementById('status');

    async function fetchImageAsBase64(url) {
        let response = await chrome.runtime.sendMessage({ action: "fetchImage", url: url });
        if (response.error) throw new Error(response.error);
        return response.base64;
    }

    async function loadImageDetails(dataUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = dataUrl;
        });
    }

    btn.addEventListener('click', async () => {
        statusDiv.innerText = "Checking active tab...";
        btn.disabled = true;

        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab || (!tab.url.includes('fliphtml5.com') && !tab.url.includes('fliphtml5.net'))) {
            statusDiv.innerHTML = "<span style='color:red;'>Error:</span> Please open a FlipHTML5 book page first!";
            btn.disabled = false;
            return;
        }

        try {
            statusDiv.innerText = "Extracting book data...";

            let [{ result }] = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                world: "MAIN",
                func: () => {
                    if (window.fliphtml5_pages && Array.isArray(window.fliphtml5_pages)) {
                        return window.fliphtml5_pages.map(p => ({
                            n: p.n || null,
                            l: p.l || null
                        }));
                    }
                    if (window.bookConfig && window.bookConfig.totalPageCount) {
                        return { error: "Metadata detected, but image pages are hard-locked." };
                    }
                    return null;
                }
            });

            if (result && result.error) {
                statusDiv.innerHTML = `<span style='color:red;'>Failed:</span> ${result.error}`;
                btn.disabled = false;
                return;
            }

            if (!result || result.length === 0) {
                statusDiv.innerHTML = "<span style='color:red;'>Failed to find images!</span><br>The book might be highly protected or not fully loaded.";
                btn.disabled = false;
                return;
            }

            let pages = result;
            let baseUrl = new URL(tab.url);
            let basePath = baseUrl.pathname.split('/').slice(0, 3).join('/') + '/';
            let baseOrigin = baseUrl.origin + basePath;
            let bookId = baseUrl.pathname.split('/')[2] || "FlipHTML5_Book";

            statusDiv.innerText = `Found ${pages.length} pages. Starting PDF generation...`;

            const { jsPDF } = window.jspdf;
            let pdf = null;
            let processedCount = 0;

            for (let i = 0; i < pages.length; i++) {
                let pageObj = pages[i];
                let relativePath = pageObj.n || pageObj.l;

                if (!relativePath) continue;

                let fileUrl = relativePath.startsWith('http') ? relativePath : baseOrigin + relativePath;

                statusDiv.innerText = `Processing page ${i + 1} of ${pages.length}...`;

                try {
                    let response = await fetch(fileUrl);
                    if (!response.ok) throw new Error("HTTP " + response.status);

                    let blob = await response.blob();
                    let base64Data = await new Promise((resolve, reject) => {
                        let reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });

                    let img = await loadImageDetails(base64Data);

                    let orientation = img.naturalWidth > img.naturalHeight ? 'l' : 'p';

                    if (pdf === null) {
                        pdf = new jsPDF({
                            orientation: orientation,
                            unit: 'px',
                            format: [img.naturalWidth, img.naturalHeight]
                        });

                        pdf.addImage(base64Data, 'WEBP', 0, 0, img.naturalWidth, img.naturalHeight);
                    } else {
                        pdf.addPage([img.naturalWidth, img.naturalHeight], orientation);
                        pdf.addImage(base64Data, 'WEBP', 0, 0, img.naturalWidth, img.naturalHeight);
                    }

                    processedCount++;

                } catch (imgError) {
                    console.error(`Failed to process page ${fileUrl}`, imgError);
                }

                await new Promise(r => setTimeout(r, 100));
            }

            if (processedCount > 0) {
                statusDiv.innerText = "Finalizing PDF... please wait!";

                pdf.save(`${bookId}.pdf`);

                statusDiv.innerHTML = `<span style='color:green;font-weight:bold;'>Success!</span><br>PDF with ${processedCount} pages has been downloaded.`;
            } else {
                statusDiv.innerHTML = `<span style='color:red;'>Failed:</span> No pages were successfully processed.`;
            }

        } catch (e) {
            console.error(e);
            statusDiv.innerHTML = `<span style='color:red;'>Critical error occurred:</span> Open console for details.`;
        }

        btn.disabled = false;
    });
});
