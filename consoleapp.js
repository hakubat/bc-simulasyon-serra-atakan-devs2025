#!/usr/bin/env node
const inquirer = require('inquirer');
const Blockchain = require('./blockchain');
const Block = require('./block');
const fs = require('fs');
const chalk = require('chalk');
const figlet = require('figlet');       // Logo
const ora = require('ora');             // Animasyon
const Table = require('cli-table3');    // Tablo

// --- SİSTEM AYARLARI ---
let myCoin = new Blockchain();
const BLOK_ODULU = 50;         
const KOMISYON_ORANI = 0.05;   

// --- 1. LİKİDİTE HAVUZU (AMM) ---
const BASLANGIC_HAVUZ = { ituCoin: 1000000, usdt: 10000000 };
let LIQUIDITY_POOL = { ituCoin: BASLANGIC_HAVUZ.ituCoin, usdt: BASLANGIC_HAVUZ.usdt, k: 0 };
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
    } catch (e) { }
}

// --- VALIDATORS ---
const BASLANGIC_VALIDATORS = [
    { name: 'Atakan Kubat', stake: 1225 },
    { name: 'Serra Güneri', stake: 1140 },
    { name: 'Batıkan Kutluer', stake: 1230 },
    { name: 'Muaz bin Cebel', stake: 1500 }
];
let VALIDATORS = JSON.parse(JSON.stringify(BASLANGIC_VALIDATORS));

// --- YARDIMCI: BEKLEME ANİMASYONU ---
async function beklemeEfekti(mesaj, sure = 1500) {
    const spinner = ora(mesaj).start();
    await new Promise(r => setTimeout(r, sure));
    spinner.succeed(chalk.green("İşlem Tamamlandı"));
}

async function main() {
    console.clear();
    
    // GÖRSEL 1: LOGO
    console.log(chalk.cyan(
        figlet.textSync('ITU CHAIN', { horizontalLayout: 'full' })
    ));
    
    // Fiyatı Havuzdan Hesapla (Oracle)
    MARKET['ITÜCOIN'] = LIQUIDITY_POOL.usdt / LIQUIDITY_POOL.ituCoin;

    console.log(chalk.yellow.bold("📊 CANLI PİYASA (AMM DEX Model)"));
    console.log(`ITÜCOIN: ${chalk.green(MARKET['ITÜCOIN'].toFixed(4))}$ | Likidite: ${chalk.dim((LIQUIDITY_POOL.usdt / 1000000).toFixed(1))}M $`);
    console.log(chalk.gray("--------------------------------------------------"));
    
    const cevap = await inquirer.prompt([
        {
            type: 'list',
            name: 'secim',
            message: chalk.yellow('İşlem Seçiniz:'),
            choices: [
                '⛏️  Blok Kaz (Proof of Work)',
                '🎲  Blok İmzala (Proof of Stake)',
                '👥  Doğrulayıcıları Gör (Table View)',
                '⛓️  Zinciri Görüntüle (Table View)',
                '🗑️  Sistemi Sıfırla (Reset)',
                '❌  Çıkış'
            ]
        }
    ]);

    if (cevap.secim.includes('Proof of Work')) await powBlokEkle();
    else if (cevap.secim.includes('Proof of Stake')) await posBlokEkle();
    else if (cevap.secim.includes('Doğrulayıcıları Gör')) await validatorGoster();
    else if (cevap.secim.includes('Zinciri Görüntüle')) await zinciriGoster();
    else if (cevap.secim.includes('Sistemi Sıfırla')) await sistemiSifirla();
    else process.exit();
}

async function sistemiSifirla() {
    console.log("\n");
    const onay = await inquirer.prompt([{
        type: 'confirm', name: 'emin', message: chalk.bgRed.white.bold(' TÜM VERİLER SİLİNECEK! Emin misiniz? '), default: false
    }]);

    if (onay.emin) {
        // GÖRSEL 2: RESET ANİMASYONU
        const spinner = ora('Sistem temizleniyor...').start();
        await new Promise(r => setTimeout(r, 2000));
        
        if (fs.existsSync('data.json')) fs.unlinkSync('data.json');
        
        myCoin = new Blockchain();
        LIQUIDITY_POOL = { ...BASLANGIC_HAVUZ, k: BASLANGIC_HAVUZ.ituCoin * BASLANGIC_HAVUZ.usdt };
        VALIDATORS = JSON.parse(JSON.stringify(BASLANGIC_VALIDATORS));
        
        spinner.succeed('Sistem Fabrika Ayarlarına Döndü.');
    } else {
        console.log(chalk.yellow("İşlem iptal edildi."));
    }
    await bekleVeDon();
}

