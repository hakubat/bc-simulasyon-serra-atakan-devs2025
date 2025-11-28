#!/usr/bin/env node
// Bu satır, dosyanın terminalde 'node consoleapp.js' komutu yazmadan sadece 'ituchain' yazarak çalışmasını sağlıyor

// --- KÜTÜPHANELER (ARAÇ ÇANTAMIZ) ---
const inquirer = require('inquirer');       // Kullanıcıya soru sormak ve menü yapmak için
const Blockchain = require('./blockchain'); // Kendi yazdığımız Blockchain mantığı
const Block = require('./block');           // Blok yapımız
const fs = require('fs');                 
const chalk = require('chalk');            

// --- GÖRSEL EFEKT KÜTÜPHANELERİ (UX) ---
const figlet = require('figlet');         
const ora = require('ora');                
const Table = require('cli-table3');        
const gradient = require('gradient-string');
const boxen = require('boxen');            
const cliProgress = require('cli-progress');

// --- SİSTEM AYARLARI ---
let myCoin = new Blockchain(); // Zincirimizi başlatıyoruz
const BLOK_ODULU = 50;         // Her blokta sistemin verdiği sabit maaş (ITÜCOIN)
const KOMISYON_ORANI = 0.05;   // %5 İşlem ücreti (Gas Fee)

// --- AMM (OTOMATİK PİYASA YAPICI) AYARLARI ---
// Uniswap mantığı: x * y = k formülü burada çalışıyor. (Blockchain 102 dersinde anlatıldı)
const BASLANGIC_HAVUZ = { ituCoin: 1000000, usdt: 10000000 }; // Havuzdaki başlangıç parası

// Havuzun o anki canlı durumu
let LIQUIDITY_POOL = { 
    ituCoin: BASLANGIC_HAVUZ.ituCoin, 
    usdt: BASLANGIC_HAVUZ.usdt, 
    k: 0 
};
// k değeri (Sabit Çarpım) hesaplanıyor. Bu değer sabittir
LIQUIDITY_POOL.k = LIQUIDITY_POOL.ituCoin * LIQUIDITY_POOL.usdt;

// Anlık Piyasa Fiyatları
let MARKET = { 
    'ITÜCOIN': 10.0, 
    'WBTC (Wrapped)': 95000.0, 
    'WETH (Wrapped)': 3200.0, 
    'USDT': 1.0 
};

<<<<<<< HEAD
let FIYAT_GECMISI = [];

=======
>>>>>>> 4e1edc0a76928fcbd4435b98be2b226daaff0438
// --- DATA YÜKLEME (PERSISTENCE) ---
// Program açıldığında eski kayıtlar var mı diye bakar.
if (fs.existsSync('data.json')) {
    try {
        const dosyaVerisi = fs.readFileSync('data.json', 'utf-8');
        if (dosyaVerisi.length > 0) myCoin.chain = JSON.parse(dosyaVerisi);
    } catch (e) { }
}

// --- DOĞRULAYICILAR (VALIDATORS) ---
const BASLANGIC_VALIDATORS = [
    { name: 'Atakan Kubat', stake: 1225 },
    { name: 'Serra Güneri', stake: 1140 },
    { name: 'Batıkan Kutluer', stake: 1230 },
    { name: 'Muaz bin Cebel', stake: 1500 }
];
// Oyunda değişiklik yapmak için klonluyoruz
let VALIDATORS = JSON.parse(JSON.stringify(BASLANGIC_VALIDATORS));

// --- GÖRSEL EFEKT: MADENCİLİK BAR ---
async function madencilikEfekti() {
    console.log(chalk.gray("\nSHA-256 Algoritması Çalıştırılıyor (Nonce Aranıyor)..."));
    
    // Bar ayarları
    const bar = new cliProgress.SingleBar({
        format: chalk.cyan('{bar}') + ' | {percentage}% | {value}/{total} Hash Denemesi',
        barCompleteChar: '\u2588', 
        barIncompleteChar: '\u2591',
        hideCursor: true
    });

    bar.start(100, 0);
    
    // Yapay gecikme ile barı doldur (Simülasyon hissi verir)
    for (let i = 0; i <= 100; i++) {
        bar.update(i);
        await new Promise(r => setTimeout(r, 20)); 
    }
    bar.stop();
    console.log(chalk.green("✔ Hash Başarıyla Çözüldü!\n"));
}

