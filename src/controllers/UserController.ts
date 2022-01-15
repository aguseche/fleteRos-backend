import { Request, Response } from 'express';
import { getCustomRepository, getRepository } from 'typeorm';
import md5 from 'md5';
import jwt from 'jsonwebtoken';

import UserRepository from '../repositories/UserRepository';
import User from '../entities/User';

class UserController {
    private userRepository = getCustomRepository(UserRepository);

    private static createToken(user: User) {
        return jwt.sign(
            { id: user.id, username: user.email },
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
            const user = await this.userRepository.findByEmail(req.body.email);

            if (user) {
                return res.status(400).json({ error: 'Email already exists' });
            }

            let newUser = new User();
            newUser = req.body;
            await this.userRepository.save(newUser);
            newUser.password = '';
            return res.status(201).json(newUser);
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
            const user = await this.userRepository.authenticate(
                req.body.email,
                md5(req.body.password)
            );

            if (user) {
                user.password = '';
                const token = UserController.createToken(user);
                return res.status(200).json({ user, token });
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

    public getMe = (req: Request, res: Response): Response => {
        return res.status(200).json(req.user);
    };
}

export default UserController;
