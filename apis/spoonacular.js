const dotenv = require('dotenv')
const request = require('superagent')

dotenv.config()

async function getNutrition(ingredientsArray) {
  ingredientListString = ingredientsArray.reduce((acc, item) => acc += `${item}\n`, '')
  const body = {
    ingredientList: ingredientListString,
    servings: 1,
    includeNutrition: true
  }
  try {
    const url = `https://api.spoonacular.com/recipes/parseIngredients?apiKey=${process.env.SPOONACULAR_API_KEY}`
    const res = await request.post(url).send(body).set('Content-Type', 'application/x-www-form-urlencoded')
    return res
  } catch (error) {
    console.error(error)
  }
}

module.exports = { getNutrition }