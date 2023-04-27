import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import md5 from 'md5';
import AuthController from './AuthController';
import DriverRepository from '../repositories/DriverRepository';
import Driver from '../entities/Driver';
import { INewDriver } from '../interfaces/INewDriver';
import { validateDriver } from '../validations/driverValidator';
import { StatusCodes } from 'http-status-codes';
import OfferRepository from '../repositories/OfferRepository';
import ShipmentRepository from '../repositories/ShipmentRepository';
import registrationEmail from '../templates/registrationEmail';
import Mailer from '../utils/mailer';
import { SEND_MAIL } from '../utils/constants';
import ReportRepository from '../repositories/ReportRepository';
import { IDriverData } from '../interfaces/IDriverData';

class DriverController {
    private driverRepository = getCustomRepository(DriverRepository);
    private offerRepository = getCustomRepository(OfferRepository);
    private shipmentRepository = getCustomRepository(ShipmentRepository);
    private reportRepository = getCustomRepository(ReportRepository);

    public signUp = async (req: Request, res: Response): Promise<Response> => {
        const newDriver: INewDriver = req.body;

        if (!validateDriver(newDriver)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Please. Send a valid email and password'
            });
        }
        try {
            const oldDriver = await this.driverRepository.findByEmail(
                newDriver.email
            );

            if (oldDriver) {
                return res
                    .status(StatusCodes.BAD_REQUEST)
                    .json({ error: 'Email already exists' });
            }

            newDriver.password = md5(newDriver.password);
            await this.driverRepository.save(newDriver);
            newDriver.password = '';

            //Send mail
            if (SEND_MAIL) {
                const template = registrationEmail(
                    // newDriver.name,
                    // newDriver.lastname,
                    '',
                    '',
                    'Driver'
                );
                const mailer = new Mailer();
                await mailer.sendMail(
                    newDriver.email,
                    'Registro Exitoso',
                    template.html
                );
            }
            return res.status(StatusCodes.CREATED).json(newDriver);
        } catch (error) {
            throw new Error('Failed to retrieve driver from the database');
        }
    };

    public signIn = async (req: Request, res: Response): Promise<Response> => {
        const loginDriver: INewDriver = req.body;
        if (!validateDriver(loginDriver)) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ error: 'Email and Password required' });
        }
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
            const token = AuthController.createToken(driver);
            return res.status(StatusCodes.OK).json({ driver, token });
        } catch (error) {
            console.log(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };
    public signOut = async (req: Request, res: Response): Promise<Response> => {
        // req.logout();
        return res.status(StatusCodes.OK).json('success');
    };
    //porque no tengo un getme aca ?

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
                total_profit: 0
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
            return res.status(StatusCodes.OK).json(driverData);
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };
}

export default DriverController;
