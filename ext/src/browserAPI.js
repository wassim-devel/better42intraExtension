const browserAPI = process.env.BROWSER === 'firefox' ? browser : chrome;

export default browserAPI;