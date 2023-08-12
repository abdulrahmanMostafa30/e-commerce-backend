export const checkRole = (role) => {
    return (req, res, next) => {
      // Check if the user's role matches the required role
      if (req.user && req.user.role === role) {
        next(); // User has the required role, proceed to the next middleware
      } else {
        return res.status(403).json({ message: 'Unauthorized' }); // User does not have the required role
      }
    };
  };
  