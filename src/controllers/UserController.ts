import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import md5 from 'md5';

import UserRepository from '../repositories/UserRepository';
// import User from '../entities/User';
import AuthController from './AuthController';
import { INewUser } from '../interfaces/INewUser';
import { validateUser } from '../validations/userValidator';
import { IUserWithoutPassword } from '../interfaces/IUserWithoutPassword';
import { StatusCodes } from 'http-status-codes';
import User from '../entities/User';
import ShipmentRepository from '../repositories/ShipmentRepository';
import Mailer from '../utils/mailer';
import registrationEmail from '../templates/registrationEmail';

class UserController {
    private userRepository = getCustomRepository(UserRepository);
    private shipmentRepository = getCustomRepository(ShipmentRepository);

    public signUp = async (req: Request, res: Response): Promise<Response> => {
        const newUser: INewUser = req.body;
        if (!validateUser(newUser)) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ error: 'Please. Send a valid email and password' });
        }
        try {
            const oldUser = await this.userRepository.findByEmail(
                newUser.email
            );
            if (oldUser) {
                return res
                    .status(StatusCodes.BAD_REQUEST)
                    .json({ error: 'Email already exists' });
            }

            //Revisar hash y pasarlo a bycript
            newUser.password = md5(newUser.password);

            const userWithoutPassword: IUserWithoutPassword =
                await this.userRepository.createUser(newUser);
            //Send mail
            const template = registrationEmail(
                userWithoutPassword.name,
                userWithoutPassword.lastname,
                'User'
            );
            const mailer = new Mailer();
            await mailer.sendMail(
                newUser.email,
                'Registro Exitoso',
                template.html
            );

            return res.status(StatusCodes.CREATED).json(userWithoutPassword);
        } catch (error) {
            throw new Error('Failed to retrieve driver from the database');
        }
    };

    public signIn = async (req: Request, res: Response): Promise<Response> => {
        const loginUser: INewUser = req.body;
        if (!validateUser(loginUser)) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ error: 'Email and Password required' });
        }
        try {
            //hay que cambiar esta forma de autenticacion, esta horrible
            const user = await this.userRepository.authenticate(
                loginUser.email,
                md5(loginUser.password)
            );

            if (!user) {
                return res
                    .status(StatusCodes.BAD_REQUEST)
                    .json({ error: 'Email or password incorrect' });
            }

            user.password = '';
            const token = AuthController.createToken(user);
            return res.status(StatusCodes.OK).json({ user, token });
        } catch (error) {
            console.log(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };
    public signOut = (req: Request, res: Response): Response => {
        //esto no desloguea, no borra el token
        req.logout(function (err) {
            if (err) {
                return res
                    .status(StatusCodes.INTERNAL_SERVER_ERROR)
                    .json({ msg: 'Error deleting session' });
            }
        });
        console.log(req);
        return res.status(StatusCodes.OK).json({ msg: 'success' });
    };

    public getMe = (req: Request, res: Response): Response => {
        return res.status(StatusCodes.OK).json(req.user);
    };

    public getShipmentsWaitingOffers = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        try {
            const user = req.user as User;
            const shipments = await this.shipmentRepository.getWaitingOffers(
                user
            );
            return res.status(StatusCodes.OK).json(shipments);
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };
    public getShipmentsActive = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        try {
            const user = req.user as User;
            const shipments = await this.shipmentRepository.getActive_user(
                user
            );
            return res.status(StatusCodes.OK).json(shipments);
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };
    public getShipmentsCancelled = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        try {
            const user = req.user as User;
            const shipments = await this.shipmentRepository.getCancelled(user);
            return res.status(StatusCodes.OK).json(shipments);
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };
    public getShipmentsDelivered = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        try {
            const user = req.user as User;
            const shipments = await this.shipmentRepository.getDelivered(user);
            return res.status(StatusCodes.OK).json(shipments);
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };
}

export default UserController;
