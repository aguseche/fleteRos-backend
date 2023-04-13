import { getCustomRepository } from 'typeorm';
import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import UserRepository from '../repositories/UserRepository';
import DriverRepository from '../repositories/DriverRepository';

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
        } else {
            const driverRepository = getCustomRepository(DriverRepository);
            const driver = await driverRepository.findOne(payload.id);
            if (driver) {
                return done(null, driver);
            }
        }
        return done(null, false);
    } catch (error) {
        return done(error, undefined);
    }
});

export default strategy;
