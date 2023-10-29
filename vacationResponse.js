const { google } = require('googleapis');
const { gmail } = require("googleapis/build/src/apis/gmail");



async function listRecentEmails(auth){
    try {
const gmail = google.gmail({
  version: 'v1',
  auth,
});
        // extract top 50 threads with inbox label
        const response = await gmail.users.threads.list({
            userId: 'me',
            maxResults: 50,
            labelIds: ['INBOX'],
        })
        const allThread = response.data.threads;

        for (const thread of allThread){
            
            // extract each thread
            const threadDetails = await gmail.users.threads.get({
                userId: 'me',
                id: thread.id,
            });

            const allMessage = threadDetails.data.messages;
            // check for atleast once occurence 
            const hasReplied = await hasRepliedMessage(allMessage);
            

            if (!hasReplied){
            console.log("Res:######################################### ");
                await sendVacationEmail(thread.id, auth);
                // await applyLabelToThread(thread.id, 'Vacation');
            }
        }
    } catch (error){
        console.error("Error listing threads: ", error);
    }
}

async function hasRepliedMessage(messages) {
    try {
            for(const message of messages){
                if(message.labelIds.includes('SENT')){
                    return true;
                    
                }
            }
            return false;

    } catch (error){
        return false;
    }
}

async function sendVacationEmail(threadId, auth) {
    try {
const gmail = google.gmail({
  version: 'v1',
  auth,
});
        // First convert string to binary buffer and then encode the buffer as base64
        const message = {
            raw: Buffer.from("I am on vacation").toString('base64'),
        }

        await gmail.users.messages.send({
            userId: 'me',
            resource: {
                raw: message.raw,
                threadId: threadId,
            },
        });
    } catch (error){
        console.error("Error sending vacation email: ", error);
    }
}

async function applyLabelToThread(threadId, labelName){
    try {
        await createLabel(labelName);

        await gmail.users.threads.modify({
            userId: 'me',
            id: threadId,
            resource:  {
                addLabelIds: [labelName],
            },
        });
    } catch (error){
        console.error("Error applying label: ", error);
    }
}

async function createLabel (labelName){
    try{
        const response = await gmail.users.labels.create({
            userId: 'me',
            resource: {
                name: labelName,
            },
        });
    } catch (error) {
        if(error.response.status == 409){
            console.log("Label already existed: ${labelName}");
        } else {
            console.error ("Error creating label: ", error);
        }
    }
}

module.exports = {
    listRecentEmails
}