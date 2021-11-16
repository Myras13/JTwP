# JTwP

PL: Aplikacja pobierająca wszystkie jednostki terytorialne w Polsce wykorzystując środowisko Node.js. Dane pochodzą ze strony https://pl.wikipedia.org/wiki/Lista_gmin_w_Polsce. Została wykorzystana technika Web Scraping'u.

ENG: Application downloading all territorial units in Poland using Node.js environment. The data comes from https://pl.wikipedia.org/wiki/Lista_gmin_w_Polsce. Web scraping technique was used.

## Node specification

The application was written using:

Node version: 14.16.0
npm version: 6.14.11

## Installation

You have to install the packages via npm:

``` bash
npm install
```

All required packages will be downloaded. 

In order to start the application you need to run the command:

``` bash
npm start
```

Here is an template of the script output:
```json
{
  'VoivodeshipName' : {
    'DistrictName' : [
      'MunicipalityName1'
      'MunicipalityName2'
      'MunicipalityName3'
      ...
    ]
    ...
  }
  ...
}
```
