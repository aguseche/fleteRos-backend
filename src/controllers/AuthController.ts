import { Request, Response } from 'express';
import User from '../entities/User';
import Driver from '../entities/Driver';
import jwt from 'jsonwebtoken';

import { StatusCodes } from 'http-status-codes';
import {
    TOKEN_EMAIL_EXPIRATION_TIME,
    TOKEN_EXPIRATION_TIME
} from '../utils/constants';
class AuthController {
    public getMe = (req: Request, res: Response): Response => {
        return res.status(StatusCodes.OK).json(req.user);
    };

    public static createToken(
        person: Driver | User,
        expiration_time: number
    ): string {
        return jwt.sign(
            { id: person.id, username: person.email },
            process.env.JWTSECRET
                ? process.env.JWTSECRET
                : 'BNR8SM&dKn6cIUA#dP%7sF&$oErml5xb',
            {
                expiresIn: expiration_time
            }
        );
    }
}

export default AuthController;
