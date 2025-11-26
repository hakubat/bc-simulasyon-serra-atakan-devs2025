const crypto = require('crypto');

class Block {
    // Hem PoS (validator) hem PoW (nonce) desteği var
    constructor(index, timestamp, data, previousHash = '', validator = 'Sistem') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.validator = validator; // Kim doğruladı?
        this.nonce = 0;             // Madencilik sayısı
        this.hash = this.calculateHash();
    }

    calculateHash() {
        // Hash hesaplarken HEM validator ismini HEM de nonce değerini katıyoruz
        const veriBirlestir = this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.validator + this.nonce;
        return crypto.createHash('sha256').update(veriBirlestir).digest('hex');
    }

    // PoW için Madencilik Fonksiyonu
    mineBlock(difficulty) {
        // Hash istenen sayıda '0' ile başlayana kadar nonce'u artır
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("⛏️  Blok Kazıldı (PoW): " + this.hash);
    }
}

module.exports = Block;