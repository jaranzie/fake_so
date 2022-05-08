let mongoose = require('mongoose')

let Schema = mongoose.Schema
var UserSchema = new Schema(
    {
        username: {type: String, required: true},
        email: {type: String, required: true},
        password: {type: String, required: true},
        account_created: {type: Date, default: Date.now},
        points: {type: Number, default: 0}
    }
)

// UserSchema.virtual('url').get(function()
// {
//     return `posts/answer/${this._id}`
// })

module.exports = mongoose.model('User', UserSchema);