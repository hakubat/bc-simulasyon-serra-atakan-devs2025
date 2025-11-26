#!/usr/bin/env node
const inquirer = require('inquirer');
const Blockchain = require('./blockchain');
const Block = require('./block');
const fs = require('fs');
const chalk = require('chalk');

// DİKKAT: Reset atabilmek için 'const' yerine 'let' yaptık
let myCoin = new Blockchain();
const BLOK_ODULU = 50;         
const KOMISYON_ORANI = 0.05;   

// --- 1. LİKİDİTE HAVUZU (BAŞLANGIÇ DEĞERLERİ) ---
// Reset atıldığında bu değerlere geri dönülecek
const BASLANGIC_HAVUZ = {
    ituCoin: 1000000,
    usdt: 10000000
};

let LIQUIDITY_POOL = {
    ituCoin: BASLANGIC_HAVUZ.ituCoin,
    usdt: BASLANGIC_HAVUZ.usdt,
    k: 0
};

// k değerini hesapla
LIQUIDITY_POOL.k = LIQUIDITY_POOL.ituCoin * LIQUIDITY_POOL.usdt;

let MARKET = {
    'ITÜCOIN': 10.0,
    'WBTC (Wrapped)': 95000.0,
    'WETH (Wrapped)': 3200.0,
    'USDT': 1.0        
};

// --- DATA YÜKLEME ---
if (fs.existsSync('data.json')) {
    try {
        const dosyaVerisi = fs.readFileSync('data.json', 'utf-8');
        if (dosyaVerisi.length > 0) myCoin.chain = JSON.parse(dosyaVerisi);
        
        // EĞER KAYITLI VERİ VARSA HAVUZU ONA GÖRE GÜNCELLEMEK GEREKİRDİ
        // Ama simülasyon basitliği için havuz her açılışta sıfırlanıyor.
        // İleri seviye: Havuz durumu da json'a kaydedilebilir.
    } catch (e) { }
}

// BAŞLANGIÇ VALIDATOR LİSTESİ (Reset için sabit tutuyoruz)
const BASLANGIC_VALIDATORS = [
    { name: 'Atakan Kubat', stake: 1225 },
    { name: 'Serra Güneri', stake: 1140 },
    { name: 'Batıkan Kutluer', stake: 1230 },
    { name: 'Muaz bin Cebel', stake: 1500 }
];

// Oynanabilir liste (Klonluyoruz)
let VALIDATORS = JSON.parse(JSON.stringify(BASLANGIC_VALIDATORS));

async function main() {
    console.clear();
    console.log(chalk.cyan.bold("=========================================="));
    console.log(chalk.cyan.bold("🌐  İTÜ HYBRID CHAIN (AMM DEX Model)     🌐"));
    console.log(chalk.cyan.bold("=========================================="));
    
    // Fiyatı Havuzdan Hesapla
    MARKET['ITÜCOIN'] = LIQUIDITY_POOL.usdt / LIQUIDITY_POOL.ituCoin;

    console.log(chalk.yellow.bold("📊 CANLI PİYASA (x*y=k Modeli)"));
    console.log(`ITÜCOIN: ${chalk.green(MARKET['ITÜCOIN'].toFixed(4))}$ | Havuz Likiditesi: ${chalk.dim((LIQUIDITY_POOL.usdt / 1000000).toFixed(1))}M $`);
    console.log(chalk.gray("------------------------------------------"));
    
    console.log(chalk.blue(`Blok Sayısı: ${myCoin.chain.length}`));
    console.log(chalk.green(`Sabit Ödül : ${BLOK_ODULU} ITÜCOIN`));
    console.log(chalk.magenta(`Gas Fee    : %${KOMISYON_ORANI * 100}`));
    console.log("\n");

    const cevap = await inquirer.prompt([
        {
            type: 'list',
            name: 'secim',
            message: chalk.yellow('İşlem Seçiniz:'),
            choices: [
                '⛏️  Blok Kaz (Proof of Work)',
                '🎲  Blok İmzala (Proof of Stake)',
                '👥  Doğrulayıcıları Gör (Validators)',
                '⛓️  Zinciri Görüntüle',
                '🗑️  Sistemi Sıfırla (Reset)', // YENİ SEÇENEK
                '❌  Çıkış'
            ]
        }
    ]);

    if (cevap.secim.includes('Proof of Work')) await powBlokEkle();
    else if (cevap.secim.includes('Proof of Stake')) await posBlokEkle();
    else if (cevap.secim.includes('Doğrulayıcıları Gör')) await validatorGoster();
    else if (cevap.secim.includes('Zinciri Görüntüle')) await zinciriGoster();
    else if (cevap.secim.includes('Sistemi Sıfırla')) await sistemiSifirla(); // YENİ FONKSİYON
    else process.exit();
}

