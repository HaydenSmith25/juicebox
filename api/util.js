function requireUser(req, res, next) {
  if (!req.user) {
    next({
      name: "MissingUserError",
      message: "You must be logged in to perfrom this auction",
    });
  }
  next();
}

module.exports = {
  requireUser,
};
