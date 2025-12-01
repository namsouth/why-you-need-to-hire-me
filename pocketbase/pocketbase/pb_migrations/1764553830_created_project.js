/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "xa5vzq45yt7t0pb",
    "created": "2025-12-01 01:50:30.156Z",
    "updated": "2025-12-01 01:50:30.156Z",
    "name": "project",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "wrb1lnwt",
        "name": "name",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "2o9wiuri",
        "name": "description",
        "type": "editor",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "convertUrls": false
        }
      }
    ],
    "indexes": [],
    "listRule": "",
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("xa5vzq45yt7t0pb");

  return dao.deleteCollection(collection);
})
