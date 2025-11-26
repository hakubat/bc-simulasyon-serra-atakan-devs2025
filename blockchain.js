// Az önce yazdığımız Block yapısını buraya dahil ediyoruz.
const Block = require('./block');

class Blockchain {
    constructor() {
        // Zinciri başlatıyoruz. İlk eleman her zaman Genesis Block'tur.
        this.chain = [this.createGenesisBlock()];
    }

    // İlk bloğu (Genesis) manuel olarak oluşturan fonksiyon.
    createGenesisBlock() {
        return new Block(0, "01/01/2025", "Genesis Block", "0");
    }

    // Zincirin en sonundaki bloğu getiren yardımcı fonksiyon.
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    // Yeni bir blok ekleme fonksiyonu.
    addBlock(newBlock) {
        // Yeni bloğun 'previousHash' değerini, zincirdeki son bloğun hash'i yapıyoruz.
        // Bağlantı burada kuruluyor!
        newBlock.previousHash = this.getLatestBlock().hash;
        
        // Yeni bilgilerle (yeni previousHash ile) bloğun kendi hash'ini tekrar hesaplıyoruz.
        newBlock.hash = newBlock.calculateHash();
        
        // Bloğu zincire (listeye) ekliyoruz.
        this.chain.push(newBlock);
    }
}

// Bu class'ı dışarı açıyoruz.
module.exports = Blockchain;