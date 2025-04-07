export const asynchandler = (func) => (req, res, next) => {
  Promise.resolve(func(req, res, next)).catch((err) => {
    next(err);
  });
};
