const Joi = require('joi')

// Not finished yet!
const validation_middleware = (schema, property) => {
    return (req, res, next) => {
        const error = Joi.validate(req.body, schema)
    }
}