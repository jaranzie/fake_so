// Question Document Schema
let mongoose = require('mongoose')

let Schema = mongoose.Schema

var QuestionSchema = new Schema(
    {
        title: {type: String, required: true, maxLength: 50},
        summary: {type: String, maxLength: 140},
        text: {type: String, required: true},
        tags: [{type: Schema.Types.ObjectID, ref: 'Tag'}],
        answers: [{type: Schema.Types.ObjectID, ref: 'Answer'}],
        asked_by: {type: Schema.Types.ObjectID, ref: 'User'},
        ask_date_time: {type: Date, default: Date.now},
        views: {type: Number, default: 0},
        votes: {type: Number, default: 0}
    }
)

QuestionSchema.virtual('url').get(function()
{
    return `posts/question/${this._id}`
})


module.exports = mongoose.model('Question', QuestionSchema);