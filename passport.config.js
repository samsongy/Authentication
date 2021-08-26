const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initalize(passport, getUserByUsername, getUserById) {
    const authenticateUser = async (username, password, done) => {
        const foundUser = await getUserByUsername(username);
        if(foundUser[0] == null) {
            return done(null, false, { message: 'No user found'});
        }
        try {
            if(await bcrypt.compare(password, foundUser[0].password)) {
                return done(null, foundUser[0])
            } else {
                return done(null, false, { message: 'Incorrect credentials'});
            }
        } catch(e) {
            return done(e);
        }
    }

    passport.use( new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, authenticateUser));

    passport.serializeUser(async(user, done) => done(null, await user.id));
    passport.deserializeUser(async(id, done) => {
        done(null, await getUserById(id))
    });
}

module.exports = initalize;