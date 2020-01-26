<h1 align="center">
  <b>:stew:</b><br>
  <b>Food-diary</b><br>
</h1>

<h4 align="center">Analyze your meals and keep track of your daily nutrition!</h4>

### This is the backend part of my Food-diary project. You can view the [frontend](https://github.com/gergohrubo/food-footprint-client), or checkout the [deployed version](https://food-app-gh.netlify.com/)

## Table of contents

* [What is this project about](#what-is-this-project-about)
* [Technologies used](#technologies-used)
* [Features breakdown](#features-breakdown)
* [My git workflow](#my-git-workflow)
* [How to use](#how-to-use)

## What is this project about

#### The purpose of the project is to write an elaborate backend using several APIs/SDKs and current high-end web technologies.

* The project is fully dockerized and is run in its own container
* Images handled by the project are uploaded to Amazon Web Services S3 via their SDK
* The project uses MongoDB with Mongoose to extend my existing knowledge of Sequelize/PostgreSQL on databases
* The project is deployed to Heroku as a docker container, and mLab is used to host a cloud Mongo database

## Technologies used

#### Click to view the code snippets implementing the technologies

* [Docker](https://github.com/gergohrubo/food-footprint-server/blob/master/Dockerfile)
* [ExpressJS](https://github.com/gergohrubo/food-footprint-server/blob/master/index.js)
* [MongoDB with Mongoose](https://github.com/gergohrubo/food-footprint-server/blob/master/db.js)
* [AWS S3](https://github.com/gergohrubo/food-footprint-server/blob/master/apis/aws.js)
* [Heroku container deployment](https://github.com/gergohrubo/food-footprint-server/blob/master/heroku.yml)
* [mLab](https://github.com/gergohrubo/food-footprint-server/blob/master/heroku.yml)
* [Multer](https://github.com/gergohrubo/food-footprint-server/tree/master/nutrition)
* [Clarifai SDK](https://github.com/gergohrubo/food-footprint-server/blob/master/apis/clarifai.js)
* [Spoonacular API](https://github.com/gergohrubo/food-footprint-server/blob/master/apis/spoonacular.js)
* [JSON web tokens](https://github.com/gergohrubo/food-footprint-server/tree/master/auth)

## Features breakdown

#### For detailed description of how the following features were implemented see the pull requests:

* [Image uploading endpoint](https://github.com/gergohrubo/food-footprint-server/pull/1)
* [Adding MongoDB and dockerizing the project](https://github.com/gergohrubo/food-footprint-server/pull/4)
* [Getting nutritional data for the uploaded image](https://github.com/gergohrubo/food-footprint-server/pull/5)
* [Sending the meals and total nutrients to the frontend](https://github.com/gergohrubo/food-footprint-server/pull/9)

## My git workflow

#### In this project my aim was to

* Use clear branch names with feat/ fix/ and bug/ prefixes
* Write prompt but descriptive commit messages
* Keep the separation of concerns between branches
* Write extensive summaries for pull requests
* Use development branch for testing while master branch is on continuous deployment

#### Here is a branching model for this project:

```
master (auto deploys) ______________________
                       \               /
development             \_____________/- pull request
                         \           /
feat/some-feature         \_commits_/- pull request
```

## How to use

This project is dockerized. After cloning the repository you can run it with the command

`docker-compose up`
