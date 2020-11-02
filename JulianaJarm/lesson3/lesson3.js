const nodemailer = require('nodemailer')

const smtpTransport = nodemailer.createTransport({
    host: 'localhost',
    port: 32025,
    secure: false,
    auth: {
        user: 'username@mail.localdomain',
        password: '1234',
    },
})

smtpTransport.sendMail({
    from: 'User <username@mail.localdomain>',
    to: 'email-adress@localdomain.local',
    subject: 'Text letter',
    text: 'Hello! Test letter to check mail.',
    html: '<h1>Hello! Test letter to check mail.</h1>',

}, (err, info) => {
    if(err){
        console.log(err)
        throw err
    }

    console.log('Mail has been sent successfully', info)
    smtpTransport.close()
})