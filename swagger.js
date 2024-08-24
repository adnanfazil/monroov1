const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Monroo',
        version: '1.0.0',
        description: 'A simple Express API',
    },
    servers: [{
        url: 'http://localhost:3000',
    }, ],
};


const options = {
    swaggerDefinition,
    apis: ['./apis/lookups.js','./apis/payment.js', './apis/provider.js', './apis/user.js'],
};

const specs = swaggerJsdoc(options);

module.exports = (app) =>{
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}