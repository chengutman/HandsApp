
const TOKEN_PATH = process.env.TOKEN_PATH;
const SCOPE = process.env.SCOPE;

const client_id = process.env.client_id;
const redirect_uris = process.env.redirect_uris.split(' ');
const client_secret = process.env.client_secret;

module.exports = {
   client_id,
   redirect_uris,
   client_secret,
    TOKEN_PATH,
    SCOPE
}