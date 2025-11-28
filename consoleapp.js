#!/usr/bin/env node
// 👆 Bu satır, dosyanın terminalde 'node' komutu yazmadan çalışmasını sağlar.

// --- KÜTÜPHANELER ---
const inquirer = require('inquirer');
const Blockchain = require('./blockchain');
const Block = require('./block');
const fs = require('fs');
const chalk = require('chalk');

// --- GÖRSEL EFEKT KÜTÜPHANELERİ ---
const figlet = require('figlet');
const ora = require('ora');
const Table = require('cli-table3');
const gradient = require('gradient-string');
const boxen = require('boxen');
const cliProgress = require('cli-progress');

// --- SİSTEM AYARLARI ---
let myCoin = new Blockchain();
const BLOK_ODULU = 50;
const KOMISYON_ORANI = 0.05;

// --- AMM AYARLARI ---
const BASLANGIC_HAVUZ = { ituCoin: 1000000, usdt: 10000000 };
let LIQUIDITY_POOL = { 
    ituCoin: BASLANGIC_HAVUZ.ituCoin, 
    usdt: BASLANGIC_HAVUZ.usdt, 
    k: BASLANGIC_HAVUZ.ituCoin * BASLANGIC_HAVUZ.usdt 
};

// --- ORACLE / PİYASA VERİLERİ ---
let MARKET = { 
    'ITÜCOIN': 10.0, 
    'WBTC (Wrapped)': 95000.0, 
    'WETH (Wrapped)': 3200.0, 
    'USDT': 1.0 
};

let FIYAT_GECMISI = []; // Grafik için veri tutucu

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

// --- GÖRSEL EFEKTLER ---
async function madencilikEfekti() {
    console.log(chalk.gray("\nSHA-256 Algoritması Çalıştırılıyor (Nonce Aranıyor)..."));
    const bar = new cliProgress.SingleBar({
        format: chalk.cyan('{bar}') + ' | {percentage}% | {value}/{total} Hash',
        barCompleteChar: '\u2588', barIncompleteChar: '\u2591', hideCursor: true
    });
    bar.start(100, 0);
    for (let i = 0; i <= 100; i++) {
        bar.update(i);
        await new Promise(r => setTimeout(r, 20)); 
    }
    bar.stop();
    console.log(chalk.green("✔ Hash Başarıyla Çözüldü!\n"));
}

async function beklemeEfekti(mesaj, sure = 1500) {
    const spinner = ora({ text: mesaj, color: 'yellow', spinner: 'dots12' }).start();
    await new Promise(r => setTimeout(r, sure));
    spinner.succeed(chalk.green("İşlem Onaylandı"));
}

// ==========================================
// ANA PROGRAM DÖNGÜSÜ (MAIN)
// ==========================================
async function main() {
    console.clear();
    
    // 1. LOGO
    const logo = figlet.textSync('ITU CHAIN', { horizontalLayout: 'full' });
    console.log(gradient.cristal(logo)); 
    console.log(gradient.atlas("     >> Decentralized Hybrid Blockchain Simulation <<     \n"));
    
    // 2. FİYAT GÜNCELLEME
    MARKET['ITÜCOIN'] = LIQUIDITY_POOL.usdt / LIQUIDITY_POOL.ituCoin;

    // 3. PİYASA BİLGİSİ (TVL ve Hizalama Düzeltilmiş)
    let totalTVL = LIQUIDITY_POOL.usdt + (LIQUIDITY_POOL.ituCoin * MARKET['ITÜCOIN']);
    let showPrice = "$" + MARKET['ITÜCOIN'].toFixed(4);
    let showTVL   = "$" + (totalTVL / 1000000).toFixed(1) + "M";
    const marketInfo = `ITÜCOIN: ${showPrice.padEnd(10, ' ')}\nTVL:     ${showTVL.padEnd(10, ' ')}`;

    console.log(boxen(marketInfo, {
        padding: 1, margin: 0, borderStyle: 'round', borderColor: 'cyan',
        title: 'CANLI PİYASA (AMM)', titleAlignment: 'center'
    }));

    // 4. MENÜ (Hizalı ve Emojili)
    const cevap = await inquirer.prompt([
        {
            type: 'list',
            name: 'secim',
            message: chalk.yellow('İşlem Seçiniz:'),
            choices: [
                { name: '⛏️   Blok Kaz (Proof of Work)',      value: 'pow' },
                { name: '🎲   Blok İmzala (Proof of Stake)',  value: 'pos' },
                { name: '📉   ITÜCOIN Sat (Market Sell)',     value: 'sell' },
                { name: '👥   Doğrulayıcıları Gör (Table)',   value: 'validators' },
                { name: '⛓️   Zinciri Görüntüle (Table)',     value: 'chain' },
                { name: '🗑️   Sistemi Sıfırla (Reset)',       value: 'reset' },
                new inquirer.Separator(),
                { name: '❌   Çıkış',                         value: 'exit' }
            ]
        }
    ]);

    if (cevap.secim === 'pow')        await powBlokEkle();
    else if (cevap.secim === 'pos')   await posBlokEkle();
    else if (cevap.secim === 'sell')  await ituCoinSatis();
    else if (cevap.secim === 'validators') await validatorGoster();
    else if (cevap.secim === 'chain') await zinciriGoster();
    else if (cevap.secim === 'reset') await sistemiSifirla();
    else process.exit();
}

