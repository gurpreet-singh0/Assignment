
const fs = require("fs");
let items=[];
let categories=[];

const initialize = () => {
    return new Promise((resolve, reject) => {
        fs.readFile("./data/items.json", "utf8", (error, data) => {
            if (error) {
                reject("Unable to read file");
            } else {
                items = JSON.parse(data);
                fs.readFile("./data/categories.json", "utf8", (error, newdata) => {
                    if (error) {
                        reject("Unable to read file");
                    } else {
                        categories = JSON.parse(newdata);
                        resolve();
                    }
                })
            }
        })
    });
};

fs.readFile('./data/items.json', 'utf8', (err, data) => { 
    items = JSON.parse(data);
});

fs.readFile("./data/categories.json", "utf8", (error, newdata) => {
    categories = JSON.parse(newdata);
});

fs.readFile('./data/items.json', 'utf8', (err, data) => { 
    item = JSON.parse(data);
});

fs.readFile("./data/categories.json", "utf8", (error, newdata) => {
    category = JSON.parse(newdata);
});

const getItems = () => {
    return new Promise((resolve, reject) => {
        if (items.length == 0) {
            reject("No items found");
        }
        resolve(items);
    });
};

const addItem = (data) => {
    return new Promise((resolve, reject) => {
        if (typeof data.published === 'undefined') {
            data.published = false;
        }
        data.id = items.length + 1;
        items.push(data);
        resolve(data);
    });
  }

const getPublishedItems = () => {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published);
        if (publishedItems.length == 0) {
            reject("No published items found");
        }
        resolve(publishedItems);
    });
};

const getCategories = () => {
    return new Promise((resolve, reject) => {
        if (categories.length == 0) {
            reject("No categories found");
        }
        resolve(categories);
    });
};


const getPublishedItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        let items = items.filter(item => item.published === true && item.category === category);
        if (items.length === 0) {
            reject("No results returned");
        } else {
            resolve(items);
        }
    });
};

const getItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        let items = itemsArray.filter((item) => item.category == category);
        if (items.length === 0) {
            reject("No results returned");
        } else {
            resolve(items);
        }
    });
};

const getItemsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        let items = itemsArray.filter((item) => new Date(item.postDate) >= new Date(minDateStr));
        if (items.length === 0) {
            reject("No results returned");
        } else {
            resolve(items);
        }
    });
};

const getItemById = (id) => {
    return new Promise((resolve, reject) => {
        let item = itemsArray.find((item) => item.id === id);
        if (item === undefined) {
            reject("No result returned");
        } else {
            resolve(item);
        }
    });
};

module.exports = {initialize,getPublishedItems,getCategories,getItems,addItem,getItemsByCategory,getItemsByMinDate,getItemById,getPublishedItemsByCategory};