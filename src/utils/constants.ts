export const OFFER_STATE = {
    confirmed: 'CONFIRMED',
    cancelled: 'CANCELLED',
    sent: 'SENT',
    deleted: 'DELETED',
    shipment_deleted: 'SHIPMENT_DELETED'
};

export const SHIPMENT_STATE = {
    waiting_offers: 'WAITING_OFFERS',
    confirmed: 'CONFIRMED',
    cancelled: 'CANCELLED'
};

export const DELIVERY_SHIFT = {
    morning: 'M',
    afternoon: 'A'
};

export const DAYS_SINCE_UPDATED = 3;

export const TOKEN_EXPIRATION_TIME = 86400; //1 day

export const TOKEN_EMAIL_EXPIRATION_TIME = 3600; //1 hour

export const SEND_MAIL = true;

export const LINK_USER = 'http://localhost:3001/user/confirm/';
export const LINK_DRIVER = 'http://localhost:3001/driver/confirm/';

export const URL_IMG = 'https://i.ibb.co/1Z32m2t/ros4.png';
