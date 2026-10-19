const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const STORE_URL = 'https://cihathyundai.otocikma.com/';

async function scrapeProducts() {
    try {
        const { data } = await axios.get(STORE_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        });
        
        const $ = cheerio.load(data);
        const products = [];
        const linkKontrol = new Set(); 

        $('a').each((i, el) => {
            let url = $(el).attr('href');
            if (!url) url = '';
            
            let img = $(el).find('img').first(); 
            if (img.length === 0) {
                img = $(el).parent().find('img').first();
            }
            
            let imgUrl = img.attr('src') || img.attr('data-src') || '';
            let title = img.attr('alt') || $(el).attr('title') || '';

            // Sitedeki ilana ait asıl metin/fiyat değerini çekiyoruz
            let rawDescription = $(el).text() \vert{}\vert{}$(el).parent().text() || '';

            if (url.length > 5 && imgUrl.length > 5 && (title.trim().length > 3 || rawDescription.trim().length > 3)) {
                
                if(!title) title = rawDescription.substring(0, 40);

                // Başlık kuralları
                let cleanTitle = title.toLowerCase().replace(/\s+/g, ' ').trim();
                cleanTitle = cleanTitle.replace(/ruhsatlı|ruhsat|/g, ''); 
                cleanTitle = cleanTitle.replace(/k[iİı]a/g, 'KIA');
                cleanTitle = cleanTitle.replace(/20 yıl/g, ''); 

                // İlan metni kuralları
                let cleanDesc = rawDescription.replace(/\s+/g, ' ').trim();
                cleanDesc = cleanDesc.replace(/orijinal|ruhsatlı|ruhsat|sıfır sandık/gi, '');
                cleanDesc = cleanDesc.replace(/K[İiı]A/gi, 'KIA');
                cleanDesc = cleanDesc.replace(/20 yıl/gi, ''); 

                if (cleanDesc === cleanTitle || cleanDesc.length < 5) {
                    cleanDesc = "Stoklarımızdadır.";
                }

                if (!linkKontrol.has(url)) {
                    let finalImg = imgUrl.startsWith('http') ? imgUrl : 'https://www.otocikma.com' + imgUrl;
                    let finalLink = url.startsWith('http') ? url : 'https://cihathyundai.otocikma.com' + url;
                    
                    products.push({
                        name: cleanTitle,
                        image: finalImg,
                        link: finalLink,
                        description: cleanDesc
                    });
                    linkKontrol.add(url);
                }
            }
        });

        fs.writeFileSync('products.json', JSON.stringify(products, null, 2), 'utf-8');
        console.log(`Başarılı: ${products.length} adet ürün çekildi.`);

    } catch (error) {
        console.error('Hata oluştu:', error.message);
    }
}

scrapeProducts();
