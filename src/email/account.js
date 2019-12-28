const sgmail = require('@sendgrid/mail')

const sendgridAPI = process.env.SENDGRID_API_KEY

sgmail.setApiKey(sendgridAPI)

const sendWelcomeEmail = (email,name)=>{
    sgmail.send({
        to:email,
        from:'task-manager@task-manager.com',
        subject:'welcome to the plateform',
        text:`Hi,${name} you are welcome to our new plateform`
    })
}

const sendCancelEmail=(email,name)=>{
    sgmail.send({
        to:email,
        from:'task-manager@task-manager.com',
        subject:'We hope we will see you again',
        text:`Hi,${name} can you please let us know why you are leaving our plateform`
    })
}

module.exports={
    sendWelcomeEmail,
    sendCancelEmail
}
