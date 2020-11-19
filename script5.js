const inquirer = require('inquirer')
const { MongoClient } = require('mongodb')
const URL = "mongodb://localhost:27017/mycontacts"

const client = new MongoClient(URL, { useUnifiedTopology: true })

client.connect()
const database = client.db('mycontacts')

const contactsOfAge = async (col) => {

  inquirer.prompt(
    [
      {
        type: "number",
        name: "age",
        message: "Qual idade"
      }
    ]
  ).then(async function ({ age }) {
    const documents = await database.collection(col).aggregate([
      {
        $match: { idade: age }
      },
      {
        $group: {
          _id: "$idade",
          total: { $sum: 1 },
          names: { $push: "$name" }
        },
      },
      {
        $sort: { total: -1 }
      }
    ]).toArray()
    console.table(documents)
    options()
  }
  ).catch((errors) => {
    console.log(`Deu errado algo com ${errors}`)
  })

}


const countByAge = async (col) => {
  const documents = await database.collection(col).aggregate([
    {
      $group: {
        _id: "$idade",
        total: { $sum: 1 },
        names: { $push: "$name" }
      },
    },
    {
      $sort: { total: -1 }
    }
  ]).toArray()
  console.table(documents)
  options()
}


async function options() {
  const collections = await database.listCollections().toArray()
  inquirer.prompt(
    [
      {
        type: "rawlist",
        name: "collection",
        message: "Escolha sua collection",
        choices: collections.map(col => col.name)
      },
      {
        type: "rawlist",
        name: "option",
        message: "Escolha sua opção",
        choices: ["Contar contatos por idade", "Contatos da idade"]
      },
    ]
  ).then(({ option, collection }) => {
    switch (option) {
      case "Contar contatos por idade":
        countByAge(collection)
        break;
      case "Contatos da idade":
        contactsOfAge(collection)
        break;
      default:
        options()
        break;
    }
  }).catch((errors) => {
    ageconsole.log(`Deu errado algo aqui`, errors)
  })
}

options()

