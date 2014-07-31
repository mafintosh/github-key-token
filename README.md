# github-key-token

Use your local ssh private key to create a username token that can be verified using your Github public key

```
npm install github-key-token
```

## Usage

``` js
var ghtoken = require('github-key-token')

var verify = ghtoken.verifier('my-app-name', [
  'mafintosh',
  'sorribas',
  'watson'
])

// use your own username here - mine won't work for you :)
var sign = ghtoken.signer('my-app-name', 'mafintosh')

sign(function(err, token) {
  if (err) throw err

  console.log('Got user token', token)

  verify(token, function(err, username) {
    if (err) throw err

    console.log('Verified that the token came from '+username)
  })
})
```

Default TTL for the token is 3600s. To change this pass it as an option

``` js
var sign = ghtoken.signer('my-app-name', 'mafintosh', {ttl:1000}) // 1000s ttl
```

This module is useful if you are building semi private api and want to do auth
without having to setup username/passwords and send them over the wire

## License

MIT