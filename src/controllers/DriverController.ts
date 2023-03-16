import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import md5 from 'md5';
import AuthController from './AuthController';
import DriverRepository from '../repositories/DriverRepository';
import Driver from '../entities/Driver';
import { INewDriver } from '../interfaces/INewDriver';
import { validateDriver } from '../validations/driverValidator';
import { StatusCodes } from 'http-status-codes';

class DriverController {
    private driverRepository = getCustomRepository(DriverRepository);

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
    public signOut = (req: Request, res: Response): Response => {
        // req.logout();
        return res.status(StatusCodes.OK).json({ msg: 'success' });
    };
    //porque no tengo un getme aca ?
}

export default DriverController;
