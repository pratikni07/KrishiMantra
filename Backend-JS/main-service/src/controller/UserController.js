const User = require("../model/User")

exports.getUserByPage = async (req, res) => {
    try {
        console.log("called")
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        console.log("Fetching users with page:", page, "and limit:", limit);

        const users = await User.find()
            .populate("additionalDetails")
            .skip(skip)
            .limit(limit)
            .select('-password'); // Exclude password field

        const totalUsers = await User.countDocuments();
        console.log(users)

        res.status(200).json({
            users: users.map(user => ({
                _id: user._id,
                name: user.name,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNo: user.phoneNo,
                accountType: user.accountType,
                image: user.image,
                additionalDetails: {
                    subscription: user.additionalDetails?.subscription,
                    location: user.additionalDetails?.location,
                    address: user.additionalDetails?.address
                },
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            })),
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalUsers / limit),
                totalUsers,
                hasNextPage: page * limit < totalUsers,
                hasPreviousPage: page > 1,
            },
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getUserById= async(req,res)=>{
    try {
        const userId = req.user._id
        const user = await User.findById(userId)
        res.status(200).json({
            user,
            message:"User By Id"
        })
    } catch (error) {
        console.error("Error fetching  By Id user:", error);
        res.status(500).json({ message: "Server error" });
    }
}