async function transferBilgileriniAl() {
    console.log(chalk.gray("\n--- Transfer Detayları ---"));
    const cevaplar = await inquirer.prompt([
        { type: 'input', name: 'gonderen', message: 'Gönderen Cüzdan:', default: 'Atakan Kubat' },
        { type: 'input', name: 'alici', message: 'Alıcı Cüzdan:', validate: v => v.length > 0 ? true : 'İsim giriniz.' },
        { type: 'number', name: 'miktar', message: 'Transfer Miktarı:', default: 1000 },
        { type: 'list', name: 'birim', message: 'Varlık Tipi:', choices: ['USDT', 'ITÜCOIN', 'WBTC (Wrapped)', 'WETH (Wrapped)'] }
    ]);
    return { txId: Math.random().toString(36).substr(2, 9).toUpperCase(), zaman: new Date().toLocaleTimeString(), ...cevaplar };
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

    // GÖRSEL 3: Mining Animasyonu
    await beklemeEfekti(`${chalk.red('PoW Madencilik')} yapılıyor (Hash Hesaplanıyor)...`, 2000);

    const yeniBlok = new Block(
        myCoin.chain.length,
        new Date().toLocaleString(),
        islemVerisi,
        myCoin.getLatestBlock().hash,
        "Miner Node (PoW)" 
    );
    yeniBlok.mineBlock(2);
    
    await zincireEkleVeKaydet(yeniBlok, BLOK_ODULU + hesap.komisyonInItuCoin, hesap, islemVerisi); 
}

async function posBlokEkle() {
    const islemVerisi = await transferBilgileriniAl();
    const hesap = gasFeeHesapla(islemVerisi);

    // GÖRSEL 3: Staking Animasyonu
    await beklemeEfekti(`${chalk.green('PoS Konsensüs')} çalışıyor (Validator Seçimi)...`, 1500);

    const kazanan = validatorSec();
    const toplamOdul = BLOK_ODULU + hesap.komisyonInItuCoin;
    kazanan.stake += toplamOdul;

    console.log(chalk.yellow(`🎉 Seçilen: ${kazanan.name}`));

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

    console.log(chalk.white("---------------------------------------------------"));
    
    // GÖRSEL 4: İŞLEM TABLOSU
    const txTable = new Table({ head: ['Gönderen', 'Alıcı', 'Miktar', 'Birim'] });
    txTable.push([blok.data.gonderen, blok.data.alici, blok.data.miktar, blok.data.birim]);
    console.log(txTable.toString());

    console.log(chalk.dim(`(Gas Fee: ${hesap.komisyonDolar.toFixed(2)}$)`)); 
    console.log(chalk.yellow(`KAZANÇ: +${toplamKazanc.toFixed(2)} ITÜCOIN (Validator: ${blok.validator})`));

    // AMM FİYAT ETKİSİ
    if(fiyatDegisimi.yeniFiyat > fiyatDegisimi.eskiFiyat) {
        console.log(chalk.bgGreen.black(` 📈 ITÜCOIN ARTTI: ${fiyatDegisimi.eskiFiyat.toFixed(4)}$ -> ${fiyatDegisimi.yeniFiyat.toFixed(4)}$ `));
    }

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

// GÖRSEL 5: VALIDATOR TABLOSU
async function validatorGoster() {
    console.log(chalk.yellow.bold("\n--- 👥 DOĞRULAYICI LİSTESİ ---"));
    
    const table = new Table({
        head: [chalk.cyan('Validator Adı'), chalk.cyan('Stake (ITÜCOIN)'), chalk.cyan('Güç %')],
        colWidths: [20, 20, 10]
    });

    const toplamStake = VALIDATORS.reduce((a, b) => a + b.stake, 0);

    VALIDATORS.forEach(v => {
        const yuzde = ((v.stake / toplamStake) * 100).toFixed(1);
        table.push([v.name, v.stake.toFixed(2), `%${yuzde}`]);
    });

    console.log(table.toString());
    await bekleVeDon();
}

// GÖRSEL 6: ZİNCİR TABLOSU
async function zinciriGoster() {
    console.log(chalk.yellow.bold("\n⛓️  BLOK ZİNCİRİ GEÇMİŞİ  ⛓️"));
    
    const table = new Table({
        head: ['No', 'Zaman', 'Kimden -> Kime', 'Miktar', 'Doğrulayıcı'],
        colWidths: [5, 22, 30, 15, 20]
    });

    myCoin.chain.forEach(blok => {
        let transfer = "Genesis Block";
        let miktar = "-";
        
        if (typeof blok.data === 'object') {
            transfer = `${blok.data.gonderen.substr(0,10)}.. -> ${blok.data.alici.substr(0,10)}..`;
            miktar = `${blok.data.miktar} ${blok.data.birim}`;
        }

        table.push([
            blok.index,
            blok.timestamp.substr(0, 20),
            transfer,
            miktar,
            blok.validator ? blok.validator.substr(0, 18) : 'Sistem'
        ]);
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