var ghsign = require('ghsign')
var b64 = require('base64url')

var now = function() {
  return (Date.now() / 1000) | 0
}

var error = function(code, message) {
  var err = typeof message === 'object' ? message : new Error(message)
  err.status = code
  return err
}

exports.signer = function(ns, username, opts) {
  if (/:/.test(ns)) throw new Error('namespace should not contain :')
  ns += ':'

  if (typeof opts === 'number') return exports.signer(ns, username, {ttl:opts})
  if (!opts) opts = {}
  if (typeof opts.ttl !== 'number') opts.ttl = 3600

  var userSign = ghsign.signer(username)
  username = new Buffer(ns+username)

  return function sign(cb) {
    var data = new Buffer(username.length+4)
    data.writeUInt32BE(opts.ttl ? now()+opts.ttl : 0, 0)
    username.copy(data, 4)
    userSign(data, function(err, sig) {
      if (err) return cb(error(500, err))
      cb(null, b64.fromBase64(Buffer.concat([sig, data]).toString('base64')))
    })
  }
}

exports.verifier = function(ns, usernames) {
  if (/:/.test(ns)) throw new Error('namespace should not contain :')
  ns += ':'

  usernames = [].concat(usernames)

  var verifiers = {}
  usernames.forEach(function(username) {
    verifiers[username] = ghsign.verifier(username)
  })

  return function verify(token, cb) {
    if (!token) return cb(error(400, 'Token is not valid'))

    var buf = new Buffer(b64.toBase64(token), 'base64')

    if (buf.length < 260) return cb(error(400, 'Token is not valid'))

    var sig = buf.slice(0, 256)
    var expires = buf.readUInt32BE(256)
    var data = buf.toString('utf-8', 260)

    if (data.slice(0, ns.length) !== ns) return cb(error(401, 'Token has invalid namespace'))

    username = data.slice(ns.length)

    if (!verifiers.hasOwnProperty(username)) return cb(error(401, 'Username not whitelisted'))

    verifiers[username](buf.slice(256), sig, function(err, valid) {
      if (err) return cb(error(500, err))
      if (!valid) return cb(error(400, 'Token is not valid'))
      if (expires && now() > expires) return cb(error(401, 'Token has expired'))
      cb(null, username)
    })
  }
}