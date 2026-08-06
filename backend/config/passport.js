const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/User");

module.exports = (passport) => {
  // ---- Serialization ----
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // ---- LOCAL STRATEGY ----
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email: email.toLowerCase() });
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }
          if (!user.password) {
            return done(null, false, { message: "Account uses social login" });
          }
          const isMatch = await user.comparePassword(password);
          if (!isMatch) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // ---- GOOGLE STRATEGY (optional) ----
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${process.env.BACKEND_URL || "http://localhost:5000"}/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await User.findOne({ providerId: profile.id, provider: "google" });
            if (!user) {
              user = await User.findOne({ email: profile.emails[0].value });
              if (user) {
                user.providerId = profile.id;
                user.provider = "google";
                user.photoURL = user.photoURL || profile.photos[0]?.value || "";
                await user.save();
              } else {
                user = new User({
                  name: profile.displayName,
                  email: profile.emails[0].value,
                  provider: "google",
                  providerId: profile.id,
                  photoURL: profile.photos[0]?.value || "",
                  password: "",
                });
                await user.save();
              }
            }
            return done(null, user);
          } catch (err) {
            return done(err, null);
          }
        }
      )
    );
  }

  // ---- FACEBOOK STRATEGY (optional) ----
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: `${process.env.BACKEND_URL || "http://localhost:5000"}/auth/facebook/callback`,
          profileFields: ["id", "displayName", "emails", "photos"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await User.findOne({ providerId: profile.id, provider: "facebook" });
            if (!user) {
              user = await User.findOne({ email: profile.emails?.[0]?.value });
              if (user) {
                user.providerId = profile.id;
                user.provider = "facebook";
                user.photoURL = user.photoURL || profile.photos?.[0]?.value || "";
                await user.save();
              } else {
                user = new User({
                  name: profile.displayName,
                  email: profile.emails?.[0]?.value || `${profile.id}@facebook.com`,
                  provider: "facebook",
                  providerId: profile.id,
                  photoURL: profile.photos?.[0]?.value || "",
                  password: "",
                });
                await user.save();
              }
            }
            return done(null, user);
          } catch (err) {
            return done(err, null);
          }
        }
      )
    );
  }
};