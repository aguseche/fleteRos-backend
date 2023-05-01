import { Request, Response } from 'express';
import { getCustomRepository, getMetadataArgsStorage } from 'typeorm';
import md5 from 'md5';

import UserRepository from '../repositories/UserRepository';
// import User from '../entities/User';
import AuthController from './AuthController';
import { IUserWithoutPassword } from '../interfaces/IUserWithoutPassword';
import { StatusCodes } from 'http-status-codes';
import User from '../entities/User';
import ShipmentRepository from '../repositories/ShipmentRepository';
import Mailer from '../utils/mailer';
import registrationEmail from '../templates/registrationEmail';
import { SEND_MAIL } from '../utils/constants';
import { validateBasicPerson } from '../validations/BasicPersonValidator';
import { validateBasicUser } from '../validations/basicUserValidator';
import { validateAttributes } from '../validations/genericValidators/attributesValidator';

class UserController {
    private userRepository = getCustomRepository(UserRepository);
    private shipmentRepository = getCustomRepository(ShipmentRepository);

    public signUp = async (req: Request, res: Response): Promise<Response> => {
        const newUser: User = req.body;
        const columns = getMetadataArgsStorage()
            .filterColumns(User)
            .map(column => column.propertyName)
            .filter(key => key !== 'id' && key !== 'registrationDate');
        const keys = Object.keys(newUser);

        try {
            if (!validateAttributes(columns, keys)) {
                throw new Error(`You must send all the attributes ${columns}`);
            }
            if (!validateBasicPerson(newUser) && validateBasicUser(newUser)) {
                throw new Error('Attributes Invalid');
            }
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
            if (SEND_MAIL) {
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
            }
            return res.status(StatusCodes.CREATED).json('success');
        } catch (error: unknown) {
            console.log(error);
            if (error instanceof Error) {
                return res.status(StatusCodes.BAD_REQUEST).json(error.message);
            }
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };

    public signIn = async (req: Request, res: Response): Promise<Response> => {
        const loginUser: User = req.body;
        if (!validateBasicPerson(loginUser)) {
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
    public updateUser = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const user = req.user as User;
        const req_user = req.body as User;
        if (
            req_user.password ||
            req_user.email ||
            req_user.id ||
            req_user.registrationDate
        ) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json('You cant update email or password');
        }

        try {
            const oldUser = await this.userRepository.findOne(user.id);
            if (!oldUser) {
                throw new Error('User does not exist');
            }
            this.userRepository.merge(oldUser, req_user);
            if (!validateBasicUser(oldUser)) {
                throw new Error('User update incorrect');
            }
            await this.userRepository.save(oldUser);
            return res.status(StatusCodes.OK).json('success');
        } catch (error: unknown) {
            console.log(error);
            if (error instanceof Error) {
                return res.status(StatusCodes.BAD_REQUEST).json(error.message);
            }
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
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
