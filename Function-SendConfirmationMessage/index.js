'use-strict'

const AWS = require('aws-sdk');
const axios = require('axios')

var customerId
var CustomerName
var CustomerEmail
var CreditCradNumber
var CreditLimit

exports.handler = async function (event) {
  customerId = event.CustId;
  CreditCradNumber = event.CreditCardNumber
  CreditLimit = event.CreditLimit
  CustomerName = event.CustomerName

  await axios.get(process.env.CUSTOMERDETAILS_API_URL + customerId)
    .then(data => {
      console.log('Received customer data from api :', data.data)
      parsedData = JSON.parse(JSON.stringify(data.data))
      CustomerEmail = parsedData.body.CustomerTempInfo.CustomerEmail
      console.log(CustomerEmail)
    })
    .catch(error => {
      console.log(error)
      return {
        statusCode: 400,
        body: "Some Error occured"
      }
    })

  const payLoad = {
    customerId: customerId,
    CustomerName: CustomerName,
    CustomerEmail: CustomerEmail,
    CreditCardNumber: CreditCradNumber,
    CreditLimit: CreditLimit,
    MessageType: '3',
  }

  AWS.config.update({ region: 'us-west-2' });

  var params = {
    Message: JSON.stringify(payLoad), /* required */
    TopicArn: process.env.SNS_ARN
  };

  // Create promise and SNS service object
  var publishTextPromise = await new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();
  console.log(publishTextPromise);

  try {
    const sqs = new AWS.SQS({
      region: 'us-west-2'
    });
    const response = await sqs.sendMessage({
      MessageBody: '{"customerId" : "' + customerId + '"}',
      QueueUrl: process.env.GENERATE_COUPON_SQS_URL
    }).promise();
    console.log('Message put on queue', response);
  } catch (e) {
    console.log('Exception on queue', e);
  }
  return {
    statusCode: 200,
    body: 'Credit Card for user ' + customerId + ' has been generated successfully.',
  };
};