'use-strict'

const sql = require('mssql')

exports.handler = async (event) => {
    
    let customerId = event.customerId
    
    const config = {
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_SERVER,
        database: process.env.DB_DATABASE,
        options: {
            encrypt: true // Use this if you're on Windows Azure
        }
    }

    let result

    try {
        // Open DB Connection
        let pool = await sql.connect(config)
        console.log('customer id is ', customerId)
        // Query Database
        result = await pool.request()
            .input('lookupValue', sql.NVarChar, customerId)
            .query('select * from TempUserInfo where Customerid = @lookupValue');



        console.log(result.recordset)

        let obj = JSON.parse(JSON.stringify(result.recordset))

        let proposedCardId = obj[0].ProposedCardId

        result = await pool.request()
            .input('lookupValue', sql.NVarChar, proposedCardId)
            .query('select * from CardTypes where CardTypeId = @lookupValue');

        var cardDetails = JSON.parse(JSON.stringify(result.recordset))

        console.log("Card Details is ", cardDetails[0])

        result = await pool.request()
            .input('lookupValue', sql.NVarChar, proposedCardId)
            .query('select Benefits.BenefitId, Description from CardBenefits inner join Benefits on CardBenefits.BenefitId = Benefits.BenefitId where CardTypeId = @lookupValue');


        var benefitDetails = JSON.parse(JSON.stringify(result.recordset))

            console.log(result.recordset)
                // Close DB Connection
                pool.close();

        var finalResult =  {
            CardDetails: cardDetails[0],
            Benefits: benefitDetails
        }

        
    } catch (err) {
        // Error running our SQL Query
        console.error("ERROR: Exception thrown running SQL", err);
    }
    
    
    // TODO implement
    const response = {
        statusCode: 200,
        body: finalResult,
    };
    return response;
};
