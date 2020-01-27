const fs = require('fs');
const { google } = require('googleapis');
const inquirer = require('inquirer');
const { client_id, redirect_uris, client_secret, SCOPE, TOKEN_PATH } = require('../../Configs/googleConfig');

async function generateOAuthClient() {
  let oAuth2Client
  try {
    oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    google.options({ auth: oAuth2Client });

    const tokenFile = fs.readFileSync(TOKEN_PATH);
    if (tokenFile !== undefined && tokenFile !== {}) {
      oAuth2Client.setCredentials(JSON.parse(tokenFile));
    } else {
      throw new Error('Empty token');
    }
    return Promise.resolve(oAuth2Client);
  } catch (err) {
    oAuth2Client = await getAccessToken(oAuth2Client, SCOPE)
    return Promise.resolve(oAuth2Client)
  }

}

async function getAccessToken(oAuth2Client, scopes) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
  console.log('⚠️ Authorize this app by visiting this url:', authUrl);
  let question = [
    {
      type: 'input',
      name: 'code',
      message: 'Enter the code from that page here:'
    }
  ]
  const answer = await inquirer.prompt(question);
  const response = await oAuth2Client.getToken(answer['code']);
  oAuth2Client.setCredentials(response.tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(response.tokens));

  return Promise.resolve(oAuth2Client);

}

module.exports = { generateOAuthClient }