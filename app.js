const { JSDOM } = require("jsdom");
const fs = require('fs');
const axios = require('axios');

console.debug('Start script');

const startScrap = async () => {

  const tableAdministration = [];

  try 
  {
    const { data } = await axios.get("https://pl.wikipedia.org/wiki/Lista_gmin_w_Polsce");
    const dom = new JSDOM(data, {runScripts: "outside-only", resources: "usable"});
    const { document } = dom.window;
    const wikiTable  = document.querySelector(".mw-parser-output > table.sortable.wikitable > tbody");
    const rows = [...wikiTable.children];

    rows.some((trItem, index) => {

      if(!index) return;

      const columns = [...trItem.children];
      let municipality = columns[1].textContent;
      let district = columns[2].textContent;
      let voivodeship = columns[3].textContent;

      municipality = municipality.replace('gmina ', '').trim();
      municipality = municipality.charAt(0).toUpperCase() + municipality.slice(1);

      district = (district.charAt(0).toUpperCase() + district.slice(1)).replace('[a]', '').trim();      
      voivodeship = (voivodeship.charAt(0).toUpperCase() + voivodeship.slice(1)).trim();

      tableAdministration.push({voivodeship:voivodeship, district:district, municipality:municipality});
      console.info("Preparing data: " + (index+1) + "/" + rows.length);

    });

    return tableAdministration;

  } 
  catch (error) 
  {
    throw error;
  }

};

async function writeFile(filename, writedata) 
{
  try 
  {
    await fs.promises.writeFile(filename, JSON.stringify(writedata, null, 4), 'utf8');
    console.log('Data is written successfully in the file.');
  }
  catch (err) 
  {
    console.log('Not able to write data in the file.');
  }
}

startScrap().then(table => {

  let response = {
    voivodeships: []
  };

  table.forEach((row, index) => {

    let idVoivodeship = -1;
    let idDistrict = -1;
    let idMunicipality = -1;

    response.voivodeships.some((_voivodeship, indexVoivodeship) => {
      if(_voivodeship.Name == row.voivodeship)
      {

        idVoivodeship = indexVoivodeship;
        _voivodeship.District.some((_district, indexDistrict) => {
          if(_district.Name == row.district)
          {

            idDistrict = indexDistrict;
            idMunicipality = _district.Municipalities.indexOf(row.municipality);
            return true;

          }
        });

        return true;

      }
    });

    if(idVoivodeship == -1)
    {
        const obj = {
          Name: row.voivodeship,
          District : [
            {
              Name: row.district,
              Municipalities: [ row.municipality ]
            }
          ]
        };

        response.voivodeships.push(obj);
        
    }

    else if(idDistrict == -1)
    {
      const obj = {
        Name: row.district,
        Municipalities: [ row.municipality ]
      };

      response.voivodeships[idVoivodeship].District.push(obj);
    }

    else if(idMunicipality == -1)
    {
      response.voivodeships[idVoivodeship].District[idDistrict]['Municipalities'].push(row.municipality);
    }

    console.info("Building a json file: " + (index+1) + "/" + table.length);

  });

  const file_path = './data.json';
  writeFile(file_path, response);

}); 