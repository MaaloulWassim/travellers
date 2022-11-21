const fs = require("fs");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Tour = require("../models/tour");
const User = require("../models/user");

const getTourById = async (req, res, next) => {
  const tourId = req.params.tid;

  let tour;
  try {
    tour = await Tour.findById(tourId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a tour.",
      500
    );
    return next(error);
  }

  if (!tour) {
    const error = new HttpError(
      "Could not find tour for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ tour: tour.toObject({ getters: true }) });
};

const getToursByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithTours;
  try {
    userWithTours = await User.findById(userId).populate("tours");
  } catch (err) {
    const error = new HttpError(
      "Fetching tours failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!userWithTours || userWithTours.tours.length === 0) {
    return next(
      new HttpError("Could not find tours for the provided user id.", 404)
    );
  }

  res.json({
    tours: userWithTours.tours.map((tour) => tour.toObject({ getters: true })),
  });
};
const createTour = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description, duration, address, price, creator } = req.body;

  // let coordinates;
  // try {
  //   coordinates = await getCoordsForAddress(address);
  // } catch (error) {
  //   return next(error);
  // }

  const createdTour = new Tour({
    title,
    description,
    duration,
    address,
    price,
    image: req.file.path,
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError("Creating tour failed, please try again.", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }

  console.log(user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdTour.save({ session: sess });
    user.tours.push(createdTour);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating tour failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json({ tour: createdTour });
};

const updateTour = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description } = req.body;
  const tourId = req.params.tid;

  let tour;
  try {
    tour = await Tour.findById(tourId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update tour.",
      500
    );
    return next(error);
  }

  if (tour.creator.toString() !== req.userData.userId) {
    const error = new HttpError("You are not allowed to edit this tour.", 401);
    return next(error);
  }

  tour.title = title;
  tour.description = description;

  try {
    await tour.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update tour.",
      500
    );
    return next(error);
  }

  res.status(200).json({ tour: tour.toObject({ getters: true }) });
};

const deleteTour = async (req, res, next) => {
  const tourId = req.params.tid;

  let tour;
  try {
    tour = await Tour.findById(tourId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete tour.",
      500
    );
    return next(error);
  }

  if (!tour) {
    const error = new HttpError("Could not find tour for this id.", 404);
    return next(error);
  }

  const imagePath = tour.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await tour.remove({ session: sess });
    tour.creator.tours.pull(tour);
    await tour.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete tour.",
      500
    );
    return next(error);
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: "Deleted tour." });
};

exports.getTourById = getTourById;
exports.getToursByUserId = getToursByUserId;
exports.createTour = createTour;
exports.updateTour = updateTour;
exports.deleteTour = deleteTour;
