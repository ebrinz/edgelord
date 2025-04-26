---
title: Next.js API with Fastify v1.0.0
language_tabs:
  - shell: cURL
language_clients:
  - shell: ""
toc_footers:
  - <a href="https://swagger.io">Find more info here</a>
includes: []
search: true
highlight_theme: darkula
headingLevel: 2

---

<!-- Generator: Widdershins v4.0.1 -->

<h1 id="next-js-api-with-fastify">Next.js API with Fastify v1.0.0</h1>

> Scroll down for code samples, example requests and responses. Select a language for code samples from the tabs above or the mobile navigation menu.

API for Next.js frontend with Supabase authentication

Base URLs:

* <a href="http://localhost:3001">http://localhost:3001</a>

# Authentication

- HTTP Authentication, scheme: bearer 

* API Key (apiKeyAuth)
    - Parameter Name: **x-api-key**, in: header. 

<h1 id="next-js-api-with-fastify-default">Default</h1>

## get__health

> Code samples

```shell
# You can also use wget
curl -X GET http://localhost:3001/health \
  -H 'Authorization: Bearer {access-token}'

```

`GET /health`

<h3 id="get__health-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Default Response|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

<h1 id="next-js-api-with-fastify-auth">Auth</h1>

Authentication endpoints

## post__api_auth_login

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

`POST /api/auth/login`

> Body parameter

```json
{
  "email": "user@example.com",
  "password": "string"
}
```

<h3 id="post__api_auth_login-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|object|true|none|
|» email|body|string(email)|true|none|
|» password|body|string|true|none|

> Example responses

> 200 Response

```json
{
  "token": "string",
  "user": {}
}
```

<h3 id="post__api_auth_login-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Default Response|Inline|

<h3 id="post__api_auth_login-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» token|string|false|none|none|
|» user|object|false|none|none|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## get__api_auth_user

> Code samples

```shell
# You can also use wget
curl -X GET http://localhost:3001/api/auth/user \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

`GET /api/auth/user`

> Example responses

> 200 Response

```json
{
  "user": {},
  "profile": {
    "username": "string",
    "full_name": "string",
    "avatar_url": "string"
  }
}
```

<h3 id="get__api_auth_user-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Default Response|Inline|

<h3 id="get__api_auth_user-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» user|object|false|none|none|
|» profile|object|false|none|none|
|»» username|string|false|none|none|
|»» full_name|string|false|none|none|
|»» avatar_url|string|false|none|none|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## post__api_auth_api-key

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:3001/api/auth/api-key \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

`POST /api/auth/api-key`

> Example responses

> 200 Response

```json
{
  "id": "string",
  "apiKey": "string",
  "expiresAt": "string",
  "permissions": [
    "string"
  ]
}
```

<h3 id="post__api_auth_api-key-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Default Response|Inline|

<h3 id="post__api_auth_api-key-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» id|string|false|none|UUID of the API key record used for revocation|
|» apiKey|string|false|none|none|
|» expiresAt|string|false|none|none|
|» permissions|[string]|false|none|none|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## delete__api_auth_api-key_{id}

> Code samples

```shell
# You can also use wget
curl -X DELETE http://localhost:3001/api/auth/api-key/{id} \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

`DELETE /api/auth/api-key/{id}`

Revoke an API key using its UUID (not the API key string itself)

<h3 id="delete__api_auth_api-key_{id}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|string|true|UUID of the API key record (obtained when generating the key)|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string"
}
```

<h3 id="delete__api_auth_api-key_{id}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Default Response|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Default Response|Inline|

<h3 id="delete__api_auth_api-key_{id}-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» success|boolean|false|none|none|
|» message|string|false|none|none|

Status Code **400**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» error|string|false|none|none|
|» message|string|false|none|none|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## get__api_auth_api-keys

> Code samples

```shell
# You can also use wget
curl -X GET http://localhost:3001/api/auth/api-keys \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

`GET /api/auth/api-keys`

List all API keys for the authenticated user

> Example responses

> 200 Response

```json
{
  "data": [
    {
      "id": "string",
      "key_preview": "string",
      "name": "string",
      "permissions": [
        "string"
      ],
      "is_active": true,
      "created_at": "string",
      "expires_at": "string"
    }
  ]
}
```

<h3 id="get__api_auth_api-keys-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Default Response|Inline|

<h3 id="get__api_auth_api-keys-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|[object]|false|none|none|
|»» id|string|false|none|UUID for API key management|
|»» key_preview|string|false|none|First few characters of the API key|
|»» name|string|false|none|none|
|»» permissions|[string]|false|none|none|
|»» is_active|boolean|false|none|none|
|»» created_at|string|false|none|none|
|»» expires_at|string|false|none|none|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

# Schemas

