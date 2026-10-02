import passport from "passport";
import {Strategy as GoogleStrategy} from 'passport-google-oauth20'
import userModel from '../models/user.model.js'

passport.use(new GoogleStrategy(
    {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
    },

    async (accesstoken, refreshtoken, profile, done) => {

        try {
            const user = await userModel.findOne({googleId: profile.id})

            if(user) return done(null, user)

            user = await userModel.create({
                googleId: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
            })

            return done(null, user)

        } catch (error) {
            return done(error)
        }
    }
))

export default passport