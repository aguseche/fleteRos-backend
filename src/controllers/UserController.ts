import { Request, Response } from 'express';
import {
    MoreThanOrEqual,
    getCustomRepository,
    getMetadataArgsStorage
} from 'typeorm';
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
import {
    LINK,
    SEND_MAIL,
    TOKEN_EMAIL_EXPIRATION_TIME,
    TOKEN_EXPIRATION_TIME
} from '../utils/constants';
import { validateBasicPerson } from '../validations/BasicPersonValidator';
import { validateBasicUser } from '../validations/basicUserValidator';
import { validateAttributes } from '../validations/genericValidators/attributesValidator';
import ReportRepository from '../repositories/ReportRepository';

class UserController {
    private userRepository = getCustomRepository(UserRepository);
    private shipmentRepository = getCustomRepository(ShipmentRepository);
    private reportRepository = getCustomRepository(ReportRepository);

    public signUp = async (req: Request, res: Response): Promise<Response> => {
        const newUser: User = req.body;
        const columns = getMetadataArgsStorage()
            .filterColumns(User)
            .map(column => column.propertyName)
            .filter(
                key =>
                    key !== 'id' &&
                    key !== 'registrationDate' &&
                    key !== 'active' &&
                    key !== 'token' &&
                    key !== 'isVerified' &&
                    key !== 'token_expiration'
            );
        const keys = Object.keys(newUser);

        try {
            if (!validateAttributes(columns, keys)) {
                throw new Error(`You must send all the attributes ${columns}`);
            }
            if (!validateBasicPerson(newUser) && validateBasicUser(newUser)) {
                throw new Error('Attributes Invalid');
            }
            const oldUser = await this.userRepository.findOne({
                email: newUser.email
            });
            if (oldUser) {
                throw new Error('Email already exists');
            }

            const token = AuthController.createToken(
                newUser,
                TOKEN_EMAIL_EXPIRATION_TIME
            );

            //Revisar hash y pasarlo a bycript
            newUser.password = md5(newUser.password);

            newUser.token = token;
            const now = new Date();
            newUser.token_expiration = new Date(
                now.getTime() + TOKEN_EMAIL_EXPIRATION_TIME * 1000
            );

            await this.userRepository.createUser(newUser);
            //Send mail
            if (SEND_MAIL) {
                const template = registrationEmail(
                    newUser.name,
                    newUser.lastname,
                    'User',
                    LINK + token
                );
                const mailer = new Mailer();
                await mailer.sendMail(
                    newUser.email,
                    '[FleteRos] Por favor confirma tu direccion de email',
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
            const token = AuthController.createToken(
                user,
                TOKEN_EXPIRATION_TIME
            );
            return res.status(StatusCodes.OK).json({ user, token });
        } catch (error) {
            console.log(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };
    public signOut = (req: Request, res: Response): Response => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        req.logout(() => {});
        return res.status(StatusCodes.OK).json('success');
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
            const oldUser = await this.userRepository.findOneOrFail(user.id);
            this.userRepository.merge(oldUser, req_user);
            if (!validateBasicUser(oldUser)) {
                throw new Error('User Invalid');
            }
            await this.userRepository.save(oldUser);
            return res.status(StatusCodes.OK);
        } catch (error) {
            console.error(error);
            if (error instanceof Error) {
                return res.status(StatusCodes.BAD_REQUEST).json(error.message);
            }
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };

    public updatePassword = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const user = req.user as User;
        const new_password = req.body.password;
        try {
            const oldUser = await this.userRepository.findOne(user.id);
            if (!oldUser) {
                throw new Error('User does not exist');
            }
            // //Revisar hash y pasarlo a bycript
            oldUser.password = md5(new_password);
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

    public confirmEmail = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const token = req.params.token;
        if (!token)
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'We were unable to find a user for this token.'
            });
        try {
            const user = await this.userRepository.findOne({
                token: token,
                token_expiration: MoreThanOrEqual(new Date())
            });
            if (!user) {
                throw new Error('Token expired');
            }
            if (user.isVerified) {
                throw new Error('User already verified');
            }
            user.isVerified = true;
            await this.userRepository.save(user);
            return res.status(StatusCodes.OK).json('success');
        } catch (error: unknown) {
            console.log(error);
            if (error instanceof Error) {
                return res.status(StatusCodes.BAD_REQUEST).json(error.message);
            }
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };

    public resendToken = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const email = req.params.email;
        try {
            const user = await this.userRepository.findOne({ email });
            if (!user) {
                throw new Error('Email not found');
            }
            if (user.isVerified) {
                throw new Error('User already verified');
            }
            if (new Date() < new Date(user.token_expiration)) {
                throw new Error('Token not expired');
            }
            const token = AuthController.createToken(
                user,
                TOKEN_EMAIL_EXPIRATION_TIME
            );
            user.token = token;
            const now = new Date();
            user.token_expiration = new Date(
                now.getTime() + TOKEN_EMAIL_EXPIRATION_TIME * 1000
            );
            await this.userRepository.save(user);
            //Send mail
            if (SEND_MAIL) {
                const template = registrationEmail(
                    user.name,
                    user.lastname,
                    'User',
                    LINK + token
                );
                const mailer = new Mailer();
                await mailer.sendMail(
                    user.email,
                    '[FleteRos] Por favor confirma tu direccion de email',
                    template.html
                );
            }
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
            // interface DriverRates {
            //     [driverId: number]: {
            //         rate: number;
            //     };
            // }
            // const driver_rates: DriverRates = {};
            // await Promise.all(
            //     shipments.map(async item => {
            //         await Promise.all(
            //             item.offers.map(async offer => {
            //                 const driverId = offer.driver.id;
            //                 const averageRate =
            //                     await this.reportRepository.getAverageRate(
            //                         driverId
            //                     );

            //                 if (!(driverId in driver_rates)) {
            //                     driver_rates[driverId] = {
            //                         rate: averageRate
            //                     };
            //                 }
            //             })
            //         );
            //     })
            // );
            // return res.status(StatusCodes.OK).json({ shipments, driver_rates });
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
