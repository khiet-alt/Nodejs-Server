const mongoose = require('mongoose')
const Schema = mongoose.Schema

const movie = new Schema({
    category: {
        type: String,
        required : true
    },
    imageUrl: {
        type: String,
        required : true
    },
    title: {
        type: String,
        required : true
    },
    url: {
        type: String,
        required : true
    },
    episode: [
        {
            episode: {
                type: String,
                required : true
            },
            url: {
                type: String,
                required : true
            },
            type: {
                type: String,
                required : true
            }
        }
    ],
    description: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Movie', movie)