---
title: "Cloudflare Worker: Автентифікація через OAuth з зберіганням данних в JWT"
description: Сніппет авторизації для Cloudflare Worker
category: Программування
tags:
  - JavaScript
  - Cloudflare
  - Worker API
date: 2024-09-30T00:00:00.000Z
---
Працюю над автентифікацією і спочатку зробив її через Cloudflare Worker, як і задумував, але стикнувся з тим що поки не зрозумів чому PHP бекенд не хоче розпізновати JWT токен згенерований в іншому місці. Причин може бути купа і, здається, що причина в додаткових полях, наприклад `iss`. Вирішив що зараз не начасі намагатися подружити JS генератор токена та PHP валідатор. Тому назріла потреба видалити шматок кода, який представляє собою авторизацію через OAuth в гуглі та створення JWT токена. Залишаю на майбутньє, тому що знайти як робити такйи флоу – діло не пʼяти хвилин.

Генерація JWT взята за посиланням: https://stateful.com/blog/key-generation-webcrypto

```js
function buildAuthorizeUrl(env) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: env.CLIENT_ID,
    scope: env.SCOPE,
    redirect_uri: env.REDIRECT_URI,
  });

  return `${env.AUTHORIZE_URL}?${params}`;
}

async function fetchUserinfo(env, access_token) {
  const params = new URLSearchParams({
    access_token,
  });

  const response = await fetch(`${env.USERINFO_URL}?${params}`, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });

  return await response.json();
}

async function fetchToken(env, code) {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: env.CLIENT_ID,
    client_secret: env.CLIENT_SECRET,
    redirect_uri: env.REDIRECT_URI,
    code,
  });

  const response = await fetch(`${env.TOKEN_URL}?${params}`, {
    method: "POST",
    headers: {
      accept: "application/json",
    },
  });

  return await response.json();
}

function buildHtmlResponse(html) {
  return new Response(html, {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },
  });
}

function buildPostMessageHtml(data) {
  return `<script>opener?.postMessage({ type: 'auth', data: ${JSON.stringify(data)} }, '*'); close();</script>`;
}

async function signJwt(
  tokenPayload = {},
  issuer,
  privateKey,
  algorithmOptions = {},
) {
  const header = {
    alg: algorithmOptions.algorithm || "RS256",
    typ: "JWT",
    // kid: issuer.publicKeys[0].keyId,
  };

  const nowInSeconds = Math.floor(Date.now() / 1000);
  const neverEndingExpInSeconds = 9999999999;

  const payload = {
    iss: issuer.id,
    iat: nowInSeconds,
    exp: neverEndingExpInSeconds,
    ...tokenPayload,
  };

  const stringifiedHeader = JSON.stringify(header);
  const stringifiedPayload = JSON.stringify(payload);

  const headerBase64 = uint8ArrayToString(
    stringToUint8Array(stringifiedHeader),
  );
  const payloadBase64 = uint8ArrayToString(
    stringToUint8Array(stringifiedPayload),
  );
  const headerAndPayload = `${headerBase64}.${payloadBase64}`;

  const messageAsUint8Array = stringToUint8Array(headerAndPayload);

  const signature = await crypto.subtle.sign(
    {
      name: algorithmOptions.name || "RSASSA-PKCS1-v1_5",
      hash: algorithmOptions.hash || "SHA-256",
    },
    privateKey,
    messageAsUint8Array,
  );

  const base64Signature = uint8ArrayToString(new Uint8Array(signature));

  return `${headerAndPayload}.${base64Signature}`;
}

function arrayBufferToBase64(arrayBuffer) {
  const byteArray = new Uint8Array(arrayBuffer);
  let byteString = "";
  byteArray.forEach((byte) => {
    byteString += String.fromCharCode(byte);
  });
  return btoa(byteString);
}

function breakPemIntoMultipleLines(pem) {
  const charsPerLine = 64;
  let pemContents = "";
  while (pem.length > 0) {
    pemContents += `${pem.substring(0, charsPerLine)}\n`;
    pem = pem.substring(64);
  }
  return pemContents;
}

function base64ToUint8Array(base64Contents) {
  base64Contents = base64Contents
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .replace(/\s/g, "");
  const content = atob(base64Contents);
  return new Uint8Array(content.split("").map((c) => c.charCodeAt(0)));
}

function stringToUint8Array(contents) {
  const encoded = btoa(unescape(encodeURIComponent(contents)));
  return base64ToUint8Array(encoded);
}

function uint8ArrayToString(unsignedArray) {
  const base64string = btoa(String.fromCharCode(...unsignedArray));
  return base64string.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function importKey(key) {
  const enc = new TextEncoder("utf-8");

  return await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    {
      name: "HMAC",
      hash: { name: "SHA-256" },
    },
    false,
    ["sign", "verify"],
  );
}

export async function onRequest({ request, env }) {
  try {
    const code = new URL(request.url).searchParams.get("code");

    if (!code) {
      const url = buildAuthorizeUrl(env);

      // return buildHtmlResponse(`<a href="${url}">${url}</a>`);

      return Response.redirect(url, 301);
    }

    const { access_token } = await fetchToken(env, code);
    const { email, locale } = await fetchUserinfo(env, access_token);
    const token = await signJwt(
      { email, locale },
      { id: email },
      await importKey(env.JWT_SECRET),
      {
        algorithm: "HS256",
        name: "HMAC",
        hash: "SHA-512",
      },
    );

    return buildHtmlResponse(buildPostMessageHtml({ type: "auth", token }));
  } catch (error) {
    return buildHtmlResponse(String(error));
  }
}
```

Env-змінні:

```
AUTHORIZE_URL=https://accounts.google.com/o/oauth2/auth
CLIENT_ID=...
CLIENT_SECRET=...
JWT_SECRET=...
REDIRECT_URI=https://...
SCOPE=https://www.googleapis.com/auth/userinfo.email
TOKEN_URL=https://oauth2.googleapis.com/token
USERINFO_URL=https://www.googleapis.com/oauth2/v3/userinfo
```
