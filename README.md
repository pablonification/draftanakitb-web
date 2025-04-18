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


# DraftAnakITB Bot

DraftAnakITB is a modern web platform that allows ITB (Institut Teknologi Bandung) students to express their thoughts anonymously through Twitter. Built with Next.js and MongoDB, the platform offers secure authentication, media handling, tweet moderation, and community-driven content moderation.

## Table of Contents

- [Features](#features)
  - [Core Message Features](#core-message-features)
  - [Authentication and Security](#authentication-and-security)
  - [Community Moderation](#community-moderation)
  - [Payment Integration](#payment-integration)
  - [Admin Features](#admin-features)
  - [Development Features](#development-features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [Running with PM2](#running-with-pm2)
- [Deployment on DigitalOcean](#deployment-on-digitalocean)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Message Features
- **Anonymous Messaging**: Send anonymous messages (menfess) to Twitter through @DraftAnakITB
- **Media Support**: Attach images to your messages
- **Video Support**: Premium users can attach videos to their messages
- **Message Types**: Various trigger words (itb!, maba!, misuh!, bucin!, itbparkir!) for different categories
- **Daily Limits**: Regular users have daily limits to prevent abuse
- **Scheduled Messages**: Premium messages are processed at specific times

### Authentication and Security
- **Email Verification**: Secure ITB email-based authentication 
- **OTP System**: One-time password verification system
- **Email Domain Validation**: Ensures only authorized ITB students can access
- **Whitelisted Accounts**: Special access for specific email addresses

### Community Moderation
- **DelVote System**: Community-driven tweet deletion request system
- **Threshold-based Moderation**: Tweets are deleted when reaching a specified vote threshold 
- **Vote Transparency**: Voters receive confirmation emails with reasons
- **Abuse Prevention**: Measures to prevent abuse of the deletion system

### Payment Integration
- **Premium Features**: Pay for guaranteed message delivery and additional features
- **TripayID Integration**: Secure payment processing

### Admin Features
- **Moderation Dashboard**: Admin tools for message review
- **Tweet Management**: Delete or edit tweets as needed
- **Analytics**: Track platform usage and metrics
- **User Management**: Manage user accounts and permissions

### Development Features
- **Dev Mode**: Special development mode for testing
- **OTP Bypass**: Simplify testing by bypassing authentication
- **URL Validation Override**: Flexible validation rules for development
- **Multiple Vote Testing**: Test the vote system with the same email

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: Custom email OTP system
- **Email Service**: SMTP integration for sending verification codes
- **Media Handling**: Image and video processing
- **Payment Processing**: TripayID API integration
- **Hosting**: DigitalOcean

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

3. Create a `.env.local` file and add the necessary environment variables (see Environment Variables).

4. Run the development server:
    ```sh
    npm run dev
    ```

## Usage

### Basic Usage
1. Open your browser and navigate to `http://localhost:3000`
2. Enter your ITB email and verify it using the OTP sent to your email
3. Compose your message with an appropriate trigger word
4. Optionally attach media
5. Submit your message to be posted on Twitter

### DelVote System
1. Navigate to the DelVote page
2. Authenticate with your ITB email
3. Enter the URL of the tweet you want to report
4. Provide a reason for deletion
5. Submit your vote
6. When a tweet reaches the threshold (10 votes), administrators are notified for review

### Development Mode
To enable development mode for testing:
1. Set `DEV_MODE=true` and `NEXT_PUBLIC_DEV_MODE=true` in your environment
2. This bypasses email restrictions and OTP verification
3. For DelVote testing, it allows using the same email multiple times

## Environment Variables

Create a `.env.local` file in the root directory and add the following environment variables:

```env
# Twitter API Credentials
TWITTER_APP_ID="your_twitter_app_id"
TWITTER_API_KEY="your_twitter_api_key"
TWITTER_API_SECRET="your_twitter_api_secret"
TWITTER_ACCESS_TOKEN="your_twitter_access_token"
TWITTER_ACCESS_SECRET="your_twitter_access_secret"

# Telegram Integration
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"

# MongoDB Connection
MONGODB_URI="your_mongodb_uri"

# Email Configuration
MAIL_HOST="smtp.gmail.com"
MAIL_PORT=587
MAIL_USER="your_email@gmail.com"
MAIL_PASS="your_email_password"
MAIL_PASSPHRASE="your_email_passphrase"

# Admin Access
LOG_USERNAME="your_log_username"
LOG_PASSWORD="your_log_password"

# Payment Gateway
TRIPAY_PRIVATE_KEY="your_tripay_private_key"
TRIPAY_API_KEY="your_tripay_api_key"
TRIPAY_MERCHANT_CODE="your_tripay_merchant_code"

# Development Mode
DEV_MODE="false"
NEXT_PUBLIC_DEV_MODE="false"
DEV_ADMIN_EMAIL="your_dev_admin_email"
DEV_SKIP_EMAILS="false"

# Base URL
NEXT_PUBLIC_BASE_URL="https://draftanakitb.tech"
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

## Contributing

We welcome contributions to DraftAnakITB Bot. Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
