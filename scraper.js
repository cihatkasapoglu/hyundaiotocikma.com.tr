const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const STORE_URL = 'https://cihathyundai.otocikma.com/';

async function scrapeProducts() {
    try {
        const { data } = await axios.get(STORE_URL);
        const $ = cheerio.load(data);
        const products = [];

        // Otocikma.com üzerindeki ilan listesi
        $('.ilan-karti, .product-item').each((i, el) => {
            let rawTitle = $(el).find('.ilan-baslik, .product-title').text() || '';
            let imgUrl = $(el).find('img').attr('src') || '';
            let url = $(el).find('a').attr('href') || '';

            // Kurallarınıza göre metin düzenlemeleri
            let title = rawTitle.toLowerCase(); // Başlıklar küçük harf
            title = title.replace(/orijinal|ruhsatlı|ruhsat/g, ''); // İstenmeyen kelimeleri temizle
            title = title.replace(/k[iİı]a/g, 'KIA'); // KIA marka yazım düzeltmesi
            title = title.replace(/\s+/g, ' ').trim(); // Fazla boşlukları sil

            // Sadece motor ile ilgili parçaları al
            if(title && title.includes('motor')) {
                products.push({
                    name: title,
                    image: imgUrl,
                    link: url.startsWith('http') ? url : STORE_URL + url,
                    location: 'ostim' // Lokasyon Ostim olarak sabitlendi
                });
            }
        });

        // Çekilen veriyi products.json dosyasına kaydet
        fs.writeFileSync('products.json', JSON.stringify(products, null, 2), 'utf-8');
        console.log(`Başarılı: ${products.length} adet motor parçası çekildi.`);

    } catch (error) {
        console.error('Hata oluştu:', error.message);
    }
}

scrapeProducts();