// --- YENİ: SİSTEMİ SIFIRLAMA FONKSİYONU ---
async function sistemiSifirla() {
    console.log("\n");
    const onay = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'emin',
            message: chalk.bgRed.white.bold(' DİKKAT: Tüm bloklar, işlemler ve piyasa verileri silinecek. Emin misiniz? '),
            default: false
        }
    ]);

    if (onay.emin) {
        console.log(chalk.gray("Sistem temizleniyor..."));
        
        // 1. Dosyayı Sil
        if (fs.existsSync('data.json')) {
            fs.unlinkSync('data.json');
            console.log(chalk.green("✔ data.json silindi."));
        }

        // 2. Blockchain'i Sıfırla (Yeni instance yarat)
        myCoin = new Blockchain();
        console.log(chalk.green("✔ Blok zinciri sıfırlandı (Genesis Block)."));

        // 3. Havuzu Sıfırla
        LIQUIDITY_POOL.ituCoin = BASLANGIC_HAVUZ.ituCoin;
        LIQUIDITY_POOL.usdt = BASLANGIC_HAVUZ.usdt;
        LIQUIDITY_POOL.k = LIQUIDITY_POOL.ituCoin * LIQUIDITY_POOL.usdt;
        console.log(chalk.green("✔ Likidite havuzu ve fiyatlar 10$ başlangıcına döndü."));

        // 4. Validatorleri Sıfırla (Kazançları sil)
        VALIDATORS = JSON.parse(JSON.stringify(BASLANGIC_VALIDATORS));
        console.log(chalk.green("✔ Validator bakiyeleri sıfırlandı."));

        console.log(chalk.bgGreen.black.bold("\n ✅ SİSTEM BAŞARIYLA FABRİKA AYARLARINA DÖNDÜ! "));
    } else {
        console.log(chalk.yellow("İşlem iptal edildi."));
    }

    await bekleVeDon();
}

async function transferBilgileriniAl() {
    console.log(chalk.gray("\n--- Transfer Detayları ---"));
    const cevaplar = await inquirer.prompt([
        { type: 'input', name: 'gonderen', message: chalk.magenta('Gönderen Cüzdan:'), default: 'Atakan Kubat' },
        { type: 'input', name: 'alici', message: chalk.magenta('Alıcı Cüzdan:'), validate: v => v.length > 0 ? true : 'İsim giriniz.' },
        { type: 'number', name: 'miktar', message: chalk.magenta('Transfer Miktarı:'), default: 1000 },
        { type: 'list', name: 'birim', message: chalk.magenta('Varlık Tipi (Asset):'), choices: ['USDT', 'ITÜCOIN', 'WBTC (Wrapped)', 'WETH (Wrapped)'] }
    ]);

    return {
        txId: Math.random().toString(36).substr(2, 9).toUpperCase(),
        zaman: new Date().toLocaleTimeString(),
        ...cevaplar
    };
}

function gasFeeHesapla(islemVerisi) {
    const varlikFiyati = MARKET[islemVerisi.birim]; 
    const islemDolarDegeri = islemVerisi.miktar * varlikFiyati;
    const komisyonDolar = islemDolarDegeri * KOMISYON_ORANI;
    const komisyonInItuCoin = komisyonDolar / MARKET['ITÜCOIN'];
    return { komisyonDolar, komisyonInItuCoin };
}

function ammFiyatGuncelle(islemVerisi, hesap) {
    const havuzaGirenDolar = hesap.komisyonDolar;
    LIQUIDITY_POOL.usdt += havuzaGirenDolar;
    const yeniItuCoinMiktari = LIQUIDITY_POOL.k / LIQUIDITY_POOL.usdt;
    
    const eskiFiyat = MARKET['ITÜCOIN'];
    LIQUIDITY_POOL.ituCoin = yeniItuCoinMiktari;
    
    const yeniFiyat = LIQUIDITY_POOL.usdt / LIQUIDITY_POOL.ituCoin;
    MARKET['ITÜCOIN'] = yeniFiyat;

    return { eskiFiyat, yeniFiyat };
}

async function powBlokEkle() {
    const islemVerisi = await transferBilgileriniAl();
    const hesap = gasFeeHesapla(islemVerisi);

    console.log(chalk.bgRed.white.bold("\n ⛏️  MADENCİLİK BAŞLIYOR (CPU GÜCÜ) "));
    console.log(chalk.gray(`Uniswap AMM Havuzu kontrol ediliyor...`));
    await new Promise(r => setTimeout(r, 1000));

    const yeniBlok = new Block(
        myCoin.chain.length,
        new Date().toLocaleString(),
        islemVerisi,
        myCoin.getLatestBlock().hash,
        "Miner Node (PoW)" 
    );

    yeniBlok.mineBlock(2);
    
    const toplamKazanc = BLOK_ODULU + hesap.komisyonInItuCoin;
    await zincireEkleVeKaydet(yeniBlok, toplamKazanc, hesap, islemVerisi); 
}

