import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const receptionistSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim : true
        },
        phone: {
            type: String,
            required: [false, "Phone number is required"],
        },
        profilePicture: {
            type: String,
            required : false,
        },
        gender: {
            type: String,
            required: false,
            enum: ["Male", "Female", "Other"],
        },
        country: {
            type: String,
            required: false,
        },
        state: {
            type: String,
            required: false,
        },
        city: {
            type: String,
            required: false,
        },
        zipCode: {
            type: String,
            required: false,
        },
        address: {
            type: String,
            required: false,
            trim: true,
        },
        password: {
            type: String,
            // required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters long"],
        },
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: [true, "Hospital ID is required"],
        },
        qualification: {
            type: String,
            required: false,
            trim: true,
        },
        emergencyContactNo: {
            type: String,
            required: false,
        },
        workingTime: {
            type: String,
            required: false,
        },
        breakTime: {
            type: String,
            required: false,
        },
        role: {
            type: String,
            default: "receptionist",
        },
        deviceToken: {
            type: String,
            default: "null",
        },
    },
    {
        timestamps: true,
    }
);
// Method to compare password for login
receptionistSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const receptionistModel = mongoose.model("Receptionist", receptionistSchema);

export default receptionistModel;
