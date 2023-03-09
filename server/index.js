const express = require("express")
const app = express()
const cors = require("cors")
const port = 3042
const keys = require("./constants/keys.json")
const secp = require("ethereum-cryptography/secp256k1")
const { keccak256 } = require("ethereum-cryptography/keccak")
const { utf8ToBytes, toHex, bytesToUtf8 } = require("ethereum-cryptography/utils")

app.use(cors())
app.use(express.json())

let balances = {}
for (let i = 0; i < keys.length; i++) {
    balances[keys[i].publicKey] = 100
}

app.get("/balance/:address", (req, res) => {
    const { address } = req.params
    const balance = balances[address] || 0
    res.send({ balance })
})

app.post("/send", async (req, res) => {
    const { message, recoveryBit, signature } = req.body
    const { sender, recipient, amount } = message

    const recoveredPublicKey = await recoverKey(message, new Uint8Array(signature), recoveryBit)

    setInitialBalance(sender)
    setInitialBalance(recipient)

    if (toHex(recoveredPublicKey) === sender) {
        if (balances[sender] < amount) {
            res.status(400).send({ message: "Not enough funds!" })
        } else {
            balances[sender] -= amount
            balances[recipient] += amount
            res.send({ balance: balances[sender] })
        }
    } else {
        res.status(400).send({ message: "Signature isn't valid!" })
    }
})

app.listen(port, () => {
    console.log(`Listening on port ${port}!`)
})

function setInitialBalance(address) {
    if (!balances[address]) {
        balances[address] = 0
    }
}

async function recoverKey(message, signature, recoveryBit) {
    return await secp.recoverPublicKey(
        keccak256(utf8ToBytes(JSON.stringify(message))),
        signature,
        recoveryBit
    )
}
