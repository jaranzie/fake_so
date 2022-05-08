// Tag Document Schema
let mongoose = require('mongoose')
let Questions = require('./questions')

let Schema = mongoose.Schema

var TagSchema = new Schema(
    {
        name: {type: String, required: true}
    }
)


TagSchema.virtual('url').get(function()
{
    return `posts/tag/${this._id}`
})

module.exports = mongoose.model('Tag', TagSchema);