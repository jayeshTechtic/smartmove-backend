const statusCode = {
    sucess: 2000, // use this for success response
    successWithoutBody: 2004    , // use this for success but no body or data in the response
    userIsNotVerified: 2009, // if user is not verified by admin
    userIsNotActive: 2010, // account is not active yet
    validation: 4000, // use this for validation of the data
    unauthorised: 4001, // Unathorised user
    dataForbidden: 4003, // user cannot access the requested resource
    notFound: 4004, // use this for record not found
    alreadyExists: 4009, // use this for conflict in data
    internalError: 5000 // use this as internal server error
}

module.exports = {
    statusCode
}