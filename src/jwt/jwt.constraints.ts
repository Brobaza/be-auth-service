import * as fs from 'fs';
import * as crypto from 'node:crypto';
import * as path from 'node:path';

function checkExistFolder(name: string) {
  const checkPath = path.join(process.cwd(), name);
  if (!fs.existsSync(checkPath)) {
    fs.mkdirSync(checkPath, { recursive: true });
  }
}

function generateKeyPair(tokenType: string): {
  privateKey: string;
  publicKey: string;
} {
  checkExistFolder('secure');

  const privateKeyPath = path.join(
    process.cwd(),
    `secure/${tokenType}_private.key`,
  );
  const publicKeyPath = path.join(
    process.cwd(),
    `secure/${tokenType}_public.key`,
  );

  if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    fs.writeFileSync(privateKeyPath, privateKey);
    fs.writeFileSync(publicKeyPath, publicKey);
  }

  const privateKey = fs.readFileSync(privateKeyPath, 'utf-8');
  const publicKey = fs.readFileSync(publicKeyPath, 'utf-8');

  return { privateKey, publicKey };
}

export const {
  privateKey: ACCESS_TOKEN_PRIVATE_KEY,
  publicKey: ACCESS_TOKEN_PUBLIC_KEY,
} = generateKeyPair('access_token');

export const {
  privateKey: REFRESH_TOKEN_PRIVATE_KEY,
  publicKey: REFRESH_TOKEN_PUBLIC_KEY,
} = generateKeyPair('refresh_token');
