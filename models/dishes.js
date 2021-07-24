const mongoose = require('mongoose')
const Schema = mongoose.Schema
require('mongoose-currency').loadType(mongoose)
const Currency = mongoose.Types.Currency

const dishSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        image: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        label: {
            type: String,
            default: ''
        },
        price: {
            type: Currency,
            min : 0,
            required: true
        },
        featured: {
            type: Boolean,
            default: false
        },
        description: {
            type: String, 
            required: true
        },
    }, {
        timestamps: true
    }
)

module.exports = mongoose.model('Dish', dishSchema)