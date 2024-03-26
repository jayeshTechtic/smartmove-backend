/**
 * userValidation.js
 *
 * List of the user validations
 */

const Joi = require("joi");

const userSignupSchema = Joi.object({
    first_name: Joi.string().required().label("First Name should not be empty"),
    last_name: Joi.string().required().label("Last Name should not be empty"),
    email: Joi.string().email().required().label("Email should not be empty"),
    dob: Joi.date().greater(new Date("1940-01-01")).label("Date of Birth should be greater than 1940-01-01"),
    country: Joi.string(),
    region: Joi.string(),
    language: Joi.string(),
    social_type: Joi.string(),
    social_id: Joi.string(),
    is_t_and_c_checked: Joi.string(),
    is_privacy_policy_checked: Joi.string(),
    password: Joi.string()
        .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)
        .label("A password must be eight characters including one uppercase letter, one special character and alphanumeric characters."),
    device_type: Joi.string().required().label("Device Type should not be empty"),
    device_token: Joi.string().required().label("Device Token should not be empty"),
    _id: Joi.string(),
});


const SubAdminuserSignupSchema = Joi.object({
    first_name: Joi.string().required().label("First Name should not be empty"),
    last_name: Joi.string().required().label("Last Name should not be empty"),
    email: Joi.string().email().required().label("Email should not be empty"),
    dob: Joi.date().greater(new Date("1940-01-01")).label("Date of Birth should be greater than 1940-01-01"),
    country: Joi.string(),
    region: Joi.string(),
    language: Joi.string(),
    social_type: Joi.string(),
    social_id: Joi.string(),
    is_t_and_c_checked: Joi.string(),
    is_privacy_policy_checked: Joi.string(),
    password: Joi.string()
        .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)
        .label("A password must be eight characters including one uppercase letter, one special character and alphanumeric characters."),
    device_type: Joi.string().required().label("Device Type should not be empty"),
    device_token: Joi.string().required().label("Device Token should not be empty"),
    _id: Joi.string(),
    user_type: Joi.string(),

});

const userSignInSchema = Joi.object({
    email: Joi.string().email().required().label("Email should not be empty"),
    password: Joi.string().required().label("Password should not be empty"),
    device_type: Joi.string().required().label("Device Type should not be empty"),
    device_token: Joi.string().required().label("Device Token should not be empty"),
    social_type: Joi.string(),
    social_id: Joi.string(),
});

const userSocialSignInSchema = Joi.object({
    email: Joi.string().email().required().label("Email should not be empty"),
    first_name: Joi.string().required().label("First Name should not be empty"),
    last_name: Joi.string().required().label("Last Name should not be empty"),
    social_type: Joi.string().required().label("Social Type should not be empty"),
    social_id: Joi.string().required().label("Social Id should not be empty"),
    device_type: Joi.string().required().label("Device Type should not be empty"),
    device_token: Joi.string().required().label("Device Token should not be empty"),
});

const resetPasswordSchema = Joi.object({
    password: Joi.string().required()
        .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)
        .label("A password must be eight characters including one uppercase letter, one special character and alphanumeric characters."),
    email: Joi.string().required()
});

const adminResetPasswordSchema = Joi.object({
    password: Joi.string().required()
        .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)
        .label("A password must be eight characters including one uppercase letter, one special character and alphanumeric characters."),
    reset_token: Joi.string().required()
});

const userUpdateAccountSchema = Joi.object({
    first_name: Joi.string().required().label("First Name should not be empty"),
    last_name: Joi.string().required().label("Last Name should not be empty"),
    email: Joi.string(),
    dob: Joi.date().greater(new Date("1940-01-01")).label("Date of Birth should be greater than 1940-01-01"),
    country: Joi.string(),
    region: Joi.string(),
    language: Joi.string(),
    device_type: Joi.string().required().label("Device Type should not be empty"),
    device_token: Joi.string().required().label("Device Token should not be empty"),
    password: Joi.string().allow('').optional(),
    _id: Joi.string().required().label("User Id should not be empty")
});

module.exports = {
    userSignupSchema,
    userSignInSchema,
    resetPasswordSchema,
    userUpdateAccountSchema,
    adminResetPasswordSchema,
    userSocialSignInSchema,
    SubAdminuserSignupSchema
}
