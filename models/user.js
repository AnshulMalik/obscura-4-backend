const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create user schema
let userSchema = new Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true, unique: true },
    password: String,
    course: String,
    college: { type: String, required: true},
    token: String,
    level: Number,
    sub_level: Number,
    created_at: Date,
    updated_at: Date
});

// on every save, add the date
userSchema.pre('save', function(next) {
    // get the current date
    let currentDate = new Date();

    // change the updated_at field to current date
    this.updated_at = currentDate;

    // if created_at doesn't exist, add to that field
    if (!this.created_at)
        this.created_at = currentDate;

    next();
});

let User = mongoose.model('User', userSchema);

module.exports = User;
