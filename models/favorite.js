const mongoose = require('mongoose')
const Schema = mongoose.Schema

const favoriteSchema = new Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        movies: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movie'
        }]
    }
)

module.exports = mongoose.model('favorite', favoriteSchema)