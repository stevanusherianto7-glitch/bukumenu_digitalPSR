const qrDownloadUrl = `https://quickchart.io/qr?text=test&ecLevel=H&size=1000&margin=2&dark=000000&light=FFFFFF&format=png`;

fetch(qrDownloadUrl).then(r => r.blob()).then(b => console.log('Blob OK', b.size)).catch(e => console.error('Fetch error:', e));
