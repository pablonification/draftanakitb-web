# DraftAnakITB Bot

DraftAnakITB Bot is a web application that allows users to send anonymous messages (menfess) to Twitter. The application is built using Next.js and integrates with Twitter and Telegram APIs.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [Running with PM2](#running-with-pm2)
- [Deployment on DigitalOcean](#deployment-on-digitalocean)
- [Contributing](#contributing)
- [License](#license)

## Features

- Send anonymous messages to Twitter
- Optional media attachments
- Email verification and OTP for message submission
- Admin panel for managing messages

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/draftanakitb-bot.git
    cd draftanakitb-bot
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a [.env.local](http://_vscodecontentref_/1) file and add the necessary environment variables (see Environment Variables).

4. Run the development server:
    ```sh
    npm run dev
    ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`.
2. Enter your email and verify it using the OTP sent to your email.
3. Compose your message and optionally attach media.
4. Submit your message to be posted on Twitter.

## Environment Variables

Create a [.env.local](http://_vscodecontentref_/2) file in the root directory and add the following environment variables:

```env
TWITTER_APP_ID="your_twitter_app_id"
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
MONGODB_URI="your_mongodb_uri"
MAIL_HOST="smtp.gmail.com"
MAIL_PORT=587
MAIL_USER="your_email@gmail.com"
MAIL_PASS="your_email_password"
MAIL_PASSPHRASE="your_email_passphrase"
LOG_USERNAME="your_log_username"
LOG_PASSWORD="your_log_password"
TRIPAY_PRIVATE_KEY="your_tripay_private_key"
```

## Running with PM2

### Prerequisites
- Node.js 18.x or later
- PM2 installed globally (`npm install -g pm2`)

### Installation
1. Install dependencies:
    ```sh
    npm install
    ```

2. Start the application with PM2:
    ```sh
    pm2 start npm --name "draftanakitb-bot" -- run dev
    ```

3. To make PM2 start on boot:
    ```sh
    pm2 startup
    pm2 save
    ```

## Deployment on DigitalOcean

Deploying the application on a DigitalOcean Ubuntu droplet using PM2.

### Prerequisites
- DigitalOcean Ubuntu Droplet
- SSH access to the droplet
- Git installed on the server
- PM2 installed globally (`npm install -g pm2`)

### Deployment Steps

1. **Clone the Repository**:
    ```sh
    git clone https://github.com/yourusername/draftanakitb-bot.git
    cd draftanakitb-bot
    ```

2. **Install Dependencies**:
    ```sh
    npm install
    ```

3. **Build the Application**:
    ```sh
    npm run build
    ```

4. **Start the Application with PM2**:
    ```sh
    pm2 start ecosystem.config.js
    ```

### Handling New Git Pushes

If there is a new push on Git, execute the following commands:

```sh
git pull origin main
npm install
npm run build
pm2 reload draftanakitb-web
pm2 list
pm2 logs draftanakitb-web --timestamp
```
