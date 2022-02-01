<p align="center">
  <a href="https://twitter.com/germanycovid">
    <img alt="atomicradio" src="https://i.imgur.com/tQEj7At.png" width="150" />
  </a>
</p>
<h1 align="center">
  Twitter Bot 📈
</h1>
<p align="center">
  Automatically tweets about COVID-19 development in Germany. Data source: Robert-Koch-Institut
</p>
<p align="center">
  <a href="https://github.com/GermanyCovid/germanycovid-twitter/actions">
      <img src="https://github.com/GermanyCovid/germanycovid-twitter/actions/workflows/action.yml/badge.svg" alt="Workflow">
  </a>
</p>

## Getting Started ✨
#### Prerequisites
* You need a Twitter access token. Check this <a href="https://developer.twitter.com/en/docs/twitter-api/getting-started/getting-access-to-the-twitter-api">Guide</a> for more informations.
* Only Node.js v14.X or newer can be used for this project.

#### Configuration
Rename `.env-example` to `.env` and fill out the variables. In the `.env` file you need your tokens that were mentioned in the prerequisites.<br>
`⚠️ The data in the .env should not be published publicly otherwise third parties can gain access to all services that are used here. `

#### Installation
1. Download the github repository.
```
git clone https://github.com/GermanyCovid/germanycovid-twitter
````
2. Navigate in the project folder and install all dependencies.
```
cd germanycovid-twitter
npm install
````
3. After the installation you can start the bot.
```
npm run start
````

## Credits 🔥
This project uses the data from the API <a href="https://github.com/marlon360/rki-covid-api">rki-covid-api</a> by <a href="https://github.com/marlon360">marlon360</a>. Be sure to check out his work on GitHub.

## License 📑
This code is available under the <a href="https://github.com/GermanyCovid/germanycovid-twitter/blob/master/LICENSE">Mozilla Public License Version 2.0</a>.
