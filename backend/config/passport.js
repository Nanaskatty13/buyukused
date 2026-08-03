const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/User");

module.exports = function(passport) {

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });


  // Google Login
  if (
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET
  ) {

    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/auth/google/callback",
        },

        async (accessToken, refreshToken, profile, done) => {
          try {

            let user = await User.findOne({
              email: profile.emails[0].value,
            });

            if (!user) {
              user = await User.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                role: "user",
              });
            }

            done(null, user);

          } catch (error) {
            done(error, null);
          }
        }
      )
    );

  }

};