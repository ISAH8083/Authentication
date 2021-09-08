require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGOOSE,
   {useNewUrlParser: true, 
    useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);

const authentSchema = new mongoose.Schema({
  email: String,
  password: String,
});

authentSchema.plugin(passportLocalMongoose);

const authent = new mongoose.model('Authent', authentSchema)
passport.use(authent.createStrategy());

passport.serializeUser(authent.serializeUser());
passport.deserializeUser(authent.deserializeUser());

app.get('/', (req, res)=>{
  res.render('home')
});

app.get('/login', (req, res)=>{
  res.render('login')
});

app.get('/register', (req, res)=>{
  res.render('register')
});

app.get('/Secrets', (req, res)=>{
  if(req.isAuthenticated()){
    res.render('Secrets');
  }else{
    res.redirect('/login');
  }
});

app.get('/logout', (req, res)=>{
  req.logout();
  res.redirect('/');
});

app.post('/register', (req, res) =>{
  authent.register({username: req.body.username}, req.body.password, (err, user)=>{
    if(err){
      console.log(err);
      res.redirect('/register');
    } else{
      passport.authenticate('local') (req, res, next =>{
        res.redirect('/Secrets')
      });
    }; 
  });  
});

app.post('/login', (req, res) =>{
 const authent = new Authent({
   username: req.body.username,
   password: req.body.password
 });
 req.login(authent, (err) =>{
   if(err){
     console.log(err);
   }else{
    passport.authenticate('local') (req, res, next => {
      res.redirect('/Secrets');      
    });
   };
 });
});


const port = 3000;
app.listen(port, ()=>{
  console.log(`app is up and running on http://localhost:${port}`);
})
