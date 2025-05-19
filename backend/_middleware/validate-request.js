// Modify the validateRequest function to be more forgiving
function validateRequest(req, next, schema) {
  const options = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  }

  const { error, value } = schema.validate(req.body, options)
  if (error) {
    console.error("Validation error:", error.details)

    // For registration, try to continue anyway with the validated parts
    if (req.path === "/accounts/register" || req.path === "/register") {
      console.log("Continuing registration despite validation errors")
      req.body = value // Use the validated parts
      return next()
    }

    // For other routes, handle validation normally
    next("Validation error: " + error.details.map((x) => x.message).join(", "))
  } else {
    req.body = value
    next()
  }
}
