# JUSTCHAT

Private and group chat built with Node/Express, GraphQL, and PostgreSQL.

#### Features

- User authentication system using JWT.
- Real time updates using GraphQL subscriptions.
- Instant messaging using GraphQL subscriptions.
- Email verification with SendGrid and JWT.
- Image upload with google cloud.
- Password recovery.

#### Installation

1. Clone project
   `git clone https://github.com/mjabubakar/justchat`
2. cd into folder
   `cd ./justchat/`
3. Download dependencies
   `npm install`
4. Connect your project with Postgres Database
5. Run migrations
   `npx sequlize db:migrate`

#### Usage

Start server from your root folder using `npm start`

#### Environmental Variables

- `PORT` determines which port the server is listening on.
- `EMAIL_ADDRESS` SendGrid sender email address.
- `API_KEY` SendGrid API key.
- `DB_HOST` Postgres database host.
- `DB_NAME` Postgres database name.
- `DB_USERNAME` Postgres role.
- `DB_PASSWORD` Postgres password.
- `NODE_ENV` determines environment (production or development).
- `ACCESS_TOKEN_SECRET` JWT encryption secret for user login.
- `CONFIRMATION_TOKEN_SECRET` JWT encryption secret for forgot password.
- `EMAIL_CONFIRMATION_TOKEN_SECRET` JWT encryption secret for email confirmation.
- `GCLOUD_PROJECT_ID` Google cloud project id
- `GCLOUD_APPLICATION_CREDENTIALS` key.json path
- `GCLOUD_STORAGE_BUCKET_URL` Storage bucket url
- `FRONT_END_URL` Website URL that will be used for email confirmation
- `GCLOUD_STORAGE_BUCKET_URL` Storage bucket url
- `GCLOUD_STORAGE_BUCKET_URL` Storage bucket url
- `FRONT_END_URL` Website URL that will be used for email confirmation
