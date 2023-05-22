import { Request, Response } from 'express';
import { MoreThanOrEqual, getCustomRepository } from 'typeorm';
import md5 from 'md5';
import AuthController from './AuthController';
import DriverRepository from '../repositories/DriverRepository';
import Driver from '../entities/Driver';
import { validateBasicDriver } from '../validations/basicDriverValidator';
import { StatusCodes } from 'http-status-codes';
import OfferRepository from '../repositories/OfferRepository';
import ShipmentRepository from '../repositories/ShipmentRepository';
import registrationEmail from '../templates/registrationEmail';
import Mailer from '../utils/mailer';
import {
    SEND_MAIL,
    TOKEN_EXPIRATION_TIME,
    TOKEN_EMAIL_EXPIRATION_TIME,
    LINK
} from '../utils/constants';
import ReportRepository from '../repositories/ReportRepository';
import { IDriverData } from '../interfaces/IDriverData';

import { getMetadataArgsStorage } from 'typeorm';
import { validateAttributes } from '../validations/genericValidators/attributesValidator';
import { validateBasicPerson } from '../validations/BasicPersonValidator';

class DriverController {
    private driverRepository = getCustomRepository(DriverRepository);
    private offerRepository = getCustomRepository(OfferRepository);
    private shipmentRepository = getCustomRepository(ShipmentRepository);
    private reportRepository = getCustomRepository(ReportRepository);

