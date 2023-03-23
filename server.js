if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const bcrypt = require('bcrypt')
const app = express()
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')

const initializePassport = require('./passport-config')
initializePassport(passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

app.get('/', checkAuthenticatedUser, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkAuthenticatedUser, (req, res) => {
    res.render('login.ejs')
})
app.post('/login', checkAuthenticatedUser, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkAuthenticatedUser, (req, res) => {
    res.render('register.ejs')
})

app.post('/register',  checkAuthenticatedUser,async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }

    console.log('>>>>>', users)
})

function checkAuthenticatedUser(req, res, next) {
    if(req.isAuthenticated()){
        return res.redirect('/')
        console.log('asdnsadnusinfjdkngkj')
    }
    next()
}

app.use(express.static(__dirname + '/public'));

app.listen(3000)