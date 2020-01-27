const { User } = require('../Schemas');
const Bcrypt = require("bcryptjs");

const signup = async (req, res) => {
    const newUser = new User({
        name: {
            first: req.body.first_name,
            last: req.body.last_name,
        },
        email: req.body.email,
        password: Bcrypt.hashSync(req.body.password, 10),
        location: req.body.location,
        profession: req.body.profession,
        user_type: req.body.user_type
    });
    try {
        const user = await newUser.save();
        return user;
    } catch (err) {
        if (err.name === 'MongoError' && err.code === 11000)
            return { message: `Email: ${req.body.email} already exists is the system` };
        else return { message: err.message };
    }
}


const login = async (req, res) => {
    try {
        const result = await User.findOne({ email: req.body.email });

        if (!result) {
            res.status(500).json({ message: "Email not found" });
        } else {
            if (Bcrypt.compareSync(req.body.password, result.password)) {
                res.status(200).json(result);
            } else {
                res.status(500).json({ message: "Invalid Password" });
            }
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


const editUser = async (req, res) => {
    const userDetails = {
        name: {
            first: req.body.first_name,
            last: req.body.last_name,
        },
        email: req.body.email,
        location: req.body.location,
        profession: req.body.profession,
    }
    try {
        const user = await User.updateOne({ _id: req.params.id }, userDetails);
        res.status(200).send("Updated");
    } catch (err) {
        if (err.name === 'MongoError' && err.code === 11000)
        res.status(500).json({ message: `Email: ${req.body.email} already exists is the system` });
        else res.status(500).json({ message: err.message });

    }
}


const deleteUser = async (req, res) => {
    try {
        await User.deleteOne({ _id: req.body.id });
        return 'deleted';
    } catch (err) {
        return -1
    }
}


const getUser = async (id) => {
    try {
        const result = await User.findOne({ _id: id });
        return result;
    } catch (err) {
        return -1;
    }
}


module.exports = {
    signup,
    login,
    editUser,
    deleteUser,
    getUser
}

