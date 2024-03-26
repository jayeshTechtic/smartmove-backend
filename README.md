# SmartMove

SmartMove is presently in the process of creating a comprehensive application designed for furniture measurement and development, catering to various user needs.

## Installation

To get started with SmartMove, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/Techtic-Solutions-Inc/smart-move-full-stack.git
   cd smart-move
   ```

2. Install the required npm packages:

   ```bash
   npm install
   ```

3. To run the project locally, use the following command:

   ```bash
   npm run dev
   ```

   This will start the development server, and you can access the application at http://localhost:3000.

## API Information

SmartMove provides the following APIs for integration:

1. Endpoint:
   > /api/... rest of the URL

## Branches

SmartMove uses the following branches:

> main: This branch contains the stable production-ready code. Code from the development branch is merged into main when ready for deployment.

> development: The development branch is all the staging code which is being merged at the time of making the code live for internal testing purpose.

> staging: For each ticket or feature, create a new branch from staging. After completing the work, merge it back into staging. Staging serves as an integration branch.

## Development Instructions

1. Never push the code directly to main or development or staging branch, always follow the pull request flow to merge your working code in these branches.

2. The branches flow like create the PR from development to main for merging your staging server code to production server code. The same way you can merge your local code from staging branch to development branch for deploying on staging server.

3. While working on any task of jira, need to create a branch from staging. The method of creating a branch is jira ticket number_task name i.e suppose you are working on the jira ticket with number #258 and the task is registation with email then, your branch name should be **258_regstation_with_email**.

4. When you have to work on any other previous task, first checkout that task branch then take a pool from staging and push your code in the same branch. Once you have completed working on it then create the PR from current branch to staging.

## API response status code

> We are following the standard methods of the API response with some API response status code. To know more which are the API response status code we are using, you can go to this path for more information. Here is the path of it **./Utils/const.js**
