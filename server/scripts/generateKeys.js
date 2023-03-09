const secp = require("ethereum-cryptography/secp256k1")
const { toHex } = require("ethereum-cryptography/utils")
var fs = require("fs")

let keys = []

for (let i = 0; i < 10; i++) {
    const privateKey = secp.utils.randomPrivateKey()
    const publicKey = secp.getPublicKey(privateKey)
    keys.push({ privateKey: toHex(privateKey), publicKey: toHex(publicKey) })
}

// console.log(keys)

fs.writeFile("./constants/keys.json", JSON.stringify(keys), (err) => console.log(err))
