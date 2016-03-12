// var jwt = require('jwt-simple');


module.exports = {
  errorLogger: function (error, req, res, next) {
    // log the error then send it to the next middleware in
    console.error(error.stack);
    next(error);
  },
  errorHandler: function (error, req, res, next) {
    // send error message to client
    // message for gracefull error handling on app
    res.send(500, {error: error.message});
  },

  // Dummy function to test routes
  testy: function (req, res, next) {
    res.json("Route Succesful");
  },

  handleCommit: function (req, res, next) {
    res.json("You made a POST to /api/commits/");
  }

  // Tolken handler, not sure if will use

  // decode: function (req, res, next) {
  //   var token = req.headers['x-access-token'];
  //   var user;
  //   if (!token) {
  //     return res.send(403); // send forbidden if a token is not provided
  //   }

  //   try {
  //     // decode token and attach user to the request
  //     // for use inside our controllers
  //     user = jwt.decode(token, 'secret');
  //     req.user = user;
  //     next();
  //   } catch (error) {
  //     return next(error);
  //   }
  // }
};