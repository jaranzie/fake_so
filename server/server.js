// Application server
let Tags = require('./models/tags')
let Answers = require('./models/answers')
let Questions = require('./models/questions')
let Users = require('./models/user.js')
// Express
const express = require('express');
const session = require("express-session")
const MongoStore = require("connect-mongo")
const bcrypt = require('bcrypt');
const saltRounds = 5;
const app = express()
const port = 8000
const cors = require('cors')
let appServer = app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
app.use(cors({credentials: true, origin: "http://localhost:3000"}))
app.use(express.json())
app.use(
    session({
        secret: "YoullNeverGuessThisYoullNeverGuessThis",
        cookie: {},
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/fake_so'})
    })
)

// Mongoose
let mongoose = require('mongoose');
let mongoDB = "mongodb://127.0.0.1:27017/fake_so";
//{useNewUrlParser: true, useUnifiedTopology: true}
mongoose.connect(mongoDB).then(() => console.log('Database Connected')).catch(error => console.log(error));
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


app.post('/posts/question', (req, res) => {
    let question = req.body
    question.user = req.session.user
    createNewQuestion(question).then(() =>(res.send('question created'))).catch(() => res.status(400).send({message: 'Not enough points to make new tags'}))
})
createNewQuestion = async (newQ) => {
    const user = await Users.find({_id:newQ.user})
    let canMakeNewQuestions = false
    if (user.points >= 100) {
        canMakeNewQuestions = true
    }
    let tags = newQ.tagArray
    //tags = tags.map((r) => r.toLowerCase())
    for (let i = 0; i < tags.length; i++) {
        const tagID = (await Tags.find({name:(tags[i].toLowerCase())}))   //._i
        if (tagID.length === 0) {
            if (!canMakeNewQuestions) {
                throw Error('Failed to make new question')
            }
            tags[i] = (await tagCreate(tags[i].toLowerCase()))  // ._id
        }
        else {
            tags[i] = tagID[0]

        }
    }
    return await questionCreate(newQ.title, newQ.text, tags, newQ.user, newQ.summary)
}
function tagCreate(name) {
    let tag = new Tags({ name: name });
    return tag.save();
}
function questionCreate(title, text, tags, user, summary) {
    let qstndetail = {
            title: title,
            text: text,
            tags: tags,
            asked_by: user,
            summary: summary
        }
    let question = new Questions(qstndetail);
    return question.save();
}


app.post('/logout', (req,res) => {
    req.session.destroy((err) => {
        if(err) {
            console.log(err)
            res.status(400).send({message: 'Logout failed'})
        }
        res.send("success")
    })
})

get_question_by_id = async (id) => {
    const question = await Questions.findById(id).populate('answers').populate('asked_by').populate('tags')
    question.views += 1
    question.save()
    return question
}
//ans_by

app.get('/posts/question/:_id', (req,res) => {
    get_question_by_id(req.params._id).then((r) =>(res.send(r))).catch((err) => console.log(err))
})

