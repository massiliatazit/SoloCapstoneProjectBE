const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const UserModel = require("../db/UsersSchema");
const { authenticate } = require("./tools");

passport.use(
  "facebook",
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      callbackURL: process.env.FACEBOOK_REDIRECT,
      profileFields: ["email", "first_name", "last_name", "gender", "link"],
    },
    async (request, accessToken, refreshToken, profile, next) => {
      const newUser = {
        facebookId: profile.id,
        firstname: profile.name.givenName,
        surname: profile.name.familyName,
        username: profile.displayName || profile.name.givenName + profile.name.familyName,
        email: profile.emails[0].value || "",
        img: "https://thumbs.dreamstime.com/b/default-avatar-profile-trendy-style-social-media-user-icon-187599373.jpg",
      };

      try {
        const user = await UserModel.findOne({ facebookId: profile.id });

        if (user) {
          const tokens = await authenticate(user);
          next(null, { user, tokens });
        } else {
          const createdUser = new UserModel(newUser);
          const savedUser = await createdUser.save();
          const tokens = await authenticate(savedUser);
          next(null, { user: savedUser, tokens });
        }
      } catch (error) {
        next(error);
      }
    }
  )
);
passport.serializeUser(function (user, next) {
  next(null, user);
});
