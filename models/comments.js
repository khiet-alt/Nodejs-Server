const mongoose = require('mongoose')
const Schema = mongoose.Schema

var commentSchema = new Schema(
    {
        comment:  {
            type: String,
            required: true
        },
        author:  {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        movie: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movie'
        }
    }, {
        timestamps: true
    }
)

module.exports = mongoose.model('Comment', commentSchema)