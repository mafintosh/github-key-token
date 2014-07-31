var ghtoken = require('./')
var http = require('http')

var verify = ghtoken.verifier('test', [
  'mafintosh',
  'sorribas',
  'watson'
])

// use your own username here - mine won't work for you :)
var sign = ghtoken.signer('test', 'mafintosh')

sign(function(err, token) {
  if (err) throw err

  console.log('Got user token', token)

  verify(token, function(err, username) {
    if (err) throw err

    console.log('Verified that the token came from '+username)
  })
})