const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const STORE_URL = 'https://cihathyundai.otocikma.com/';

async function scrapeProducts() {
    try {
        const { data } = await axios.get(STORE_URL);
        const $ = cheerio.load(data);
        const products = [];

        // Otocikma.com HTML yapısını daha geniş tarayalım
        $('.ilan-karti, .product-item, .listing-item, .card').each((i, el) => {
            let rawTitle = $(el).find('.ilan-baslik, .product-title, h3, .title').text() || '';
            let imgUrl = $(el).find('img').attr('src') || '';
            let url = $(el).find('a').first().attr('href') || '';

            // Metin düzenlemeleri (Sizin kurallarınız)
            let title = rawTitle.toLowerCase(); 
            title = title.replace(/orijinal|ruhsatlı|ruhsat/g, ''); 
            title = title.replace(/k[iİı]a/g, 'KIA'); 
            title = title.replace(/\s+/g, ' ').trim(); 

            // Başlık boş değilse listeye ekle (motor kelimesi şartını kaldırdık)
            if(title.length > 3) {
                products.push({
                    name: title,
                    image: imgUrl.startsWith('http') ? imgUrl : 'https://www.otocikma.com' + imgUrl,
                    link: url.startsWith('http') ? url : 'https://www.otocikma.com' + url,
                    location: 'ostim'
                });
            }
        });

        // Veriyi kaydet
        fs.writeFileSync('products.json', JSON.stringify(products, null, 2), 'utf-8');
        console.log(`Başarılı: ${products.length} adet parça çekildi.`);

    } catch (error) {
        console.error('Hata oluştu:', error.message);
    }
}

scrapeProducts();
