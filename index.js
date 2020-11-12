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

const criar = () => {
  inquirer.prompt(
    [
      {
        type: "input",
        name: "name",
        message: "Digite o nome da collection",
      }
    ]
  ).then(async function (answers) {
    await database.createCollection(answers.name)
    console.log("Collection criada!")
    listar()
  }
  ).catch((errors) => {
    console.log(`Deu errado algo com ${errors}`)
  })
}

const apagar = () => {
  inquirer.prompt(
    [
      {
        type: "input",
        name: "name",
        message: "Digite o nome da collection",
      }
    ]
  ).then(async function (answers) {
    const apagou = await database.dropCollection(answers.name)
    if (apagou) {
      console.log("Collection apagada!")
    }
    listar()
  }
  ).catch((errors) => {
    console.log(`Deu errado algo, verifique se a collection existe.`, errors)
  })
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
        criar()
        break;
      case "Apagar":
        apagar()
        break;
      default:
        options()
        break;
    }
  }).catch((errors) => {
    console.log(`Deu errado algo aqui`)
  })
}

options()

