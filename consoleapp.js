const inquirer = require('inquirer');
const Blockchain = require('./blockchain');
const Block = require('./block');
const fs = require('fs');
const chalk = require('chalk'); // Renkli çıktı için

const myCoin = new Blockchain();
const ZORLUK_DERECESI = 2; // WOW: Hash '00' ile başlamalı (Bunu 4 yaparsan bilgisayarın donabilir!)

// --- DATA YÜKLEME ---
if (fs.existsSync('data.json')) {
    const dosyaVerisi = fs.readFileSync('data.json', 'utf-8');
    if (dosyaVerisi.length > 0) {
        const yuklenenZincir = JSON.parse(dosyaVerisi);
        if (yuklenenZincir.length > 0) myCoin.chain = yuklenenZincir;
    }
}

async function main() {
    console.clear();
    console.log(chalk.yellow.bold("=========================================="));
    console.log(chalk.yellow.bold("🚀  İTÜ BLOCKCHAIN MINER v1.0 (PoW)   🚀"));
    console.log(chalk.yellow.bold("=========================================="));
    console.log(chalk.blue(`Mevcut Blok: ${myCoin.chain.length} | Zorluk: ${ZORLUK_DERECESI}`));
    console.log("\n");

    const cevap = await inquirer.prompt([
        {
            type: 'list',
            name: 'secim',
            message: chalk.cyan('Operasyon Seçiniz:'),
            choices: ['Yeni Blok Madenciliği Yap (Mine)', 'Zinciri Görüntüle', 'Çıkış']
        }
    ]);

    if (cevap.secim === 'Yeni Blok Madenciliği Yap (Mine)') await blokEkle();
    else if (cevap.secim === 'Zinciri Görüntüle') zinciriGoster();
    else process.exit();
}

async function blokEkle() {
    const veriSorusu = await inquirer.prompt([
        {
            type: 'input',
            name: 'veri',
            message: chalk.magenta('Transfer Verisi (Örn: Atakan -> Ali 50 BTC):')
        }
    ]);

    // Madencilik Efekti
    console.log("\n");
    console.log(chalk.bgRed.white.bold(" ⛏️  MADENCİLİK BAŞLIYOR... LÜTFEN BEKLEYİN "));
    console.log(chalk.gray("Matematiksel problem çözülüyor... (Proof of Work)"));

    // Bekletme efekti (Sadece heyecan yaratmak için yapay gecikme)
    await new Promise(r => setTimeout(r, 1000));

    const yeniBlok = new Block(
        myCoin.chain.length,
        new Date().toLocaleString(),
        veriSorusu.veri,
        myCoin.getLatestBlock().hash // Önceki hash'i al
    );

    // --- BURASI KRİTİK NOKTA ---
    // Bilgisayar burada hash '00' ile başlayana kadar binlerce deneme yapacak
    yeniBlok.mineBlock(ZORLUK_DERECESI); 

    // Blok kazıldıktan sonra zincire ekliyoruz (addBlock içindeki hash hesaplamayı devre dışı bırakıyoruz)
    // Çünkü mineBlock zaten doğru hash'i buldu.
    // Basitlik olsun diye manuel push yapıyoruz veya blockchain.js'i buna göre düzenlememiz gerekirdi.
    // Şimdilik addBlock yerine manuel ekleme yapalım ki karışmasın:
    myCoin.chain.push(yeniBlok);

    console.log(chalk.green.bold("\n✅  BAŞARILI! Blok Zincire Kilitlendi."));
    console.log(chalk.white("---------------------------------------------------"));
    console.log(chalk.yellow("Bulunan Nonce Değeri : ") + chalk.cyan(yeniBlok.nonce));
    console.log(chalk.yellow("Oluşan Hash          : ") + chalk.green(yeniBlok.hash));
    console.log(chalk.white("---------------------------------------------------"));

    fs.writeFileSync('data.json', JSON.stringify(myCoin.chain, null, 4));
    console.log(chalk.dim("💾  Veri tabanı güncellendi."));

    await bekleVeDon();
}

function zinciriGoster() {
    console.log(chalk.yellow.bold("\n⛓️  GÜNCEL BLOK ZİNCİRİ  ⛓️"));
    console.log(JSON.stringify(myCoin.chain, null, 4));
    setTimeout(() => bekleVeDon(), 2000);
}

async function bekleVeDon() {
    console.log("\n");
    await inquirer.prompt([{ type: 'input', name: 'devam', message: chalk.gray('Devam etmek için ENTER...') }]);
    main();
}

main();