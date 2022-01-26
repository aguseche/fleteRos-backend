// import roles from '../utils/roles';
import { Request, Response } from 'express';
import Driver from '../entities/Driver';
import User from '../entities/User';

function user_validation(req: Request, res: Response, next: () => void): void {
    if (req.user instanceof User) {
        next();
    } else {
        res.status(403).json('unauthorized');
    }
}

function driver_validation(
    req: Request,
    res: Response,
    next: () => void
): void {
    if (req.user instanceof Driver) {
        next();
    } else {
        res.status(403).json('unauthorized');
    }
}

export { user_validation, driver_validation };
