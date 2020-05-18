# PolisPay Recovery

WARNING: This program has not been audited for security.

PolisPay Recovery is an open-source tool to recovery private keys from mnemonic phrases for multiple cryptocurrencies.
Currently supporting:
* Polis (POLIS)
* Bitcoin (BTC)
* Dash (DASH)
* Litecoin (LTC)

### Building

Requirements:
* Node >= 11 (haven't tested compatibility with lower versions)
* npm (or yarn)
* electron

Clone the repository 
```
git clone https://github.com/eabz/polispay-recovery && cd polispay-recovery
```

Install dependencies
```
npm install
```

or 

```
yarn install
```

Run the app on electron
```
yarn run electron:run
```

Create binaries
```
yarn run electron:pack
```


### Verifying

Clone the repository 
```
git clone https://github.com/eabz/polispay-recovery && cd polispay-recovery
```

Import signature 
```
gpg --import signatures/cronos.asc 
```

Check binaries signing
```
gpg --verify SIGNATURE-FILE.asc BINARY-FILE(.dmg .exe .snap)
```
