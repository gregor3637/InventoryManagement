const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// REGISTER USER
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  //VALIDATION
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  if (password.length < 4) {
    res.status(400);
    throw new Error("Password must be up to 6 characters");
  }

  //CHECK IF USER EMAIL ALREADY EXISTS
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("Email has already been registered");
  }

  // CREATE NEW USER
  const user = await User.create({
    name,
    email,
    password,
  });

  //GENERATE TOKEN
  const token = generateToken(user._id);

  // SEBD HTTP-ONLY COOKIE
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1day
    sameSite: "none",
    secure: true,
  });

  if (user) {
    const { _id, name, email, photo, phone, bio } = user;

    res.status(201).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// LOGIN USER
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  //VALIDATE REQUEST
  if (!email || !password) {
    res.status(400);
    throw new Error("Please add email and password");
  }

  //check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User not found. Please sign up");
  }

  //USER EXITS, CHECK IF PASSWORD IS CORRECT
  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  //GENERATE TOKEN
  const token = generateToken(user._id);

  // SEBD HTTP-ONLY COOKIE
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1day
    sameSite: "none",
    secure: true,
  });

  if (user && passwordIsCorrect) {
    const { _id, name, email, photo, phone, bio } = user;

    res.status(200).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

//LOGOUT USER
const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });

  return res.status(200).json({ message: "successfully logged out" });
});

//GET USER DATA
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { _id, name, email, photo, phone, bio } = user;

    res.status(200).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

//GET LOGIN STATUS
const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json(false);
  }

  //VERIFY TOKEN
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.json(true);
  }

  return res.json(false);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { name, email, photo, phone, bio } = user;

    user.email = email;
    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;
    user.bio = req.body.bio || bio;
    user.photo = req.body.photo || photo;

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updateUser._id,
      name: updateUser.name,
      email: updateUser.email,
      photo: updateUser.photo,
      phone: updateUser.phone,
      bio: updateUser.bio,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

module.exports = {
  registerUser,
  loginUser,
  logout,
  getUser,
  loginStatus,
  updateUser,
};
