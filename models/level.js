const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let levelSchema = new Schema({
    _id: Number,
    name: { type: String, required: true },
    level: Number,      // Level number
    next: String,       // Url of next level
    picture: String,
    url: String,
    html: String,
    js: String,         // Javascript to be executed on client side+
    hint: String,
    answers: Array,
});

levelSchema.method('toPublic', function() {
    // Abstracts unnecessary into from user object for public view
    let obj = this.toObject();
    obj.id = this._id;
    delete obj._id;
    delete obj.__v;
    return obj;
});

let Level = mongoose.model('Level', levelSchema);

module.exports = Level;
