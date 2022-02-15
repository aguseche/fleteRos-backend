import { Request, Response } from 'express';
// import { getCustomRepository } from 'typeorm';

// import UserRepository from '../repositories/UserRepository';
// import User from '../entities/User';

// import DriverRepository from '../repositories/DriverRepository';
// import Driver from '../entities/Driver';

class AuthController {
    public getMe = (req: Request, res: Response): Response => {
        return res.status(200).json(req.user);
    };
}

export default AuthController;
