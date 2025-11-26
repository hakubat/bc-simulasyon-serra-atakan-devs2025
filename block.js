const crypto = require('crypto');

class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0; // WOW: Madencilik için sayaç (Deneme sayısı)
    }

    calculateHash() {
        // Nonce değerini de şifreye dahil ediyoruz
        const veriBirlestir = this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce;
        return crypto.createHash('sha256').update(veriBirlestir).digest('hex');
    }

    // WOW: Madencilik Fonksiyonu
    // difficulty: Zorluk derecesi (Kaç tane 0 ile başlamalı?)
    mineBlock(difficulty) {
        // Hash'in başındaki karakterler, istediğimiz kadar "0" olana kadar döngü kuruyoruz
        // Örn: difficulty 2 ise hash "00..." ile başlamalı.
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++; // Sayacı 1 artır
            this.hash = this.calculateHash(); // Yeni hash hesapla
        }
        // Döngü bittiğinde madencilik tamamlanmış demektir.
        console.log("⛏️  Blok Kazıldı: " + this.hash);
    }
}

module.exports = Block;