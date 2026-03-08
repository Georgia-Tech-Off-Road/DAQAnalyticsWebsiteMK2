const passport = require('passport')
const LocalStrategy = require('passport-local')
const db_lib = require("../../database/db-lib")
const bcrypt = require("bcrypt")

passport.use(new LocalStrategy(function verify(username, password, done) {
	let localAuthProvider = db_lib.getAuthProviderByLocalUsername(username)

	if (localAuthProvider == null) {
		return done(null, false);
	}

	bcrypt.compare(password, localAuthProvider.password_hash)
		.then((result) => {
			if(result === true) {
				const user = db_lib.getUserByID(localAuthProvider.user_id)
				return done(null, user)
			} else {
				return done(null, false)
			}
		})
		.catch((err) => done(err));
}));

const samlStrategy = require('./samlStrategy')

if (samlStrategy !== null) {
	passport.use(samlStrategy)
}

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(userID, done) {
	const user = db_lib.getUserByID(userID);
	done(null, user);
});

module.exports = passport
