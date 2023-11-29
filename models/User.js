import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Enter name of user'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, "Email already registered"],
        //from stackoverflow
        match: [
            /^([-!#-\'*+\/-9=?A-Z^-~]{1,64}(\.[-!#-\'*+\/-9=?A-Z^-~]{1,64})*|"([]!#-[^-~ \t]|(\\[\t -~]))+")@[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?(\.[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?)+$/,
            "Please Enter a valid email"
        ]
    },
    role: {
        type: String,
        enum: ['user', 'publisher', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false  //will not fetch password on normal fetch call from database
    },
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

UserSchema.pre('save', async function (next) {
    //This middleware is running even for forgot password. forgotPassword user don't have a password
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

//Sign JWT and return
UserSchema.methods.getJWTSignedToken = function () {
    //payload, secret,expiresIn
    return jwt.sign({
        id: this._id,
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
}

//match user entered password
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

//generate and hash password token
UserSchema.methods.getResetPasswordToken = async function () {
    //generate token
    //as every time a new token is to be created
    const resetToken = crypto.randomBytes(20).toString('hex');

    // console.log(resetToken);
    //Hash token and set to  resetPasswordToken
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    // Set expire
    this.resetPasswordExpiry = Date.now() + 10 * 60 * 1000; //10min
    return resetToken;
}

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;