app.post('/login', (req,res) => {
    let loginCreds = req.body
    Users.find({email:loginCreds.email}).then(results => {
        if (results.length === 0) { //possilby check length
            res.status(400).send({message: 'Email not found'});
        }
        else {
            bcrypt.compare(loginCreds.password, results[0].password).then(function(isMatch) {
                if(!isMatch) {
                    res.status(400).send({message: 'Incorrect Password'});
                }
                else {
                    req.session.user = results[0]._id
                    res.send({_id:results[0]._id})
                }
            });
        }
    })
})
app.post('/newUser', (req,res) => {
    let newUser = req.body
    Users.find({email:newUser.email}).then(results => {
        if (results.length !== 0) { //possilby check length
            res.status(400).send({message: 'Email already in use'});
        }
        else {
            bcrypt.hash(newUser.password, saltRounds).then(function(hash) {
                newUser.password = hash
                const newU = new Users(newUser)
                newU.save().then(res.send('User Created')).catch(error => console.log(error))
        }
    ).catch(error => console.log(error))
}}).catch(error => console.log(error))})
app.get('/posts/tag/:_id', (req,res) => {
    Questions.find({tags:req.params._id}).populate('tags').then((r) =>(res.send(r))).catch((err) => console.log(err))
})
app.get('/posts/questions', (req,res) => {
    Questions.find({}).populate('tags').populate('asked_by').sort({ask_date_time: -1}).then((r) =>(res.send(r))).catch((err) => console.log(err))
})
app.get('/posts/tags', (req,res) => {
    get_tags().then((r) =>(res.send(r))).catch((err) => console.log(err))
})
get_tags = async () =>{
    let tags = await Tags.find({})
    for (let i = 0; i < tags.length; i++) {
        tags[i] = {
            name:tags[i].name,
            _id:tags[i]._id,
            numQuestions: await get_tag_nums(tags[i])
        }
    }
    return tags
}
function get_tag_nums(t) {
    return Questions.count({tags:t._id})
}
//Search
app.post('/posts/questions/search', (req,res) => {
    search_questions(req.body).then((r) =>(res.send(r))).catch((err) => console.log(err))
})
function search_all_questions(searchObj) {
    return Questions.find({$or:[{text: (new RegExp(searchObj.searchText, "i"))}, {title: (new RegExp(searchObj.searchText, "i"))}, {summary: (new RegExp(searchObj.searchText, "i"))}]}).populate('tags').sort({ask_date_time: -1})
}
search_questions = async (searchObj) =>{
    let questions = await search_all_questions(searchObj).exec()
    if (searchObj.tags.length === 0)
        return questions
    return questions.filter((r) => {
        for (const t of r.tags) {
            if (searchObj.tags.includes(t.name)) {
                return true
            }
        }
        return false
    })
}

app.get('/profile', (req,res) => {
    get_profile(req.session.user).then(result => res.send(result)).catch(err => console.log(err))
})

async function get_profile(id) {
    console.log(id)
    const questions = await Questions.find({asked_by:id}).populate('tags').populate('asked_by')
   // const answers = await Answers.find({ans_by:id})
    const user_profile = await Users.findOne({_id:id})
    return {
        questions:questions,
      //  answers:answers,
        user:user_profile
    }
}

app.post('/posts/question/:_id', (req,res) => {
    createNewAnswer(req.body, req.session.user).then(() =>(res.send('question created'))).catch((err) => console.log(err)).catch(error => console.log(error))
})

createNewAnswer = async (newA, user) => {
    let question = await Questions.findById(newA.question)
    let answer = await answerCreate(newA.text, user)
    question.answers.push(answer)
    return await question.save()
}

function answerCreate(text, ans_by) {
    let answerdetail = {text:text};
    answerdetail.ans_by = ans_by;
    let answer = new Answers(answerdetail);
    return answer.save();
}

app.post('/posts/question/:_id/upvote', (req,res) => {
    Users.findOne({_id:req.session.user}).then(user => {
        if (user.points >= 99)
            vote(req.params._id, true)
        else {
            res.status(400).send({message: 'Not enough points to vote'})
        }

    })

})

app.post('/posts/question/:_id/downvote', (req,res) => {
    Users.findOne({_id:req.session.user}).then(user => {
        if (user.points >= 99)
            vote(req.params._id, false).then(() => res.send({message:'vote success'}))
        else {
            res.status(400).send({message: 'Not enough points to vote'})
        }

    })

})

async function vote(qid, change) {
    let amount = -1
    if (change)
        amount = 1
    let question = await Questions.findOne({_id:qid})

    question.votes = question.votes + amount
    question.save()
    let user = await Users.findOne({_id:question.asked_by})
    user.points = user.points + (10 * amount)
    user.save()
}


process.on('SIGINT', () => {
    if(db) {
        db.close()
            .then(() => {
                appServer.close()
                console.log('Server Closed. Database instance disconnected')})
            .catch((err) => console.log(err));
    }
    console.log('process terminated');
})