async function posBlokEkle() {
    const islemVerisi = await transferBilgileriniAl();
    const hesap = gasFeeHesapla(islemVerisi);

    console.log(chalk.bgGreen.black.bold("\n 🎲  DOĞRULAYICI SEÇİLİYOR (STAKING) "));
    await new Promise(r => setTimeout(r, 1000));

    const kazanan = validatorSec();
    const toplamOdul = BLOK_ODULU + hesap.komisyonInItuCoin;
    kazanan.stake += toplamOdul;

    console.log(chalk.yellow(`🎉 Seçilen Doğrulayıcı: ${kazanan.name}`));
    console.log(chalk.dim(`(Toplam Kazanç: ${toplamOdul.toFixed(2)} ITÜCOIN)`));

    const yeniBlok = new Block(
        myCoin.chain.length,
        new Date().toLocaleString(),
        islemVerisi,
        myCoin.getLatestBlock().hash,
        kazanan.name
    );

    await zincireEkleVeKaydet(yeniBlok, toplamOdul, hesap, islemVerisi);
}

async function zincireEkleVeKaydet(blok, toplamKazanc, hesap, islemVerisi) {
    myCoin.addBlock(blok);
    
    const fiyatDegisimi = ammFiyatGuncelle(islemVerisi, hesap);

    console.log(chalk.green.bold("\n✅ BLOK ZİNCİRE EKLENDİ!"));
    console.log(chalk.white("---------------------------------------------------"));
    console.log(chalk.bold("İŞLEM: ") + `${blok.data.gonderen} -> ${blok.data.alici} (${blok.data.miktar} ${blok.data.birim})`);
    console.log(chalk.dim(`(Gas Fee / Komisyon: ${hesap.komisyonDolar.toFixed(2)} USD)`)); 
    console.log(chalk.white("---------------------------------------------------"));
    
    if (blok.nonce > 0) {
        console.log(chalk.yellow("Konsensüs: ") + chalk.red("PoW (Work)"));
        console.log(chalk.yellow("Node     : ") + "Miner (Anonim)");
    } else {
        console.log(chalk.yellow("Konsensüs: ") + chalk.green("PoS (Stake)"));
        console.log(chalk.yellow("Validator: ") + chalk.cyan(blok.validator));
    }

    console.log(chalk.yellow("KAZANÇ   : ") + chalk.green.bold(`+${toplamKazanc.toFixed(2)} ITÜCOIN 💰`));
    console.log(chalk.gray(`(Blok Ödülü: ${BLOK_ODULU} + Gas Fee: ${hesap.komisyonInItuCoin.toFixed(2)})`));
    console.log(chalk.yellow("Hash     : ") + chalk.gray(blok.hash));
    
    console.log(chalk.white("---------------------------------------------------"));
    const renk = fiyatDegisimi.yeniFiyat > fiyatDegisimi.eskiFiyat ? chalk.green : chalk.red;
    console.log(chalk.bgBlue.white.bold(` 📊 AMM (x*y=k) FİYAT GÜNCELLEMESİ `));
    console.log(`Eski Fiyat: ${fiyatDegisimi.eskiFiyat.toFixed(5)}$`);
    console.log(`Yeni Fiyat: ${renk(fiyatDegisimi.yeniFiyat.toFixed(5) + "$")} (Talep Etkisi)`);
    console.log(chalk.white("---------------------------------------------------"));

    fs.writeFileSync('data.json', JSON.stringify(myCoin.chain, null, 4));
    await bekleVeDon();
}

function validatorSec() {
    const toplamStake = VALIDATORS.reduce((acc, v) => acc + v.stake, 0);
    let rastgele = Math.random() * toplamStake;
    for (const v of VALIDATORS) {
        if (rastgele < v.stake) return v;
        rastgele -= v.stake;
    }
    return VALIDATORS[0];
}

async function validatorGoster() {
    console.log(chalk.yellow.bold("\n--- 👥 AĞ DOĞRULAYICILARI (VALIDATORS) ---"));
    VALIDATORS.forEach(v => {
        const bar = "█".repeat(Math.ceil(v.stake / 100)); 
        console.log(`${chalk.cyan(v.name.padEnd(15))} : ${chalk.green(Number(v.stake).toFixed(1))} ITÜCOIN ${chalk.gray(bar)}`);
    });
    await bekleVeDon();
}

async function zinciriGoster() {
    console.log(chalk.yellow.bold("\n⛓️  HIBRT BLOK ZİNCİRİ  ⛓️"));
    console.log(JSON.stringify(myCoin.chain, null, 4));
    await bekleVeDon();
}

async function bekleVeDon() {
    console.log("\n");
    await inquirer.prompt([{ type: 'input', name: 'devam', message: chalk.gray('Devam etmek için ENTER\'a basın...') }]);
    main();
}

main();