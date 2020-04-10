'use-strict'

const sql = require('mssql')

exports.handler = async (event) => {
    
    let guid = event.guid
    
    const config = {
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_SERVER,
        database: process.env.DB_DATABASE,
        options: {
            encrypt: true // Use this if you're on Windows Azure
        }
    }

    let result, customerId, existingCardId, UserInfo, ExistingCardDetails, benefitDetails

    try {
        // Open DB Connection
        let pool = await sql.connect(config)
        console.log('guid id is ', guid)
        // Query Database
        result = await pool.request()
            .input('lookupValue', sql.NVarChar, guid)
            .query('select * from TempUserInfo where guid = @lookupValue');

        if(result.recordset[0] === undefined) {
            pool.close();
            return {
                statusCode: 404,
                body: JSON.stringify('User Record not found')
            }

        }

        customerId = result.recordset[0].CustomerId.trim()
        existingCardId = result.recordset[0].ExistingCardId

        result = await pool.request()
            .input('lookupValue', sql.NVarChar, customerId)
            .query('select * from UserInfo where CustomerId = @lookupValue');

        if(result.recordset[0] === undefined) {
            pool.close();
            return {
                statusCode: 404,
                body: JSON.stringify('User Record not found')
            }

        }   

        console.log("User Details are ", result.recordset[0])

        UserInfo = JSON.parse(JSON.stringify(result.recordset[0]))

        console.log("User Information is ", UserInfo)

        result = await pool.request()
             .input('lookupValue', sql.NVarChar, customerId)
             .input('cardId', sql.Int, existingCardId)
             .query('select * from CustomerCardInfo where CustomerId = @lookupValue and CardTypeId = @cardId');

        ExistingCardDetails = JSON.parse(JSON.stringify(result.recordset[0]))

        console.log("Exisitng card details is ", ExistingCardDetails)

        result = await pool.request()
            .input('lookupValue', sql.NVarChar, existingCardId)
            .query('select Benefits.BenefitId, Description from CardBenefits inner join Benefits on CardBenefits.BenefitId = Benefits.BenefitId where CardTypeId = @lookupValue');


        benefitDetails = JSON.parse(JSON.stringify(result.recordset))

        console.log("Exisiting Card Benefits are ", benefitDetails)

        // Close DB Connection
        pool.close();

        console.log('DB Connection Closed')
        
    } catch (err) {
        // Error running our SQL Query
        console.error("ERROR: Exception thrown running SQL", err);
        return {
            statusCode: 500,
            body: JSON.stringify('Some error occured')
        }
    }
    
    const output = {
        CustomerDetails: UserInfo,
        CardInfo: ExistingCardDetails,
        CardBenefits: benefitDetails
    }
    
    return {
    statusCode: 200,
    body: output
}
    
};
