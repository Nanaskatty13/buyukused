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

const mongoose =
  require("mongoose");

const User =
  require("../models/User");

// ============================================================
// PASSPORT CONFIGURATION
// ============================================================

module.exports = (passport) => {
  console.log(
    "============================================================"
  );

  console.log(
    "🔐 Initializing Passport authentication..."
  );

  // ==========================================================
  // SERIALIZATION
  // ==========================================================

  passport.serializeUser(
    (user, done) => {
      try {
        done(null, user.id);
      } catch (error) {
        done(error, null);
      }
    }
  );

  passport.deserializeUser(
    async (id, done) => {
      try {
        if (
          !mongoose.Types.ObjectId.isValid(id)
        ) {
          return done(
            null,
            false
          );
        }

        const user =
          await User.findById(id);

        if (!user) {
          return done(
            null,
            false
          );
        }

        if (
          user.isActive === false
        ) {
          return done(
            null,
            false
          );
        }

        return done(
          null,
          user
        );
      } catch (error) {
        console.error(
          "❌ Passport deserializeUser error:",
          error.message
        );

        return done(
          error,
          null
        );
      }
    }
  );

  // ==========================================================
  // JWT STRATEGY
  // ==========================================================
  //
  // Used by authenticated API requests:
  //
  // Authorization: Bearer <JWT>
  //
  // Example:
  //
  // GET  /api/messages/unread-count
  // POST /api/reviews
  // PUT  /api/reviews/:id
  // DELETE /api/reviews/:id
  //
  // ==========================================================

  if (!process.env.JWT_SECRET) {
    console.error(
      "❌ JWT_SECRET is missing."
    );

    console.error(
      "❌ Passport JWT strategy was NOT enabled."
    );
  } else {
    passport.use(
      new JwtStrategy(
        {
          jwtFromRequest:
            ExtractJwt.fromAuthHeaderAsBearerToken(),

          secretOrKey:
            process.env.JWT_SECRET,

          algorithms: [
            "HS256",
          ],

          // Prevent accepting tokens with
          // unexpected issuer/audience unless
          // explicitly configured.
          ...(process.env.JWT_ISSUER
            ? {
                issuer:
                  process.env.JWT_ISSUER,
              }
            : {}),

          ...(process.env.JWT_AUDIENCE
            ? {
                audience:
                  process.env.JWT_AUDIENCE,
              }
            : {}),
        },

        async (
          payload,
          done
        ) => {
          try {
            // ------------------------------------------------
            // DEBUG JWT PAYLOAD
            // ------------------------------------------------

            console.log(
              "🔐 JWT authentication attempt"
            );

            // Never log the actual token.
            console.log(
              "🔐 JWT payload keys:",
              Object.keys(
                payload || {}
              )
            );

            // ------------------------------------------------
            // GET USER ID
            // ------------------------------------------------
            //
            // Support all formats currently used by the
            // BuyUKUsed application.
            //
            // Preferred:
            //
            // { id: user._id }
            //
            // Also supported:
            //
            // { userId: user._id }
            // { _id: user._id }
            //
            // ------------------------------------------------

            const userId =
              payload?.id ||
              payload?.userId ||
              payload?._id;

            if (!userId) {
              console.error(
                "❌ JWT does not contain a user ID."
              );

              console.error(
                "❌ Available payload fields:",
                Object.keys(
                  payload || {}
                )
              );

              return done(
                null,
                false
              );
            }

            // ------------------------------------------------
            // VALIDATE OBJECT ID
            // ------------------------------------------------

            if (
              !mongoose.Types.ObjectId.isValid(
                userId
              )
            ) {
              console.error(
                "❌ JWT contains invalid MongoDB user ID:",
                userId
              );

              return done(
                null,
                false
              );
            }

            // ------------------------------------------------
            // FIND USER
            // ------------------------------------------------

            const user =
              await User.findById(
                userId
              );

            // ------------------------------------------------
            // USER DOES NOT EXIST
            // ------------------------------------------------

            if (!user) {
              console.error(
                "⚠️ JWT user not found:",
                userId
              );

              console.error(
                "⚠️ The token belongs to a user that does not exist in the current MongoDB database."
              );

              return done(
                null,
                false
              );
            }

            // ------------------------------------------------
            // ACCOUNT STATUS
            // ------------------------------------------------

            if (
              user.isActive === false
            ) {
              console.error(
                "⚠️ JWT user account is inactive:",
                userId
              );

              return done(
                null,
                false
              );
            }

            // ------------------------------------------------
            // SUCCESS
            // ------------------------------------------------

            console.log(
              "✅ JWT user authenticated:",
              user._id.toString()
            );

            return done(
              null,
              user
            );
          } catch (error) {
            console.error(
              "❌ JWT authentication error:",
              error.message
            );

            return done(
              error,
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

        passwordField:
          "password",

        session: false,
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

          if (
            !normalizedEmail ||
            !password
          ) {
            return done(
              null,
              false,
              {
                message:
                  "Email and password are required.",
              }
            );
          }

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
                  "Invalid email or password.",
              }
            );
          }

          // ------------------------------------------------
          // ACCOUNT STATUS
          // ------------------------------------------------

          if (
            user.isActive === false
          ) {
            return done(
              null,
              false,
              {
                message:
                  "Account is inactive.",
              }
            );
          }

          // ------------------------------------------------
          // SOCIAL LOGIN
          // ------------------------------------------------

          if (
            !user.password
          ) {
            return done(
              null,
              false,
              {
                message:
                  "This account uses social login.",
              }
            );
          }

          // ------------------------------------------------
          // PASSWORD CHECK
          // ------------------------------------------------

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
                  "Invalid email or password.",
              }
            );
          }

          return done(
            null,
            user
          );
        } catch (error) {
          console.error(
            "❌ Passport Local authentication error:",
            error.message
          );

          return done(
            error,
            false
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
              process.env.BACKEND_URL ||
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

            // ------------------------------------------------
            // LINK GOOGLE ACCOUNT TO EXISTING EMAIL
            // ------------------------------------------------

            if (
              !user &&
              googleEmail
            ) {
              user =
                await User.findOne({
                  email:
                    googleEmail,
                });
            }

            // ------------------------------------------------
            // EXISTING USER
            // ------------------------------------------------

            if (user) {
              user.providerId =
                profile.id;

              user.provider =
                "google";

              if (
                !user.photoURL &&
                profile.photos?.[0]
                  ?.value
              ) {
                user.photoURL =
                  profile.photos[0].value;
              }

              if (
                user.isActive === false
              ) {
                user.isActive =
                  true;
              }

              await user.save();
            }

            // ------------------------------------------------
            // NEW USER
            // ------------------------------------------------

            else {
              user =
                new User({
                  name:
                    profile.displayName ||
                    "Google User",

                  email:
                    googleEmail ||
                    `${profile.id}@google.local`,

                  provider:
                    "google",

                  providerId:
                    profile.id,

                  photoURL:
                    profile.photos?.[0]
                      ?.value ||
                    "",

                  password:
                    "",
                  
                  isActive:
                    true,

                  role:
                    "buyer",
                });

              await user.save();
            }

            return done(
              null,
              user
            );
          } catch (error) {
            console.error(
              "❌ Google authentication error:",
              error.message
            );

            return done(
              error,
              null
            );
          }
        }
      )
    );

    console.log(
      "🔐 Passport Google strategy enabled"
    );
  } else {
    console.log(
      "ℹ️ Google OAuth not configured. Google strategy skipped."
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
              process.env.BACKEND_URL ||
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

            // ------------------------------------------------
            // LINK FACEBOOK TO EXISTING EMAIL
            // ------------------------------------------------

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

            // ------------------------------------------------
            // EXISTING USER
            // ------------------------------------------------

            if (user) {
              user.providerId =
                profile.id;

              user.provider =
                "facebook";

              if (
                !user.photoURL &&
                profile.photos?.[0]
                  ?.value
              ) {
                user.photoURL =
                  profile.photos[0].value;
              }

              if (
                user.isActive === false
              ) {
                user.isActive =
                  true;
              }

              await user.save();
            }

            // ------------------------------------------------
            // NEW USER
            // ------------------------------------------------

            else {
              user =
                new User({
                  name:
                    profile.displayName ||
                    "Facebook User",

                  email:
                    facebookEmail ||
                    `${profile.id}@facebook.local`,

                  provider:
                    "facebook",

                  providerId:
                    profile.id,

                  photoURL:
                    profile.photos?.[0]
                      ?.value ||
                    "",

                  password:
                    "",

                  isActive:
                    true,

                  role:
                    "buyer",
                });

              await user.save();
            }

            return done(
              null,
              user
            );
          } catch (error) {
            console.error(
              "❌ Facebook authentication error:",
              error.message
            );

            return done(
              error,
              null
            );
          }
        }
      )
    );

    console.log(
      "🔐 Passport Facebook strategy enabled"
    );
  } else {
    console.log(
      "ℹ️ Facebook OAuth not configured. Facebook strategy skipped."
    );
  }

  // ==========================================================
  // FINISHED
  // ==========================================================

  console.log(
    "✅ Passport authentication configuration loaded"
  );

  console.log(
    "============================================================"
  );
};