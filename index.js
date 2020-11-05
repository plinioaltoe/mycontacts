const inquirer = require('inquirer')
const { MongoClient } = require('mongodb')
const URL = "mongodb://localhost:27017/mycontacts"

const client = new MongoClient(URL, { useUnifiedTopology: true })

client.connect()
const database = client.db('mycontacts')

const listar = async () => {
  const collections = await database.listCollections().toArray()
  for (let collection of collections) {
    console.log(collection.name)
  }
  options()
}

function options() {
  inquirer.prompt(
    [
      {
        type: "rawlist",
        name: "option",
        message: "Escolha sua opção",
        choices: ["Listar", "Criar", "Apagar"]
      }
    ]
  ).then(function (answers) {
    switch (answers.option) {
      case "Listar":
        listar()
        break;
      case "Criar":
        // criar()
        break;
      case "Apagar":
        // apagar()
        break;
      default:
        options()
        break;
    }
  }).catch((errors) => {
    console.log(`Deu errado algo com ${errors}`)
  })
}

options()

