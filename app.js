const http = require('http');
const express = require('express');
const { JSDOM } = require("jsdom");
const fs = require('fs');
const axios = require('axios');
const app = express();

app.set('view engine', 'ejs'); 

const server = http.createServer(app);
const port = 8000;
server.listen(port);
console.debug('Server starting on port ' + port);

const startScrap = async () => {

  const tableAdministration = [];

  try 
  {
    const { data } = await axios.get("https://pl.wikipedia.org/wiki/Lista_gmin_w_Polsce");
    const dom = new JSDOM(data, {runScripts: "outside-only", resources: "usable"});
    const { document } = dom.window;
    const wikiTable  = document.querySelector(".mw-parser-output > table.sortable.wikitable > tbody");
    const rows = [...wikiTable.children];
    const countItem = rows.length;

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

      console.info("Preparing data: " + (index+1) + "/" + countItem);

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

  let response = {};
  const countItem = table.length;

  table.forEach((row, index) => {

    voivodeship = row.voivodeship;
    district = row.district;
    municipality = row.municipality;

    if(!Reflect.has(response, voivodeship))
    {
      response[voivodeship] = {};
    }

    if(!Reflect.has(response[voivodeship], district))
    {
      response[voivodeship][district] = [];
    }

    if(response[voivodeship][district].indexOf(municipality) === -1)
    {
      response[voivodeship][district].push(municipality)
    }

    console.info("Building a json file: " + (index+1) + "/" + countItem);

  });

  const file_path = './data.json';
  writeFile(file_path, response);

}); 