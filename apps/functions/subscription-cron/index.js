const axios = require('axios');

module.exports = async function (context, myTimer) {
    const timeStamp = new Date().toISOString();

    if (myTimer.isPastDue) {
        context.log('Timer function is running late!');
    }

    const BACKEND_URL = process.env.BACKEND_URL || 'https://your-app-service.azurewebsites.net';

    try {
        context.log('🚀 Starting subscription cron jobs at:', timeStamp);

        const jobs = [
            { name: 'Trial Expiry Check', endpoint: '/api/cron/check-trial-expiry', time: '09:00' },
            { name: 'Trial Warnings', endpoint: '/api/cron/send-trial-warnings', time: '10:00' },
            { name: 'Auto Renewals', endpoint: '/api/cron/process-auto-renewals', time: '11:00' }
        ];

        const currentHour = new Date().getHours();
        let jobToRun = null;

        if (currentHour === 9) jobToRun = jobs[0];
        else if (currentHour === 10) jobToRun = jobs[1];
        else if (currentHour === 11) jobToRun = jobs[2];

        if (jobToRun) {
            context.log(`📋 Running: ${jobToRun.name}`);

            const response = await axios.post(`${BACKEND_URL}${jobToRun.endpoint}`, {}, {
                headers: {
                    'Authorization': `Bearer ${process.env.CRON_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });

            if (response.status === 200) {
                context.log(`✅ ${jobToRun.name} completed successfully`);
                context.log('Response:', response.data);
            } else {
                context.log(`❌ ${jobToRun.name} failed with status:`, response.status);
            }
        } else {
            context.log('⏰ No scheduled job for current hour:', currentHour);
        }

    } catch (error) {
        context.log('❌ Cron job error:', error.message);

        if (error.response) {
            context.log('Error response:', error.response.data);
        }

        throw error;
    }

    context.log('🏁 Subscription cron function completed at:', new Date().toISOString());
};
