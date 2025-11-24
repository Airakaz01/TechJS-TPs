import { Schema, model } from 'mongoose';
import type { IUser } from '../types/user.js';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        required: [true, 'Le nom d\'utilisateur est requis.'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Le mot de passe est requis.']
    }
}, {
    timestamps: true
});

UserSchema.pre<IUser>('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

export default model<IUser>('User', UserSchema);