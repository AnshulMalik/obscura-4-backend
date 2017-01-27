const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create user schema
let userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    course: String,
    college: { type: String, required: true },
    level: Number,
    sub_level: Number,
    _id: { type: String, required: true, unique: true },
    picture: String,
    created_at: Date,
    updated_at: Date
});

// on every save, add the date
userSchema.pre('save', function(next) {
    // get the current date
    let currentDate = new Date();

    // change the updated_at field to current date
    this.updated_at = currentDate;
    this.level = 0;
    this.sub_level = 0;
    // if created_at doesn't exist, add to that field
    if (!this.created_at)
        this.created_at = currentDate;

    next();
});

let User = mongoose.model('User', userSchema);

module.exports = User;
