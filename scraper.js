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
            
            let imgUrl = img.attr('src');
            if (!imgUrl) imgUrl = img.attr('data-src');
            if (!imgUrl) imgUrl = '';
            
            let title = img.attr('alt');
            if (!title) title = $(el).attr('title');
            if (!title) title = '';

            let rawDescription = $(el).text();
            if (!rawDescription) rawDescription = $(el).parent().text();
            if (!rawDescription) rawDescription = '';

            let kontrolGecerli = false;
            if (title.trim().length > 3) kontrolGecerli = true;
            if (rawDescription.trim().length > 3) kontrolGecerli = true;

            if (url.length > 5 && imgUrl.length > 5 && kontrolGecerli) {
                
                if(!title) title = rawDescription.substring(0, 40);

                let cleanTitle = title.toLowerCase().replace(/\s+/g, ' ').trim();
                cleanTitle = cleanTitle.replace(/ruhsatlı/g, ''); 
                cleanTitle = cleanTitle.replace(/ruhsat/g, ''); 
                cleanTitle = cleanTitle.replace(/kia/g, 'KIA');
                cleanTitle = cleanTitle.replace(/kİa/g, 'KIA');
                cleanTitle = cleanTitle.replace(/kıa/g, 'KIA');
                cleanTitle = cleanTitle.replace(/20 yıl/g, ''); 

                let cleanDesc = rawDescription.replace(/\s+/g, ' ').trim();
                cleanDesc = cleanDesc.replace(/ruhsatlı/gi, '');
                cleanDesc = cleanDesc.replace(/ruhsat/gi, '');
                cleanDesc = cleanDesc.replace(/kia/gi, 'KIA');
                cleanDesc = cleanDesc.replace(/kİa/gi, 'KIA');
                cleanDesc = cleanDesc.replace(/kıa/gi, 'KIA');
                cleanDesc = cleanDesc.replace(/20 yıl/gi, ''); 

                if (cleanDesc === cleanTitle) {
                    cleanDesc = "Stoklarımızdadır.";
                }
                
                if (cleanDesc.length < 5) {
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
