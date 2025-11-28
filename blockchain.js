// yazdığımız Block yapısını buraya dahil ediyoruz.
const Block = require('./block');

class Blockchain {
    constructor() {
        // Zinciri başlatıyoruz. İlk eleman Genesis Block
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

        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
    }
}

module.exports = Blockchain;