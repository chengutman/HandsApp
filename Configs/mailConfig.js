
const mailHostConfig = {
    service:'gmail',
    auth: {
      user: process.env.user,
      pass: process.env.pass
    }
};

module.exports = {
  mailHostConfig
}