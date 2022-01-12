module.exports = {
    type: 'mysql',
    host: process.env.DBHOST || 'localhost',
    port: process.env.DBPORT || 3306,
    username: process.env.DBUSER || 'root',
    password: process.env.DBPASS || '',
    database: process.env.DBSCHEMA || 'fleteRos',
    entities: ['dist/entities/**/*.js'],
    logging: true,
    synchronize: false
};
