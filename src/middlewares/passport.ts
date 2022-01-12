import { getCustomRepository } from 'typeorm';
import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import UserRepository from '../repositories/UserRepository';

const opts: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWTSECRET
        ? process.env.JWTSECRET
        : 'BNR8SM&dKn6cIUA#dP%7sF&$oErml5xb'
};

const strategy = new Strategy(opts, async (payload, done) => {
    try {
        const userRepository = getCustomRepository(UserRepository);
        const user = await userRepository.findOne(payload.id);
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    } catch (error) {
        return done(error, null);
    }
});

export default strategy;
