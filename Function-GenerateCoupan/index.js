'use-strict'

const sql = require('mssql')
var AWS = require('aws-sdk');
const axios = require('axios')
var voucher_codes = require('voucher-code-generator');

exports.handler = async (event) => {
    
    console.log("triggered from queue")
    let customerId
    const url = process.env.HEREURL
    const key = process.env.APIKEY

    if(event.Records === undefined) {
        customerId = event.customerId
    }
    else {
        customerId = event.Records[0].messageAttributes.CustomerId['stringValue']
    }

    console.log("Customer id is ", customerId)

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
            .input('lookupValue', sql.NVarChar, customerId.trim())
            .query('select * from TempUserInfo where CustomerId = @lookupValue')

        console.log('Result is ', result)

        if(result.recordset[0] == undefined) {
            pool.close()
            return {
                statusCode: 400,
                body: "Some Error occured"
            }
        }

        

        lattitude = result.recordset[0].Lattitude
        longitude = result.recordset[0].Longitude
        Email = result.recordset[0].CustomerEmail
        
        if(result.recordset[0].CoupanSent == 'Y') {
            pool.close()
            return {
                statusCode: 200,
                body: "Coupan already sent"
            }
        }

        const finalUrl = url + '?apiKey=' + key + '&at=' + lattitude + ',' + longitude + '&q=' + 'coffee'

        console.log(finalUrl)
        let parsedData

        await axios.get(finalUrl)
        .then(data => {

            console.log('Got data from Here API', data.data)
            parsedData = JSON.parse(JSON.stringify(data.data))
            console.log(parsedData)



            console.log("Generation coupan for ", parsedData.items[0].title)
            console.log("Generation coupan for ", parsedData.items[0].address)

            

        })
        .catch(error => {
            console.log(error)
            pool.close()
            return {
                statusCode: 400,
                body: "Some Error occured"
            }
        })

        var gmapLink = 'https://www.google.com/maps/search/?api=1&query=' + parsedData.items[0].position.lat + ',' + parsedData.items[0].position.lng;

            console.log('Gmap link is ', gmapLink)
            var voucher = voucher_codes.generate({
                length: 8,
                count: 1
            });

            const payLoad = {
                CustomerEmail: Email,
                CustomerGuid: '',
                MessageType: '2',
                Voucher: voucher[0],
                CafeName: parsedData.items[0].title,
                CafeAddress: parsedData.items[0].address.label,
                MapLink: gmapLink
            }

            AWS.config.update({region: 'us-west-2'});
    
            var params = {
            Message: JSON.stringify(payLoad), /* required */
            TopicArn: process.env.SNS_ARN
            };
    
            // Create promise and SNS service object
            var publishTextPromise = await new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();   




        result = await pool.request()
           .input('customerId', sql.NVarChar, customerId)
           .input('coupanSent', sql.NVarChar, 'Y')
           .query('Update TempUserInfo set CoupanSent = @coupanSent where CustomerId = @customerId')

        console.log(result)

        pool.close()



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
