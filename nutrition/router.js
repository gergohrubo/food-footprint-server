const { Router } = require('express')
const multer = require('multer')
const moment = require('moment')
const { uploadImg, getImgURL } = require('../apis/aws')
const predictImage = require('../apis/clarifai')
const { getNutrition, getRecipe } = require('../apis/spoonacular')
const Nutrition = require('./model')

const upload = multer()

const router = new Router()

router.post('/image', upload.single('image'), async (req, res, next) => {
  if (req.file) {
    await uploadImg(req.file.buffer, 'newimage.jpg')
    const imgURL = await getImgURL()
    const guess = await predictImage(imgURL)
    res.send(guess)
  } else {
    res.status(400).send('Please support a valid image')
  }
})

router.post('/ingredients', async (req, res, next) => {
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