// --- GÖRSEL EFEKT: SPINNER ---
// PoS veya diğer bekleme işlemleri için dönen simge
async function beklemeEfekti(mesaj, sure = 1500) {
    const spinner = ora({
        text: mesaj,
        color: 'yellow',
        spinner: 'dots12'
    }).start();
    
    // İşlemi simüle etmek için bekletiyoruz
    await new Promise(r => setTimeout(r, sure));
    
    spinner.succeed(chalk.green("İşlem Onaylandı"));
}

// ==========================================
// ANA PROGRAM DÖNGÜSÜ (MAIN FUNCTION)
// ==========================================
async function main() {
    console.clear(); // Ekranı temizle
    
    // 1. LOGO GÖSTERİMİ (Gradient)
    const logo = figlet.textSync('ITU CHAIN', { horizontalLayout: 'full' });
    console.log(gradient.cristal(logo)); 
    console.log(gradient.atlas("     >> Decentralized Hybrid Blockchain Simulation <<     \n"));
    
    // 2. FİYATI GÜNCELLE (Oracle Mantığı)
    // Fiyat = Havuzdaki Dolar / Havuzdaki Coin
    MARKET['ITÜCOIN'] = LIQUIDITY_POOL.usdt / LIQUIDITY_POOL.ituCoin;

<<<<<<< HEAD
// 3. PİYASA BİLGİSİNİ KUTULU GÖSTER
    
    // a. TVL Hesabı: (Havuzdaki Dolar) + (Havuzdaki Coin * Güncel Fiyat)
    // Aslında havuz dengedeyse ikisi eşittir, yani 2 * USDT de diyebiliriz.
    let totalTVL = LIQUIDITY_POOL.usdt + (LIQUIDITY_POOL.ituCoin * MARKET['ITÜCOIN']);

    // b. Formatlama (Bloomberg Standardı: $ işareti başta)
    let showPrice = "$" + MARKET['ITÜCOIN'].toFixed(4);
    let showTVL   = "$" + (totalTVL / 1000000).toFixed(1) + "M";

    // c. Hizalama (padEnd ile kutu bozulmaz)
    // Boxen zaten kutu yapıyor ama içindeki metin hizası için bunu yapıyoruz
    const marketInfo = `ITÜCOIN: ${showPrice.padEnd(10, ' ')}\nTVL:     ${showTVL.padEnd(10, ' ')}`;

    console.log(boxen(marketInfo, {
        padding: 1,
=======
    // 3. PİYASA BİLGİSİNİ KUTULU GÖSTER
    const marketInfo = `ITÜCOIN: ${MARKET['ITÜCOIN'].toFixed(4)}$\nHavuz Likiditesi: ${(LIQUIDITY_POOL.usdt / 1000000).toFixed(1)}M $`;
    console.log(boxen(marketInfo, {
        padding: 0,
>>>>>>> 4e1edc0a76928fcbd4435b98be2b226daaff0438
        margin: 0,
        borderStyle: 'round',
        borderColor: 'cyan',
        title: 'CANLI PİYASA (AMM)',
        titleAlignment: 'center'
    }));
<<<<<<< HEAD

// 4. MENÜ SEÇENEKLERİ
=======
    console.log("\n");

    // 4. MENÜ SEÇENEKLERİ
>>>>>>> 4e1edc0a76928fcbd4435b98be2b226daaff0438
    const cevap = await inquirer.prompt([
        {
            type: 'list',
            name: 'secim',
            message: chalk.yellow('İşlem Seçiniz:'),
            choices: [
                '⛏️  Blok Kaz (Proof of Work)',       // CPU gücü ile (simülatif)
                '🎲  Blok İmzala (Proof of Stake)',   // Stake gücü ile
                '📉  ITÜCOIN Sat (Market Sell)',      // ITUCOIN fiyatını düşürür
                '👥  Doğrulayıcıları Gör (Table)',    // Hissedarlar
                '⛓️  Zinciri Görüntüle (Table)',      // Blockchain explorer
                '🗑️  Sistemi Sıfırla (Reset)',        // Fabrika ayarları
                '❌  Çıkış'
            ]
        }
    ]);

    // Seçime göre yönlendirme
    if (cevap.secim.includes('Proof of Work')) await powBlokEkle();
    else if (cevap.secim.includes('Proof of Stake')) await posBlokEkle();
    else if (cevap.secim.includes('ITÜCOIN Sat')) await ituCoinSatis();
    else if (cevap.secim.includes('Doğrulayıcıları Gör')) await validatorGoster();
    else if (cevap.secim.includes('Zinciri Görüntüle')) await zinciriGoster();
    else if (cevap.secim.includes('Sistemi Sıfırla')) await sistemiSifirla();
    else process.exit();
}

// --- RESET FONKSİYONU ---
async function sistemiSifirla() {
    console.log("\n");
    const onay = await inquirer.prompt([{
        type: 'confirm', name: 'emin', message: chalk.bgRed.white.bold(' TÜM VERİLER SİLİNECEK! Emin misiniz? '), default: false
    }]);

    if (onay.emin) {
        const spinner = ora('Sistem formatlanıyor...').start();
        await new Promise(r => setTimeout(r, 2000));
        
        // Veritabanını sil
        if (fs.existsSync('data.json')) fs.unlinkSync('data.json');
        
        // Değişkenleri sıfırla
        myCoin = new Blockchain();
        LIQUIDITY_POOL = { ...BASLANGIC_HAVUZ, k: BASLANGIC_HAVUZ.ituCoin * BASLANGIC_HAVUZ.usdt };
        VALIDATORS = JSON.parse(JSON.stringify(BASLANGIC_VALIDATORS));
        
        spinner.succeed('Sıfırlama Tamamlandı.');
        
        console.log(boxen(chalk.green("SİSTEM FABRİKA AYARLARINA DÖNDÜ"), {padding: 1, borderStyle: 'double', borderColor: 'green'}));
    } else {
        console.log(chalk.yellow("İşlem iptal edildi."));
    }
    await bekleVeDon();
}

// --- CÜZDAN ARAYÜZÜ (Transaction Form) ---
async function transferBilgileriniAl() {
    console.log(chalk.gray("\n--- Transfer Detayları ---"));
    const cevaplar = await inquirer.prompt([
        { type: 'input', name: 'gonderen', message: 'Gönderen:', default: 'Atakan Kubat' },
        { type: 'input', name: 'alici', message: 'Alıcı:', validate: v => v.length > 0 ? true : 'İsim giriniz.' },
        { type: 'number', name: 'miktar', message: 'Miktar:', default: 1000 },
        { type: 'list', name: 'birim', message: 'Varlık:', choices: ['USDT', 'ITÜCOIN', 'WBTC (Wrapped)', 'WETH (Wrapped)'] }
    ]);
    // Veriyi paketle ve rastgele bir TxID (İşlem Kimliği) ekle
    return { txId: Math.random().toString(36).substr(2, 9).toUpperCase(), zaman: new Date().toLocaleTimeString(), ...cevaplar };
}

// --- TOKENOMICS: GAS FEE HESAPLAMA ---
function gasFeeHesapla(islemVerisi) {
    // 1. Gönderilen varlığın o anki Dolar değerini bul
    const varlikFiyati = MARKET[islemVerisi.birim]; 
    const islemDolarDegeri = islemVerisi.miktar * varlikFiyati;
    
    // 2. Komisyonu Dolar olarak hesapla (%5)
    const komisyonDolar = islemDolarDegeri * KOMISYON_ORANI;

    // 3. Doları ITÜCOIN cinsine çevir (Çünkü ağda ödemeler ITÜCOIN ile yapılır)
    const komisyonInItuCoin = komisyonDolar / MARKET['ITÜCOIN'];
    
    return { komisyonDolar, komisyonInItuCoin };
}

// --- AMM MATEMATİĞİ (x * y = k) ---
function ammFiyatGuncelle(islemVerisi, hesap) {
    // Havuza işlem ücreti kadar Dolar (USDT) giriyor
    LIQUIDITY_POOL.usdt += hesap.komisyonDolar;
    
    // x = k / y formülü ile yeni ITÜCOIN miktarını buluyoruz
    const yeniItuCoinMiktari = LIQUIDITY_POOL.k / LIQUIDITY_POOL.usdt;
    
    // Fiyatları kıyaslamak için eski fiyatı tut
    const eskiFiyat = MARKET['ITÜCOIN'];
    LIQUIDITY_POOL.ituCoin = yeniItuCoinMiktari;
    
    // Yeni Fiyat = Havuzdaki Dolar / Havuzdaki Coin
    const yeniFiyat = LIQUIDITY_POOL.usdt / LIQUIDITY_POOL.ituCoin;
    MARKET['ITÜCOIN'] = yeniFiyat;
    
    return { eskiFiyat, yeniFiyat };
}

// --- MADENCİLİK (Proof of Work) ---
async function powBlokEkle() {
    const islemVerisi = await transferBilgileriniAl();
    const hesap = gasFeeHesapla(islemVerisi);

    // Madencilik animasyonunu çağır
    await madencilikEfekti();

    // Bloğu oluştur
    const yeniBlok = new Block(myCoin.chain.length, new Date().toLocaleString(), islemVerisi, myCoin.getLatestBlock().hash, "Miner Node (PoW)");
    yeniBlok.mineBlock(2);
    await zincireEkleVeKaydet(yeniBlok, BLOK_ODULU + hesap.komisyonInItuCoin, hesap, islemVerisi); 
}

// --- STAKING (Proof of Stake) ---
async function posBlokEkle() {
    const islemVerisi = await transferBilgileriniAl();
    const hesap = gasFeeHesapla(islemVerisi);

    // Doğrulayıcı seçimi animasyonu
    await beklemeEfekti(`Validator seçiliyor...`, 1500);

    const kazanan = validatorSec();
    
    // Kazananın hesabına ödülü yatır (Maaş + Gas Fee)
    const toplamOdul = BLOK_ODULU + hesap.komisyonInItuCoin;
    kazanan.stake += toplamOdul;

    console.log(chalk.yellow(`🎉 Seçilen: ${kazanan.name}`));
    const yeniBlok = new Block(myCoin.chain.length, new Date().toLocaleString(), islemVerisi, myCoin.getLatestBlock().hash, kazanan.name);
    await zincireEkleVeKaydet(yeniBlok, toplamOdul, hesap, islemVerisi);
}

async function zincireEkleVeKaydet(blok, toplamKazanc, hesap, islemVerisi) {
    myCoin.addBlock(blok);
    
    // AMM Havuzunu güncelle ve fiyat etkisini hesapla
    const fiyatDegisimi = ammFiyatGuncelle(islemVerisi, hesap);

    // KUTULU İŞLEM FİŞİ OLUŞTUR
    let ozetMetni = "";
    ozetMetni += `${chalk.bold('İŞLEM:')} ${blok.data.gonderen} -> ${blok.data.alici}\n`;
    ozetMetni += `${chalk.bold('TUTAR:')} ${blok.data.miktar} ${blok.data.birim}\n`;
    ozetMetni += `${chalk.dim('Gas Fee:')} ${hesap.komisyonDolar.toFixed(2)}$\n`;
    ozetMetni += `-----------------------------\n`;
    ozetMetni += `${chalk.bold.green('KAZANÇ:')} +${toplamKazanc.toFixed(2)} ITÜCOIN\n`;
    ozetMetni += `${chalk.gray('Validator:')} ${blok.validator}`;

    console.log(boxen(ozetMetni, {
        padding: 1,
        borderStyle: 'classic',
        borderColor: 'yellow',
        title: '✅ BLOK EKLENDİ',
    }));

    // Eğer işlem fiyatı artırdıysa ekrana bas (Talep Etkisi)
    if(fiyatDegisimi.yeniFiyat > fiyatDegisimi.eskiFiyat) {
        console.log(gradient.pastel(`📈 PİYASA YÜKSELDİ: 1 ITÜCOIN = ${fiyatDegisimi.yeniFiyat.toFixed(4)}$`));
    }

    // Dosyaya yaz (Persistence)
    fs.writeFileSync('data.json', JSON.stringify(myCoin.chain, null, 4));
    await bekleVeDon();
}
// --- YENİ: SATIŞ FONKSİYONU ---
async function ituCoinSatis() {
    console.log(chalk.gray("\n--- Satış Emri (Sell Order) ---"));
    
    // Kullanıcıdan miktar al
    const cevap = await inquirer.prompt([
        { type: 'number', name: 'miktar', message: chalk.red('Kaç ITÜCOIN satmak istiyorsun?'), default: 100 }
    ]);
    const satilanMiktar = cevap.miktar;

    // --- AMM MATEMATİĞİ (Tersine Çalışır) ---
    // 1. Havuza Coin giriyor (x artar)
    LIQUIDITY_POOL.ituCoin += satilanMiktar;

    // 2. Havuzdan ne kadar Dolar çıkmalı? (y = k / x)
    const eskiUsdt = LIQUIDITY_POOL.usdt;
    const yeniUsdt = LIQUIDITY_POOL.k / LIQUIDITY_POOL.ituCoin;
    const alinanUsdt = eskiUsdt - yeniUsdt; // Kullanıcıya ödenecek para

    // 3. Havuzu güncelle (y azalır)
    LIQUIDITY_POOL.usdt = yeniUsdt;

    // 4. Yeni Fiyatı Hesapla
    const eskiFiyat = MARKET['ITÜCOIN'];
    const yeniFiyat = LIQUIDITY_POOL.usdt / LIQUIDITY_POOL.ituCoin;
    MARKET['ITÜCOIN'] = yeniFiyat;

    // Grafiği güncellemek için geçmişe ekle
    if (typeof FIYAT_GECMISI !== 'undefined') {
        FIYAT_GECMISI.push(yeniFiyat);
        if (FIYAT_GECMISI.length > 30) FIYAT_GECMISI.shift();
        if (fs.existsSync('market.json')) fs.writeFileSync('market.json', JSON.stringify(FIYAT_GECMISI));
    }

    await beklemeEfekti(chalk.red('Satış emri havuza iletiliyor...'), 1500);

    const islemVerisi = {
        txId: Math.random().toString(36).substr(2, 9).toUpperCase(),
        gonderen: "Atakan (Trader)",
        alici: "Liquidity Pool (AMM)",
        miktar: satilanMiktar,
        birim: "ITÜCOIN (SOLD)"
    };

    const yeniBlok = new Block(myCoin.chain.length, new Date().toLocaleString(), islemVerisi, myCoin.getLatestBlock().hash, "DEX Contract");
    myCoin.addBlock(yeniBlok);
    fs.writeFileSync('data.json', JSON.stringify(myCoin.chain, null, 4));

    // SONUÇ EKRANI (Kırmızı Tema: çünkü bear market lol)
    let ozetMetni = `${chalk.bold('İŞLEM:')} SATIŞ (SELL)\n`;
    ozetMetni += `${chalk.bold('VERİLEN:')} ${satilanMiktar} ITÜCOIN\n`;
    ozetMetni += `${chalk.bold.green('ALINAN:')}  ${alinanUsdt.toFixed(2)} USDT\n`;
    
    console.log(boxen(ozetMetni, {
        padding: 1,
        borderStyle: 'double',
        borderColor: 'red',
        title: '📉 SATIŞ BAŞARILI',
    }));
    
    // Fiyat Düşüş Uyarısı
    console.log(gradient.morning(` 📉 PİYASA DÜŞTÜ: ${eskiFiyat.toFixed(4)}$ -> ${yeniFiyat.toFixed(4)}$ `));
    
    await bekleVeDon();
}

// --- YARDIMCI: Validator Seçimi ---
function validatorSec() {
    // Stake miktarına göre ağırlıklı rastgele seçim
    const toplamStake = VALIDATORS.reduce((acc, v) => acc + v.stake, 0);
    let rastgele = Math.random() * toplamStake;
    for (const v of VALIDATORS) return (rastgele -= v.stake) < 0 ? v : null || v;
}

// --- GÖRSEL: Tablolar ---
async function validatorGoster() {
    console.log(chalk.yellow.bold("\n--- 👥 DOĞRULAYICI LİSTESİ ---"));
    const table = new Table({ head: [chalk.cyan('Validator'), chalk.cyan('Stake'), chalk.cyan('Güç %')] });
    const toplamStake = VALIDATORS.reduce((a, b) => a + b.stake, 0);

    VALIDATORS.forEach(v => {
        // Yüzdelik hesaplama
        table.push([v.name, v.stake.toFixed(2), `%${((v.stake / toplamStake) * 100).toFixed(1)}`]);
    });

    console.log(table.toString());
    await bekleVeDon();
}

async function zinciriGoster() {
    console.log(chalk.yellow.bold("\n⛓️  BLOK ZİNCİRİ GEÇMİŞİ  ⛓️"));
    const table = new Table({ head: ['No', 'Zaman', 'Transfer', 'Tutar', 'Validator'], colWidths: [5, 20, 25, 15, 20] });

    myCoin.chain.forEach(blok => {
        let transfer = "Genesis", miktar = "-";
        if (typeof blok.data === 'object') {
            transfer = `${blok.data.gonderen.substr(0,8)}->${blok.data.alici.substr(0,8)}`;
            miktar = `${blok.data.miktar} ${blok.data.birim}`;
        }
        table.push([blok.index, blok.timestamp.substr(0, 15), transfer, miktar, blok.validator ? blok.validator.substr(0, 18) : 'Sistem']);
    });

    console.log(table.toString());
    await bekleVeDon();
}

async function bekleVeDon() {
    console.log("\n");
    await inquirer.prompt([{ type: 'input', name: 'devam', message: chalk.gray('Menü için ENTER...') }]);
    main();
}

main();