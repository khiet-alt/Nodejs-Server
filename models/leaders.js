const mongoose = require('mongoose')

const Schema = mongoose.Schema

var leaderSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        destination: {
            type: String,
            default: ''
        },
        abbr: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        featured: {
            type: Boolean,
            default: false
        }
    }, {
        timestamps: true
    }
)

const Leaders = mongoose.model('Leader', leaderSchema)

module.exports = Leaders