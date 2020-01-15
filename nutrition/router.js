const { Router } = require('express')
const multer = require('multer')
const moment = require('moment')
const { uploadImg } = require('../apis/aws')
const authMiddleware = require('../auth/middleware')
const predictImage = require('../apis/clarifai')
const { getNutrition, getRecipe } = require('../apis/spoonacular')
const Nutrition = require('./model')

const upload = multer()

const router = new Router()

router.post('/image', upload.single('image'), authMiddleware, async (req, res, next) => {
  if (req.file) {
    try {
      const imageName = req.file.originalname
      await uploadImg(req.file.buffer, imageName)
      const bucket = process.env.BUCKET_NAME
      const imgURL = `http://${bucket}.s3.eu-central-1.amazonaws.com/${imageName}`
      const guess = await predictImage(imgURL)
      const start = moment().startOf('day')
      const end = moment().endOf('day')
      const entry = await Nutrition.findOne({ userId: req.user._id, date: { '$gte': start, '$lt': end } })
      if (!entry) {
        const newDBRow = {
          userId: req.user._id,
          date: moment().startOf('day'),
          nutrients: {},
          meals: [
            {
              imageName
            }
          ]
        }
        const newLog = new Nutrition(newDBRow)
        await newLog.save()
      } else {
        entry.meals = [
          ...entry.meals, {
            imageName
          }
        ]
        await entry.save()
      }
      res.send(guess)
    } catch (error) {
      console.error(error)
    }
  } else {
    res.status(400).send('Please support a valid image')
  }
})

router.post('/ingredients', authMiddleware, async (req, res, next) => {
  try {
    const ingredientsList = req.body.ingredients.map(ingredient => ingredient.name)
    const [nutritionResponse, recipeResponse] = await Promise.all([getNutrition(ingredientsList), getRecipe(ingredientsList)])
    const nutritionData = nutritionResponse.body
    const recipeData = recipeResponse.body
    const nutritionObject = compoundNutrition(nutritionData)
    const mealObject = {
      title: recipeData[0]['title'],
      ingredients: [...nutritionData]
    }
    const newDBRow = {
      userId: 1,
      date: moment(),
      nutrients: { ...nutritionObject },
      meals: mealObject
    }
    const nutritionLog = new Nutrition(newDBRow)
    await nutritionLog.save()
    res.send([nutritionObject, nutritionData, recipeData])
  } catch (error) {
    console.error(error)
  }
})

function compoundNutrition(ingredientArray) {
  const nutritionArrays = ingredientArray.map(ingredient => ingredient.nutrition.nutrients)
  const nutritionObject = nutritionArrays.reduce((acc, ingredient) => {
    ingredient.forEach(nutrient => {
      if (acc.hasOwnProperty(nutrient.title)) {
        acc[nutrient.title]['amount'] += nutrient['amount']
        acc[nutrient.title]['percentOfDailyNeeds'] += nutrient['percentOfDailyNeeds']
      } else {
        acc[nutrient.title] = {
          amount: nutrient['amount'],
          percentOfDailyNeeds: nutrient['percentOfDailyNeeds']
        }
      }
    })
    return acc
  }, {})
  return nutritionObject
}

module.exports = router