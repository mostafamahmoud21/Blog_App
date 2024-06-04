const joi = require('joi');

const addPostSchema=joi.object({
    title:joi.string().required(),
    desc:joi.string().max(3000).required(),
    category: joi.string().required(),
    photo:joi.string()
})

const editPostSchema=joi.object({
    title:joi.string().trim().optional(),
    desc:joi.string().max(3000).trim().optional(),
    category: joi.string().trim().optional(),
    photo:joi.string().optional()
})

module.exports={addPostSchema,editPostSchema}