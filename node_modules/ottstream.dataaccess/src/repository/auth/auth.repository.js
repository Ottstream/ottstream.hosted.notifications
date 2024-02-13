const httpStatus = require('http-status');
const tokenService = require('../user/token.repository');
const userService = require('../user/user.repository');
const providerService = require('../ottprovider/ottprovider.repository');
const Token = require('../../models/user/token.model');
const ApiError = require('../../api/utils/error/ApiError');

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  } else if (!(await user.isPasswordMatch(password))) {
    await user.incrementLoginAttempt(password);
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  if (!user.provider || !user.provider.status) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Provider status is 0');
  }
  if (!user.accessEnable) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User is blocked');
  }
  await user.updateOne({
    email,
    $set: { lastActiveTime: Date.now() },
    // $set: { lastActiveTime: Date.now(), loginAttempt: 0 },
    new: true,
  });
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: 'refresh', blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.remove();
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, 'resetPassword');
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: 'resetPassword' });
    await userService.updateUserById(user.id, { password: newPassword });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * otp Check
 * @param {string} resetPasswordToken
 * @returns {Promise}
 */
const otpCheck = async (resetPasswordToken) => {
  const response = {
    status: true,
    message: '',
  };
  try {
    await tokenService.verifyToken(resetPasswordToken, 'resetPassword');
  } catch (e) {
    response.status = false;
    response.message = 'token expired';
  }
  return response;
};

/**
 * email Check
 * @param {string} email
 * @returns {Promise}
 */
const emailCheck = async (email) => {
  const userEmailCheck = await userService.isEmailTaken(email);
  const providerEmailCheck = await providerService.isEmailTaken(email);
  return { result: userEmailCheck || providerEmailCheck };
};

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  otpCheck,
  emailCheck,
  resetPassword,
};
