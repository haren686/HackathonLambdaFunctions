'use-strict'

const sql = require('mssql')
let AWS = require('aws-sdk')
const axios = require('axios')
const generator = require('creditcard-generator')

AWS.config.region = 'us-west-2';
var lambda = new AWS.Lambda();

var customerId
var CardNumber
var CardSegment
var CardTypeId
var CreditLimit
var NameOnCard
var ExpiryDate

exports.handler = async function (event) {
    event.Records.forEach(record => {
        try {
            console.log("Lambda for credit card processing triggered from SQS.");
            customerId = record.messageAttributes.CustId["stringValue"];
            CardSegment = record.messageAttributes.CardSegment["stringValue"];
            CardTypeId = record.messageAttributes.NewCardId["stringValue"];
            CreditLimit = record.messageAttributes.CreditLimit["stringValue"];
            NameOnCard = record.messageAttributes.NameOnCard["stringValue"];
            ExpiryDate = record.messageAttributes.ExpiryDate["stringValue"];
            CardNumber = generator.GenCC();

            console.log("Customer Id : " + customerId);
            console.log("CardNumber  : " + CardNumber);
            console.log("CardSegment : " + CardSegment);
            console.log("CardTypeId : " + CardTypeId);
            console.log("CreditLimit : " + CreditLimit);
            console.log("NameOnCard : " + NameOnCard);
            console.log("ExpiryDate : " + ExpiryDate);
        }
        catch (err) {
            console.log("Error fetching message attributes.", err);
            return {
                statusCode: 500,
                body: "Error fetching message attributes."
            }
        }
    });
    try {
        await axios.get(process.env.CUSTOMERDETAILS_API_URL + customerId)
            .then(data => {
                console.log('Received customer data from api :', data.data)
                parsedData = JSON.parse(JSON.stringify(data.data))
                CardGenerated = parsedData.body.CustomerTempInfo.CardGenerated
            })
            .catch(error => {
                console.log(error)
                return {
                    statusCode: 400,
                    body: "Some Error occured"
                }
            })
        const config = {
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            server: process.env.DB_SERVER,
            database: process.env.DB_DATABASE,
            options: {
                encrypt: true // Use this if you're on Windows Azure
            }
        }
        let pool, resultInsert, resultUpdate, resultRewardPointUpdate
        pool = await sql.connect(config)
        console.log("Successfully connected to the DB")
        if (CardGenerated === 'N') {
            resultInsert = await pool.request()
                .input('customerId', sql.NVarChar, customerId)
                .input('CardNumber', sql.NVarChar, CardNumber)
                .input('CardSegment', sql.NVarChar, CardSegment)
                .input('CardTypeId', sql.Numeric, CardTypeId)
                .input('CreditLimit', sql.Numeric, CreditLimit)
                .input('NameOnCard', sql.NVarChar, NameOnCard)
                .input('ExpiryDate', sql.NVarChar, ExpiryDate)
                .query('Insert into CustomerCardInfo (CustomerId, CardNumber, CardSegment, CardTypeId, CreditLimit, NameOnCard, ExpiryDate) values(@CustomerId,	@CardNumber, @CardSegment, @CardTypeId, @CreditLimit, @NameOnCard, @ExpiryDate)');
            console.log(resultInsert);

            resultRewardPointUpdate = resultUpdate = await pool.request()
                .input('customerId', sql.NVarChar, customerId)
                .query('update CustomerCardInfo set RewardPoints = RewardPoints + 500 where CustomerId= @CustomerId');
            console.log(resultRewardPointUpdate);

            resultUpdate = await pool.request()
                .input('customerId', sql.NVarChar, customerId)
                .input('CardGenerated', sql.NVarChar, 'Y')
                .query('update TempUserInfo set CardGenerated = @CardGenerated, NewRewardPoints = (select top 1 RewardPoints from CustomerCardInfo where CustomerId = @CustomerId) where CustomerId = @CustomerId');
            console.log(resultUpdate);

            let params = {
                FunctionName: 'SendConfirmationMessage',
                InvocationType: 'RequestResponse',
                Payload: '{ "CustId" : "' + customerId + '", "CustomerName" : "' + NameOnCard + '", "CreditCardNumber" : "' + CardNumber + '", "CreditLimit" : "' + CreditLimit + '"}'
            };

            return await lambda.invoke(params, function (err, data) {
                if (err) {
                    console.log(err);
                    throw err;
                } else {
                    console.log('SendConfirmationMessage invoked: ' + data.Payload);
                }
            }).promise();
        }
        else {
            return {
                statusCode: 200,
                body: 'Duplicate request : Credit Card for user ' + customerId + ' has already been generated.',
            };
        }
    }
    catch (err) {
        console.log("Error generating new credit card.", err);
        return {
            statusCode: 500,
            body: "Error generating new credit card."
        }
    }
};