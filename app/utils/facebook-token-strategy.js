exports.config = {
  clientID: process.env.FB_CLIENT_ID,
  clientSecret: process.env.FB_CLIENT_SECRET,
  profileFields: [
    'id',
    'displayName',
    'first_name',
    'picture.type(large)',
    'email'
  ]
}

exports.func = (accessToken, refreshToken, profile, done) => {
  done(null, profile._json);
}