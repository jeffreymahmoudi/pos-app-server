Moody POS
============================

This API provides resources for [Moody POS](https://moody-pos-client.herokuapp.com/) app which documentation can be found [here](https://github.com/jeffreymahmoudi/moody-pos-client).

Live [URL](https://moody-pos-client.herokuapp.com/)

## API Documentation
#### `GET /items/`
 
Returns all menu items.

Example response:
 
```javascript
[
   {
      "name": "Beef",
      "price": 3,
      "id": "5b73a3ac11894b3ffc04dea3"
    },
    {
       "name": "Chicken",
       "price": 2,
       "id": "5b73a3c711894b3ffc04dea4"
    },
    {
       "name": "Fish",
       "price": 1,
       "id": "5b73a3d111894b3ffc04dea5"
    }
]
```

#### `GET /tables/`
 
Returns all tables.

Example response:
 
```javascript
  [
    {
        "number": 1,
        "id": "5b70c022d69aca3dd05a3c72"
    },
    {
        "number": 2,
        "id": "5b70c032d69aca3dd05a3c73"
    },
    {
        "number": 3,
        "id": "5b70c039d69aca3dd05a3c74"
    }    
]
```

#### `POST /checks/`
 
Returns a new check.
 
Example response:

```javascript
  {
    "closed": false,
    "orderedItems": [],
    "tableId": "5b70c022d69aca3dd05a3c72",
    "createdAt": "2018-08-17T07:39:32.271Z",
    "updatedAt": "2018-08-17T07:39:32.271Z",
    "id": "5b767bb4bf2e4825842bd8bc"
}
```

#### `POST /checks/:id/addItem`

Adds menu item to check

Data parameters:

```javascript
{
   "itemId": "5b73a3c711894b3ffc04dea4"
}
```

Example response:

```javascript
{
    "closed": false,
    "orderedItems": [
        {
            "name": "Chicken",
            "price": 2,
            "id": "5b73a3c711894b3ffc04dea4"
        }
    ],
    "tableId": "5b70c022d69aca3dd05a3c72",
    "createdAt": "2018-08-17T07:39:32.271Z",
    "updatedAt": "2018-08-17T07:40:16.469Z",
    "id": "5b767bb4bf2e4825842bd8bc"
}
```

 ## Tech Stack
 
 [Node.js](https://nodejs.org/en/)
 
 [Express.js](https://expressjs.com/)
 
 [MongoDB](https://www.mongodb.com/)
 
 [Mongoose](https://mongoosejs.com/)
 
 [dotenv](https://www.npmjs.com/package/dotenv)