import Shipment from '../entities/Shipment';

const registrationEmail = function (
    name: string | null,
    lastname: string | null,
    price: number,
    shipment: Shipment,
    text: string
) {
    const html = `
    <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>Offer</title>
            <style>
                /* Define the colors using inline CSS styles */
                .primary-color {
                    color: #2962ff;
                }
                .secondary-color {
                    color: #6c757d;
                }
                .background-color {
                    background-image: url(https://i.ibb.co/7YF8kGZ/ros4.png);
                    background-repeat: no-repeat;
                    background-position: center;
                    background-size: cover;
                    height: 550px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .content {
                    background-color: #fff;
                    padding: 40px;
                    margin: 40px auto;
                    text-align: center;
                    min-width: 500px;
                }
            </style>
        </head>
        <body>
            <div class="background-color">
                <div class="content">
                    <h1 class="primary-color" style="margin-bottom: 0"> Nueva oferta recibida !!!</h1>
                    <p class="secondary-color" style="margin-top: 0">
                        Hola, ${name} ${lastname} 
                    </p>
                    <p class="secondary-color">
                        ${text}
                    </p>
                    <p class="primary-color">
                        La oferta es: <b>${price}</b> por el viaje a realizar.
                    </p>
                    <p class="secondary-color">
                        Esta es la informacion de la entrega:
                    </p>
                    <p class="secondary-color">
                        Localizacion desde: ${shipment.locationFrom}
                    </p>
                    <p class="secondary-color">    
                        Localizacion hasta: ${shipment.locationTo}
                    </p>
                        Fecha de entrega: ${shipment.shipDate}
                    </p>
                    <p class="secondary-color">
                        Para ver todos los detalles logueate en tu cuenta
                    </p>
                </div>
            </div>
        </body>
        </html>

    `;
    return {
        html: html
    };
};

export default registrationEmail;
