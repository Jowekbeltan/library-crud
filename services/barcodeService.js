const QRCode = require('qrcode');
const { createCanvas } = require('canvas');
const jsbarcode = require('jsbarcode');

class BarcodeService {
    // Generate QR Code for a book
    async generateQRCode(bookData, options = {}) {
        try {
            const { title, author, isbn, id } = bookData;
            const qrData = JSON.stringify({
                bookId: id,
                title: title,
                author: author,
                isbn: isbn,
                type: 'library_book'
            });
            
            const qrOptions = {
                width: options.width || 200,
                height: options.height || 200,
                margin: 1,
                color: {
                    dark: options.darkColor || '#000000',
                    light: options.lightColor || '#FFFFFF'
                }
            };
            
            const qrCodeDataURL = await QRCode.toDataURL(qrData, qrOptions);
            return qrCodeDataURL;
            
        } catch (error) {
            console.error('QR Code generation error:', error);
            throw error;
        }
    }
    
    // Generate Barcode for ISBN
    generateBarcode(isbn, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                const canvas = createCanvas(options.width || 300, options.height || 100);
                
                jsbarcode(canvas, isbn, {
                    format: "CODE128",
                    width: 2,
                    height: 40,
                    displayValue: true,
                    text: `${isbn}`,
                    fontOptions: "bold",
                    textMargin: 10,
                    fontSize: 16,
                    background: options.background || "#ffffff",
                    lineColor: options.lineColor || "#000000"
                });
                
                const barcodeDataURL = canvas.toDataURL();
                resolve(barcodeDataURL);
                
            } catch (error) {
                console.error('Barcode generation error:', error);
                reject(error);
            }
        });
    }
    
    // Generate combined label with both QR and barcode
    async generateBookLabel(bookData, options = {}) {
        try {
            const [qrCode, barcode] = await Promise.all([
                this.generateQRCode(bookData, options.qrOptions),
                this.generateBarcode(bookData.isbn, options.barcodeOptions)
            ]);
            
            return {
                qrCode,
                barcode,
                bookInfo: {
                    title: bookData.title,
                    author: bookData.author,
                    isbn: bookData.isbn,
                    id: bookData.id
                }
            };
            
        } catch (error) {
            console.error('Book label generation error:', error);
            throw error;
        }
    }
}

module.exports = new BarcodeService();