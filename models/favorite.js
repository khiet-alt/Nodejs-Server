const mongoose = require('mongoose')
const Schema = mongoose.Schema

const dishesSchema = new Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'
    }
})

const favoriteSchema = new Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        dishes: [dishesSchema]
    }
)

module.exports = mongoose.model('favorite', favoriteSchema)