// --- FONKSİYONLAR ---
async function sistemiSifirla() {
    console.log("\n");
    const onay = await inquirer.prompt([{ type: 'confirm', name: 'emin', message: chalk.bgRed.white.bold(' SİLİNECEK! Emin misiniz? '), default: false }]);
    if (onay.emin) {
        const spinner = ora('Sıfırlanıyor...').start();
        await new Promise(r => setTimeout(r, 2000));
        if (fs.existsSync('data.json')) fs.unlinkSync('data.json');
        myCoin = new Blockchain();
        LIQUIDITY_POOL = { ...BASLANGIC_HAVUZ, k: BASLANGIC_HAVUZ.ituCoin * BASLANGIC_HAVUZ.usdt };
        VALIDATORS = JSON.parse(JSON.stringify(BASLANGIC_VALIDATORS));
        spinner.succeed('Tamamlandı.');
    } 
    await bekleVeDon();
}

async function transferBilgileriniAl() {
    console.log(chalk.gray("\n--- Transfer Detayları ---"));
    const cevaplar = await inquirer.prompt([
        { type: 'input', name: 'gonderen', message: 'Gönderen:', default: 'Atakan Kubat' },
        { type: 'input', name: 'alici', message: 'Alıcı:', validate: v => v.length > 0 ? true : 'Gerekli.' },
        { type: 'number', name: 'miktar', message: 'Miktar:', default: 1000 },
        { type: 'list', name: 'birim', message: 'Varlık:', choices: ['USDT', 'ITÜCOIN', 'WBTC', 'WETH'] }
    ]);
    return { txId: Math.random().toString(36).substr(2, 9).toUpperCase(), zaman: new Date().toLocaleTimeString(), ...cevaplar };
}

function gasFeeHesapla(islemVerisi) {
    const varlikFiyati = MARKET[islemVerisi.birim] || MARKET['USDT']; // Güvenlik önlemi
    const islemDolarDegeri = islemVerisi.miktar * varlikFiyati;
    const komisyonDolar = islemDolarDegeri * KOMISYON_ORANI;
    const komisyonInItuCoin = komisyonDolar / MARKET['ITÜCOIN'];
    return { komisyonDolar, komisyonInItuCoin };
}

function ammFiyatGuncelle(islemVerisi, hesap) {
    LIQUIDITY_POOL.usdt += hesap.komisyonDolar;
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
    await madencilikEfekti();
    const yeniBlok = new Block(myCoin.chain.length, new Date().toLocaleString(), islemVerisi, myCoin.getLatestBlock().hash, "Miner Node (PoW)");
    yeniBlok.mineBlock(2);
    await zincireEkleVeKaydet(yeniBlok, BLOK_ODULU + hesap.komisyonInItuCoin, hesap, islemVerisi); 
}

async function posBlokEkle() {
    const islemVerisi = await transferBilgileriniAl();
    const hesap = gasFeeHesapla(islemVerisi);
    await beklemeEfekti(`Validator seçiliyor...`, 1500);
    const kazanan = validatorSec();
    const toplamOdul = BLOK_ODULU + hesap.komisyonInItuCoin;
    kazanan.stake += toplamOdul;
    console.log(chalk.yellow(`🎉 Seçilen: ${kazanan.name}`));
    const yeniBlok = new Block(myCoin.chain.length, new Date().toLocaleString(), islemVerisi, myCoin.getLatestBlock().hash, kazanan.name);
    await zincireEkleVeKaydet(yeniBlok, toplamOdul, hesap, islemVerisi);
}

