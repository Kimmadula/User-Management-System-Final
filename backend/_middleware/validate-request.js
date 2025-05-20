function validateRequest(req, next, schema) {
  // For registration requests, always proceed without validation
  if (req.path.includes("register")) {
    console.log("Bypassing validation for registration")
    return next()
  }

  // For other requests, perform normal validation
  const options = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  }

  const { error, value } = schema.validate(req.body, options)
  if (error) {
    console.error("Validation error:", error.details)
    next("Validation error: " + error.details.map((x) => x.message).join(", "))
  } else {
    req.body = value
    next()
  }
}
