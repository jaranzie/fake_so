// Answer Document Schema
let mongoose = require('mongoose')

let Schema = mongoose.Schema
var AnswerSchema = new Schema(
    {
        text: {type: String, required: true},
        ans_by: {type: Schema.Types.ObjectID, ref: 'User'},
        ans_date_time: {type: Date, default: Date.now}
    }
)

AnswerSchema.virtual('url').get(function()
{
    return `posts/answer/${this._id}`
})

module.exports = mongoose.model('Answer', AnswerSchema);