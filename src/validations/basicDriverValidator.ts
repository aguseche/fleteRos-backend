import { validateName } from './personValidators/nameValidator';
import { validateGender } from './personValidators/genderValidator';
import { validateLicense } from './personValidators/licenseValidator';
import Driver from '../entities/Driver';

export const validateBasicDriver = (driver: Driver): boolean => {
    //Does not validate user y pass, combite with BasicDriverValidator for both
    return (
        validateName(driver.name) &&
        validateName(driver.lastname) &&
        validateGender(driver.gender) &&
        validateGender(driver.phone) &&
        validateLicense(driver.license) &&
        validateLicense(driver.greenCard)
    );
};
