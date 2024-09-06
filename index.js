import { readFile, writeFile } from "./data/index.js";
import Patrimoine from "./models/Patrimoine.js";
import Personne from "./models/Personne.js";
import Flux from "./models/possessions/Flux.js";
import Possession from "./models/possessions/Possession.js";
const john = new Personne("John Doe");

const macBookPro = new Possession(john, "MacBook Pro", 4000000, new Date("2023-12-25"), null, 5);
const salaire = new Flux(john,"Alternance",500_000,new Date("2023-1-1"),null,null,1);
const traindevie = new Flux(john,"Survie",-300_000,new Date("2023-1-1"),null,null,2)
const possessions = [macBookPro,salaire,traindevie];


const johnPatrimoine  = new Patrimoine(john,possessions);

johnPatrimoine.addPossession(macBookPro);
johnPatrimoine.addPossession(salaire);
johnPatrimoine.addPossession(traindevie);

function save(personne, patrimoine) {
  const file = []
  file.push({
    model: "Personne",
    data: personne
  })
  file.push({
    model: "Patrimoine",
    data: patrimoine
  })
  return writeFile("./fileManager/data.json", file)

}
function read() {
  return readFile("./fileManager/data.json")
}

export {save, read}