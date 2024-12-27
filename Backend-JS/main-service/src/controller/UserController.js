// controllers/UserController.js (adding to existing file)
const User = require("../model/User");
const UserDetail = require("../model/UserDetail");

// Update main user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, firstName, lastName, phoneNo, image } = req.body;

    // Validate input
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        firstName,
        lastName,
        phoneNo,
        image,
      },
      {
        new: true, // Return updated document
        runValidators: true, // Run model validations
      }
    ).select("-password"); // Exclude password from response

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update user additional details
exports.updateUserDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    const { address, location, interests, profilePic } = req.body;

    // Find existing user details or create new
    let userDetails = await UserDetail.findOne({ userId });

    if (!userDetails) {
      // Create new user details if not exists
      userDetails = new UserDetail({
        userId,
        address,
        location,
        interests,
        profilePic,
      });
    } else {
      // Update existing user details
      userDetails.address = address || userDetails.address;
      userDetails.location = location || userDetails.location;
      userDetails.interests = interests || userDetails.interests;
      userDetails.profilePic = profilePic || userDetails.profilePic;
    }

    // Save updated/new user details
    await userDetails.save();

    // Update user's additional details reference
    await User.findByIdAndUpdate(userId, {
      additionalDetails: userDetails._id,
    });

    res.status(200).json({
      message: "User details updated successfully",
      userDetails,
    });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update user subscription details (optional)
exports.updateSubscription = async (req, res) => {
  try {
    const userId = req.user._id;
    const { subscriptionType, transactionDetails, endDate } = req.body;

    // Find user details
    let userDetails = await UserDetail.findOne({ userId });

    if (!userDetails) {
      return res.status(404).json({ message: "User details not found" });
    }

    // Update subscription details
    userDetails.subscription = {
      type: subscriptionType || userDetails.subscription.type,
      transactionDetails:
        transactionDetails || userDetails.subscription.transactionDetails,
      endDate: endDate || userDetails.subscription.endDate,
      purchasedDate: new Date(),
    };

    await userDetails.save();

    res.status(200).json({
      message: "Subscription updated successfully",
      subscription: userDetails.subscription,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
exports.getUserByPage = async (req, res) => {
  try {
    console.log("called");
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    console.log("Fetching users with page:", page, "and limit:", limit);

    const users = await User.find()
      .populate("additionalDetails")
      .skip(skip)
      .limit(limit)
      .select("-password"); // Exclude password field

    const totalUsers = await User.countDocuments();
    console.log(users);

    res.status(200).json({
      users: users.map((user) => ({
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
          address: user.additionalDetails?.address,
        },
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
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
exports.getUserById = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    res.status(200).json({
      user,
      message: "User By Id",
    });
  } catch (error) {
    console.error("Error fetching  By Id user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// get consultant according to latitude and langitude

exports.getConsultant = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    console.log(latitude, longitude, "requested");

    // Find consultants near the user's location
    const consultants = await UserDetail.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude], // Longitude first, then latitude
          },
          $maxDistance: 10000, // Maximum distance in meters (10 km)
        },
      },
    })
      .populate({
        path: "userId", // Populate the 'userId' field from UserDetail with User data
        match: { accountType: "consultant" }, // Only include users with accountType "consultant"
        select: "name image", // Only select the name and image (profile photo) from the User model
      })
      .populate({
        path: "company", // Populate the 'company' field from UserDetail with Company data
        select: "name logo", // Only select the company name and logo from the Company model
      })
      .exec();

    // Filter out any entries where the populated userId doesn't match the accountType "consultant"
    const filteredConsultants = consultants
      .filter((consultant) => consultant.userId !== null)
      .map((consultant) => ({
        userName: consultant.userId.name, // Extract user's name
        profilePhotoId: consultant.userId.image, // Extract user's profile photo ID
        experience: consultant.experience, // Extract user's experience
        rating: consultant.rating, // Extract user's rating
        company: consultant.company
          ? {
              name: consultant.company.name, // Company name
              logo: consultant.company.logo, // Company logo
            }
          : null, // Handle cases where company may be null
      }));

    res.status(200).json({
      consultants: filteredConsultants,
      message: "Consultants found",
    });
  } catch (error) {
    console.error("Error fetching consultants:", error);
    res.status(500).json({ message: "Server error" });
  }
};
