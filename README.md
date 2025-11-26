# ⛓️ İTÜCHAIN Blockchain Simülasyonu

Bu proje, **İTÜ Blockchain Kulübü** tarafından verilen ödev kapsamında geliştirilmiş, terminal tabanlı basit bir blokzincir simülasyonudur.

Projenin amacı; blokzincirlerin temel çalışma prensiplerini (Madencilik, Transferler, Blok Yapısı) JavaScript ve Node.js kullanarak pratik etmektir.

## 📌 Neler Yapabiliyor?

Proje, temel bir blokzincir ağını simüle eder ve şu özelliklere sahiptir:

* **Proof of Work (Madencilik):** Blokların işlemci gücü simülasyonu ile (gecikmeli olarak) oluşturulması.
* **Proof of Stake (Staking):** Blokların bakiye miktarına göre seçilen doğrulayıcılar tarafından onaylanması.
* **Basit Piyasa Mantığı:** İşlem yapıldıkça coin fiyatının değiştiği temel bir fiyatlandırma algoritması (x*y=k).
* **Transfer Simülasyonu:** ITÜCOIN, WBTC, USDT gibi varlıkların temsili transferi ve kayıt altına alınması.
* **Kalıcılık:** Verilerin `data.json` dosyasında tutulması ve program kapansa bile silinmemesi.
* **Sıfırlama:** Tek tuşla tüm zinciri temizleme (Reset) özelliği.

## 🚀 Kurulum ve Çalıştırma

Projeyi kendi bilgisayarınızda çalıştırmak için:

1.  Projeyi klonlayın:
    ```bash
    git clone [https://github.com/hakubat/bc-simulasyon-serra-atakan-devs2025.git](https://github.com/hakubat/bc-simulasyon-serra-atakan-devs2025.git)
    ```
2.  Proje klasörüne girin:
    ```bash
    cd bc-simulasyon-serra-atakan-devs2025
    ```
3.  Gerekli paketleri yükleyin:
    ```bash
    npm install
    ```
4.  Sisteme entegre edin (Önerilen):
    ```bash
    sudo npm link
    ```

## 💻 Nasıl Kullanılır?

Terminale şu komutu yazarak simülasyonu başlatabilirsiniz:

```bash
ituchain