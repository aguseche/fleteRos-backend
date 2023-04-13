import { Request, Response } from 'express';
import User from '../entities/User';
import Driver from '../entities/Driver';
import jwt from 'jsonwebtoken';

import { StatusCodes } from 'http-status-codes';
class AuthController {
    public getMe = (req: Request, res: Response): Response => {
        return res.status(StatusCodes.OK).json(req.user);
    };

    public static createToken(base_user: Driver | User): string {
        return jwt.sign(
            { id: base_user.id, username: base_user.email },
            process.env.JWTSECRET
                ? process.env.JWTSECRET
                : 'BNR8SM&dKn6cIUA#dP%7sF&$oErml5xb',
            {
                expiresIn: process.env.TOKEN_EXPIRATION_TIME // 1 dia
            }
        );
    }
}

export default AuthController;
