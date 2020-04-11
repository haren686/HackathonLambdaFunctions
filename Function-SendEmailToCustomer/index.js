var aws = require('aws-sdk');
var ses = new aws.SES({ region: 'us-west-2' });

exports.handler = async (event) => {

    console.log("Triggered from SNS topic")
    console.log("Event object is ,", event)
    console.log("sns object is ", event.Records[0].Sns)

    const parsedMessage = JSON.parse(event.Records[0].Sns.Message)

    let email = parsedMessage.CustomerEmail

    let messageType = parsedMessage.MessageType

    let emailContent = '', emailSubject = '', htmlEmailContent = '', CustomerName = "Customer"

    console.log("Email is, ", email)
    console.log("Message Type is, ", messageType)

    if (messageType == '1') {
        let guid = parsedMessage.CustomerGuid
        let url = process.env.APP_URL + 'CreditCard' + '?id=' + guid

        //emailContent = `You are being offered a new credit card. Please click on ${url} to proceed `
        emailSubject = 'New Credit Card Offered'

        htmlEmailContent = '<html><body><table width="650" border="0" align="center" cellpadding="0" cellspacing="0">';
        htmlEmailContent = htmlEmailContent + '<tr><td><img src="https://ci4.googleusercontent.com/proxy/JnFaoMelJBRFRdiDFqcmpLWFJSpHiLMuaU52mIQutkDN86bgdu_O1sO2b1k3Mw6H5MNX8tOGBGiIiWEb7fGT0556ECXfQdP-wf-nrabHgv5-ISCYxr-Cfu308Q_4IR_0g8yQkHOD5oDFUNFhIqO5jaWTis6D3-7K=s0-d-e1-ft#http://www.icicibank.com/campaigns/mailers/CCEmailalerts/Applicationapproved/HTML/images/ad_image.jpg" width="650" height="86"></td></tr>';
        htmlEmailContent = htmlEmailContent + '<tr><td><table width="650" border="0" cellpadding="0" cellspacing="0" align="center"><tr><td style="border-left:#e56e2e solid 1px;border-right:#e56e2e solid 1px">';
        htmlEmailContent = htmlEmailContent + '<table width="590" border="0" align="center" cellpadding="0" cellspacing="0"><tr style="text-align:justify"><td align="left"><br />';
        htmlEmailContent = htmlEmailContent + `<font face="zurich bt" color="#" style="font-size:16px">Dear ${CustomerName}</font></td></tr>`;
        htmlEmailContent = htmlEmailContent + '<tr><td align="left" valign="top" style="text-align:justify"><font face="zurich bt" color="#333333" style="font-size:16px"> <br />';
        htmlEmailContent = htmlEmailContent + 'Greetings from MY Bank.<br /><br />';
        htmlEmailContent = htmlEmailContent + `You are being offered a new credit card. Please <a href = "${url}">click here</a> to proceed. `;
        htmlEmailContent = htmlEmailContent + '<br /> <br />';
        htmlEmailContent = htmlEmailContent + 'Sincerely, <br>MY Bank Credit Cards Team.';
        htmlEmailContent = htmlEmailContent + '</font></td></tr><tr><td style="text-align:justify"><font face="zurich bt" color="#333333" style="font-size:16px"><br />';
        htmlEmailContent = htmlEmailContent + 'This is a system generated mail. Please do not reply to this e-mail ID.<br /><br />';
        htmlEmailContent = htmlEmailContent + 'Discover a new way of paying your Credit Card bills from your bank account anytime anywhere by using MY Bank iMobile. GPRS users, SMS iMobile to 555555555. <br>';
        htmlEmailContent = htmlEmailContent + '</font><br /></td></tr></table></td></tr></table></td></tr><tr>';
        htmlEmailContent = htmlEmailContent + '<td><img src="https://ci3.googleusercontent.com/proxy/f_OD9H5Fo5RDzJH67ZSEBJittVhTKAG42O9vo_e047n4Z8da2SPl1ANi4MPTEHulA8Rxi9pXBXW0VkevglyS8H8iimSGRvg3plSsvr9Ik1k-K47sjYJEEp_YtlJxCnPVgpQcuUqG-yBWv1q-UofUEkGw5rPSXA=s0-d-e1-ft#http://www.icicibank.com/campaigns/mailers/CCEmailalerts/Applicationapproved/HTML/images/bottom.gif" width="650" height="30" class="CToWUd"></td></tr></table></body></html>';
    }

    if (messageType == '2') {
        let Voucher = parsedMessage.Voucher
        let CafeName = parsedMessage.CafeName
        let CafeAddress = parsedMessage.CafeAddress
        let gmapLink = parsedMessage.MapLink

        emailSubject = `Here is a voucher to enjoy you favorite beverage at ${CafeName}`
        //emailContent = `Dear Customer, \n We are pleased to offer you a voucher to enjoy your favorite beverage at ${CafeName}. Please find the details below`;
        //emailContent = emailContent + `\n Voucher Code = ${Voucher} \n Address = ${CafeAddress} \n Get Directions = ${gmapLink}  `

        htmlEmailContent = '<html><body><table width="650" border="0" align="center" cellpadding="0" cellspacing="0">';
        htmlEmailContent = htmlEmailContent + '<tr><td><img src="https://ci4.googleusercontent.com/proxy/JnFaoMelJBRFRdiDFqcmpLWFJSpHiLMuaU52mIQutkDN86bgdu_O1sO2b1k3Mw6H5MNX8tOGBGiIiWEb7fGT0556ECXfQdP-wf-nrabHgv5-ISCYxr-Cfu308Q_4IR_0g8yQkHOD5oDFUNFhIqO5jaWTis6D3-7K=s0-d-e1-ft#http://www.icicibank.com/campaigns/mailers/CCEmailalerts/Applicationapproved/HTML/images/ad_image.jpg" width="650" height="86"></td></tr>';
        htmlEmailContent = htmlEmailContent + '<tr><td><table width="650" border="0" cellpadding="0" cellspacing="0" align="center"><tr><td style="border-left:#e56e2e solid 1px;border-right:#e56e2e solid 1px">';
        htmlEmailContent = htmlEmailContent + '<table width="590" border="0" align="center" cellpadding="0" cellspacing="0"><tr style="text-align:justify"><td align="left"><br />';
        htmlEmailContent = htmlEmailContent + `<font face="zurich bt" color="#" style="font-size:16px">Dear ${CustomerName}</font></td></tr>`;
        htmlEmailContent = htmlEmailContent + '<tr><td align="left" valign="top" style="text-align:justify"><font face="zurich bt" color="#333333" style="font-size:16px"> <br />';
        htmlEmailContent = htmlEmailContent + 'Greetings from MY Bank.<br /><br />';
        htmlEmailContent = htmlEmailContent + `We are pleased to offer you a voucher to enjoy your favorite beverage at ${CafeName}. Please find the details below,<br /><br />`;
        htmlEmailContent = htmlEmailContent + `Voucher Code = ${Voucher} <br /> <br /> Cafe Address : ${CafeAddress} <br /> <br />  <a href="${gmapLink}">Get Direction Here</a> <br /> <br />`;
        htmlEmailContent = htmlEmailContent + 'Sincerely, <br>MY Bank Credit Cards Team.';
        htmlEmailContent = htmlEmailContent + '</font></td></tr><tr><td style="text-align:justify"><font face="zurich bt" color="#333333" style="font-size:16px"><br />';
        htmlEmailContent = htmlEmailContent + 'This is a system generated mail. Please do not reply to this e-mail ID.<br /><br />';
        htmlEmailContent = htmlEmailContent + 'Discover a new way of paying your Credit Card bills from your bank account anytime anywhere by using MY Bank iMobile. GPRS users, SMS iMobile to 555555555. <br>';
        htmlEmailContent = htmlEmailContent + '</font><br /></td></tr></table></td></tr></table></td></tr><tr>';
        htmlEmailContent = htmlEmailContent + '<td><img src="https://ci3.googleusercontent.com/proxy/f_OD9H5Fo5RDzJH67ZSEBJittVhTKAG42O9vo_e047n4Z8da2SPl1ANi4MPTEHulA8Rxi9pXBXW0VkevglyS8H8iimSGRvg3plSsvr9Ik1k-K47sjYJEEp_YtlJxCnPVgpQcuUqG-yBWv1q-UofUEkGw5rPSXA=s0-d-e1-ft#http://www.icicibank.com/campaigns/mailers/CCEmailalerts/Applicationapproved/HTML/images/bottom.gif" width="650" height="30" class="CToWUd"></td></tr></table></body></html>';
    }

    if (messageType == '3') {
        CustomerName = parsedMessage.CustomerName;
        CreditCardNumber = parsedMessage.CreditCardNumber;
        CreditLimit = parsedMessage.CreditLimit;
        emailSubject = 'Status Of your MY Bank Credit Card Application'
        htmlEmailContent = '<html><body><table width="650" border="0" align="center" cellpadding="0" cellspacing="0">';
        htmlEmailContent = htmlEmailContent + '<tr><td><img src="https://ci4.googleusercontent.com/proxy/JnFaoMelJBRFRdiDFqcmpLWFJSpHiLMuaU52mIQutkDN86bgdu_O1sO2b1k3Mw6H5MNX8tOGBGiIiWEb7fGT0556ECXfQdP-wf-nrabHgv5-ISCYxr-Cfu308Q_4IR_0g8yQkHOD5oDFUNFhIqO5jaWTis6D3-7K=s0-d-e1-ft#http://www.icicibank.com/campaigns/mailers/CCEmailalerts/Applicationapproved/HTML/images/ad_image.jpg" width="650" height="86"></td></tr>';
        htmlEmailContent = htmlEmailContent + '<tr><td><table width="650" border="0" cellpadding="0" cellspacing="0" align="center"><tr><td style="border-left:#e56e2e solid 1px;border-right:#e56e2e solid 1px">';
        htmlEmailContent = htmlEmailContent + '<table width="590" border="0" align="center" cellpadding="0" cellspacing="0"><tr style="text-align:justify"><td align="left"><br />';
        htmlEmailContent = htmlEmailContent + `<font face="zurich bt" color="#" style="font-size:16px">Dear ${CustomerName}</font></td></tr>`;
        htmlEmailContent = htmlEmailContent + '<tr><td align="left" valign="top" style="text-align:justify"><font face="zurich bt" color="#333333" style="font-size:16px"> <br />';
        htmlEmailContent = htmlEmailContent + 'Greetings from MY Bank.<br /><br />';
        htmlEmailContent = htmlEmailContent + 'We would like to inform you that your application for MY Bank Card has been approved. Thank you for selecting MY Bank Card. The card would be mailed to the mailing address mentioned in your application in the next 10 days.<br><br>';
        htmlEmailContent = htmlEmailContent + `Your new credit card ending with XXXXXXXXXXXX${CreditCardNumber.substring(11,15)} has been credited with 500 bonus points. Your new credit limit is ${CreditLimit}. <br /><br />`;
        htmlEmailContent = htmlEmailContent + 'For any clarification or more information, please call our 24-hour Customer Care. Alternatively, you may like to contact us by e-mail through the. <br /><br />';
        htmlEmailContent = htmlEmailContent + 'Looking forward to more opportunities to be of service to you.<br><br>';
        htmlEmailContent = htmlEmailContent + 'Sincerely, <br>MY Bank Credit Cards Team.';
        htmlEmailContent = htmlEmailContent + '</font></td></tr><tr><td style="text-align:justify"><font face="zurich bt" color="#333333" style="font-size:16px"><br />';
        htmlEmailContent = htmlEmailContent + 'This is a system generated mail. Please do not reply to this e-mail ID.<br /><br />';
        htmlEmailContent = htmlEmailContent + 'Discover a new way of paying your Credit Card bills from your bank account anytime anywhere by using MY Bank iMobile. GPRS users, SMS iMobile to 555555555. <br>';
        htmlEmailContent = htmlEmailContent + '</font><br /></td></tr></table></td></tr></table></td></tr><tr>';
        htmlEmailContent = htmlEmailContent + '<td><img src="https://ci3.googleusercontent.com/proxy/f_OD9H5Fo5RDzJH67ZSEBJittVhTKAG42O9vo_e047n4Z8da2SPl1ANi4MPTEHulA8Rxi9pXBXW0VkevglyS8H8iimSGRvg3plSsvr9Ik1k-K47sjYJEEp_YtlJxCnPVgpQcuUqG-yBWv1q-UofUEkGw5rPSXA=s0-d-e1-ft#http://www.icicibank.com/campaigns/mailers/CCEmailalerts/Applicationapproved/HTML/images/bottom.gif" width="650" height="30" class="CToWUd"></td></tr></table></body></html>';
    }


    var params = {
        Destination: {
            ToAddresses: [email]
        },
        Message: {
            Body: {
                Text: {
                    Data: emailContent
                },
                Html: {
                    Data: htmlEmailContent
                }
            },
            Subject: {
                Data: emailSubject
            }
        },
        Source: "admin@www.codingparadox.com"
    };

    const resp = await ses.sendEmail(params).promise();

    console.log(resp)

    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
