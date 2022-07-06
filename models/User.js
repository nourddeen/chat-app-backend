const mongoose = require('mongoose');
const {isEmail} = require('validator');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Cannot be blank"]
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, "Email is needed"],
    index: true,
    validate: [isEmail, "Cannot be blank"]
  },
  password: {
    type: String,
    required: [true, "Cannot be blank"]
  },
  picture: {
    type: String,
  },
  newMessages: {
    type: Object,
    default: {}
  },
  // online/offline status
  status: {
    type: String,
    default: 'online'
  }
}, {minimize: false});


UserSchema.pre('save', function(next){
  const user = this;
  if(!user.isModified('password')) return next();

  bcrypt.genSalt(10, function(err, salt){
    if(err) return next(err);
    bcrypt.hash(user.password, salt, function(err, hash){
      if(err) return next(err);
      user.password = hash
      next();
    })
  })
})

// Don't send back user password
UserSchema.methods.toJSON = function(){
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
}

// 
UserSchema.statics.findByCredentials = async function(email, password) {
  // email
  const user = await User.findOne({email});
  if(!user) throw new Error('Invalid email or password');
  // password
  const isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch) throw new Error('Invalid email or password')
  return user
}


const User = mongoose.model('User', UserSchema);

module.exports = User