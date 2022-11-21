const express = require("express");
const { check } = require("express-validator");

const tourControllers = require("../controllers/tour-controllers");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/:tid", tourControllers.getTourById);

router.get("/user/:uid", tourControllers.getToursByUserId);

router.use(checkAuth);

router.post(
  "/",
  fileUpload.single("image"),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("duration").not().isEmpty(),
    check("address").not().isEmpty(),
    check("price").not().isEmpty(),
  ],
  tourControllers.createTour
);

router.patch(
  "/:tid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  tourControllers.updateTour
);

router.delete("/:tid", tourControllers.deleteTour);

module.exports = router;
