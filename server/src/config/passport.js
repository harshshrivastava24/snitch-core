import passport from "passport";
import {Strategy as GoogleStrategy} from 'passport-google-oauth20'
import userModel from '../models/user.model.js'

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
    },

    async (accesstoken, refreshtoken, profile, done) => {

        try {
            let user = await userModel.findOne({googleId: profile.id})

            if(user) return done(null, user)

            user = await userModel.findOne({ email: profile.emails[0].value });
            
            if (user) {
                // Link the Google ID to the existing account
                user.googleId = profile.id;
                await user.save();
                return done(null, user);
            }

            const newUser = await userModel.create({
                googleId: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
            })

            return done(null, newUser)

        } catch (error) {
            return done(error)
        }
    }
))

export default passport