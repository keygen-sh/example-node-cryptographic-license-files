# Example Node Cryptographic License Files

This is an example of how to verify and decrypt [cryptographic license files](https://keygen.sh/docs/api/cryptography/#cryptographic-lic)
in Node, using Ed25519 signing and AES-256-GCM encryption. This example
verifies the `aes-256-gcm+ed25519` algorithm.

## Running the example

First up, add an environment variable containing your **DER-encoded** Ed25519 public key:

```bash
export KEYGEN_PUBLIC_KEY='MCowBQYDK2VwAyEA6GAeSLaTg7pSAkX9B5cemD0G0ixCV8/YIwRgFHnO54g='
```

You can either run each line above within your terminal session before
starting the app, or you can add the above contents to your `~/.bashrc`
file and then run `source ~/.bashrc` after saving the file.

Next, install dependencies with [`yarn`](https://yarnpkg.com):

```
yarn
```

Then run the script, passing in a `path` to a license file, and a `license`
key as arguments:

```bash
yarn start --license 'A_LICENSE_KEY' --path /etc/keygen/license.lic
```

Or run one of the pre-defined examples:

```bash
KEYGEN_PUBLIC_KEY='MCowBQYDK2VwAyEA6GAeSLaTg7pSAkX9B5cemD0G0ixCV8/YIwRgFHnO54g=' yarn start \
  --license 'DC00E8-CC6DA1-2E35BF-BBDC02-E80494-V3' \
  --path examples/license.lic
```

The following will happen:

1. The license file's authenticity will be verified using Ed25519, by verifing
   its signature using the public key.
1. The license file will be decrypted using the license key
   as the decryption key.

If everything checks out, the script will print the decrypted contents of
the license file — the license object, with any included data. If it
fails, check your inputs.

## Questions?

Reach out at [support@keygen.sh](mailto:support@keygen.sh) if you have any
questions or concerns!
