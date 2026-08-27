// ============================================================
// backend/config/passport.js
// BuyUKUsed - Passport Authentication Configuration
// ============================================================

const LocalStrategy =
  require("passport-local").Strategy;

const GoogleStrategy =
  require("passport-google-oauth20").Strategy;

const FacebookStrategy =
  require("passport-facebook").Strategy;

const JwtStrategy =
  require("passport-jwt").Strategy;

const ExtractJwt =
  require("passport-jwt").ExtractJwt;

const User =
  require("../models/User");

// ============================================================
// PASSPORT CONFIGURATION
// ============================================================

module.exports = (passport) => {
  // ==========================================================
  // SERIALIZATION
  // ==========================================================

  passport.serializeUser(
    (user, done) => {
      done(null, user.id);
    }
  );

  passport.deserializeUser(
    async (id, done) => {
      try {
        const user =
          await User.findById(id);

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  );

  // ==========================================================
  // JWT STRATEGY
  // ==========================================================
  //
  // Used for authenticated API requests:
  //
  // Authorization: Bearer <JWT>
  //
  // This is especially important for:
  //
  // POST   /api/reviews
  // PUT    /api/reviews/:id
  // DELETE /api/reviews/:id
  //
  // ==========================================================

  if (!process.env.JWT_SECRET) {
    console.error(
      "❌ JWT_SECRET is missing. JWT authentication cannot be initialized."
    );
  } else {
    passport.use(
      new JwtStrategy(
        {
          jwtFromRequest:
            ExtractJwt.fromAuthHeaderAsBearerToken(),

          secretOrKey:
            process.env.JWT_SECRET,

          algorithms: ["HS256"],
        },

        async (
          payload,
          done
        ) => {
          try {
            // ------------------------------------------------
            // Extract user ID from JWT
            // ------------------------------------------------
            //
            // Your authController should normally create
            // tokens containing either:
            //
            // { id: user._id }
            //
            // or:
            //
            // { userId: user._id }
            //
            // Support both.
            // ------------------------------------------------

            const userId =
              payload?.id ||
              payload?.userId ||
              payload?._id;

            if (!userId) {
              console.error(
                "❌ JWT payload does not contain a user ID:",
                payload
              );

              return done(
                null,
                false
              );
            }

            // ------------------------------------------------
            // Find user
            // ------------------------------------------------

            const user =
              await User.findById(
                userId
              );

            if (!user) {
              console.error(
                "❌ JWT user not found:",
                userId
              );

              return done(
                null,
                false
              );
            }

            // ------------------------------------------------
            // Check account status
            // ------------------------------------------------

            if (
              user.isActive === false
            ) {
              console.error(
                "❌ JWT user account is inactive:",
                userId
              );

              return done(
                null,
                false
              );
            }

            // ------------------------------------------------
            // Authentication successful
            // ------------------------------------------------

            return done(
              null,
              user
            );
          } catch (err) {
            console.error(
              "❌ JWT authentication error:",
              err
            );

            return done(
              err,
              false
            );
          }
        }
      )
    );

    console.log(
      "🔐 Passport JWT strategy enabled"
    );
  }

  // ==========================================================
  // LOCAL STRATEGY
  // ==========================================================

  passport.use(
    new LocalStrategy(
      {
        usernameField:
          "email",
      },

      async (
        email,
        password,
        done
      ) => {
        try {
          const normalizedEmail =
            String(
              email || ""
            )
              .trim()
              .toLowerCase();

          const user =
            await User.findOne({
              email:
                normalizedEmail,
            });

          if (!user) {
            return done(
              null,
              false,
              {
                message:
                  "Invalid email or password",
              }
            );
          }

          if (!user.password) {
            return done(
              null,
              false,
              {
                message:
                  "Account uses social login",
              }
            );
          }

          const isMatch =
            await user.comparePassword(
              password
            );

          if (!isMatch) {
            return done(
              null,
              false,
              {
                message:
                  "Invalid email or password",
              }
            );
          }

          if (
            user.isActive === false
          ) {
            return done(
              null,
              false,
              {
                message:
                  "Account is inactive",
              }
            );
          }

          return done(
            null,
            user
          );
        } catch (err) {
          return done(
            err
          );
        }
      }
    )
  );

  console.log(
    "🔐 Passport Local strategy enabled"
  );

  // ==========================================================
  // GOOGLE STRATEGY
  // ==========================================================

  if (
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET
  ) {
    passport.use(
      new GoogleStrategy(
        {
          clientID:
            process.env
              .GOOGLE_CLIENT_ID,

          clientSecret:
            process.env
              .GOOGLE_CLIENT_SECRET,

          callbackURL:
            `${
              process.env
                .BACKEND_URL ||
              "http://localhost:5000"
            }/auth/google/callback`,
        },

        async (
          accessToken,
          refreshToken,
          profile,
          done
        ) => {
          try {
            const googleEmail =
              profile.emails?.[0]
                ?.value
                ?.trim()
                .toLowerCase();

            let user =
              await User.findOne({
                providerId:
                  profile.id,

                provider:
                  "google",
              });

            if (!user && googleEmail) {
              user =
                await User.findOne({
                  email:
                    googleEmail,
                });
            }

            if (user) {
              user.providerId =
                profile.id;

              user.provider =
                "google";

              user.photoURL =
                user.photoURL ||
                profile.photos?.[0]
                  ?.value ||
                "";

              await user.save();
            } else {
              user =
                new User({
                  name:
                    profile.displayName ||
                    "Google User",

                  email:
                    googleEmail ||
                    `${profile.id}@google.com`,

                  provider:
                    "google",

                  providerId:
                    profile.id,

                  photoURL:
                    profile.photos?.[0]
                      ?.value ||
                    "",

                  password: "",
                });

              await user.save();
            }

            return done(
              null,
              user
            );
          } catch (err) {
            return done(
              err,
              null
            );
          }
        }
      )
    );

    console.log(
      "🔐 Passport Google strategy enabled"
    );
  }

  // ==========================================================
  // FACEBOOK STRATEGY
  // ==========================================================

  if (
    process.env.FACEBOOK_APP_ID &&
    process.env.FACEBOOK_APP_SECRET
  ) {
    passport.use(
      new FacebookStrategy(
        {
          clientID:
            process.env
              .FACEBOOK_APP_ID,

          clientSecret:
            process.env
              .FACEBOOK_APP_SECRET,

          callbackURL:
            `${
              process.env
                .BACKEND_URL ||
              "http://localhost:5000"
            }/auth/facebook/callback`,

          profileFields: [
            "id",
            "displayName",
            "emails",
            "photos",
          ],
        },

        async (
          accessToken,
          refreshToken,
          profile,
          done
        ) => {
          try {
            const facebookEmail =
              profile.emails?.[0]
                ?.value
                ?.trim()
                .toLowerCase();

            let user =
              await User.findOne({
                providerId:
                  profile.id,

                provider:
                  "facebook",
              });

            if (
              !user &&
              facebookEmail
            ) {
              user =
                await User.findOne({
                  email:
                    facebookEmail,
                });
            }

            if (user) {
              user.providerId =
                profile.id;

              user.provider =
                "facebook";

              user.photoURL =
                user.photoURL ||
                profile.photos?.[0]
                  ?.value ||
                "";

              await user.save();
            } else {
              user =
                new User({
                  name:
                    profile.displayName ||
                    "Facebook User",

                  email:
                    facebookEmail ||
                    `${profile.id}@facebook.com`,

                  provider:
                    "facebook",

                  providerId:
                    profile.id,

                  photoURL:
                    profile.photos?.[0]
                      ?.value ||
                    "",

                  password: "",
                });

              await user.save();
            }

            return done(
              null,
              user
            );
          } catch (err) {
            return done(
              err,
              null
            );
          }
        }
      )
    );

    console.log(
      "🔐 Passport Facebook strategy enabled"
    );
  }

  // ==========================================================
  // FINISHED
  // ==========================================================

  console.log(
    "✅ Passport authentication configuration loaded"
  );
};