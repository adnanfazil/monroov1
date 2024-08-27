const admin = require('firebase-admin');
const serviceAccount = require('../bin/fbKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})


module.exports = admin;