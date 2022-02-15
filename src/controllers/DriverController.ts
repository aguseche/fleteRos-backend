import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import md5 from 'md5';
import jwt from 'jsonwebtoken';

import DriverRepository from '../repositories/DriverRepository';
import Driver from '../entities/Driver';

class DriverController {
    private driverRepository = getCustomRepository(DriverRepository);

    private static createToken(driver: Driver) {
        return jwt.sign(
            { id: driver.id, username: driver.email },
            process.env.JWTSECRET
                ? process.env.JWTSECRET
                : 'BNR8SM&dKn6cIUA#dP%7sF&$oErml5xb',
            {
                expiresIn: process.env.TOKEN_EXPIRATION_TIME // 1 dia
            }
        );
    }

    public signUp = async (req: Request, res: Response): Promise<Response> => {
        if (!req.body.email || !req.body.password) {
            return res.status(400).json({
                error: 'Please. Send your email and password'
            });
        }

        try {
            const driver = await this.driverRepository.findByEmail(
                req.body.email
            );

            if (driver) {
                return res.status(400).json({ error: 'Email already exists' });
            }

            let newDriver = new Driver();
            newDriver = req.body;
            newDriver.password = md5(newDriver.password);
            await this.driverRepository.save(newDriver);
            newDriver.password = '';
            return res.status(201).json(newDriver);
        } catch (error) {
            return res.status(500).json(error);
        }
    };
    public signIn = async (req: Request, res: Response): Promise<Response> => {
        if (!req.body.email || !req.body.password) {
            return res
                .status(400)
                .json({ error: 'Email and Password required' });
        }
        try {
            const driver = await this.driverRepository.authenticate(
                req.body.email,
                md5(req.body.password)
            );

            if (driver) {
                driver.password = '';
                const token = DriverController.createToken(driver);
                return res.status(200).json({ driver, token });
            }

            return res
                .status(400)
                .json({ error: 'Email or password incorrect' });
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    };
    public signOut = (req: Request, res: Response): Response => {
        req.logout();
        return res.status(200).json({ msg: 'success' });
    };
}

export default DriverController;
