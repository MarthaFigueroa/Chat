const passport = require('passport');
const LocalStrategy = require('passport-local');

passport.use('local.signin', new LocalStrategy({
    usernameField: 'username',
    passReqToCallback: true
}, async (req, username, done)=>{
    console.log(req.body);
    done(null, user, req.flash('success','Welcome '+username));
}))

passport.serializeUser((user, done)=>{
    done(null, user.id);
});

//Deserializa el Usuario a partir de verificar que exista el id en db
passport.deserializeUser(async (id, done)=>{
    done(null, true);
});