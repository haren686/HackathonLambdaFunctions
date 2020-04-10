'use-strict'

const sql = require('mssql')
const uuidv4 = require('uuid/v4');
var AWS = require('aws-sdk');

exports.handler = async (event) => {
    
    console.log("triggered from queue")
    let customerId
    if(event.Records === undefined) {
        customerId = event.customerId
    }
    else {
        customerId = event.Records[0].messageAttributes.CustomerId['stringValue']
    }
    console.log("Customer Id from queue ", customerId)

    
    //let customerId = event.customerId

    console.log("Customer id is ", customerId)

    let existingCardTypeId, proposedCardTypeId, Email

     const config = {
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_SERVER,
        database: process.env.DB_DATABASE,
        options: {
            encrypt: true // Use this if you're on Windows Azure
        }
    }

    try {
        // Open DB Connection
        let pool = await sql.connect(config)

        result = await pool.request()
            .input('lookupValue', sql.NVarChar, customerId)
            .query('select * from TempUserInfo where CustomerId = @lookupValue')

        if(result.recordset[0] != undefined) {
            pool.close()
            return {
                statusCode: 400,
                body: "Record already processed"
            }
        }

        result = await pool.request()
            .input('lookupValue', sql.NVarChar, customerId)
            .query('select CustomerCardInfo.*, UserInfo.Email from CustomerCardInfo inner join UserInfo on CustomerCardInfo.CustomerId = UserInfo.CustomerId where CustomerCardInfo.CustomerId = @lookupValue order by CardTypeId desc')

        console.log("Getting CardType Details ", result)
        
        if(result.recordset[0] === undefined) {
            pool.close()
            return {
                statusCode: 404,
                body: "Not an existing Credit Card Holder"
            }
        }

        existingCardTypeId = result.recordset[0].CardTypeId
        Email = result.recordset[0].Email

        console.log('Existing card type id is ', existingCardTypeId)

        result = await pool.request()
            .input('lookupValue', sql.NVarChar, existingCardTypeId)
            .query('select * from CardTypes where CardTypeId > @lookupValue order by CardTypeId')

        console.log("Valid Card Type id ", result)

        if(result.recordset[0] === undefined) {
            pool.close()
            return {
                status: 400,
                body: "No Upgrade available at the moment"
            }
        }

        proposedCardTypeId = result.recordset[0].CardTypeId

        var lattitude  = 13.1986
        var longitude = 77.7066

        

        const guid = uuidv4()

        console.log("Generated guid is ", guid)

        result = await pool.request()
           .input('customerId', sql.NVarChar, customerId)
           .input('guid', sql.NVarChar, guid)
           .input('existingCardTypeId', sql.Numeric, existingCardTypeId)
           .input('proposedCardTypeId', sql.Numeric, proposedCardTypeId)
           .input('lattitude', sql.Float, lattitude)
           .input('longitude', sql.Float, longitude)
           .input('customerEmail', sql.NVarChar, Email)
           .query('Insert into TempUserInfo(Guid, CustomerId, ExistingCardId, ProposedCardId, Lattitude, Longitude, CustomerEmail) values(@guid, @customerId, @existingCardTypeId, @proposedCardTypeId, @lattitude, @longitude, @customerEmail)')

        console.log(result)

        pool.close()

        const payLoad = {
            CustomerEmail: Email,
            CustomerGuid: guid,
            MessageType: '1'
        }

        // Load the AWS SDK for Node.js

// Set region
        AWS.config.update({region: 'us-west-2'});

// Create publish parameters
        var params = {
        Message: JSON.stringify(payLoad), /* required */
        TopicArn: process.env.SNS_ARN
        };

        // Create promise and SNS service object
        var publishTextPromise = await new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();

        // Handle promise's fulfilled/rejected states

        console.log(publishTextPromise)
       /* publishTextPromise.then(
        function(data) {
            console.log(`Message ${params.Message} send sent to the topic ${params.TopicArn}`);
            console.log("MessageID is " + data.MessageId);
        }).catch(
            function(err) {
            console.error(err, err.stack);
        }); */

    }
    catch(err)
    {
        //pool.close()
        console.log("An error occured", err)
        return {
            statusCode: 500,
            body: "An error occured"
        }
    }

    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Data successfully processed'),
    };
    return response;
};
