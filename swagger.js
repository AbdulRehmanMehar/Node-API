const swaggerAutogen = require('swagger-autogen')({openapi: '3.0.0'})

const doc = {
  info: {
    title: 'Node API',        // by default: 'REST API'
    description: 'Authentication and CRUD Operations on Post.',  // by default: ''
  },
  host: (process.env.PROD ? 'apiwithnode.herokuapp.com' : 'localhost:3000'),
  schemes: ['http', 'https']
}

const outputFile = './swagger_output.json'
const endpointsFiles = ['./app.js']

swaggerAutogen(outputFile, endpointsFiles, doc)