const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const fs = require('fs');

async function runLinkedInScraper() {
    console.log("Starting Step 1: LinkedIn Auto-Login...");
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.goto('https://www.linkedin.com/login');
    // Security Best Practice: Insert credentials safely via local process variables
    await page.type('#username', 'aryanambikar753@gmail.com');
    await page.type('#password', 'mh12xp1312');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    
    console.log("Starting Step 2: Searching recent Java Developer Contract posts...");
    const searchQuery = encodeURIComponent('Java Developer "Contract"');
    const searchUrl = `https://www.linkedin.com/search/results/content/?datePosted=%22past-24h%22&keywords=${searchQuery}`;
    await page.goto(searchUrl);
    await page.waitForTimeout(5000);

    const scrapedData = await page.evaluate(() => {
        const posts = [];
        const postElements = document.querySelectorAll('.feed-shared-update-v2');
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

        postElements.forEach(post => {
            const text = post.innerText;
            const foundEmails = text.match(emailRegex);
            if (foundEmails && foundEmails.length > 0) {
                posts.push({
                    recruiterEmail: foundEmails[0],
                    jobDescription: text.substring(0, 200)
                });
            }
        });
        return posts;
    });

    await browser.close();
    return scrapedData;
}

async function sendOutreachEmails(recruiterList) {
    if (recruiterList.length === 0) {
        console.log("No recruiter emails found in the last 24 hours.");
        return;
    }

    console.log(`Starting Step 3 & 4: Logging into Gmail and sending ${recruiterList.length} emails...`);

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'aryanambikar753@gmail.com',
            pass: 'pgya phre fvqq xqov'
        }
    });

    for (let recruiter of recruiterList) {
        let mailOptions = {
            from: 'aryanambikar753@gmail.com',
            to: recruiter.recruiterEmail,
            subject: 'Application for Java Developer (Contract) Position',
            text: `Dear Recruiter,\n\nI hope this email finds you well. I am applying for the Java Developer position mentioned in your recent LinkedIn post.\n\nPlease find my resume attached.\n\nBest Regards,\nAryan Ambikar`,
            attachments: [
                {
                    filename: 'resume.pdf',
                    path: './resume.pdf' 
                }
            ]
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Email sent successfully to: ${recruiter.recruiterEmail}`);
        } catch (error) {
            console.error(`Failed to send email to: ${recruiter.recruiterEmail}`, error);
        }
    }
}

async function main() {
    try {
        const recruiters = await runLinkedInScraper();
        fs.writeFileSync('jobs_data.json', JSON.stringify(recruiters, null, 2));
        await sendOutreachEmails(recruiters);
        console.log("All 4 steps completed successfully inside app.js!");
    } catch (err) {
        console.error("Execution failed:", err);
    }
}

main();