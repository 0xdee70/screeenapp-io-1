const { BlobServiceClient } = require("@azure/storage-blob");
const dotenv = require('dotenv')
dotenv.config()

const AZURE_STORAGE_CONNECTION_STRING = `${process.env.AZURE_STORAGE_CONNECTION_STRING}`;
const CONTAINER_NAME = "testcontainer";

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

module.exports = { containerClient };