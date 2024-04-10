const { KEYGEN_PUBLIC_KEY } = process.env

const crypto = require('crypto')
const chalk = require('chalk')
const fs = require('fs/promises')

async function main() {
  let licenseFilePath, licenseKey

  // Parse argument flags
  process.argv.forEach((arg, i, argv) => {
    switch (arg) {
      case '--path':
      case '-p':
        licenseFilePath = argv[i + 1]
        break
      case '--license':
      case '-l':
        licenseKey = argv[i + 1]
        break
    }
  })

  // Sanity checks for public key
  if (!KEYGEN_PUBLIC_KEY) {
    throw new Error('DER-encoded Ed25519 public key is required')
  }

  // Validate flags
  if (!licenseFilePath) {
    throw new Error('License file path is required')
  }

  if (!licenseKey) {
    throw new Error('License key is required')
  }

  const licenseFile = await fs.readFile(licenseFilePath, { encoding: 'utf-8' })
  const encodedPayload  = licenseFile.replace(/-----(?:BEGIN|END) LICENSE FILE-----\n?/g, '')
  const decodedPayload = Buffer.from(encodedPayload, 'base64').toString()
  const payload = JSON.parse(decodedPayload)

  const { enc, sig, alg } = payload
  if (alg !== 'aes-256-gcm+ed25519') {
    throw new Error(`License file algorithm is not supported: ${alg}`)
  }

  // Format is good
  console.log(chalk.green(`License file format is valid!`))

  const decodedPublicKey = Buffer.from(KEYGEN_PUBLIC_KEY, 'base64')
  const publicKey = crypto.createPublicKey({ key: decodedPublicKey, format: 'der', type: 'spki' })
  const signatureBytes = Buffer.from(sig, 'base64')
  const dataBytes = Buffer.from(`license/${enc}`)
  const ok = crypto.verify(null, dataBytes, publicKey, signatureBytes)
  if (!ok) {
    throw new Error(`License file signature verification failed!`)
  }

  // Signature is good
  console.log(
    chalk.green(`License file signature is valid!`),
  )

  const [ciphertext, iv, tag] = enc.split('.')
  const digest = crypto.createHash('sha256').update(licenseKey).digest()
  const aes = crypto.createDecipheriv('aes-256-gcm', digest, Buffer.from(iv, 'base64'))

  aes.setAuthTag(Buffer.from(tag, 'base64'))
  aes.setAAD(Buffer.from(''))

  let plaintext = aes.update(Buffer.from(ciphertext, 'base64'), null, 'utf-8')
  plaintext += aes.final('utf8')

  // Decryption succeeded
  console.log(
    chalk.green(`License file decrypted!`),
  )

  const { meta, data, included } = JSON.parse(plaintext)
  const { issued, expiry } = meta
  if (new Date(issued).getTime() > Date.now() || new Date(expiry).getTime() < Date.now()) {
    throw new Error(`License file has expired`)
  }

  console.log(chalk.green(`License file:`))
  console.log(
    chalk.green(JSON.stringify({ meta, data, included }, null, 2)),
  )
}

main().catch(err =>
  console.error(
    chalk.red(`Error: ${err.message}\n`),
    err.stack,
  )
)