    public signUp = async (req: Request, res: Response): Promise<Response> => {
        const newDriver: Driver = req.body;
        const columns = getMetadataArgsStorage()
            .filterColumns(Driver)
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
        const keys = Object.keys(newDriver);
        try {
            if (!validateAttributes(columns, keys)) {
                throw new Error(`You must send all the attributes ${columns}`);
            }
            if (
                !validateBasicDriver(newDriver) &&
                !validateBasicPerson(newDriver)
            ) {
                throw new Error('Attributes Invalid');
            }
            const oldDriver = await this.driverRepository.findOne(
                newDriver.email
            );

            if (oldDriver) {
                throw new Error('Email already exists');
            }
            const token = AuthController.createToken(
                newDriver,
                TOKEN_EMAIL_EXPIRATION_TIME
            );
            //Revisar hash y pasarlo a bycript
            newDriver.password = md5(newDriver.password);

            newDriver.token = token;
            const now = new Date();
            newDriver.token_expiration = new Date(
                now.getTime() + TOKEN_EMAIL_EXPIRATION_TIME * 1000
            );

            await this.driverRepository.createDriver(newDriver);
            //Send mail
            if (SEND_MAIL) {
                const template = registrationEmail(
                    newDriver.name,
                    newDriver.lastname,
                    'Driver',
                    LINK + token
                );
                const mailer = new Mailer();
                await mailer.sendMail(
                    newDriver.email,
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
        const loginDriver: Driver = req.body;
        try {
            //hay que cambiar esta forma de autenticacion, esta horrible
            const driver = await this.driverRepository.authenticate(
                loginDriver.email,
                md5(loginDriver.password)
            );

            if (!driver) {
                return res
                    .status(StatusCodes.BAD_REQUEST)
                    .json({ error: 'Email or password incorrect' });
            }
            driver.password = '';
            const token = AuthController.createToken(
                driver,
                TOKEN_EXPIRATION_TIME
            );
            return res.status(StatusCodes.OK).json({ driver, token });
        } catch (error) {
            console.log(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };
    public signOut = async (req: Request, res: Response): Promise<Response> => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        req.logout(() => {});
        return res.status(StatusCodes.OK).json('success');
    };
    public updateDriver = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const driver = req.user as Driver;
        const req_driver = req.body as Driver;
        if (
            req_driver.password ||
            req_driver.email ||
            req_driver.id ||
            req_driver.registrationDate
        ) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json('You cant update email or password');
        }
        try {
            const oldDriver = await this.driverRepository.findOne(driver.id);
            if (!oldDriver) {
                throw new Error('Driver does not exist');
            }
            this.driverRepository.merge(oldDriver, req_driver);
            if (!validateBasicDriver(oldDriver)) {
                throw new Error('Driver update incorrect');
            }
            await this.driverRepository.save(oldDriver);
            return res.status(StatusCodes.OK).json('success');
        } catch (error: unknown) {
            console.log(error);
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
        const driver = req.user as Driver;
        const new_password = req.body.password;
        try {
            const oldDriver = await this.driverRepository.findOne(driver.id);
            if (!oldDriver) {
                throw new Error('Driver does not exist');
            }
            //Revisar hash y pasarlo a bycript
            oldDriver.password = md5(new_password);

            await this.driverRepository.save(oldDriver);
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
            const driver = await this.driverRepository.findOne({
                token: token,
                token_expiration: MoreThanOrEqual(new Date())
            });
            if (!driver) {
                throw new Error('Token expired');
            }
            if (driver.isVerified) {
                throw new Error('Driver already verified');
            }
            driver.isVerified = true;
            await this.driverRepository.save(driver);
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
        const now = new Date();
        try {
            const driver = await this.driverRepository.findOne({ email });
            if (!driver) {
                throw new Error('Email not found');
            }
            if (driver.isVerified) {
                throw new Error('Driver already verified');
            }
            if (new Date() < new Date(driver.token_expiration)) {
                throw new Error('Token not expired');
            }
            const token = AuthController.createToken(
                driver,
                TOKEN_EMAIL_EXPIRATION_TIME
            );
            driver.token = token;
            driver.token_expiration = new Date(
                now.getTime() + TOKEN_EMAIL_EXPIRATION_TIME * 1000
            );
            await this.driverRepository.save(driver);
            //Send mail
            if (SEND_MAIL) {
                const template = registrationEmail(
                    driver.name,
                    driver.lastname,
                    'Driver',
                    LINK + token
                );
                const mailer = new Mailer();
                await mailer.sendMail(
                    driver.email,
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

    public getOffersSent = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        try {
            const driver = req.user as Driver;
            const offers = await this.offerRepository.getSent(driver);
            return res.status(StatusCodes.OK).json(offers);
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };
    public getOffersAccepted = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        try {
            const driver = req.user as Driver;
            const offers = await this.offerRepository.getAccepted(driver);
            return res.status(StatusCodes.OK).json(offers);
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };
    public getOffersDelivered = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        try {
            const driver = req.user as Driver;
            const offers = await this.offerRepository.getDelivered(driver);
            return res.status(StatusCodes.OK).json(offers);
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };
    public getOffersCancelled = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        try {
            const driver = req.user as Driver;
            const offers = await this.offerRepository.getCancelled(driver);
            return res.status(StatusCodes.OK).json(offers);
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };
    public getOffersDeleted = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        try {
            const driver = req.user as Driver;
            const offers = await this.offerRepository.getDeleted(driver);
            return res.status(StatusCodes.OK).json(offers);
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };
    public getShipmentsAvailable = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        try {
            const driver = req.user as Driver;
            const shipments = await this.shipmentRepository.getAvailable(
                driver
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
            const driver = req.user as Driver;
            const shipments = await this.shipmentRepository.getActive_driver(
                driver
            );
            return res.status(StatusCodes.OK).json(shipments);
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };

    public getAverageRate = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        try {
            const idDriver = req.body.id;
            if (!idDriver) {
                throw new Error('Driver id missing');
            }
            const average_rate = await this.reportRepository.getAverageRate(
                idDriver
            );
            return res.status(StatusCodes.OK).json(average_rate);
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };

    public getMyData = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        try {
            //Constants
            const driver = req.user as Driver;
            const driverData: IDriverData = {
                shipments_last_week: 0,
                shipments_last_month: 0,
                shipments_last_3_months: 0,
                profit_last_week: 0,
                profit_last_month: 0,
                profit_last_3_months: 0,
                average_rate: 0,
                total_shipments: 0,
                total_profit: 0,
                total_duration: 0,
                total_distance: 0
            };
            const aux_currentDate = new Date();
            const currentDate = aux_currentDate
                .toISOString()
                .replace('T', ' ')
                .slice(0, -5);
            const oneWeekAgo = new Date(
                aux_currentDate.getTime() - 7 * 24 * 60 * 60 * 1000
            )
                .toISOString()
                .replace('T', ' ')
                .slice(0, -5);
            const oneMonthAgo = new Date(
                aux_currentDate.getFullYear(),
                aux_currentDate.getMonth() - 1,
                aux_currentDate.getDate()
            )
                .toISOString()
                .replace('T', ' ')
                .slice(0, -5);
            const threeMonthsAgo = new Date(
                aux_currentDate.getFullYear(),
                aux_currentDate.getMonth() - 3,
                aux_currentDate.getDate()
            )
                .toISOString()
                .replace('T', ' ')
                .slice(0, -5);
            //Rate average
            driverData.average_rate =
                await this.reportRepository.getAverageRate(driver.id);
            //Cantidad de viajes finalizados x tiempo
            driverData.shipments_last_week =
                await this.reportRepository.getTotalShipmentsWithInterval(
                    driver.id,
                    oneWeekAgo,
                    currentDate
                );
            driverData.shipments_last_month =
                await this.reportRepository.getTotalShipmentsWithInterval(
                    driver.id,
                    oneMonthAgo,
                    currentDate
                );
            driverData.shipments_last_3_months =
                await this.reportRepository.getTotalShipmentsWithInterval(
                    driver.id,
                    threeMonthsAgo,
                    currentDate
                );

            //Cantidad de plata x tiempo
            driverData.profit_last_week =
                await this.reportRepository.getTotalProfitWithInterval(
                    driver.id,
                    oneWeekAgo,
                    currentDate
                );
            driverData.profit_last_month =
                await this.reportRepository.getTotalProfitWithInterval(
                    driver.id,
                    oneMonthAgo,
                    currentDate
                );
            driverData.profit_last_3_months =
                await this.reportRepository.getTotalProfitWithInterval(
                    driver.id,
                    threeMonthsAgo,
                    currentDate
                );
            //Cantidad total de viajes finalizados
            driverData.total_shipments =
                await this.reportRepository.getTotalShipments(driver.id);
            //Cantidad total de plata
            driverData.total_profit =
                await this.reportRepository.getTotalProfit(driver.id);
            //Cantidad total de distancia
            driverData.total_distance =
                await this.reportRepository.getTotalDistance(driver.id);
            //Cantidad total de duracion
            driverData.total_duration =
                await this.reportRepository.getTotalDuration(driver.id);
            return res.status(StatusCodes.OK).json(driverData);
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };
}

export default DriverController;