async function zincireEkleVeKaydet(blok, toplamKazanc, hesap, islemVerisi) {
    myCoin.addBlock(blok);
    const fiyatDegisimi = ammFiyatGuncelle(islemVerisi, hesap);

    let ozetMetni = "";
    ozetMetni += `${chalk.bold('İŞLEM:')} ${blok.data.gonderen} -> ${blok.data.alici}\n`;
    ozetMetni += `${chalk.bold('TUTAR:')} ${blok.data.miktar} ${blok.data.birim}\n`;
    ozetMetni += `${chalk.dim('Gas Fee:')} ${hesap.komisyonDolar.toFixed(2)}$\n`;
    ozetMetni += `-----------------------------\n`;
    ozetMetni += `${chalk.bold.green('KAZANÇ:')} +${toplamKazanc.toFixed(2)} ITÜCOIN\n`;
    ozetMetni += `${chalk.gray('Validator:')} ${blok.validator}`;

    console.log(boxen(ozetMetni, { padding: 1, borderStyle: 'classic', borderColor: 'yellow', title: '✅ BLOK EKLENDİ' }));

    if(fiyatDegisimi.yeniFiyat > fiyatDegisimi.eskiFiyat) {
        console.log(gradient.pastel(`📈 PİYASA YÜKSELDİ: 1 ITÜCOIN = ${fiyatDegisimi.yeniFiyat.toFixed(4)}$`));
    }
    fs.writeFileSync('data.json', JSON.stringify(myCoin.chain, null, 4));
    await bekleVeDon();
}

async function ituCoinSatis() {
    console.log(chalk.gray("\n--- Satış Emri (Sell Order) ---"));
    const cevap = await inquirer.prompt([{ type: 'number', name: 'miktar', message: chalk.red('Kaç ITÜCOIN satmak istiyorsun?'), default: 100 }]);
    const satilanMiktar = cevap.miktar;

    LIQUIDITY_POOL.ituCoin += satilanMiktar;
    const eskiUsdt = LIQUIDITY_POOL.usdt;
    const yeniUsdt = LIQUIDITY_POOL.k / LIQUIDITY_POOL.ituCoin;
    const alinanUsdt = eskiUsdt - yeniUsdt;
    LIQUIDITY_POOL.usdt = yeniUsdt;
    const eskiFiyat = MARKET['ITÜCOIN'];
    const yeniFiyat = LIQUIDITY_POOL.usdt / LIQUIDITY_POOL.ituCoin;
    MARKET['ITÜCOIN'] = yeniFiyat;

    if (typeof FIYAT_GECMISI !== 'undefined') {
        FIYAT_GECMISI.push(yeniFiyat);
        if (FIYAT_GECMISI.length > 30) FIYAT_GECMISI.shift();
        if (fs.existsSync('market.json')) fs.writeFileSync('market.json', JSON.stringify(FIYAT_GECMISI));
    }

    await beklemeEfekti(chalk.red('Satış emri havuza iletiliyor...'), 1500);
    const islemVerisi = { txId: Math.random().toString(36).substr(2, 9).toUpperCase(), gonderen: "Atakan (Trader)", alici: "Liquidity Pool (AMM)", miktar: satilanMiktar, birim: "ITÜCOIN (SOLD)" };
    const yeniBlok = new Block(myCoin.chain.length, new Date().toLocaleString(), islemVerisi, myCoin.getLatestBlock().hash, "DEX Contract");
    myCoin.addBlock(yeniBlok);
    fs.writeFileSync('data.json', JSON.stringify(myCoin.chain, null, 4));

    let ozetMetni = `${chalk.bold('İŞLEM:')} SATIŞ (SELL)\n`;
    ozetMetni += `${chalk.bold('VERİLEN:')} ${satilanMiktar} ITÜCOIN\n`;
    ozetMetni += `${chalk.bold.green('ALINAN:')}  ${alinanUsdt.toFixed(2)} USDT\n`;
    console.log(boxen(ozetMetni, { padding: 1, borderStyle: 'double', borderColor: 'red', title: '📉 SATIŞ BAŞARILI' }));
    console.log(gradient.morning(` 📉 PİYASA DÜŞTÜ: ${eskiFiyat.toFixed(4)}$ -> ${yeniFiyat.toFixed(4)}$ `));
    await bekleVeDon();
}

function validatorSec() {
    const toplamStake = VALIDATORS.reduce((acc, v) => acc + v.stake, 0);
    let rastgele = Math.random() * toplamStake;
    for (const v of VALIDATORS) return (rastgele -= v.stake) < 0 ? v : null || v;
}

async function validatorGoster() {
    console.log(chalk.yellow.bold("\n--- 👥 DOĞRULAYICI LİSTESİ ---"));
    const table = new Table({ head: [chalk.cyan('Validator'), chalk.cyan('Stake'), chalk.cyan('Güç %')] });
    const toplamStake = VALIDATORS.reduce((a, b) => a + b.stake, 0);
    VALIDATORS.forEach(v => table.push([v.name, v.stake.toFixed(2), `%${((v.stake / toplamStake) * 100).toFixed(1)}`]));
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