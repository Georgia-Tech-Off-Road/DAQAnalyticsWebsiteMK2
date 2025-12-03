const Joi = require('joi')

const LocationSchema = Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    competition: Joi.boolean(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    parent_id: Joi.string().uuid().allow(null).optional()
});


const schemas = {
    Location: LocationSchema
};

module.exports = schemas