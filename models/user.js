const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create user schema
let userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    college: { type: String, required: true },
    level: Number,          // Current level id of the user
    _id: { type: String, required: true, unique: true },
    picture: String,
    created_at: Date,
    updated_at: Date
});

userSchema.method('toPublic', function() {
    // Abstracts unnecessary into from user object for public view
    let obj = this.toObject();
    obj.id = this._id;
    delete obj._id;
    delete obj.created_at;
    delete obj.updated_at;
    delete obj.__v;
    return obj;
});

// on every save, add the date
userSchema.pre('save', function(next) {
    // get the current date
    let currentDate = new Date();

    if(!this.level) {
        this.level = 0;
    }
    // change the updated_at field to current date
    this.updated_at = currentDate;
    // if created_at doesn't exist, add to that field
    if (!this.created_at)
        this.created_at = currentDate;

    next();
});


let User = mongoose.model('User', userSchema);

module.exports = User;
