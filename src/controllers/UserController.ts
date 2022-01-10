import { Request, Response } from 'express';
// import md5 from 'md5';
import { getCustomRepository } from 'typeorm';

import UserRepository from '../repositories/UserRepository';
import User from '../entities/User';

class UserController {
    // private userRepository;
    // constructor() {
    //     this.userRepository = getCustomRepository(UserRepository);
    // }
    public async getUsers(req: Request, res: Response): Promise<Response> {
        try {
            const userRepository = getCustomRepository(UserRepository); //hacer un unico parametro general
            const users = await userRepository.find();
            return res.status(200).json(users);
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    }
    public async getUser(req: Request, res: Response): Promise<Response> {
        try {
            const userRepository = getCustomRepository(UserRepository); //hacer un unico parametro general
            const user = await userRepository.findByEmail(req.body.email);
            return res.status(200).json(user);
        } catch (error) {
            return res.status(500).json(error);
        }
    }
    public async signUp(req: Request, res: Response): Promise<Response> {
        const userRepository = getCustomRepository(UserRepository); //hacer un unico parametro general
        if (!req.body.email || !req.body.password) {
            return res.status(400).json({
                error: 'Please. Send your email and password'
            });
        }

        try {
            const user = await userRepository.findByEmail(req.body.email);

            if (user) {
                return res.status(400).json({ error: 'Email already exists' });
            }
            const newUser = new User({ ...req.body });
            await userRepository.save(newUser);
            newUser.password = '';
            return res.status(201).json(newUser);
        } catch (error) {
            return res.status(500).json(error);
        }
    }
    public async signIn(req: Request, res: Response): Promise<Response> {
        return res.status(200);
    }
    public async signOut(req: Request, res: Response): Promise<Response> {
        return res.status(200);
    }
}

export default UserController;
