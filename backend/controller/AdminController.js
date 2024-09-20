const User = require("../models/User");
const bcrypt = require("bcrypt");

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const changeUserPassword = async (req, res) => {
    const { userId } = req.params;
    const { newPassword } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json("User not found");
        }

        const securePassword = await bcrypt.hash(newPassword, 10);
        user.password = securePassword;
        await user.save();

        res.status(200).json("Password changed successfully");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllUsers, changeUserPassword };