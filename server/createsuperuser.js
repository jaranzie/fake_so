let Users = require('./models/user')
const bcrypt = require('bcrypt');
const saltRounds = 5;

let mongoose = require('mongoose');
let mongoDB = "mongodb://127.0.0.1:27017/fake_so";
//{useNewUrlParser: true, useUnifiedTopology: true}
mongoose.connect(mongoDB).then(() => console.log('Database Connected')).catch(error => console.log(error));
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


const user = {
    username:'sudo',
    password:bcrypt.hashSync('password', saltRounds),
    email:'sudo@mail.com',
    points:100
}

newUser = new Users(user)
newUser.save().then(() => console.log('asdasd'))



db.close()


