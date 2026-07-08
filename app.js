const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'aryanambikar753@gmail.com',
        pass: 'svfh zjph eirg bqul'
    }
});

function processJobApplications() {
    try {
        const rawData = fs.readFileSync('jobs_data.json');
        const jobs = JSON.parse(rawData);

        console.log(`Total jobs found: ${jobs.length}. Starting process...\n`);

        jobs.forEach((job) => {
            const isTargetJob = job.jobTitle.toUpperCase().includes('JAVA DEVELOPER') || 
                               job.jobTitle.toUpperCase().includes('CONTRACT');

            if (isTargetJob && job.recruiterEmail) {
                sendApplicationEmail(job);
            } else {
                console.log(`Skipped: "${job.jobTitle}"`);
            }
        });
    } catch (error) {
        console.error("Error reading data:", error.message);
    }
}

function sendApplicationEmail(job) {
    const mailOptions = {
        from: 'TUMCHA_EMAIL@gmail.com',
        to: job.recruiterEmail,
        subject: `Application for ${job.jobTitle} position`,
        text: `Hi,\n\nI came across your job post for "${job.jobTitle}". Please find attached my resume for your review.\n\nBest regards,\nCandidate`,
        attachments: [
            {
                filename: 'resume.pdf.',
                path: path.join(__dirname, 'resume.pdf')
            }
        ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(`❌ Failed (${job.recruiterEmail}):`, error.message);
        } else {
            console.log(`✅ Sent successfully: ${job.recruiterEmail} (${job.jobTitle})`);
        }
    });
}

processJobApplications();